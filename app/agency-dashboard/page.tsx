import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import AgencyDashboardClient from "./AgencyDashboardClient";
import {
  AgencyApplication,
  Lead,
  scoreLeadAgainstAgency,
  ScoredLead,
} from "@/lib/leadMatching";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LeadWithCommercialState = ScoredLead & {
  contact_locked: boolean;
  is_purchased: boolean;
  purchased_at: string | null;
};

export default async function AgencyDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/agency-access");
  }

  const { data: applicationData } = await supabase
    .from("agency_applications")
    .select("*")
    .eq("email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!applicationData) {
    redirect("/agencies");
  }

  const application = applicationData as AgencyApplication;
  const isApproved = application.status === "approved";

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: purchases } = await supabase
    .from("lead_purchases")
    .select("lead_id, price_eur, purchased_at")
    .eq("agency_id", application.id);

  const purchaseMap = new Map<
    string,
    { price_eur: number | null; purchased_at: string | null }
  >();

  for (const purchase of purchases ?? []) {
    purchaseMap.set(String(purchase.lead_id), {
      price_eur:
        typeof purchase.price_eur === "number" ? purchase.price_eur : null,
      purchased_at:
        typeof purchase.purchased_at === "string" ? purchase.purchased_at : null,
    });
  }

  const typedLeads: Lead[] = (leads ?? []) as Lead[];

  const scoredLeads = typedLeads
    .map((lead) => scoreLeadAgainstAgency(lead, application))
    .filter((lead): lead is ScoredLead => Boolean(lead))
    .sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }

      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });

  const safeLeads: LeadWithCommercialState[] = scoredLeads.map((lead) => {
    const purchase = purchaseMap.get(lead.id);
    const isPurchased = Boolean(purchase);
    const canSeeContact = isApproved && isPurchased;

    return {
      ...lead,
      lead_price:
        purchase?.price_eur && Number.isFinite(purchase.price_eur)
          ? purchase.price_eur
          : lead.lead_price,
      is_purchased: isPurchased,
      purchased_at: purchase?.purchased_at ?? null,
      name: canSeeContact ? lead.name : lead.name ? "Locked" : "-",
      email: canSeeContact ? lead.email : lead.email ? "Locked" : "-",
      phone: canSeeContact ? lead.phone : lead.phone ? "Locked" : "-",
      message: canSeeContact
        ? lead.message
        : lead.message
        ? "Purchase this lead to unlock the full message."
        : "-",
      contact_locked: !canSeeContact,
    };
  });

  const purchasedCount = safeLeads.filter((lead) => lead.is_purchased).length;
  const lockedCount = safeLeads.filter((lead) => !lead.is_purchased).length;
  const totalUnlockedValue = safeLeads
    .filter((lead) => lead.is_purchased)
    .reduce((sum, lead) => sum + (lead.lead_price ?? 0), 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(26,26,26,0.9) 0%, #0a0a0a 45%, #050505 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "54px 20px 70px",
      }}
    >
      <section style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            padding: "34px",
            border: "1px solid #1f1f1f",
            borderRadius: "22px",
            background:
              "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(11,11,11,0.98) 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ maxWidth: "900px" }}>
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "999px",
                border: "1px solid #252525",
                backgroundColor: "#121212",
                color: "#b8b8b8",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Monetized lead flow
            </div>

            <h1
              style={{
                fontSize: "58px",
                marginBottom: "12px",
                fontWeight: 400,
                letterSpacing: "-1.5px",
                lineHeight: "0.98",
              }}
            >
              AGENCY DASHBOARD
            </h1>

            <p
              style={{
                fontSize: "21px",
                color: "#d0d0d0",
                lineHeight: "1.7",
                margin: 0,
                maxWidth: "820px",
              }}
            >
              Welcome, {application.agency_name}. You are viewing matched leads
              ranked by commercial fit. Contact details are unlocked per lead
              purchase.
            </p>

            <p
              style={{
                fontSize: "14px",
                color: "#8f8f8f",
                marginTop: "16px",
                marginBottom: 0,
              }}
            >
              Signed in as: {user.email}
            </p>

            <p
              style={{
                fontSize: "14px",
                color: "#8f8f8f",
                marginTop: "10px",
                marginBottom: 0,
              }}
            >
              Matching logic prioritizes same-city opportunities above all other
              criteria. Pricing is dynamic and based on match quality and lead
              value.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div
          style={{
            marginBottom: "22px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <TopMetricCard
            title="Matched leads"
            value={safeLeads.length.toString()}
            helper="Leads aligned with your territory and profile"
          />
          <TopMetricCard
            title="Unlocked leads"
            value={purchasedCount.toString()}
            helper="Leads you have already purchased"
          />
          <TopMetricCard
            title="Locked leads"
            value={lockedCount.toString()}
            helper="Available to unlock individually"
          />
          <TopMetricCard
            title="Total spend"
            value={`€${totalUnlockedValue}`}
            helper="Total value of purchased leads"
          />
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "18px 22px",
            border: "1px solid #1f1f1f",
            borderRadius: "16px",
            background:
              "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(12,12,12,0.98) 100%)",
            color: "#cfcfcf",
            fontSize: "16px",
            lineHeight: "1.7",
          }}
        >
          {isApproved ? (
            <>
              <strong style={{ color: "white" }}>Agency approved:</strong> you
              can unlock any matched lead individually. Contact details and full
              message content appear immediately after purchase.
            </>
          ) : (
            <>
              <strong style={{ color: "white" }}>Agency not approved:</strong>{" "}
              you can view matched opportunities and prices, but you cannot
              unlock leads until your agency has been approved.
            </>
          )}
        </div>

        {error && (
          <p style={{ color: "#ff6b6b", textAlign: "center" }}>
            Error loading leads.
          </p>
        )}

        <AgencyDashboardClient
          initialLeads={safeLeads}
          isApproved={isApproved}
        />
      </section>
    </main>
  );
}

function TopMetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(12,12,12,0.98) 100%)",
        border: "1px solid #1f1f1f",
        borderRadius: "18px",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#8f8f8f",
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          fontWeight: 700,
        }}
      >
        Commercial overview
      </div>

      <div
        style={{
          fontSize: "16px",
          color: "#d8d8d8",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "34px",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: "8px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#8f8f8f",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        {helper}
      </div>
    </div>
  );
}