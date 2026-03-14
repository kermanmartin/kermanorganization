"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusButton from "./StatusButton";

type LeadStatus = "new" | "contacted" | "closed";

type Lead = {
  id: number;
  name: string | null;
  email: string | null;
  city: string | null;
  budget: string | null;
  user_type: string | null;
  status: string | null;
  message: string | null;
  created_at: string | null;
  contact_locked?: boolean;
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
  const [selectedCity, setSelectedCity] = useState("all");

  const cityOptions = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(
        leads
          .map((lead) => lead.city?.trim())
          .filter((city): city is string => Boolean(city))
      )
    ).sort((a, b) => a.localeCompare(b));

    return uniqueCities;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (!isApproved) {
      return leads;
    }

    if (selectedCity === "all") return leads;

    return leads.filter(
      (lead) =>
        (lead.city?.trim() ?? "").toLowerCase() === selectedCity.toLowerCase()
    );
  }, [leads, selectedCity, isApproved]);

  const newLeads = useMemo(
    () => filteredLeads.filter((lead) => (lead.status ?? "new") === "new").length,
    [filteredLeads]
  );

  const contactedLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.status === "contacted").length,
    [filteredLeads]
  );

  const closedLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.status === "closed").length,
    [filteredLeads]
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
    return <p style={{ textAlign: "center" }}>No leads available yet.</p>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "22px",
          flexWrap: "wrap",
          alignItems: "end",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <StatCard title="New leads" value={newLeads} />
          <StatCard title="Contacted" value={contactedLeads} />
          <StatCard title="Closed" value={closedLeads} />
        </div>

        <div
          style={{
            minWidth: "220px",
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "14px",
            padding: "14px 16px",
            position: "relative",
            opacity: isApproved ? 1 : 0.7,
          }}
        >
          <label
            htmlFor="city-filter"
            style={{
              display: "block",
              fontSize: "13px",
              color: "#9f9f9f",
              marginBottom: "8px",
            }}
          >
            Filter by city
          </label>

          <div style={{ position: "relative" }}>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!isApproved}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #2a2a2a",
                backgroundColor: "#1a1a1a",
                color: "white",
                fontSize: "15px",
                outline: "none",
                appearance: "none",
                cursor: isApproved ? "pointer" : "not-allowed",
              }}
            >
              <option value="all">All cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {!isApproved && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  pointerEvents: "none",
                  backdropFilter: "blur(2px)",
                  WebkitBackdropFilter: "blur(2px)",
                }}
              >
                Locked
              </div>
            )}
          </div>
        </div>
      </div>

      {!isApproved && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px 18px",
            borderRadius: "14px",
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            color: "#cfcfcf",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "white" }}>Contact details locked:</strong>{" "}
          name, email, full message content and advanced filtering will be
          unlocked once your agency is approved.
        </div>
      )}

      {filteredLeads.length === 0 ? (
        <div
          style={{
            padding: "28px",
            borderRadius: "14px",
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            color: "#cfcfcf",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          No leads found for the selected city.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#111111",
              borderRadius: "14px",
              overflow: "hidden",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1a1a1a" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Budget</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={{ borderTop: "1px solid #222" }}>
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

                  <td style={tdStyle}>{lead.city ?? "-"}</td>
                  <td style={tdStyle}>{lead.budget ?? "-"}</td>
                  <td style={tdStyle}>{lead.user_type ?? "-"}</td>

                  <td style={tdStyle}>
                    <StatusButton
                      status={(lead.status as LeadStatus) ?? "new"}
                      onChange={() => updateLeadStatus(lead.id, lead.status)}
                    />
                  </td>

                  <td style={tdStyle}>
                    <LockedCell locked={Boolean(lead.contact_locked)}>
                      {lead.message ?? "-"}
                    </LockedCell>
                  </td>

                  <td style={tdStyle}>
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
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
          opacity: locked ? 0.85 : 1,
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

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        backgroundColor: "#111111",
        border: "1px solid #1f1f1f",
        borderRadius: "14px",
        padding: "18px 24px",
        minWidth: "160px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#9f9f9f",
          marginBottom: "6px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "16px",
  textAlign: "left" as const,
  fontSize: "15px",
};

const tdStyle = {
  padding: "16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
};
