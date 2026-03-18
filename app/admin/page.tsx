import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
};

export default async function AdminPage() {
  noStore();

  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const safeLeads = (leads ?? []) as Lead[];

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1800px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "40px",
            marginBottom: "14px",
            textAlign: "center",
            letterSpacing: "-1px",
            fontWeight: 400,
          }}
        >
          THE KERMAN ORGANIZATION — LEADS
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#bfbfbf",
            marginBottom: "30px",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          Admin lead view with structured intake fields for better matching.
        </p>

        {error && (
          <p style={{ textAlign: "center", color: "#ff6b6b" }}>
            Error loading leads.
          </p>
        )}

        {!safeLeads || safeLeads.length === 0 ? (
          <p style={{ textAlign: "center" }}>No leads yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#111111",
                borderRadius: "12px",
                overflow: "hidden",
                minWidth: "2200px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Preferred area</th>
                  <th style={thStyle}>Property type</th>
                  <th style={thStyle}>Timeframe</th>
                  <th style={thStyle}>Financing status</th>
                  <th style={thStyle}>Seller status</th>
                  <th style={thStyle}>Rental profile</th>
                  <th style={thStyle}>Budget</th>
                  <th style={thStyle}>User type</th>
                  <th style={thStyle}>Lead status</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Created at</th>
                </tr>
              </thead>

              <tbody>
                {safeLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderTop: "1px solid #222" }}>
                    <td style={tdStyle}>{lead.name ?? "-"}</td>
                    <td style={tdStyle}>{lead.email ?? "-"}</td>
                    <td style={tdStyle}>{lead.phone ?? "-"}</td>
                    <td style={tdStyle}>{lead.city ?? "-"}</td>
                    <td style={tdStyle}>{lead.preferred_area ?? "-"}</td>
                    <td style={tdStyle}>{formatValue(lead.property_type)}</td>
                    <td style={tdStyle}>{formatValue(lead.timeframe)}</td>
                    <td style={tdStyle}>
                      {formatValue(lead.financing_status)}
                    </td>
                    <td style={tdStyle}>{formatValue(lead.seller_status)}</td>
                    <td style={tdStyle}>{formatValue(lead.rental_profile)}</td>
                    <td style={tdStyle}>{lead.budget ?? "-"}</td>
                    <td style={tdStyle}>{formatValue(lead.user_type)}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          backgroundColor: getLeadStatusBackground(
                            lead.status ?? "new"
                          ),
                          color: "white",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          letterSpacing: "0.4px",
                          display: "inline-block",
                        }}
                      >
                        {lead.status ?? "new"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, minWidth: "360px" }}>
                      {lead.message ?? "-"}
                    </td>
                    <td style={tdStyle}>
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function formatValue(value: string | null) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLeadStatusBackground(status: string) {
  if (status === "new") return "#0f2d16";
  if (status === "contacted") return "#2d240f";
  if (status === "closed") return "#2a2a2a";
  return "#2d2d2d";
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
  lineHeight: "1.5",
};