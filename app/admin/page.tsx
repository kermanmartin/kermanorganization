import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminPage() {
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
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "30px", textAlign: "center" }}>
        THE KERMAN ORGANIZATION — LEADS
      </h1>

      {error && (
        <p style={{ textAlign: "center", color: "red" }}>
          Error loading leads.
        </p>
      )}

      {!leads || leads.length === 0 ? (
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
              {leads.map((lead) => (
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
    </main>
  );
}

const thStyle = {
  padding: "16px",
  textAlign: "left" as const,
  fontSize: "16px",
};

const tdStyle = {
  padding: "16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "15px",
};