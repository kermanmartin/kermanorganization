import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminAgenciesPage() {
  const { data: applications, error } = await supabase
    .from("agency_applications")
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
      <h1
        style={{
          fontSize: "40px",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        THE KERMAN ORGANIZATION — AGENCY APPLICATIONS
      </h1>

      {error && (
        <p style={{ textAlign: "center", color: "red" }}>
          Error loading agency applications.
        </p>
      )}

      {!applications || applications.length === 0 ? (
        <p style={{ textAlign: "center" }}>No agency applications yet.</p>
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
                <th style={thStyle}>Agency</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Website</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created at</th>
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
                  <td style={tdStyle}>{app.email}</td>
                  <td style={tdStyle}>{app.message}</td>
                  <td style={tdStyle}>{app.status}</td>
                  <td style={tdStyle}>
                    {app.created_at
                      ? new Date(app.created_at).toLocaleString()
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
  fontSize: "15px",
};

const tdStyle = {
  padding: "16px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
};