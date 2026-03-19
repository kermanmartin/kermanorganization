"use client";

import { useMemo, useState } from "react";
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

type FormState = {
  name: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  language: string;
  country: string;
  city: string;
  cityFreeText: string;
  preferredArea: string;
  userType: UserType;
  propertyType: string;
  timeframe: string;
  financingStatus: string;
  sellerStatus: string;
  currency: string;
  budgetMin: string;
  budgetMax: string;
  purpose: string;
  urgency: string;
  workingWithAgency: string;
  flexibility: string;
  message: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  phonePrefix: "",
  phoneNumber: "",
  language: "english",
  country: "",
  city: "",
  cityFreeText: "",
  preferredArea: "",
  userType: "",
  propertyType: "",
  timeframe: "",
  financingStatus: "",
  sellerStatus: "",
  currency: "EUR",
  budgetMin: "",
  budgetMax: "",
  purpose: "",
  urgency: "",
  workingWithAgency: "",
  flexibility: "",
  message: "",
};

export default function StartPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const cityOptions = useMemo(() => {
    if (!form.country) return [];
    return CITY_OPTIONS_BY_COUNTRY[form.country] ?? [];
  }, [form.country]);

  const budgetLabel = useMemo(() => {
    if (form.userType === "seller") return "Expected sale value range";
    if (form.userType === "buyer") return "Purchase budget range";
    if (form.userType === "tenant") return "Monthly rental budget range";
    if (form.userType === "landlord") return "Expected monthly rental range";
    if (form.userType === "investor") return "Investment range";
    return "Budget range";
  }, [form.userType]);

  const showFinancingStatus =
    form.userType === "buyer" || form.userType === "investor";
  const showSellerStatus = form.userType === "seller";
  const showPurpose =
    form.userType === "buyer" ||
    form.userType === "investor" ||
    form.userType === "tenant";
  const showUrgency = true;

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildFullPhone = () => {
    const prefix = form.phonePrefix.trim();
    const number = form.phoneNumber.trim();

    if (!prefix || !number) return "";

    const normalizedPrefix = prefix.startsWith("+") ? prefix : `+${prefix}`;
    return `${normalizedPrefix} ${number}`;
  };

  const buildBudgetRange = () => {
    const min = form.budgetMin.trim();
    const max = form.budgetMax.trim();

    if (!min || !max) return "";
    return `${form.currency} ${min} - ${max}`;
  };

  const getFinalCity = () => {
    if (form.city === "other") {
      return form.cityFreeText.trim();
    }
    return form.city;
  };

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((prev) => prev + 1);
  };

  const validateStep = (targetStep: number) => {
    if (targetStep === 1) {
      if (!form.userType) {
        return "Please select what you are looking to do.";
      }
    }

    if (targetStep === 2) {
      if (!form.name.trim() || !form.email.trim()) {
        return "Please complete your name and email.";
      }

      if (!form.phonePrefix.trim() || !form.phoneNumber.trim()) {
        return "Please complete your phone number.";
      }

      if (!form.country) {
        return "Please select a country.";
      }

      if (!form.city) {
        return "Please select a city.";
      }

      if (form.city === "other" && !form.cityFreeText.trim()) {
        return "Please enter your city.";
      }
    }

    if (targetStep === 3) {
      if (!form.propertyType) {
        return "Please select a property type.";
      }

      if (!form.timeframe) {
        return "Please select a timeframe.";
      }

      if (!form.preferredArea.trim()) {
        return "Please enter your preferred area.";
      }

      if (!form.budgetMin.trim() || !form.budgetMax.trim()) {
        return "Please enter both minimum and maximum budget.";
      }
    }

    if (targetStep === 4) {
      if (showFinancingStatus && !form.financingStatus) {
        return "Please select your financing status.";
      }

      if (showSellerStatus && !form.sellerStatus) {
        return "Please select your seller status.";
      }

      if (showPurpose && !form.purpose) {
        return "Please select the purpose of your request.";
      }

      if (showUrgency && !form.urgency) {
        return "Please select your urgency.";
      }

      if (!form.workingWithAgency) {
        return "Please tell us whether you are already working with an agency.";
      }

      if (!form.flexibility) {
        return "Please select your flexibility level.";
      }
    }

    return "";
  };

  const goNext = () => {
    const error = validateStep(step);
    if (error) {
      setStatusMessage(error);
      return;
    }

    setStatusMessage("");
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const goBack = () => {
    setStatusMessage("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastValidation = validateStep(4);
    if (lastValidation) {
      setStatusMessage(lastValidation);
      return;
    }

    if (!form.message.trim()) {
      setStatusMessage("Please add some final details about your request.");
      return;
    }

    if (!turnstileToken) {
      setStatusMessage("Please complete the security verification.");
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
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: fullPhone,
          language: form.language,
          country: form.country,
          city: getFinalCity(),
          preferred_area: form.preferredArea.trim(),
          property_type: form.propertyType,
          timeframe: form.timeframe,
          financing_status: form.financingStatus,
          seller_status: form.sellerStatus,
          rental_profile: null,
          budget: fullBudget,
          user_type: form.userType,
          purpose: form.purpose,
          urgency: form.urgency,
          working_with_agency: form.workingWithAgency,
          flexibility: form.flexibility,
          message: form.message.trim(),
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
      setForm(initialFormState);
      setStep(1);
      resetTurnstile();
      setLoading(false);
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
      resetTurnstile();
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(24,24,24,0.9) 0%, #0a0a0a 42%, #050505 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "54px 16px 70px",
      }}
    >
      <section
        style={{
          maxWidth: "980px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto 26px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid #252525",
              backgroundColor: "#121212",
              color: "#b8b8b8",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Structured intake
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: "0.98",
              fontWeight: 400,
              letterSpacing: "-1.5px",
              margin: "0 0 14px 0",
            }}
          >
            Start your request
          </h1>

          <p
            style={{
              margin: 0,
              color: "#cfcfcf",
              fontSize: "18px",
              lineHeight: "1.8",
            }}
          >
            Submit your request in a structured format so it can be matched to
            the right agency profile.
          </p>
        </div>

        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(10,10,10,0.98) 100%)",
            border: "1px solid #1f1f1f",
            borderRadius: "24px",
            padding: "clamp(22px, 4vw, 34px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
          }}
        >
          <StepIndicator currentStep={step} />

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {step === 1 && (
              <>
                <SectionTitle
                  title="What are you looking to do?"
                  description="Select the path that best describes your request."
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <ChoiceButton
                    label="Sell"
                    active={form.userType === "seller"}
                    onClick={() => {
                      updateField("userType", "seller");
                      updateField("financingStatus", "");
                    }}
                  />

                  <ChoiceButton
                    label="Buy"
                    active={form.userType === "buyer"}
                    onClick={() => {
                      updateField("userType", "buyer");
                      updateField("sellerStatus", "");
                    }}
                  />

                  <ChoiceButton
                    label="Rent"
                    active={form.userType === "tenant"}
                    onClick={() => {
                      updateField("userType", "tenant");
                      updateField("financingStatus", "");
                      updateField("sellerStatus", "");
                    }}
                  />

                  <ChoiceButton
                    label="Rent out"
                    active={form.userType === "landlord"}
                    onClick={() => {
                      updateField("userType", "landlord");
                      updateField("financingStatus", "");
                      updateField("sellerStatus", "");
                    }}
                  />

                  <ChoiceButton
                    label="Invest"
                    active={form.userType === "investor"}
                    onClick={() => {
                      updateField("userType", "investor");
                      updateField("sellerStatus", "");
                    }}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <SectionTitle
                  title="Basic information"
                  description="We need your contact details and target location."
                />

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
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
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
                    value={form.phonePrefix}
                    onChange={(e) => updateField("phonePrefix", e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <select
                  value={form.language}
                  onChange={(e) => updateField("language", e.target.value)}
                  style={inputStyle}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="arabic">Arabic</option>
                </select>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <select
                    value={form.country}
                    onChange={(e) => {
                      updateField("country", e.target.value);
                      updateField("city", "");
                      updateField("cityFreeText", "");
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
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    required
                    disabled={!form.country}
                    style={{
                      ...inputStyle,
                      opacity: form.country ? 1 : 0.7,
                      cursor: form.country ? "pointer" : "not-allowed",
                    }}
                  >
                    <option value="">
                      {form.country ? "City" : "Select country first"}
                    </option>
                    {cityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {form.country && <option value="other">Other city</option>}
                  </select>
                </div>

                {form.city === "other" && (
                  <input
                    type="text"
                    placeholder="Enter your city"
                    value={form.cityFreeText}
                    onChange={(e) => updateField("cityFreeText", e.target.value)}
                    required
                    style={inputStyle}
                  />
                )}
              </>
            )}

            {step === 3 && (
              <>
                <SectionTitle
                  title="Property and criteria"
                  description="Tell us what you are looking for and in what range."
                />

                <input
                  type="text"
                  placeholder="Preferred area / district / zone"
                  value={form.preferredArea}
                  onChange={(e) => updateField("preferredArea", e.target.value)}
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
                    value={form.propertyType}
                    onChange={(e) => updateField("propertyType", e.target.value)}
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
                    value={form.timeframe}
                    onChange={(e) => updateField("timeframe", e.target.value)}
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
                    value={form.budgetMin}
                    onChange={(e) => updateField("budgetMin", e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    placeholder="Max"
                    value={form.budgetMax}
                    onChange={(e) => updateField("budgetMax", e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <select
                    value={form.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <SectionTitle
                  title="Qualification"
                  description="This information helps us route your request more accurately."
                />

                {showFinancingStatus && (
                  <select
                    value={form.financingStatus}
                    onChange={(e) =>
                      updateField("financingStatus", e.target.value)
                    }
                    required={showFinancingStatus}
                    style={inputStyle}
                  >
                    <option value="">Financing status</option>
                    <option value="cash_ready">Cash ready</option>
                    <option value="mortgage_preapproved">
                      Mortgage pre-approved
                    </option>
                    <option value="needs_financing">Needs financing</option>
                    <option value="evaluating_options">
                      Evaluating options
                    </option>
                  </select>
                )}

                {showSellerStatus && (
                  <select
                    value={form.sellerStatus}
                    onChange={(e) => updateField("sellerStatus", e.target.value)}
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

                {showPurpose && (
                  <select
                    value={form.purpose}
                    onChange={(e) => updateField("purpose", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Purpose of request</option>
                    <option value="primary_residence">Primary residence</option>
                    <option value="second_home">Second home</option>
                    <option value="investment">Investment</option>
                    <option value="relocation">Relocation</option>
                    <option value="other">Other</option>
                  </select>
                )}

                <select
                  value={form.urgency}
                  onChange={(e) => updateField("urgency", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">How serious are you right now?</option>
                  <option value="ready_now">Ready now</option>
                  <option value="actively_searching">Actively searching</option>
                  <option value="evaluating_options">Evaluating options</option>
                  <option value="just_exploring">Just exploring</option>
                </select>

                <select
                  value={form.workingWithAgency}
                  onChange={(e) =>
                    updateField("workingWithAgency", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">Are you already working with an agency?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                <select
                  value={form.flexibility}
                  onChange={(e) => updateField("flexibility", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Location flexibility</option>
                  <option value="strict">Strict</option>
                  <option value="moderately_flexible">
                    Moderately flexible
                  </option>
                  <option value="very_flexible">Very flexible</option>
                </select>
              </>
            )}

            {step === 5 && (
              <>
                <SectionTitle
                  title="Final details"
                  description="Add anything relevant that would help an agency understand your case."
                />

                <textarea
                  placeholder="Tell us exactly what you are looking for or what you want to achieve"
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  required
                  rows={7}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "160px",
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
              </>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginTop: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1 || loading}
                style={{
                  ...secondaryButtonStyle,
                  opacity: step === 1 || loading ? 0.5 : 1,
                  cursor:
                    step === 1 || loading ? "not-allowed" : "pointer",
                }}
              >
                Back
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={loading}
                  style={{
                    ...primaryButtonStyle,
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...primaryButtonStyle,
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Submitting..." : "Submit request"}
                </button>
              )}
            </div>
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
      </section>
    </main>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: "Intent" },
    { number: 2, label: "Identity" },
    { number: 3, label: "Criteria" },
    { number: 4, label: "Qualification" },
    { number: 5, label: "Details" },
  ];

  return (
    <div style={{ marginBottom: "28px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          alignItems: "start",
        }}
      >
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: 700,
                  border: isActive
                    ? "1px solid #ffffff"
                    : isCompleted
                    ? "1px solid #2f6f46"
                    : "1px solid #2a2a2a",
                  backgroundColor: isActive
                    ? "#ffffff"
                    : isCompleted
                    ? "#13311e"
                    : "#111111",
                  color: isActive
                    ? "#000000"
                    : isCompleted
                    ? "#8ef0b0"
                    : "#bcbcbc",
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(255,255,255,0.06)"
                    : "none",
                }}
              >
                {isCompleted ? "✓" : step.number}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  color: isActive
                    ? "#ffffff"
                    : isCompleted
                    ? "#cfcfcf"
                    : "#7f7f7f",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "28px",
          fontWeight: 400,
          letterSpacing: "-0.7px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#b8b8b8",
          fontSize: "15px",
          lineHeight: "1.7",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function ChoiceButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px 10px",
        borderRadius: "12px",
        border: "1px solid #333",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 700,
        backgroundColor: active ? "white" : "#111",
        color: active ? "black" : "white",
      }}
    >
      {label}
    </button>
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

const primaryButtonStyle = {
  padding: "16px 22px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "white",
  color: "black",
  fontSize: "16px",
  fontWeight: 700,
  minWidth: "160px",
};

const secondaryButtonStyle = {
  padding: "16px 22px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  backgroundColor: "#111111",
  color: "white",
  fontSize: "16px",
  fontWeight: 700,
  minWidth: "140px",
};