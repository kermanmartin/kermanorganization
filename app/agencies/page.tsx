"use client";

import { useMemo, useState } from "react";

type MultiOption =
  | "buyer"
  | "seller"
  | "tenant"
  | "landlord"
  | "investor"
  | "apartment"
  | "house"
  | "villa"
  | "penthouse"
  | "studio"
  | "office"
  | "retail"
  | "building"
  | "land"
  | "other";

const COUNTRY_OPTIONS = [
  { value: "spain", label: "Spain" },
  { value: "portugal", label: "Portugal" },
  { value: "france", label: "France" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "united_states", label: "United States" },
  { value: "uae", label: "United Arab Emirates" },
] as const;

const CITY_OPTIONS_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  spain: [
    { value: "madrid", label: "Madrid" },
    { value: "barcelona", label: "Barcelona" },
    { value: "valencia", label: "Valencia" },
    { value: "malaga", label: "Málaga" },
    { value: "sevilla", label: "Sevilla" },
    { value: "bilbao", label: "Bilbao" },
    { value: "alicante", label: "Alicante" },
    { value: "marbella", label: "Marbella" },
    { value: "palma", label: "Palma" },
  ],
  portugal: [
    { value: "lisbon", label: "Lisbon" },
    { value: "porto", label: "Porto" },
    { value: "faro", label: "Faro" },
    { value: "cascais", label: "Cascais" },
  ],
  france: [
    { value: "paris", label: "Paris" },
    { value: "nice", label: "Nice" },
    { value: "lyon", label: "Lyon" },
    { value: "marseille", label: "Marseille" },
  ],
  united_kingdom: [
    { value: "london", label: "London" },
    { value: "manchester", label: "Manchester" },
    { value: "birmingham", label: "Birmingham" },
  ],
  united_states: [
    { value: "new_york", label: "New York" },
    { value: "miami", label: "Miami" },
    { value: "los_angeles", label: "Los Angeles" },
    { value: "dallas", label: "Dallas" },
  ],
  uae: [
    { value: "dubai", label: "Dubai" },
    { value: "abu_dhabi", label: "Abu Dhabi" },
  ],
};

export default function AgenciesPage() {
  const [agencyName, setAgencyName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessPhonePrefix, setBusinessPhonePrefix] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [preferredAreas, setPreferredAreas] = useState("");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [clientTypes, setClientTypes] = useState<string[]>([]);
  const [currency, setCurrency] = useState("EUR");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [dealsPerMonth, setDealsPerMonth] = useState("");
  const [coverageDetails, setCoverageDetails] = useState("");
  const [message, setMessage] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const availableCityOptions = useMemo(() => {
    if (!country) return [];
    return CITY_OPTIONS_BY_COUNTRY[country] ?? [];
  }, [country]);

  const normalizeWebsite = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const buildFullPhone = () => {
    const prefix = businessPhonePrefix.trim();
    const number = businessPhoneNumber.trim();

    if (!prefix || !number) return "";

    const normalizedPrefix = prefix.startsWith("+") ? prefix : `+${prefix}`;
    return `${normalizedPrefix} ${number}`;
  };

  const buildBudgetRange = () => {
    const min = minBudget.trim();
    const max = maxBudget.trim();

    if (!min || !max) return "";
    return `${currency} ${min} - ${max}`;
  };

  const toggleMultiSelect = (
    value: MultiOption,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  const togglePreferredCity = (value: string) => {
    if (preferredCities.includes(value)) {
      setPreferredCities(preferredCities.filter((item) => item !== value));
      return;
    }

    setPreferredCities([...preferredCities, value]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    if (!country) {
      setStatusMessage("Please select a country.");
      setLoading(false);
      return;
    }

    if (!city) {
      setStatusMessage("Please select a main city.");
      setLoading(false);
      return;
    }

    if (preferredCities.length === 0) {
      setStatusMessage("Please select at least one covered city.");
      setLoading(false);
      return;
    }

    if (propertyTypes.length === 0) {
      setStatusMessage("Please select at least one property type.");
      setLoading(false);
      return;
    }

    if (clientTypes.length === 0) {
      setStatusMessage("Please select at least one client type.");
      setLoading(false);
      return;
    }

    if (!minBudget.trim() || !maxBudget.trim()) {
      setStatusMessage("Please enter both minimum and maximum budget.");
      setLoading(false);
      return;
    }

    const normalizedWebsite = normalizeWebsite(website);
    const fullBusinessPhone = buildFullPhone();
    const budgetRange = buildBudgetRange();

    try {
      const response = await fetch("/api/agency-applications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agency_name: agencyName.trim(),
          country,
          city,
          website: normalizedWebsite,
          contact_name: contactName.trim(),
          business_phone: fullBusinessPhone,
          email: email.trim().toLowerCase(),
          password: password.trim(),
          preferred_cities: preferredCities.join(", "),
          preferred_areas: preferredAreas.trim(),
          property_types: propertyTypes,
          client_types: clientTypes,
          min_budget: minBudget.trim(),
          max_budget: maxBudget.trim(),
          budget_range: budgetRange,
          deals_per_month: dealsPerMonth.trim(),
          coverage_details: coverageDetails.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage(result.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setStatusMessage(
        "Agency account created successfully. You can now log in through Agency Access. Your account is under review."
      );

      setAgencyName("");
      setCountry("");
      setCity("");
      setWebsite("");
      setContactName("");
      setBusinessPhonePrefix("");
      setBusinessPhoneNumber("");
      setEmail("");
      setPassword("");
      setPreferredCities([]);
      setPreferredAreas("");
      setPropertyTypes([]);
      setClientTypes([]);
      setCurrency("EUR");
      setMinBudget("");
      setMaxBudget("");
      setDealsPerMonth("");
      setCoverageDetails("");
      setMessage("");
      setLoading(false);
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.82)), url('/wpaper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "70px 20px",
      }}
    >
      <section style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "56px",
            textAlign: "center",
            marginBottom: "16px",
            fontWeight: 400,
            letterSpacing: "-1px",
          }}
        >
          Agency Applications
        </h1>

        <p
          style={{
            fontSize: "20px",
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 auto 50px",
            color: "#d0d0d0",
            lineHeight: "1.7",
          }}
        >
          Apply to join The Kerman Organization agency network. Create your account
          and submit the commercial profile of your agency so we can qualify and
          match future opportunities more intelligently.
        </p>

        <div
          style={{
            maxWidth: "980px",
            margin: "0 auto",
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "18px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "32px",
              marginBottom: "12px",
              fontWeight: 400,
            }}
          >
            Apply and create account
          </h2>

          <p
            style={{
              color: "#cfcfcf",
              lineHeight: "1.7",
              marginBottom: "24px",
              fontSize: "16px",
            }}
          >
            Submit your agency details and create your agency login. You will be
            able to access the dashboard immediately, while full contact details
            remain locked until approval.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <input
              type="text"
              placeholder="Agency name"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
              style={inputStyle}
            />

            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
                setPreferredCities([]);
              }}
              required
              style={inputStyle}
            >
              <option value="">Country</option>
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={!country}
              style={{
                ...inputStyle,
                opacity: country ? 1 : 0.7,
                cursor: country ? "pointer" : "not-allowed",
              }}
            >
              <option value="">{country ? "Main city" : "Select country first"}</option>
              {availableCityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "10px",
                gridColumn: "1 / -1",
              }}
            >
              <input
                type="text"
                placeholder="+34"
                value={businessPhonePrefix}
                onChange={(e) => setBusinessPhonePrefix(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="tel"
                placeholder="Business phone"
                value={businessPhoneNumber}
                onChange={(e) => setBusinessPhoneNumber(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <input
              type="email"
              placeholder="Business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={sectionLabel}>Covered cities</div>
              <div style={choiceGrid}>
                {availableCityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => togglePreferredCity(option.value)}
                    style={{
                      ...choiceButton,
                      backgroundColor: preferredCities.includes(option.value)
                        ? "white"
                        : "#111111",
                      color: preferredCities.includes(option.value)
                        ? "black"
                        : "white",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Preferred areas / districts / zones (comma separated)"
              value={preferredAreas}
              onChange={(e) => setPreferredAreas(e.target.value)}
              required
              style={{ ...inputStyle, gridColumn: "1 / -1" }}
            />

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={sectionLabel}>Property types</div>
              <div style={choiceGrid}>
                {[
                  ["apartment", "Apartment"],
                  ["house", "House"],
                  ["villa", "Villa"],
                  ["penthouse", "Penthouse"],
                  ["studio", "Studio"],
                  ["office", "Office"],
                  ["retail", "Retail"],
                  ["building", "Building"],
                  ["land", "Land"],
                  ["other", "Other"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      toggleMultiSelect(
                        value as MultiOption,
                        propertyTypes,
                        setPropertyTypes
                      )
                    }
                    style={{
                      ...choiceButton,
                      backgroundColor: propertyTypes.includes(value)
                        ? "white"
                        : "#111111",
                      color: propertyTypes.includes(value) ? "black" : "white",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={sectionLabel}>Client types</div>
              <div style={choiceGrid}>
                {[
                  ["buyer", "Buyer"],
                  ["seller", "Seller"],
                  ["tenant", "Tenant"],
                  ["landlord", "Landlord"],
                  ["investor", "Investor"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      toggleMultiSelect(
                        value as MultiOption,
                        clientTypes,
                        setClientTypes
                      )
                    }
                    style={{
                      ...choiceButton,
                      backgroundColor: clientTypes.includes(value)
                        ? "white"
                        : "#111111",
                      color: clientTypes.includes(value) ? "black" : "white",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={sectionLabel}>Budget range you usually work with</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 130px",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder="Min budget"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  required
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Max budget"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  required
                  style={inputStyle}
                />

                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={inputStyle}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Approximate deals per month"
              value={dealsPerMonth}
              onChange={(e) => setDealsPerMonth(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Coverage details (for example: central Madrid, Salamanca, Chamartín, luxury buyer focus)"
              value={coverageDetails}
              onChange={(e) => setCoverageDetails(e.target.value)}
              required
              style={inputStyle}
            />

            <textarea
              placeholder="Tell us about your agency, the kind of opportunities you want, and anything relevant for matching"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              style={{
                ...inputStyle,
                gridColumn: "1 / -1",
                resize: "vertical" as const,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                gridColumn: "1 / -1",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account..." : "Apply and create account"}
            </button>
          </form>

          {statusMessage && (
            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#181818",
                border: "1px solid #2a2a2a",
                color: "#e5e5e5",
                lineHeight: "1.6",
              }}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1a1a1a",
  color: "white",
  fontSize: "16px",
  width: "100%",
};

const buttonStyle = {
  padding: "15px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "white",
  color: "black",
  fontWeight: "bold",
};

const sectionLabel = {
  fontSize: "14px",
  color: "#cfcfcf",
  marginBottom: "10px",
};

const choiceGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "10px",
};

const choiceButton = {
  width: "100%",
  padding: "14px 10px",
  borderRadius: "12px",
  border: "1px solid #333",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 700,
};