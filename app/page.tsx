"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";

type UserType = "buyer" | "seller" | "tenant" | "landlord" | "investor" | "";

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

function formatOptionLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [preferredArea, setPreferredArea] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [financingStatus, setFinancingStatus] = useState("");
  const [sellerStatus, setSellerStatus] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [userType, setUserType] = useState<UserType>("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const cityOptions = useMemo(() => {
    if (!country) return [];
    return CITY_OPTIONS_BY_COUNTRY[country] ?? [];
  }, [country]);

  const budgetLabel = useMemo(() => {
    if (userType === "seller") return "Expected sale value range";
    if (userType === "buyer") return "Purchase budget range";
    if (userType === "tenant") return "Monthly rental budget range";
    if (userType === "landlord") return "Expected monthly rental range";
    if (userType === "investor") return "Investment range";
    return "Budget range";
  }, [userType]);

  const buildFullPhone = () => {
    const prefix = phonePrefix.trim();
    const number = phoneNumber.trim();

    if (!prefix || !number) return "";

    const normalizedPrefix = prefix.startsWith("+") ? prefix : `+${prefix}`;
    return `${normalizedPrefix} ${number}`;
  };

  const buildBudgetRange = () => {
    const min = budgetMin.trim();
    const max = budgetMax.trim();

    if (!min || !max) return "";
    return `${currency} ${min} - ${max}`;
  };

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((prev) => prev + 1);
  };

  const validateConditionalFields = () => {
    if (!userType) {
      return "Please select your profile: seller, buyer, tenant, landlord or investor.";
    }

    if (!country) {
      return "Please select a country.";
    }

    if (!city) {
      return "Please select a city.";
    }

    if (!budgetMin.trim() || !budgetMax.trim()) {
      return "Please enter both minimum and maximum budget.";
    }

    if ((userType === "buyer" || userType === "investor") && !financingStatus) {
      return "Please select your financing status.";
    }

    if (userType === "seller" && !sellerStatus) {
      return "Please select your seller status.";
    }

    if (!turnstileToken) {
      return "Please complete the security verification.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateConditionalFields();
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    setLoading(true);
    setStatusMessage("");

    const fullPhone = buildFullPhone();
    const fullBudget = buildBudgetRange();

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: fullPhone,
          country,
          city,
          preferred_area: preferredArea.trim(),
          property_type: propertyType,
          timeframe,
          financing_status: financingStatus,
          seller_status: sellerStatus,
          rental_profile: null,
          budget: fullBudget,
          user_type: userType,
          message: message.trim(),
          turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage(
          result.details?.length
            ? `${result.error} ${result.details.join(", ")}`
            : result.error || "Something went wrong. Please try again."
        );
        resetTurnstile();
        setLoading(false);
        return;
      }

      setStatusMessage("Submitted successfully. We will review your request.");

      setName("");
      setEmail("");
      setPhonePrefix("");
      setPhoneNumber("");
      setCountry("");
      setCity("");
      setPreferredArea("");
      setPropertyType("");
      setTimeframe("");
      setFinancingStatus("");
      setSellerStatus("");
      setCurrency("EUR");
      setBudgetMin("");
      setBudgetMax("");
      setUserType("");
      setMessage("");
      resetTurnstile();
      setLoading(false);
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
      resetTurnstile();
      setLoading(false);
    }
  };

  const showFinancingStatus = userType === "buyer" || userType === "investor";
  const showSellerStatus = userType === "seller";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          minHeight: "calc(100vh - 90px)",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.68)), url('/wpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "32px 16px 56px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1420px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "32px",
              alignItems: "center",
            }}
          >
            <div style={{ maxWidth: "720px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <Badge text="AI-powered analysis" />
                <Badge text="Qualified leads" />
                <Badge text="Real estate intelligence" />
              </div>

              <h1
                style={{
                  fontSize: "clamp(40px, 6vw, 78px)",
                  lineHeight: "0.96",
                  fontWeight: 300,
                  letterSpacing: "-2px",
                  margin: "0 0 18px 0",
                  textTransform: "uppercase",
                  maxWidth: "720px",
                }}
              >
                THE KERMAN ORGANIZATION
              </h1>

              <p
                style={{
                  fontSize: "clamp(20px, 2.5vw, 30px)",
                  lineHeight: "1.4",
                  color: "#f1f1f1",
                  margin: "0 0 14px 0",
                }}
              >
                AI-powered real estate intelligence.
              </p>

              <div
                style={{
                  marginTop: "12px",
                  maxWidth: "680px",
                  background: "rgba(20,20,20,0.56)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "16px 18px",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <p
                  style={{
                    fontSize: "clamp(16px, 1.8vw, 22px)",
                    lineHeight: "1.65",
                    color: "#dddddd",
                    margin: 0,
                  }}
                >
                  Tell us exactly what you need and we will structure your lead
                  with enough detail to enable high-quality matching with the
                  right agency.
                </p>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "760px",
                justifySelf: "end",
                backgroundColor: "rgba(10,10,10,0.82)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "clamp(22px, 4vw, 30px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    fontSize: "clamp(30px, 4vw, 42px)",
                    margin: "0 0 10px 0",
                    fontWeight: 400,
                    letterSpacing: "-1px",
                  }}
                >
                  Start here
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#d0d0d0",
                    lineHeight: "1.65",
                    fontSize: "clamp(15px, 2vw, 17px)",
                  }}
                >
                  This is the lead intake version designed to capture better
                  information from day one.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setUserType("seller");
                      setFinancingStatus("");
                    }}
                    style={{
                      ...choiceButton,
                      backgroundColor: userType === "seller" ? "white" : "#111",
                      color: userType === "seller" ? "black" : "white",
                    }}
                  >
                    Sell
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserType("buyer");
                      setSellerStatus("");
                    }}
                    style={{
                      ...choiceButton,
                      backgroundColor: userType === "buyer" ? "white" : "#111",
                      color: userType === "buyer" ? "black" : "white",
                    }}
                  >
                    Buy
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserType("tenant");
                      setFinancingStatus("");
                      setSellerStatus("");
                    }}
                    style={{
                      ...choiceButton,
                      backgroundColor: userType === "tenant" ? "white" : "#111",
                      color: userType === "tenant" ? "black" : "white",
                    }}
                  >
                    Rent
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserType("landlord");
                      setFinancingStatus("");
                      setSellerStatus("");
                    }}
                    style={{
                      ...choiceButton,
                      backgroundColor: userType === "landlord" ? "white" : "#111",
                      color: userType === "landlord" ? "black" : "white",
                    }}
                  >
                    Rent out
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserType("investor");
                      setSellerStatus("");
                    }}
                    style={{
                      ...choiceButton,
                      backgroundColor: userType === "investor" ? "white" : "#111",
                      color: userType === "investor" ? "black" : "white",
                    }}
                  >
                    Invest
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="+34"
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setCity("");
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
                    <option value="">{country ? "City" : "Select country first"}</option>
                    {cityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Preferred area / district / zone"
                  value={preferredArea}
                  onChange={(e) => setPreferredArea(e.target.value)}
                  required
                  style={inputStyle}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">Property type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="studio">Studio</option>
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="building">Building</option>
                    <option value="land">Land</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">Timeframe</option>
                    <option value="asap">ASAP</option>
                    <option value="within_30_days">Within 30 days</option>
                    <option value="1_3_months">1 to 3 months</option>
                    <option value="3_6_months">3 to 6 months</option>
                    <option value="6_plus_months">6+ months</option>
                    <option value="just_exploring">Just exploring</option>
                  </select>
                </div>

                {showFinancingStatus && (
                  <select
                    value={financingStatus}
                    onChange={(e) => setFinancingStatus(e.target.value)}
                    required={showFinancingStatus}
                    style={inputStyle}
                  >
                    <option value="">Financing status</option>
                    <option value="cash_ready">Cash ready</option>
                    <option value="mortgage_preapproved">
                      Mortgage pre-approved
                    </option>
                    <option value="needs_financing">
                      Needs financing
                    </option>
                    <option value="evaluating_options">
                      Evaluating options
                    </option>
                  </select>
                )}

                {showSellerStatus && (
                  <select
                    value={sellerStatus}
                    onChange={(e) => setSellerStatus(e.target.value)}
                    required={showSellerStatus}
                    style={inputStyle}
                  >
                    <option value="">Seller status</option>
                    <option value="ready_to_list">Ready to list now</option>
                    <option value="comparing_agencies">
                      Comparing agencies
                    </option>
                    <option value="just_exploring">Just exploring</option>
                    <option value="already_listed">
                      Already listed elsewhere
                    </option>
                  </select>
                )}

                <div
                  style={{
                    color: "#cfcfcf",
                    fontSize: "14px",
                    marginTop: "2px",
                    marginBottom: "-4px",
                  }}
                >
                  {budgetLabel}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 130px",
                    gap: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Min"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    placeholder="Max"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
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

                <textarea
                  placeholder="Tell us exactly what you are looking for or what you want to achieve"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "140px",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "4px",
                    minHeight: "70px",
                  }}
                >
                  <Turnstile
                    key={turnstileKey}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    options={{
                      theme: "dark",
                      size: "normal",
                    }}
                    onSuccess={(token: string) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => {
                      setTurnstileToken("");
                      setStatusMessage(
                        "Security verification could not be loaded. Please refresh the page."
                      );
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "4px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "17px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? "Submitting..." : "Continue"}
                </button>
              </form>

              {statusMessage && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e6e6e6",
                    lineHeight: "1.6",
                    fontSize: "15px",
                  }}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "64px 16px 84px",
          backgroundColor: "#050505",
        }}
      >
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "22px",
            }}
          >
            <InfoCard
              title="Better lead structure"
              text="The form captures commercial detail that is actually useful for routing and matching."
            />
            <InfoCard
              title="Smarter qualification"
              text="Property type, urgency and financial profile help determine who should receive each opportunity."
            />
            <InfoCard
              title="Agency network ready"
              text="This structure is designed for a pay-per-lead model from the beginning."
            />
          </div>

          <div
            style={{
              marginTop: "36px",
              textAlign: "center",
              color: "#bdbdbd",
              fontSize: "16px",
              lineHeight: "1.8",
              maxWidth: "900px",
              marginInline: "auto",
            }}
          >
            Agencies can apply through{" "}
            <Link
              href="/agencies"
              style={{ color: "white", textDecoration: "none" }}
            >
              /agencies
            </Link>{" "}
            and approved partners can access their private area through{" "}
            <Link
              href="/agency-access"
              style={{ color: "white", textDecoration: "none" }}
            >
              /agency-access
            </Link>
            .
          </div>
        </div>
      </section>
    </main>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        backgroundColor: "rgba(17,17,17,0.68)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "white",
        fontSize: "14px",
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        backgroundColor: "#0f0f0f",
        border: "1px solid #1e1e1e",
        borderRadius: "18px",
        padding: "28px",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "24px",
          fontWeight: 400,
          color: "white",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#cfcfcf",
          lineHeight: "1.7",
          fontSize: "16px",
        }}
      >
        {text}
      </p>
    </div>
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

const choiceButton = {
  width: "100%",
  padding: "16px 10px",
  borderRadius: "12px",
  border: "1px solid #333",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 700,
};