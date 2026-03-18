"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AgencyApplication = {
  id: string;
  agency_name: string;
  city: string;
  website: string;
  contact_name: string;
  business_phone: string | null;
  email: string;
  preferred_cities: string | null;
  preferred_areas: string | null;
  property_types: string[] | null;
  client_types: string[] | null;
  min_budget: string | null;
  max_budget: string | null;
  budget_range: string | null;
  deals_per_month: string | null;
  coverage_details: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function AgencyApplicationsTable({
  initialApplications,
}: {
  initialApplications: AgencyApplication[];
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const updateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);

    const res = await fetch("/api/agency-applications/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );

      router.refresh();
    } else {
      alert("Could not update status.");
    }

    setLoadingId(null);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#111111",
          borderRadius: "12px",
          overflow: "hidden",
          minWidth: "2400px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#1a1a1a" }}>
            <th style={thStyle}>Agency</th>
            <th style={thStyle}>Main city</th>
            <th style={thStyle}>Website</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Business phone</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Preferred cities</th>
            <th style={thStyle}>Preferred areas</th>
            <th style={thStyle}>Property types</th>
            <th style={thStyle}>Client types</th>
            <th style={thStyle}>Min budget</th>
            <th style={thStyle}>Max budget</th>
            <th style={thStyle}>Budget range</th>
            <th style={thStyle}>Deals / month</th>
            <th style={thStyle}>Coverage details</th>
            <th style={thStyle}>Message</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Created at</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app.id} style={{ borderTop: "1px solid #222" }}>
              <td style={tdStyle}>{app.agency_name}</td>
              <td style={tdStyle}>{app.city}</td>

              <td style={tdStyle}>
                {app.website ? (
                  <a
                    href={
                      app.website.startsWith("http")
                        ? app.website
                        : `https://${app.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#9ecbff" }}
                  >
                    {app.website}
                  </a>
                ) : (
                  "-"
                )}
              </td>

              <td style={tdStyle}>{app.contact_name}</td>
              <td style={tdStyle}>{app.business_phone ?? "-"}</td>
              <td style={tdStyle}>{app.email}</td>
              <td style={tdStyleText}>{app.preferred_cities ?? "-"}</td>
              <td style={tdStyleText}>{app.preferred_areas ?? "-"}</td>
              <td style={tdStyle}>{formatArray(app.property_types)}</td>
              <td style={tdStyle}>{formatArray(app.client_types)}</td>
              <td style={tdStyle}>{app.min_budget ?? "-"}</td>
              <td style={tdStyle}>{app.max_budget ?? "-"}</td>
              <td style={tdStyle}>{app.budget_range ?? "-"}</td>
              <td style={tdStyle}>{app.deals_per_month ?? "-"}</td>
              <td style={tdStyleText}>{app.coverage_details ?? "-"}</td>
              <td style={tdStyleMessage}>{app.message}</td>

              <td style={tdStyle}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    backgroundColor:
                      app.status === "approved"
                        ? "#123d22"
                        : app.status === "rejected"
                        ? "#4a1515"
                        : "#2d2d2d",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {app.status}
                </span>
              </td>

              <td style={tdStyle}>
                {app.created_at
                  ? new Date(app.created_at).toLocaleString()
                  : ""}
              </td>

              <td style={tdStyle}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => updateStatus(app.id, "approved")}
                    disabled={loadingId === app.id}
                    style={{
                      ...approveButton,
                      opacity: loadingId === app.id ? 0.6 : 1,
                      cursor: loadingId === app.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {loadingId === app.id ? "Updating..." : "Approve"}
                  </button>

                  <button
                    onClick={() => updateStatus(app.id, "rejected")}
                    disabled={loadingId === app.id}
                    style={{
                      ...rejectButton,
                      opacity: loadingId === app.id ? 0.6 : 1,
                      cursor: loadingId === app.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {loadingId === app.id ? "Updating..." : "Reject"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatArray(value: string[] | null) {
  if (!value || value.length === 0) return "-";

  return value
    .map((item) =>
      item
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    )
    .join(", ");
}

const thStyle = {
  padding: "16px",
  textAlign: "left" as const,
  fontSize: "15px",
  whiteSpace: "nowrap" as const,
};

const tdStyle = {
  padding: "16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
};

const tdStyleText = {
  padding: "16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "180px",
  maxWidth: "260px",
  lineHeight: "1.6",
};

const tdStyleMessage = {
  padding: "16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "260px",
  maxWidth: "360px",
  lineHeight: "1.6",
};

const approveButton = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#1f7a3f",
  color: "white",
  fontWeight: "bold",
};

const rejectButton = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#8b1e1e",
  color: "white",
  fontWeight: "bold",
};