import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AgenciesPage() {
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

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial",
        padding: "50px 20px",
      }}
    >
      <section style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "30px",
            padding: "24px",
            border: "1px solid #1f1f1f",
            borderRadius: "16px",
            backgroundColor: "#111111",
          }}
        >
          <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
            Agency Dashboard
          </h1>

          <p style={{ fontSize: "20px", color: "#d0d0d0", lineHeight: "1.6" }}>
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
          }}
        >
          <strong style={{ color: "white" }}>Current phase:</strong> all approved
          agencies can see the same leads. Lead filtering by agency profile will
          come later.
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
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1a1a1a" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Created at</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderTop: "1px solid #222" }}>
                    <td style={tdStyle}>{lead.name}</td>
                    <td style={tdStyle}>{lead.email}</td>
                    <td style={tdStyle}>{lead.user_type}</td>
                    <td style={tdStyle}>{lead.message}</td>
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
      </section>
    </main>
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