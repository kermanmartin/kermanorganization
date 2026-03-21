import { NextResponse } from "next/server";
import Stripe from "stripe";
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

function getWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
  }

  return webhookSecret;
}

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();

    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature." },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid webhook signature.";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const leadId = typeof session.metadata?.leadId === "string"
      ? session.metadata.leadId.trim()
      : "";

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing leadId in Stripe metadata." },
        { status: 400 }
      );
    }

    const paidAmountEur = Math.round((session.amount_total ?? 0) / 100);

    const customerEmail =
      typeof session.customer_details?.email === "string"
        ? session.customer_details.email.trim().toLowerCase()
        : typeof session.customer_email === "string"
        ? session.customer_email.trim().toLowerCase()
        : "";

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email in Stripe session." },
        { status: 400 }
      );
    }

    const { data: applicationData, error: applicationError } =
      await adminSupabase
        .from("agency_applications")
        .select("*")
        .eq("email", customerEmail)
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
        { error: "Agency application not found for this payment." },
        { status: 404 }
      );
    }

    const application = applicationData as AgencyApplication;

    if (application.status !== "approved") {
      return NextResponse.json(
        { error: "Agency is not approved." },
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
        { error: "Lead does not match this agency anymore." },
        { status: 403 }
      );
    }

    if (paidAmountEur !== scoredLead.lead_price) {
      return NextResponse.json(
        {
          error: `Paid amount (${paidAmountEur} EUR) does not match expected lead price (${scoredLead.lead_price} EUR).`,
        },
        { status: 400 }
      );
    }

    const { data: existingPurchase, error: existingPurchaseError } =
      await adminSupabase
        .from("lead_purchases")
        .select("id")
        .eq("agency_id", application.id)
        .eq("lead_id", leadId)
        .maybeSingle();

    if (existingPurchaseError) {
      return NextResponse.json(
        { error: existingPurchaseError.message },
        { status: 500 }
      );
    }

    if (existingPurchase) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const purchasedAt = new Date().toISOString();

    const { error: insertError } = await adminSupabase
      .from("lead_purchases")
      .insert([
        {
          lead_id: leadId,
          agency_id: application.id,
          price_eur: scoredLead.lead_price,
          match_score: scoredLead.match_score,
          purchased_at: purchasedAt,
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true, purchased: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}