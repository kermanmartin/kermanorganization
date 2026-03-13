import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import AgencyDashboardClient from "./AgencyDashboardClient";

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

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            Error loading leads.
          </p>
        )}

        <AgencyDashboardClient initialLeads={leads ?? []} />
      </section>
    </main>
  );
}