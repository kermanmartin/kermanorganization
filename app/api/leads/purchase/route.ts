import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  AgencyApplication,
  Lead,
  scoreLeadAgainstAgency,
} from "@/lib/leadMatching";

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
        { error: "Your agency must be approved before unlocking leads." },
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

    const now = new Date().toISOString();

    const { error: insertError } = await adminSupabase
      .from("lead_purchases")
      .insert([
        {
          lead_id: leadId,
          agency_id: application.id,
          price_eur: scoredLead.lead_price,
          match_score: scoredLead.match_score,
          purchased_at: now,
        },
      ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: scoredLead.id,
        name: scoredLead.name,
        email: scoredLead.email,
        phone: scoredLead.phone,
        message: scoredLead.message,
        lead_price: scoredLead.lead_price,
        purchased_at: now,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid purchase request." },
      { status: 400 }
    );
  }
}