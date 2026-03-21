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

    const leadId =
      typeof session.metadata?.leadId === "string"
        ? session.metadata.leadId.trim()
        : "";

    const agencyId =
      typeof session.metadata?.agencyId === "string"
        ? session.metadata.agencyId.trim()
        : "";

    const expectedPriceEur = Number(session.metadata?.expectedPriceEur ?? "0");

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing leadId in Stripe metadata." },
        { status: 400 }
      );
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: "Missing agencyId in Stripe metadata." },
        { status: 400 }
      );
    }

    const paidAmountEur = Math.round((session.amount_total ?? 0) / 100);

    const { data: applicationData, error: applicationError } =
      await adminSupabase
        .from("agency_applications")
        .select("*")
        .eq("id", agencyId)
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

    const lead = leadData as Lead;
    const scoredLead = scoreLeadAgainstAgency(lead, application, pricingContext);

    if (!scoredLead) {
      return NextResponse.json(
        { error: "Lead does not match this agency anymore." },
        { status: 403 }
      );
    }

    if (
      Number.isFinite(expectedPriceEur) &&
      expectedPriceEur > 0 &&
      paidAmountEur !== expectedPriceEur
    ) {
      return NextResponse.json(
        {
          error: `Paid amount (${paidAmountEur} EUR) does not match expected checkout price (${expectedPriceEur} EUR).`,
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

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    const stripeSessionId = session.id;
    const stripeEventId = event.id;
    const purchasedAt = new Date().toISOString();

    if (!existingPurchase) {
      const { error: insertPurchaseError } = await adminSupabase
        .from("lead_purchases")
        .insert([
          {
            lead_id: leadId,
            agency_id: application.id,
            price_eur: paidAmountEur,
            match_score: scoredLead.match_score,
            purchased_at: purchasedAt,
          },
        ]);

      if (insertPurchaseError) {
        return NextResponse.json(
          { error: insertPurchaseError.message },
          { status: 500 }
        );
      }

      await adminSupabase.from("lead_events").insert([
        {
          lead_id: leadId,
          agency_id: application.id,
          event_type: "purchase",
          metadata: {
            stripe_checkout_session_id: stripeSessionId,
            stripe_event_id: stripeEventId,
            price_eur: paidAmountEur,
          },
        },
      ]);
    }

    const { data: existingPayment } = await adminSupabase
      .from("payments")
      .select("id")
      .eq("stripe_checkout_session_id", stripeSessionId)
      .maybeSingle();

    if (existingPayment) {
      await adminSupabase
        .from("payments")
        .update({
          stripe_payment_intent_id: paymentIntentId,
          stripe_event_id: stripeEventId,
          status: "paid",
          paid_at: purchasedAt,
          amount_eur: paidAmountEur,
          metadata: {
            source: "lead_unlock",
            webhook_confirmed: true,
          },
        })
        .eq("stripe_checkout_session_id", stripeSessionId);
    } else {
      await adminSupabase.from("payments").insert([
        {
          stripe_checkout_session_id: stripeSessionId,
          stripe_payment_intent_id: paymentIntentId,
          stripe_event_id: stripeEventId,
          agency_id: application.id,
          lead_id: leadId,
          amount_eur: paidAmountEur,
          currency: "eur",
          status: "paid",
          provider: "stripe",
          paid_at: purchasedAt,
          metadata: {
            source: "lead_unlock",
            webhook_confirmed: true,
          },
        },
      ]);
    }

    return NextResponse.json({ received: true, purchased: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}