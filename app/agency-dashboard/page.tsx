import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import AgencyDashboardClient from "./AgencyDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Lead = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
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
  contact_locked?: boolean;
};

type AgencyApplication = {
  id: string;
  agency_name: string;
  email: string;
  status: string;
  country: string | null;
  city: string | null;
  preferred_cities: string | null;
  property_types: string[] | null;
  client_types: string[] | null;
  min_budget: string | null;
  max_budget: string | null;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function splitCommaValues(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseBudgetNumber(value: string | null | undefined) {
  if (!value) return null;

  const cleaned = value
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseLeadBudgetRange(budget: string | null | undefined) {
  if (!budget) {
    return { min: null as number | null, max: null as number | null };
  }

  const normalized = budget.replace(/[^\d\-–—,.\s]/g, " ");
  const matches = normalized.match(/\d[\d.,]*/g) ?? [];

  if (matches.length < 2) {
    return { min: null as number | null, max: null as number | null };
  }

  const min = parseBudgetNumber(matches[0]);
  const max = parseBudgetNumber(matches[1]);

  return { min, max };
}

function matchesCountry(lead: Lead, application: AgencyApplication) {
  const agencyCountry = normalizeText(application.country);
  if (!agencyCountry) return true;

  const leadCountry = normalizeText(lead.country);
  return agencyCountry === leadCountry;
}

function matchesCity(lead: Lead, application: AgencyApplication) {
  const leadCity = normalizeText(lead.city);
  const mainCity = normalizeText(application.city);
  const extraCities = splitCommaValues(application.preferred_cities);

  if (!leadCity) return false;
  if (leadCity === mainCity) return true;
  if (extraCities.includes(leadCity)) return true;

  return false;
}

function matchesPropertyType(lead: Lead, application: AgencyApplication) {
  const agencyPropertyTypes =
    application.property_types?.map((item) => item.trim().toLowerCase()) ?? [];

  if (agencyPropertyTypes.length === 0) return true;

  const leadPropertyType = normalizeText(lead.property_type);
  return agencyPropertyTypes.includes(leadPropertyType);
}

function matchesClientType(lead: Lead, application: AgencyApplication) {
  const agencyClientTypes =
    application.client_types?.map((item) => item.trim().toLowerCase()) ?? [];

  if (agencyClientTypes.length === 0) return true;

  const leadUserType = normalizeText(lead.user_type);
  return agencyClientTypes.includes(leadUserType);
}

function matchesBudget(lead: Lead, application: AgencyApplication) {
  const agencyMin = parseBudgetNumber(application.min_budget);
  const agencyMax = parseBudgetNumber(application.max_budget);

  if (agencyMin === null || agencyMax === null) return true;

  const leadBudget = parseLeadBudgetRange(lead.budget);

  if (leadBudget.min === null || leadBudget.max === null) return true;

  return leadBudget.max >= agencyMin && leadBudget.min <= agencyMax;
}

function leadMatchesAgency(lead: Lead, application: AgencyApplication) {
  return (
    matchesCountry(lead, application) &&
    matchesCity(lead, application) &&
    matchesPropertyType(lead, application) &&
    matchesClientType(lead, application) &&
    matchesBudget(lead, application)
  );
}

export default async function AgencyDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/agency-access");
  }

  const { data: applicationData } = await supabase
    .from("agency_applications")
    .select("*")
    .eq("email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!applicationData) {
    redirect("/agencies");
  }

  const application = applicationData as AgencyApplication;
  const isApproved = application.status === "approved";

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const typedLeads: Lead[] = (leads ?? []) as Lead[];

  const matchedLeads = typedLeads.filter((lead) =>
    leadMatchesAgency(lead, application)
  );

  const safeLeads: Lead[] = matchedLeads.map((lead) => ({
    ...lead,
    name: isApproved ? lead.name : lead.name ? "Contact locked" : "-",
    email: isApproved ? lead.email : lead.email ? "Contact locked" : "-",
    phone: isApproved ? lead.phone : lead.phone ? "Contact locked" : "-",
    message: isApproved
      ? lead.message
      : lead.message
      ? "Full message available after agency approval."
      : "-",
    contact_locked: !isApproved,
  }));

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
              Welcome, {application.agency_name}. You are viewing the matched lead
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
          {isApproved ? (
            <>
              <strong style={{ color: "white" }}>Agency approved:</strong> you
              have full access to matched lead contact details.
            </>
          ) : (
            <>
              <strong style={{ color: "white" }}>Agency not approved:</strong>{" "}
              you can still access matched leads, but contact details remain
              locked until approval.
            </>
          )}
        </div>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            Error loading leads.
          </p>
        )}

        <AgencyDashboardClient
          initialLeads={safeLeads}
          isApproved={isApproved}
        />
      </section>
    </main>
  );
}