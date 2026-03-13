import { createClient } from "@/lib/supabase/server";
import AgencyApplicationsTable from "./AgencyApplicationsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAgenciesPage() {
  const supabase = await createClient();

  const { data: applications, error } = await supabase
    .from("agency_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
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
        <section style={{ maxWidth: "1600px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 300,
              marginBottom: "40px",
              letterSpacing: "-1px",
            }}
          >
            THE KERMAN ORGANIZATION — AGENCY APPLICATIONS
          </h1>

          <p style={{ color: "red" }}>Error loading agency applications.</p>
        </section>
      </main>
    );
  }

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
      <section style={{ maxWidth: "1600px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 300,
            marginBottom: "40px",
            letterSpacing: "-1px",
          }}
        >
          THE KERMAN ORGANIZATION — AGENCY APPLICATIONS
        </h1>

        <AgencyApplicationsTable initialApplications={applications ?? []} />
      </section>
    </main>
  );
}