import { createClient } from "@supabase/supabase-js";
import AgencyApplicationsTable from "./AgencyApplicationsTable";

export const dynamic = "force-dynamic";

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
        <AgencyApplicationsTable initialApplications={applications} />
      )}
    </main>
  );
}