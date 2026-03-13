import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AgencyDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/agency-access");
  }

  const { data: application, error: applicationError } = await supabase
    .from("agency_applications")
    .select("*")
    .eq("email", user.email)
    .eq("status", "approved")
    .maybeSingle();

  if (applicationError || !application) {
    redirect("/agency-access");
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "50px 20px",
      }}
    >
      <section style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "30px",
            padding: "28px",
            border: "1px solid #1f1f1f",
            borderRadius: "18px",
            backgroundColor: "#111111",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "12px",
              fontWeight: 400,
              letterSpacing: "-1px",
            }}
          >
            AGENCY DASHBOARD
          </h1>

          <p
            style={{
              fontSize: "20px",
              color: "#d0d0d0",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            Welcome, {application.agency_name}. You are viewing the current lead
            flow from The Kerman Organization.
          </p>
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "18px 22px",
            border: "1px solid #1f1f1f",
            borderRadius: "14px",
            backgroundColor: "#111111",
            color: "#cfcfcf",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "white" }}>Current phase:</strong> all approved
          agencies can view the same leads. Smart lead filtering and assignment
          logic will be added later.
        </div>

        {leadsError && (
          <div
            style={{
              padding: "18px 22px",
              border: "1px solid #4a1515",
              borderRadius: "14px",
              backgroundColor: "#1a0f0f",
              color: "#ff6b6b",
              marginBottom: "24px",
            }}
          >
            Error loading leads.
          </div>
        )}

        {!leads || leads.length === 0 ? (
          <div
            style={{
              padding: "24px",
              border: "1px solid #1f1f1f",
              borderRadius: "14px",
              backgroundColor: "#111111",
              textAlign: "center",
              color: "#d0d0d0",
            }}
          >
            No leads available yet.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #1f1f1f",
              borderRadius: "16px",
              backgroundColor: "#111111",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1000px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Property type</th>
                  <th style={thStyle}>Budget</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Created at</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderTop: "1px solid #222" }}>
                    <td style={tdStyle}>{lead.name ?? "-"}</td>
                    <td style={tdStyle}>{lead.email ?? "-"}</td>
                    <td style={tdStyle}>{lead.phone ?? "-"}</td>
                    <td style={tdStyle}>{lead.city ?? "-"}</td>
                    <td style={tdStyle}>{lead.property_type ?? "-"}</td>
                    <td style={tdStyle}>{lead.budget ?? "-"}</td>
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
      </section>
    </main>
  );
}

const thStyle = {
  padding: "18px 16px",
  textAlign: "left" as const,
  fontSize: "15px",
  fontWeight: 700,
  color: "white",
  whiteSpace: "nowrap" as const,
};

const tdStyle = {
  padding: "18px 16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  color: "#e8e8e8",
  lineHeight: "1.5",
};