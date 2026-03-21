"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusButton from "./StatusButton";

type LeadStatus = "new" | "contacted" | "closed";
type LeadTier = "exclusive" | "premium" | "standard";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  preferred_area: string | null;
  property_type: string | null;
  timeframe: string | null;
  financing_status: string | null;
  seller_status: string | null;
  rental_profile: string | null;
  budget: string | null;
  user_type: string | null;
  urgency?: string | null;
  status: string | null;
  message: string | null;
  created_at: string | null;
  contact_locked?: boolean;
  match_score?: number;
  match_reason?: string | null;
  match_label?: string | null;
  lead_tier?: LeadTier;
  lead_price?: number | null;
  is_purchased?: boolean;
  purchased_at?: string | null;
};

export default function AgencyDashboardClient({
  initialLeads,
  isApproved,
  agencyName,
}: {
  initialLeads: Lead[];
  isApproved: boolean;
  agencyName: string;
}) {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [buyingLeadId, setBuyingLeadId] = useState<string | null>(null);

  const purchasedLeads = useMemo(
    () => leads.filter((lead) => Boolean(lead.is_purchased)).length,
    [leads]
  );

  const lockedLeads = useMemo(
    () => leads.filter((lead) => !lead.is_purchased).length,
    [leads]
  );

  const readyToActLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          (lead.match_score ?? 0) >= 80 &&
          ((lead.status ?? "new") === "new" || !lead.status)
      ).length,
    [leads]
  );

  const getNextStatus = (currentStatus: string | null): LeadStatus => {
    if (currentStatus === "new" || !currentStatus) return "contacted";
    if (currentStatus === "contacted") return "closed";
    return "new";
  };

  const updateLeadStatus = async (
    leadId: string,
    currentStatus: string | null
  ) => {
    const lead = leads.find((item) => item.id === leadId);

    if (!lead?.is_purchased) {
      alert("Unlock this lead first before updating its pipeline status.");
      return;
    }

    const newStatus = getNextStatus(currentStatus);
    const previousLeads = leads;

    setLeads((prev) =>
      prev.map((item) =>
        item.id === leadId ? { ...item, status: newStatus } : item
      )
    );

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      setLeads(previousLeads);
      alert("Could not update lead status.");
    }
  };

  const unlockLead = async (leadId: string) => {
    if (!isApproved) {
      alert("Your agency must be approved before unlocking leads.");
      return;
    }

    setBuyingLeadId(leadId);

    try {
      const response = await fetch("/api/leads/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const payload = await response.json();

      if (!response.ok) {
        alert(payload?.error ?? "Could not unlock this lead.");
        return;
      }

      const purchasedLead = payload?.lead;

      if (!purchasedLead) {
        alert("Lead unlocked, but no lead data was returned.");
        return;
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                name: purchasedLead.name ?? lead.name,
                email: purchasedLead.email ?? lead.email,
                phone: purchasedLead.phone ?? lead.phone,
                message: purchasedLead.message ?? lead.message,
                contact_locked: false,
                is_purchased: true,
                purchased_at:
                  purchasedLead.purchased_at ?? new Date().toISOString(),
                lead_price:
                  typeof purchasedLead.lead_price === "number"
                    ? purchasedLead.lead_price
                    : lead.lead_price,
              }
            : lead
        )
      );
    } catch {
      alert("Could not unlock this lead.");
    } finally {
      setBuyingLeadId(null);
    }
  };

  if (!leads || leads.length === 0) {
    return (
      <div
        style={{
          padding: "38px",
          borderRadius: "22px",
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(11,11,11,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: 500,
            marginBottom: "12px",
            letterSpacing: "-0.6px",
          }}
        >
          No matched leads yet
        </div>

        <p
          style={{
            margin: 0,
            color: "#a9a9a9",
            fontSize: "16px",
            lineHeight: "1.8",
            maxWidth: "760px",
            marginInline: "auto",
          }}
        >
          {agencyName} will see new opportunities here as soon as incoming demand
          aligns with your territory, property focus and client profile.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          marginBottom: "18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <ActionCard
          title="Locked opportunities"
          value={lockedLeads}
          helper="Still available to review and unlock individually"
        />
        <ActionCard
          title="Unlocked opportunities"
          value={purchasedLeads}
          helper="Open leads with visible contact and message details"
        />
        <ActionCard
          title="Ready now"
          value={readyToActLeads}
          helper="Strong high-priority matches currently sitting in new"
        />
      </div>

      {!isApproved && (
        <div
          style={{
            marginBottom: "20px",
            padding: "18px 20px",
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(11,11,11,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#cfcfcf",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          <strong style={{ color: "white" }}>Lead unlocking unavailable:</strong>{" "}
          your agency must be approved before contact details and full message
          content can be revealed.
        </div>
      )}

      <div
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(10,10,10,0.99) 100%)",
          boxShadow: "0 20px 56px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 500,
                letterSpacing: "-0.6px",
              }}
            >
              Matched opportunities
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#9f9f9f",
                fontSize: "14px",
                lineHeight: "1.7",
                maxWidth: "760px",
              }}
            >
              Ranked by fit quality and operational relevance. This view is built
              to help your agency decide fast which leads deserve immediate action.
            </p>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.03)",
              color: "#d7d7d7",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.45px",
              textTransform: "uppercase",
            }}
          >
            {leads.length} active opportunities
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "2320px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <th style={thStyle}>Match</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Market fit</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Area</th>
                <th style={thStyle}>Property</th>
                <th style={thStyle}>Budget</th>
                <th style={thStyle}>Client type</th>
                <th style={thStyle}>Timeframe</th>
                <th style={thStyle}>Financing</th>
                <th style={thStyle}>Seller status</th>
                <th style={thStyle}>Pipeline</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Unlocked at</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => {
                const isBuying = buyingLeadId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td style={tdStyleScore}>
                      <MatchScoreBadge
                        score={lead.match_score ?? 0}
                        label={lead.match_label ?? null}
                      />
                    </td>

                    <td style={tdStylePrice}>
                      <PriceBadge
                        price={lead.lead_price ?? 0}
                        purchased={Boolean(lead.is_purchased)}
                      />
                    </td>

                    <td style={tdStyleAction}>
                      {lead.is_purchased ? (
                        <UnlockedBadge />
                      ) : (
                        <button
                          onClick={() => unlockLead(lead.id)}
                          disabled={isBuying || !isApproved}
                          style={{
                            border: "1px solid #3d6b52",
                            background: isApproved
                              ? "linear-gradient(180deg, #193728 0%, #102219 100%)"
                              : "#1b1b1b",
                            color: isApproved ? "#e5f7ec" : "#7c7c7c",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor:
                              isBuying || !isApproved ? "not-allowed" : "pointer",
                            minWidth: "128px",
                            boxShadow: isApproved
                              ? "0 10px 28px rgba(11, 46, 27, 0.28)"
                              : "none",
                          }}
                        >
                          {isBuying ? "Unlocking..." : "Unlock lead"}
                        </button>
                      )}
                    </td>

                    <td style={tdStyleReason}>
                      <FitSummary
                        score={lead.match_score ?? 0}
                        reason={lead.match_reason ?? ""}
                      />
                    </td>

                    <td style={tdStyle}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.name ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyle}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.email ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyle}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.phone ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyle}>{formatValue(lead.city)}</td>
                    <td style={tdStyle}>{lead.preferred_area ?? "-"}</td>
                    <td style={tdStyle}>{formatValue(lead.property_type)}</td>
                    <td style={tdStyleBudget}>{lead.budget ?? "-"}</td>
                    <td style={tdStyle}>{formatValue(lead.user_type)}</td>
                    <td style={tdStyle}>{formatValue(lead.timeframe)}</td>
                    <td style={tdStyle}>{formatValue(lead.financing_status)}</td>
                    <td style={tdStyle}>{formatValue(lead.seller_status)}</td>

                    <td style={tdStyle}>
                      {lead.is_purchased ? (
                        <StatusButton
                          status={(lead.status as LeadStatus) ?? "new"}
                          onChange={() => updateLeadStatus(lead.id, lead.status)}
                        />
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "8px 10px",
                            borderRadius: "10px",
                            border: "1px solid #343434",
                            backgroundColor: "#191919",
                            color: "#8f8f8f",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Unlock first
                        </span>
                      )}
                    </td>

                    <td style={tdStyleMessage}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.message ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyleDate}>
                      {lead.purchased_at
                        ? new Date(lead.purchased_at).toLocaleString()
                        : "-"}
                    </td>

                    <td style={tdStyleDate}>
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function formatValue(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function MatchScoreBadge({
  score,
  label,
}: {
  score: number;
  label: string | null;
}) {
  const getStyles = () => {
    if (score >= 80) {
      return {
        background: "#10311c",
        border: "#1d5a34",
        color: "#8ff0b1",
        label: label ?? "STRONG",
      };
    }

    if (score >= 60) {
      return {
        background: "#2e2610",
        border: "#5a4a1d",
        color: "#f2d37d",
        label: label ?? "GOOD",
      };
    }

    return {
      background: "#262626",
      border: "#3a3a3a",
      color: "#d7d7d7",
      label: label ?? "BASIC",
    };
  };

  const styles = getStyles();

  return (
    <div style={{ minWidth: "104px" }}>
      <div
        style={{
          padding: "8px 10px",
          borderRadius: "13px",
          backgroundColor: styles.background,
          border: `1px solid ${styles.border}`,
          color: styles.color,
          fontWeight: 700,
          fontSize: "13px",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        {score}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#9f9f9f",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          fontWeight: 700,
        }}
      >
        {styles.label}
      </div>
    </div>
  );
}

function PriceBadge({
  price,
  purchased,
}: {
  price: number;
  purchased: boolean;
}) {
  return (
    <div style={{ minWidth: "102px" }}>
      <div
        style={{
          padding: "8px 10px",
          borderRadius: "13px",
          backgroundColor: purchased ? "#0f2e23" : "#151515",
          border: purchased ? "1px solid #24533f" : "1px solid #2b2b2b",
          color: purchased ? "#9df0c5" : "#f1f1f1",
          fontWeight: 700,
          fontSize: "14px",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        €{price}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#9f9f9f",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          fontWeight: 700,
        }}
      >
        {purchased ? "Unlocked" : "Per lead"}
      </div>
    </div>
  );
}

function UnlockedBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 12px",
        borderRadius: "12px",
        border: "1px solid #24533f",
        background: "linear-gradient(180deg, #143325 0%, #10261b 100%)",
        color: "#c8f7da",
        fontSize: "12px",
        fontWeight: 700,
        minWidth: "128px",
      }}
    >
      Unlocked
    </div>
  );
}

function FitSummary({
  score,
  reason,
}: {
  score: number;
  reason: string;
}) {
  const items = reason
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div style={{ minWidth: "250px", maxWidth: "320px" }}>
      <div
        style={{
          marginBottom: "8px",
          fontSize: "12px",
          color: score >= 80 ? "#8ff0b1" : score >= 60 ? "#f2d37d" : "#b3b3b3",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
        }}
      >
        {score >= 80 ? "High fit" : score >= 60 ? "Good fit" : "Basic fit"}
      </div>

      <div style={{ color: "#d8d8d8", lineHeight: "1.65", fontSize: "14px" }}>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} style={{ marginBottom: "5px" }}>
              <span style={{ color: "#858585" }}>• </span>
              {capitalizeWords(item)}
            </div>
          ))
        ) : (
          "-"
        )}
      </div>
    </div>
  );
}

function capitalizeWords(value: string) {
  return value
    .split(" ")
    .map((part) =>
      part.length ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join(" ");
}

function LockedCell({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "22px",
      }}
    >
      <div
        style={{
          filter: locked ? "blur(4px)" : "none",
          userSelect: locked ? "none" : "text",
          pointerEvents: locked ? "none" : "auto",
          opacity: locked ? 0.82 : 1,
        }}
      >
        {children}
      </div>

      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            color: "#f1f1f1",
            pointerEvents: "none",
          }}
        >
          Locked
        </div>
      )}
    </div>
  );
}

function ActionCard({
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
        padding: "20px 22px",
        minHeight: "124px",
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
        Lead desk
      </div>

      <div
        style={{
          fontSize: "15px",
          color: "#d7d7d7",
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

const thStyle = {
  padding: "16px 18px",
  textAlign: "left" as const,
  fontSize: "12px",
  whiteSpace: "nowrap" as const,
  color: "#c5c5c5",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  color: "#f1f1f1",
};

const tdStyleScore = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "120px",
  color: "#f1f1f1",
};

const tdStylePrice = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "112px",
  color: "#f1f1f1",
};

const tdStyleAction = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "150px",
  color: "#f1f1f1",
};

const tdStyleReason = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "260px",
  maxWidth: "330px",
  color: "#f1f1f1",
};

const tdStyleMessage = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "320px",
  maxWidth: "420px",
  lineHeight: "1.7",
  color: "#f1f1f1",
};

const tdStyleBudget = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "130px",
  lineHeight: "1.6",
  color: "#f1f1f1",
};

const tdStyleDate = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "175px",
  lineHeight: "1.6",
  color: "#f1f1f1",
};