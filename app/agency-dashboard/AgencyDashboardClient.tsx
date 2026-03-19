"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusButton from "./StatusButton";

type LeadStatus = "new" | "contacted" | "closed";

type Lead = {
  id: number;
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
  status: string | null;
  message: string | null;
  created_at: string | null;
  contact_locked?: boolean;
  match_score?: number;
  match_reason?: string | null;
};

export default function AgencyDashboardClient({
  initialLeads,
  isApproved,
}: {
  initialLeads: Lead[];
  isApproved: boolean;
}) {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const newLeads = useMemo(
    () => leads.filter((lead) => (lead.status ?? "new") === "new").length,
    [leads]
  );

  const contactedLeads = useMemo(
    () => leads.filter((lead) => lead.status === "contacted").length,
    [leads]
  );

  const closedLeads = useMemo(
    () => leads.filter((lead) => lead.status === "closed").length,
    [leads]
  );

  const averageMatchScore = useMemo(() => {
    const scoredLeads = leads.filter(
      (lead) => typeof lead.match_score === "number"
    );

    if (scoredLeads.length === 0) return null;

    const total = scoredLeads.reduce(
      (sum, lead) => sum + (lead.match_score ?? 0),
      0
    );

    return Math.round(total / scoredLeads.length);
  }, [leads]);

  const strongMatches = useMemo(
    () => leads.filter((lead) => (lead.match_score ?? 0) >= 70).length,
    [leads]
  );

  const getNextStatus = (currentStatus: string | null): LeadStatus => {
    if (currentStatus === "new" || !currentStatus) return "contacted";
    if (currentStatus === "contacted") return "closed";
    return "new";
  };

  const updateLeadStatus = async (
    leadId: number,
    currentStatus: string | null
  ) => {
    const newStatus = getNextStatus(currentStatus);
    const previousLeads = leads;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
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

  if (!leads || leads.length === 0) {
    return (
      <div
        style={{
          padding: "34px",
          borderRadius: "18px",
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(12,12,12,0.98) 100%)",
          border: "1px solid #1f1f1f",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 500,
            marginBottom: "10px",
            letterSpacing: "-0.5px",
          }}
        >
          No matched leads yet
        </div>

        <p
          style={{
            margin: 0,
            color: "#a9a9a9",
            fontSize: "16px",
            lineHeight: "1.7",
            maxWidth: "760px",
            marginInline: "auto",
          }}
        >
          When a new lead matches your city coverage, property profile and budget
          range, it will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <StatCard
          eyebrow="Pipeline"
          title="Matched leads"
          value={leads.length}
        />
        <StatCard eyebrow="Status" title="New" value={newLeads} />
        <StatCard eyebrow="Status" title="Contacted" value={contactedLeads} />
        <StatCard eyebrow="Status" title="Closed" value={closedLeads} />
        <StatCard
          eyebrow="Quality"
          title="Strong matches"
          value={strongMatches}
        />
        <StatCard
          eyebrow="Quality"
          title="Avg. score"
          value={averageMatchScore ?? 0}
        />
      </div>

      {!isApproved && (
        <div
          style={{
            marginBottom: "20px",
            padding: "18px 20px",
            borderRadius: "16px",
            background:
              "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(12,12,12,0.98) 100%)",
            border: "1px solid #1f1f1f",
            color: "#cfcfcf",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          <strong style={{ color: "white" }}>Contact details locked:</strong>{" "}
          name, email, phone and full message content remain locked until your
          agency is approved.
        </div>
      )}

      <div
        style={{
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid #1f1f1f",
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(12,12,12,0.98) 100%)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #1f1f1f",
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
                fontSize: "24px",
                fontWeight: 500,
                letterSpacing: "-0.5px",
              }}
            >
              Matched opportunities
            </h2>
            <p
              style={{
                margin: "6px 0 0 0",
                color: "#9f9f9f",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Leads shown here already match your city coverage and current
              agency profile.
            </p>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              border: "1px solid #2a2a2a",
              backgroundColor: "#141414",
              color: "#d7d7d7",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            {leads.length} matched
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "2050px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#171717" }}>
                <th style={thStyle}>Match</th>
                <th style={thStyle}>Why matched</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Preferred area</th>
                <th style={thStyle}>Property type</th>
                <th style={thStyle}>Timeframe</th>
                <th style={thStyle}>Financing</th>
                <th style={thStyle}>Seller status</th>
                <th style={thStyle}>Budget</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderTop: "1px solid #202020" }}>
                  <td style={tdStyleScore}>
                    <MatchScoreBadge score={lead.match_score ?? 0} />
                  </td>

                  <td style={tdStyleReason}>
                    <div
                      style={{
                        color: "#d9d9d9",
                        lineHeight: "1.7",
                        minWidth: "240px",
                        maxWidth: "320px",
                      }}
                    >
                      {lead.match_reason ? (
                        lead.match_reason
                          .split("•")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item) => (
                            <div key={item} style={{ marginBottom: "6px" }}>
                              <span style={{ color: "#8f8f8f" }}>• </span>
                              {capitalizeWords(item)}
                            </div>
                          ))
                      ) : (
                        "-"
                      )}
                    </div>
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
                  <td style={tdStyle}>{formatValue(lead.timeframe)}</td>
                  <td style={tdStyle}>{formatValue(lead.financing_status)}</td>
                  <td style={tdStyle}>{formatValue(lead.seller_status)}</td>
                  <td style={tdStyleBudget}>{lead.budget ?? "-"}</td>
                  <td style={tdStyle}>{formatValue(lead.user_type)}</td>

                  <td style={tdStyle}>
                    <StatusButton
                      status={(lead.status as LeadStatus) ?? "new"}
                      onChange={() => updateLeadStatus(lead.id, lead.status)}
                    />
                  </td>

                  <td style={tdStyleMessage}>
                    <LockedCell locked={Boolean(lead.contact_locked)}>
                      {lead.message ?? "-"}
                    </LockedCell>
                  </td>

                  <td style={tdStyleDate}>
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function formatValue(value: string | null) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function capitalizeWords(value: string) {
  return value
    .split(" ")
    .map((part) =>
      part.length ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join(" ");
}

function MatchScoreBadge({ score }: { score: number }) {
  const getStyles = () => {
    if (score >= 75) {
      return {
        background: "#10311c",
        border: "#1d5a34",
        color: "#8ff0b1",
        label: "Strong",
      };
    }

    if (score >= 55) {
      return {
        background: "#2e2610",
        border: "#5a4a1d",
        color: "#f2d37d",
        label: "Good",
      };
    }

    return {
      background: "#262626",
      border: "#3a3a3a",
      color: "#d7d7d7",
      label: "Basic",
    };
  };

  const styles = getStyles();

  return (
    <div
      style={{
        minWidth: "100px",
      }}
    >
      <div
        style={{
          padding: "8px 10px",
          borderRadius: "12px",
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

function StatCard({
  eyebrow,
  title,
  value,
}: {
  eyebrow: string;
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(12,12,12,0.98) 100%)",
        border: "1px solid #1f1f1f",
        borderRadius: "18px",
        padding: "20px 22px",
        minHeight: "112px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#8f8f8f",
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontSize: "15px",
          color: "#d2d2d2",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "34px",
          fontWeight: 700,
          letterSpacing: "-1px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "16px 18px",
  textAlign: "left" as const,
  fontSize: "13px",
  whiteSpace: "nowrap" as const,
  color: "#c5c5c5",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.4px",
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

const tdStyleReason = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  color: "#f1f1f1",
  minWidth: "260px",
  maxWidth: "340px",
};

const tdStyleMessage = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "300px",
  maxWidth: "400px",
  lineHeight: "1.7",
  color: "#f1f1f1",
};

const tdStyleBudget = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "120px",
  lineHeight: "1.6",
  color: "#f1f1f1",
};

const tdStyleDate = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "170px",
  lineHeight: "1.6",
  color: "#f1f1f1",
};