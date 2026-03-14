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
};

export default function AgencyDashboardClient({
  initialLeads,
}: {
  initialLeads: Lead[];
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
    if (selectedCity === "all") return leads;

    return leads.filter(
      (lead) => (lead.city?.trim() ?? "").toLowerCase() === selectedCity.toLowerCase()
    );
  }, [leads, selectedCity]);

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

          <select
            id="city-filter"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #2a2a2a",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: "15px",
              outline: "none",
            }}
          >
            <option value="all">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                  <td style={tdStyle}>{lead.name ?? "-"}</td>
                  <td style={tdStyle}>{lead.email ?? "-"}</td>
                  <td style={tdStyle}>{lead.city ?? "-"}</td>
                  <td style={tdStyle}>{lead.budget ?? "-"}</td>
                  <td style={tdStyle}>{lead.user_type ?? "-"}</td>

                  <td style={tdStyle}>
                    <StatusButton
                      status={(lead.status as LeadStatus) ?? "new"}
                      onChange={() => updateLeadStatus(lead.id, lead.status)}
                    />
                  </td>

                  <td style={tdStyle}>{lead.message ?? "-"}</td>

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
