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
          minWidth: "1500px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#1a1a1a" }}>
            <th style={thStyle}>Agency</th>
            <th style={thStyle}>City</th>
            <th style={thStyle}>Website</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Business phone</th>
            <th style={thStyle}>Email</th>
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
                  ""
                )}
              </td>

              <td style={tdStyle}>{app.contact_name}</td>
              <td style={tdStyle}>{app.business_phone ?? "-"}</td>
              <td style={tdStyle}>{app.email}</td>
              <td style={tdStyle}>{app.message}</td>

              <td style={tdStyle}>
                <span
                  style={{
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
                    textTransform: "uppercase",
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
