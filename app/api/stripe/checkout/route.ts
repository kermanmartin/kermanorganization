import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  AgencyApplication,
  Lead,
  scoreLeadAgainstAgency,
} from "@/lib/leadMatching";

export const runtime = "nodejs";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  return new Stripe(secretKey);
}

function normalizeBaseUrl(raw: string) {
  const url = new URL(raw);
  return url.origin;
}

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  const origin = req.headers.get("origin")?.trim();

  if (origin) {
    return normalizeBaseUrl(origin);
  }

  throw new Error("Missing NEXT_PUBLIC_SITE_URL environment variable.");
}

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const leadId = typeof body?.leadId === "string" ? body.leadId.trim() : "";

    if (!leadId) {
      return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });
    }

    const { data: applicationData, error: applicationError } =
      await adminSupabase
        .from("agency_applications")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (applicationError) {
      return NextResponse.json(
        { error: applicationError.message },
        { status: 500 }
      );
    }

    if (!applicationData) {
      return NextResponse.json(
        { error: "Agency application not found." },
        { status: 404 }
      );
    }

    const application = applicationData as AgencyApplication;

    if (application.status !== "approved") {
      return NextResponse.json(
        { error: "Your agency must be approved before purchasing leads." },
        { status: 403 }
      );
    }

    const { data: leadData, error: leadError } = await adminSupabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) {
      return NextResponse.json({ error: leadError.message }, { status: 500 });
    }

    if (!leadData) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const lead = leadData as Lead;

    const { data: purchasesData } = await adminSupabase
      .from("lead_purchases")
      .select("lead_id, agency_id, purchased_at");

    const { data: leadEventsData } = await adminSupabase
      .from("lead_events")
      .select("lead_id, agency_id, event_type, created_at")
      .in("event_type", ["click_unlock", "checkout_started", "purchase"]);

    const pricingContext = {
      checkoutStartedCount: (leadEventsData ?? []).filter(
        (event) =>
          event.lead_id === leadId && event.event_type === "checkout_started"
      ).length,
      purchaseCount: (purchasesData ?? []).filter(
        (purchase) => purchase.lead_id === leadId
      ).length,
      recentInterestCount: (leadEventsData ?? []).filter((event) => {
        if (event.lead_id !== leadId) return false;
        if (!event.created_at) return false;

        const ageMs = Date.now() - new Date(event.created_at).getTime();
        if (ageMs > 72 * 60 * 60 * 1000) return false;

        return (
          event.event_type === "click_unlock" ||
          event.event_type === "checkout_started" ||
          event.event_type === "purchase"
        );
      }).length,
    };

    const scoredLead = scoreLeadAgainstAgency(lead, application, pricingContext);

    if (!scoredLead) {
      return NextResponse.json(
        { error: "This lead does not match your agency profile." },
        { status: 403 }
      );
    }

    const { data: existingPurchase, error: purchaseLookupError } =
      await adminSupabase
        .from("lead_purchases")
        .select("id, price_eur, purchased_at")
        .eq("agency_id", application.id)
        .eq("lead_id", leadId)
        .maybeSingle();

    if (purchaseLookupError) {
      return NextResponse.json(
        { error: purchaseLookupError.message },
        { status: 500 }
      );
    }

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        alreadyPurchased: true,
        lead: {
          id: scoredLead.id,
          name: scoredLead.name,
          email: scoredLead.email,
          phone: scoredLead.phone,
          message: scoredLead.message,
          lead_price: existingPurchase.price_eur ?? scoredLead.lead_price,
          purchased_at: existingPurchase.purchased_at,
        },
      });
    }

    const stripe = getStripeClient();
    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: application.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(scoredLead.lead_price * 100),
            product_data: {
              name: "Lead Unlock",
              description: `Lead ID: ${leadId}`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/agency-dashboard?checkout=success&lead=${encodeURIComponent(
        leadId
      )}`,
      cancel_url: `${baseUrl}/agency-dashboard?checkout=cancelled&lead=${encodeURIComponent(
        leadId
      )}`,
      metadata: {
        leadId: scoredLead.id,
        agencyId: application.id,
        expectedPriceEur: String(scoredLead.lead_price),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout URL was not generated." },
        { status: 500 }
      );
    }

    await adminSupabase.from("lead_events").insert([
      {
        lead_id: leadId,
        agency_id: application.id,
        event_type: "checkout_started",
        metadata: {
          stripe_checkout_session_id: session.id,
          price_eur: scoredLead.lead_price,
        },
      },
    ]);

    await adminSupabase.from("payments").insert([
      {
        stripe_checkout_session_id: session.id,
        agency_id: application.id,
        lead_id: leadId,
        amount_eur: scoredLead.lead_price,
        currency: "eur",
        status: "pending",
        provider: "stripe",
        metadata: {
          source: "lead_unlock",
        },
      },
    ]);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe checkout failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}