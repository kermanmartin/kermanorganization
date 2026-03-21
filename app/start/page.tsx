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

const STEP_CONFIG = [
  {
    number: 1,
    label: "Intent",
    helper: "What you want to do",
  },
  {
    number: 2,
    label: "Identity",
    helper: "Who you are and where",
  },
  {
    number: 3,
    label: "Criteria",
    helper: "Property and budget",
  },
  {
    number: 4,
    label: "Qualification",
    helper: "Routing signals",
  },
  {
    number: 5,
    label: "Details",
    helper: "Final context",
  },
] as const;

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

      if (!form.urgency) {
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

  const progressPercentage = (step / 5) * 100;

  return (
    <>
      <main className="start-page">
        <section className="start-shell">
          <div className="hero">
            <div className="eyebrow">Structured intake</div>

            <h1 className="hero-title">Start your request</h1>

            <p className="hero-copy">
              Submit your request in a structured format so it can be matched to
              the right agency profile.
            </p>
          </div>

          <div className="card">
            <div className="steps-header">
              <div className="steps-topline">
                <div className="steps-count">Step {step} of 5</div>
                <div className="steps-label">{STEP_CONFIG[step - 1].label}</div>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="steps-scroll">
                <div className="steps-grid">
                  {STEP_CONFIG.map((item) => {
                    const isCurrent = step === item.number;
                    const isCompleted = step > item.number;

                    return (
                      <div
                        key={item.number}
                        className={`step-card ${
                          isCurrent ? "current" : ""
                        } ${isCompleted ? "completed" : ""}`}
                      >
                        <div className="step-card-top">
                          <div className="step-badge">
                            {isCompleted ? "✓" : item.number}
                          </div>

                          <div className="step-name">{item.label}</div>
                        </div>

                        <div className="step-helper">{item.helper}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-stack">
              {step === 1 && (
                <>
                  <SectionTitle
                    title="What are you looking to do?"
                    description="Select the path that best describes your request."
                  />

                  <div className="choice-grid">
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

                  <div className="two-col-grid">
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

                  <div className="phone-grid">
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

                  <div className="two-col-grid">
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

                  <div className="two-col-grid">
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

                  <div className="budget-label">{budgetLabel}</div>

                  <div className="budget-grid">
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

                  <div className="turnstile-wrap">
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

              <div className="actions">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1 || loading}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: step === 1 || loading ? 0.5 : 1,
                    cursor: step === 1 || loading ? "not-allowed" : "pointer",
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
              <div className="status-box">{statusMessage}</div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        .start-page {
          min-height: 100vh;
          background: radial-gradient(
            circle at top,
            rgba(24, 24, 24, 0.9) 0%,
            #0a0a0a 42%,
            #050505 100%
          );
          color: white;
          font-family: Arial, sans-serif;
          padding: 54px 16px 70px;
        }

        .start-shell {
          max-width: 980px;
          margin: 0 auto;
        }

        .hero {
          max-width: 760px;
          margin: 0 auto 26px;
          text-align: center;
        }

        .eyebrow {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid #252525;
          background-color: #121212;
          color: #b8b8b8;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: clamp(40px, 6vw, 64px);
          line-height: 0.98;
          font-weight: 400;
          letter-spacing: -1.5px;
          margin: 0 0 14px 0;
        }

        .hero-copy {
          margin: 0;
          color: #cfcfcf;
          font-size: 18px;
          line-height: 1.8;
        }

        .card {
          background: linear-gradient(
            180deg,
            rgba(17, 17, 17, 0.98) 0%,
            rgba(10, 10, 10, 0.98) 100%
          );
          border: 1px solid #1f1f1f;
          border-radius: 24px;
          padding: 34px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
        }

        .steps-header {
          margin-bottom: 28px;
        }

        .steps-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .steps-count {
          font-size: 13px;
          color: #9f9f9f;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 700;
        }

        .steps-label {
          font-size: 14px;
          color: #d7d7d7;
          font-weight: 600;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background-color: #181818;
          border: 1px solid #242424;
          overflow: hidden;
          margin-bottom: 22px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f3f3f3 0%, #bfbfbf 100%);
          border-radius: 999px;
          transition: width 0.25s ease;
        }

        .steps-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .steps-scroll::-webkit-scrollbar {
          display: none;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(160px, 1fr));
          gap: 10px;
          min-width: 860px;
        }

        .step-card {
          padding: 12px 12px 14px;
          border-radius: 16px;
          border: 1px solid #1f1f1f;
          background-color: rgba(255, 255, 255, 0.01);
          min-width: 0;
        }

        .step-card.current {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .step-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .step-badge {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background-color: #111111;
          color: #a8a8a8;
          border: 1px solid #2a2a2a;
          flex-shrink: 0;
        }

        .step-card.current .step-badge {
          background-color: #ffffff;
          color: #000000;
          border: 1px solid #ffffff;
        }

        .step-card.completed .step-badge {
          background-color: #173021;
          color: #8ef0b0;
          border: 1px solid #2e5b3f;
        }

        .step-name {
          font-size: 12px;
          color: #b1b1b1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          line-height: 1.3;
          word-break: break-word;
        }

        .step-card.current .step-name {
          color: #ffffff;
        }

        .step-helper {
          font-size: 12px;
          color: #7d7d7d;
          line-height: 1.5;
          word-break: break-word;
        }

        .step-card.current .step-helper {
          color: #cfcfcf;
        }

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .phone-grid {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 10px;
        }

        .budget-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 130px;
          gap: 10px;
        }

        .budget-label {
          color: #cfcfcf;
          font-size: 14px;
          margin-top: 2px;
          margin-bottom: -4px;
        }

        .turnstile-wrap {
          display: flex;
          justify-content: center;
          margin-top: 4px;
          min-height: 70px;
          overflow-x: auto;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .status-box {
          margin-top: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e6e6e6;
          line-height: 1.6;
          font-size: 15px;
        }

        @media (max-width: 900px) {
          .card {
            padding: 24px;
          }

          .choice-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .budget-grid {
            grid-template-columns: 1fr 1fr;
          }

          .budget-grid :global(select) {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 640px) {
          .start-page {
            padding: 32px 12px 52px;
          }

          .hero {
            text-align: left;
            margin-bottom: 20px;
          }

          .eyebrow {
            font-size: 11px;
            margin-bottom: 12px;
          }

          .hero-title {
            font-size: 52px;
            line-height: 0.98;
            letter-spacing: -1.2px;
            margin-bottom: 12px;
          }

          .hero-copy {
            font-size: 16px;
            line-height: 1.7;
          }

          .card {
            border-radius: 20px;
            padding: 18px;
          }

          .steps-topline {
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 12px;
          }

          .progress-track {
            margin-bottom: 16px;
          }

          .steps-grid {
            min-width: 720px;
            grid-template-columns: repeat(5, minmax(132px, 1fr));
          }

          .step-card {
            padding: 10px 10px 12px;
            border-radius: 14px;
          }

          .step-card-top {
            align-items: flex-start;
          }

          .step-name {
            font-size: 11px;
          }

          .step-helper {
            font-size: 11px;
            line-height: 1.4;
          }

          .two-col-grid,
          .phone-grid,
          .budget-grid,
          .choice-grid {
            grid-template-columns: 1fr;
          }

          .actions {
            flex-direction: column-reverse;
          }

          .actions :global(button) {
            width: 100%;
            min-width: 0 !important;
          }
        }

        @media (max-width: 420px) {
          .hero-title {
            font-size: 44px;
          }

          .hero-copy {
            font-size: 15px;
          }

          .card {
            padding: 16px;
          }

          .steps-grid {
            min-width: 680px;
          }
        }
      `}</style>
    </>
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
          fontSize: "clamp(24px, 4vw, 28px)",
          fontWeight: 400,
          letterSpacing: "-0.7px",
          lineHeight: 1.08,
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
        minHeight: "60px",
        padding: "16px 12px",
        borderRadius: "12px",
        border: "1px solid #333",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 700,
        backgroundColor: active ? "white" : "#111",
        color: active ? "black" : "white",
        textAlign: "center",
      }}
    >
      {label}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1a1a1a",
  color: "white",
  fontSize: "16px",
  width: "100%",
  minWidth: 0,
  appearance: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "16px 22px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "white",
  color: "black",
  fontSize: "16px",
  fontWeight: 700,
  minWidth: "160px",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "16px 22px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  backgroundColor: "#111111",
  color: "white",
  fontSize: "16px",
  fontWeight: 700,
  minWidth: "140px",
};