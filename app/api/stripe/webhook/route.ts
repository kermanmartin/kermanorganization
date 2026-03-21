import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  AgencyApplication,
  Lead,
  scoreLeadAgainstAgency,
} from "@/lib/leadMatching";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const agencyId = session.metadata?.agency_id?.trim() ?? "";
      const agencyEmail = session.metadata?.agency_email?.trim() ?? "";
      const leadId = session.metadata?.lead_id?.trim() ?? "";
      const expectedPriceEur = Number(
        session.metadata?.expected_price_eur?.trim() ?? ""
      );

      if (!agencyId || !agencyEmail || !leadId || !Number.isFinite(expectedPriceEur)) {
        return NextResponse.json(
          { error: "Missing checkout metadata." },
          { status: 400 }
        );
      }

      const amountTotal = session.amount_total ?? 0;
      const paidPriceEur = Math.round(amountTotal / 100);

      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true });
      }

      const { data: applicationData, error: applicationError } =
        await adminSupabase
          .from("agency_applications")
          .select("*")
          .eq("id", agencyId)
          .eq("email", agencyEmail)
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
          { error: "Lead no longer matches this agency." },
          { status: 403 }
        );
      }

      if (scoredLead.lead_price !== expectedPriceEur) {
        return NextResponse.json(
          { error: "Lead price metadata mismatch." },
          { status: 400 }
        );
      }

      if (paidPriceEur !== scoredLead.lead_price) {
        return NextResponse.json(
          { error: "Paid amount does not match expected price." },
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

      if (!existingPurchase) {
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
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}