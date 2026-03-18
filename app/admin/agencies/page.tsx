import { createClient } from "@/lib/supabase/server";
import AgencyApplicationsTable from "./AgencyApplicationsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        <section style={{ maxWidth: "1700px", margin: "0 auto" }}>
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

          <pre
            style={{
              color: "#ff4d4f",
              backgroundColor: "#111111",
              padding: "20px",
              borderRadius: "12px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: "1px solid #222",
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </section>
      </main>
    );
  }

  const safeApplications: AgencyApplication[] =
    (applications ?? []) as AgencyApplication[];

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
      <section style={{ maxWidth: "1700px", margin: "0 auto" }}>
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

        <AgencyApplicationsTable initialApplications={safeApplications} />
      </section>
    </main>
  );
}