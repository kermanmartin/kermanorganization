import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusButton from "./StatusButton";
import LogoutButton from "./LogoutButton";

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

  const { data: application } = await supabase
    .from("agency_applications")
    .select("*")
    .eq("email", user.email)
    .eq("status", "approved")
    .maybeSingle();

  if (!application) {
    redirect("/agency-access");
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const newLeads = leads?.filter((lead: any) => (lead.status ?? "new") === "new").length ?? 0;
  const contactedLeads =
    leads?.filter((lead: any) => lead.status === "contacted").length ?? 0;
  const closedLeads =
    leads?.filter((lead: any) => lead.status === "closed").length ?? 0;

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            padding: "28px",
            border: "1px solid #1f1f1f",
            borderRadius: "18px",
            backgroundColor: "#111111",
          }}
        >
          <div>
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

            <p
              style={{
                fontSize: "14px",
                color: "#9f9f9f",
                marginTop: "14px",
                marginBottom: 0,
              }}
            >
              Signed in as: {user.email}
            </p>
          </div>

          <LogoutButton />
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
          agencies can view the same leads.
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <StatCard title="New leads" value={newLeads} />
          <StatCard title="Contacted" value={contactedLeads} />
          <StatCard title="Closed" value={closedLeads} />
        </div>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            Error loading leads.
          </p>
        )}

        {!leads || leads.length === 0 ? (
          <p style={{ textAlign: "center" }}>No leads available yet.</p>
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
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderTop: "1px solid #222" }}>
                    <td style={tdStyle}>{lead.name ?? "-"}</td>
                    <td style={tdStyle}>{lead.email ?? "-"}</td>
                    <td style={tdStyle}>{lead.city ?? "-"}</td>
                    <td style={tdStyle}>{lead.budget ?? "-"}</td>
                    <td style={tdStyle}>{lead.user_type ?? "-"}</td>

                    <td style={tdStyle}>
                      <StatusButton
                        leadId={lead.id}
                        currentStatus={lead.status ?? "new"}
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
      </section>
    </main>
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