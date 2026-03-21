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
        ? "Unlock this lead to access the full message."
        : "-",
      contact_locked: !canSeeContact,
    };
  });

  const matchedCount = safeLeads.length;
  const unlockedCount = safeLeads.filter((lead) => lead.is_purchased).length;
  const strongCount = safeLeads.filter((lead) => (lead.match_score ?? 0) >= 80).length;

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
          radial-gradient(circle at top left, rgba(146, 118, 61, 0.16) 0%, rgba(146, 118, 61, 0) 26%),
          radial-gradient(circle at top right, rgba(255, 255, 255, 0.06) 0%, rgba(255,255,255,0) 20%),
          linear-gradient(180deg, #060606 0%, #0a0a0a 32%, #0d0d0d 100%)
        `,
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "34px 18px 64px",
      }}
    >
      <section style={{ maxWidth: "1480px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "20px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "26px",
            background:
              "linear-gradient(180deg, rgba(19,19,19,0.92) 0%, rgba(10,10,10,0.96) 100%)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.03)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background:
                "radial-gradient(circle, rgba(166,133,66,0.18) 0%, rgba(166,133,66,0) 68%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "22px",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ maxWidth: "980px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#bdbdbd",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.55px",
                    textTransform: "uppercase",
                  }}
                >
                  Agency workspace
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    border: `1px solid ${
                      isApproved ? "rgba(53,116,79,0.9)" : "rgba(104,104,104,0.7)"
                    }`,
                    background: isApproved
                      ? "rgba(18,49,31,0.9)"
                      : "rgba(28,28,28,0.95)",
                    color: isApproved ? "#a7e4b9" : "#b9b9b9",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.55px",
                    textTransform: "uppercase",
                  }}
                >
                  {isApproved ? "Approved" : "Pending approval"}
                </div>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "48px",
                  fontWeight: 500,
                  letterSpacing: "-1.4px",
                  lineHeight: 1,
                }}
              >
                {application.agency_name}
              </h1>

              <p
                style={{
                  marginTop: "16px",
                  marginBottom: 0,
                  maxWidth: "840px",
                  color: "#cfcfcf",
                  fontSize: "18px",
                  lineHeight: "1.8",
                }}
              >
                Your private lead desk for high-fit opportunities matched to your
                territory, client profile and commercial positioning.
              </p>

              <div
                style={{
                  marginTop: "22px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  maxWidth: "1080px",
                }}
              >
                <ProfileTile
                  label="Primary city"
                  value={formatValue(application.city)}
                />
                <ProfileTile
                  label="Covered cities"
                  value={formatCommaList(application.preferred_cities)}
                />
                <ProfileTile
                  label="Client focus"
                  value={formatArray(application.client_types)}
                />
                <ProfileTile
                  label="Property focus"
                  value={formatArray(application.property_types)}
                />
                <ProfileTile
                  label="Languages"
                  value={formatArray(application.languages_spoken)}
                />
                <ProfileTile
                  label="Budget range"
                  value={
                    application.min_budget || application.max_budget
                      ? `${application.min_budget ?? "-"} → ${application.max_budget ?? "-"}`
                      : "-"
                  }
                />
              </div>

              <div
                style={{
                  marginTop: "18px",
                  fontSize: "13px",
                  color: "#8f8f8f",
                  lineHeight: "1.7",
                }}
              >
                Signed in as {user.email}
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>

        <div
          style={{
            marginBottom: "18px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <MetricCard
            title="Matched leads"
            value={matchedCount}
            helper="Qualified opportunities in your current queue"
          />
          <MetricCard
            title="Unlocked"
            value={unlockedCount}
            helper="Leads already opened by your agency"
          />
          <MetricCard
            title="Strong matches"
            value={strongCount}
            helper="Highest-fit opportunities ready for review"
          />
          <MetricCard
            title="Avg. score"
            value={averageMatchScore}
            helper="Average fit quality across your matched pipeline"
          />
        </div>

        <div
          style={{
            marginBottom: "22px",
            padding: "16px 18px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.07)",
            background:
              "linear-gradient(180deg, rgba(17,17,17,0.95) 0%, rgba(11,11,11,0.97) 100%)",
            color: "#cfcfcf",
            fontSize: "14px",
            lineHeight: "1.7",
          }}
        >
          {isApproved ? (
            <>
              <strong style={{ color: "white" }}>Live access enabled:</strong>{" "}
              you can unlock matched leads individually. The dashboard prioritizes
              operational clarity, fit quality and commercial relevance.
            </>
          ) : (
            <>
              <strong style={{ color: "white" }}>Approval pending:</strong>{" "}
              matched leads are visible, but contact details remain locked until
              your agency is approved.
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

function ProfileTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "14px 15px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#8f8f8f",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "15px",
          color: "#f1f1f1",
          lineHeight: "1.55",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetricCard({
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
        background:
          "linear-gradient(180deg, rgba(18,18,18,0.95) 0%, rgba(10,10,10,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        padding: "22px",
        minHeight: "132px",
        boxShadow: "0 14px 38px rgba(0,0,0,0.18)",
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
        Performance
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
          fontSize: "38px",
          fontWeight: 700,
          letterSpacing: "-1.2px",
          marginBottom: "10px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#8a8a8a",
          fontSize: "13px",
          lineHeight: "1.65",
        }}
      >
        {helper}
      </div>
    </div>
  );
}