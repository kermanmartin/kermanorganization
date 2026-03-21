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

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBaseUrl(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

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
    const scoredLead = scoreLeadAgainstAgency(lead, application);

    if (!scoredLead) {
      return NextResponse.json(
        { error: "This lead does not match your agency profile." },
        { status: 403 }
      );
    }

    const { data: existingPurchase, error: purchaseLookupError } =
      await adminSupabase
        .from("lead_purchases")
        .select("id, lead_id, agency_id, price_eur, purchased_at")
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

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: application.email,
      success_url: `${baseUrl}/agency-dashboard?checkout=success`,
      cancel_url: `${baseUrl}/agency-dashboard?checkout=cancelled`,
      metadata: {
        agency_id: application.id,
        agency_email: application.email,
        lead_id: scoredLead.id,
        expected_price_eur: String(scoredLead.lead_price),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: scoredLead.lead_price * 100,
            product_data: {
              name: `Lead unlock · ${lead.city ?? "Matched market"}`,
              description: `Access to matched lead contact details and full message for ${application.agency_name}.`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create Stripe Checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid purchase request.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}