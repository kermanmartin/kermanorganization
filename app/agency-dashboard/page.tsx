import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import AgencyDashboardClient from "./AgencyDashboardClient";
import {
  AgencyApplication,
  Lead,
  LeadPricingContext,
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

type LeadEventRow = {
  lead_id: string;
  agency_id: string | null;
  event_type: string;
  created_at: string | null;
};

type PurchaseRow = {
  lead_id: string;
  agency_id: string;
  price_eur: number | null;
  purchased_at: string | null;
};

function formatValue(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCommaList(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" · ");
}

function formatArray(values: string[] | null | undefined) {
  if (!values || values.length === 0) return "-";

  return values
    .map((item) =>
      item
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    )
    .join(" · ");
}

function buildPricingContext(
  leadId: string,
  leadEvents: LeadEventRow[],
  purchases: PurchaseRow[]
): LeadPricingContext {
  const now = Date.now();
  const seventyTwoHoursMs = 72 * 60 * 60 * 1000;

  const leadSpecificEvents = leadEvents.filter((event) => event.lead_id === leadId);
  const leadSpecificPurchases = purchases.filter((purchase) => purchase.lead_id === leadId);

  const checkoutStartedCount = leadSpecificEvents.filter(
    (event) => event.event_type === "checkout_started"
  ).length;

  const purchaseCount = leadSpecificPurchases.length;

  const recentInterestCount = leadSpecificEvents.filter((event) => {
    if (!event.created_at) return false;
    const createdAt = new Date(event.created_at).getTime();
    if (!Number.isFinite(createdAt)) return false;
    if (now - createdAt > seventyTwoHoursMs) return false;

    return (
      event.event_type === "click_unlock" ||
      event.event_type === "checkout_started" ||
      event.event_type === "purchase"
    );
  }).length;

  return {
    checkoutStartedCount,
    purchaseCount,
    recentInterestCount,
  };
}

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

  const { data: purchasesData } = await supabase
    .from("lead_purchases")
    .select("lead_id, agency_id, price_eur, purchased_at");

  const { data: leadEventsData } = await supabase
    .from("lead_events")
    .select("lead_id, agency_id, event_type, created_at")
    .in("event_type", ["click_unlock", "checkout_started", "purchase"]);

  const purchases = (purchasesData ?? []) as PurchaseRow[];
  const leadEvents = (leadEventsData ?? []) as LeadEventRow[];

  const purchaseMap = new Map<
    string,
    { price_eur: number | null; purchased_at: string | null }
  >();

  for (const purchase of purchases.filter(
    (item) => item.agency_id === application.id
  )) {
    purchaseMap.set(String(purchase.lead_id), {
      price_eur:
        typeof purchase.price_eur === "number" ? purchase.price_eur : null,
      purchased_at:
        typeof purchase.purchased_at === "string" ? purchase.purchased_at : null,
    });
  }

  const typedLeads: Lead[] = (leads ?? []) as Lead[];

  const scoredLeads = typedLeads
    .map((lead) =>
      scoreLeadAgainstAgency(
        lead,
        application,
        buildPricingContext(lead.id, leadEvents, purchases)
      )
    )
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
        ? "Unlock this lead to access the full message."
        : "-",
      contact_locked: !canSeeContact,
    };
  });

  const matchedCount = safeLeads.length;
  const unlockedCount = safeLeads.filter((lead) => lead.is_purchased).length;
  const strongCount = safeLeads.filter(
    (lead) => (lead.match_score ?? 0) >= 80
  ).length;

  const averageMatchScore =
    safeLeads.length > 0
      ? Math.round(
          safeLeads.reduce((sum, lead) => sum + (lead.match_score ?? 0), 0) /
            safeLeads.length
        )
      : 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at top left, rgba(170,136,76,0.10) 0%, rgba(170,136,76,0) 24%),
          radial-gradient(circle at 85% 0%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 18%),
          linear-gradient(180deg, #050505 0%, #090909 42%, #0d0d0d 100%)
        `,
        color: "white",
        fontFamily: 'Inter, Arial, sans-serif',
        padding: "24px 18px 56px",
      }}
    >
      <section style={{ maxWidth: "1420px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "18px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "30px",
            background:
              "linear-gradient(180deg, rgba(15,15,15,0.92) 0%, rgba(8,8,8,0.98) 100%)",
            boxShadow:
              "0 28px 90px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.03)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-110px",
              right: "-60px",
              width: "280px",
              height: "280px",
              borderRadius: "999px",
              background:
                "radial-gradient(circle, rgba(166,133,66,0.12) 0%, rgba(166,133,66,0) 72%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              padding: "34px 34px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              gap: "24px",
              alignItems: "flex-start",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ maxWidth: "960px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <TopTag label="Private deal desk" />
                <TopTag
                  label={isApproved ? "Approved" : "Pending approval"}
                  tone={isApproved ? "green" : "neutral"}
                />
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "56px",
                  fontWeight: 500,
                  letterSpacing: "-2px",
                  lineHeight: 0.94,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                {application.agency_name}
              </h1>

              <p
                style={{
                  marginTop: "18px",
                  marginBottom: 0,
                  maxWidth: "860px",
                  color: "#cdcdcd",
                  fontSize: "18px",
                  lineHeight: "1.85",
                }}
              >
                A private workspace for reviewing high-fit demand aligned with your
                territory, commercial profile and market focus.
              </p>
            </div>

            <LogoutButton />
          </div>

          <div
            style={{
              padding: "18px 34px 26px",
              display: "grid",
              gridTemplateColumns: "1.15fr 0.95fr",
              gap: "24px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8d8d8d",
                  textTransform: "uppercase",
                  letterSpacing: "0.65px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Agency profile
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px 12px",
                }}
              >
                <InlineInfo
                  label="Primary city"
                  value={formatValue(application.city)}
                />
                <InlineInfo
                  label="Covered cities"
                  value={formatCommaList(application.preferred_cities)}
                />
                <InlineInfo
                  label="Client focus"
                  value={formatArray(application.client_types)}
                />
                <InlineInfo
                  label="Property focus"
                  value={formatArray(application.property_types)}
                />
                <InlineInfo
                  label="Budget range"
                  value={
                    application.min_budget || application.max_budget
                      ? `${application.min_budget ?? "-"} → ${application.max_budget ?? "-"}`
                      : "-"
                  }
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8d8d8d",
                  textTransform: "uppercase",
                  letterSpacing: "0.65px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Live desk snapshot
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
                  gap: "12px",
                }}
              >
                <MetricStrip
                  title="Matched"
                  value={matchedCount}
                  helper="Current queue"
                />
                <MetricStrip
                  title="Unlocked"
                  value={unlockedCount}
                  helper="Full access"
                />
                <MetricStrip
                  title="Avg. score"
                  value={averageMatchScore}
                  helper={`${strongCount} strong`}
                />
              </div>

              <div
                style={{
                  marginTop: "14px",
                  fontSize: "13px",
                  color: "#8f8f8f",
                  lineHeight: "1.7",
                }}
              >
                Signed in as {user.email}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginBottom: "18px",
            padding: "15px 18px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.07)",
            background:
              "linear-gradient(180deg, rgba(13,13,13,0.94) 0%, rgba(9,9,9,0.98) 100%)",
            color: "#cfcfcf",
            fontSize: "14px",
            lineHeight: "1.75",
          }}
        >
          {isApproved ? (
            <>
              <strong style={{ color: "white" }}>Live access enabled:</strong>{" "}
              launch pricing remains intentionally conservative to increase agency
              adoption and repeat buying while the network grows.
            </>
          ) : (
            <>
              <strong style={{ color: "white" }}>Approval pending:</strong>{" "}
              matched opportunities remain visible, but payment and full contact
              access are disabled until approval.
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
          agencyName={application.agency_name}
        />
      </section>
    </main>
  );
}

function TopTag({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "green";
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "8px 12px",
        borderRadius: "999px",
        border:
          tone === "green"
            ? "1px solid rgba(53,116,79,0.85)"
            : "1px solid rgba(255,255,255,0.08)",
        background:
          tone === "green"
            ? "rgba(18,49,31,0.9)"
            : "rgba(255,255,255,0.03)",
        color: tone === "green" ? "#a7e4b9" : "#bdbdbd",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.55px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

function InlineInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: "4px",
        padding: "12px 14px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        minWidth: "180px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#8f8f8f",
          textTransform: "uppercase",
          letterSpacing: "0.55px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "15px",
          color: "#f1f1f1",
          lineHeight: "1.45",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetricStrip({
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.06)",
        background:
          "linear-gradient(180deg, rgba(16,16,16,0.96) 0%, rgba(9,9,9,0.99) 100%)",
        padding: "16px 16px 14px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#8f8f8f",
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "-1px",
          marginBottom: "6px",
          color: "#f5f5f5",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#8a8a8a",
          fontSize: "12px",
          lineHeight: "1.45",
        }}
      >
        {helper}
      </div>
    </div>
  );
}