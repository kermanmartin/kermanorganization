"use client";

import { useState } from "react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [userType, setUserType] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const getBudgetLabel = () => {
    if (userType === "seller") return "Expected value range";
    if (userType === "buyer") return "Purchase budget range";
    if (userType === "rent") return "Monthly rent range";
    if (userType === "investor") return "Investment range";
    return "Budget range";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      setStatusMessage("Please select whether you want to sell, buy, rent or invest.");
      return;
    }

    if (!budgetMin.trim() || !budgetMax.trim()) {
      setStatusMessage("Please enter both minimum and maximum budget.");
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
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: fullPhone,
          city: city.trim(),
          budget: fullBudget,
          user_type: userType,
          message: message.trim(),
          turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage(result.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setStatusMessage("Submitted successfully. We will review your request.");
      setName("");
      setEmail("");
      setPhonePrefix("");
      setPhoneNumber("");
      setCity("");
      setCurrency("EUR");
      setBudgetMin("");
      setBudgetMax("");
      setUserType("");
      setMessage("");
      setTurnstileToken("");
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
        backgroundColor: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          minHeight: "calc(100vh - 90px)",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.24), rgba(0,0,0,0.60)), url('/wpaper.jpg')",
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
            maxWidth: "1380px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "30px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                maxWidth: "700px",
              }}
            >
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
                  fontSize: "clamp(40px, 6vw, 76px)",
                  lineHeight: "0.96",
                  fontWeight: 300,
                  letterSpacing: "-2px",
                  margin: "0 0 18px 0",
                  textTransform: "uppercase",
                  maxWidth: "680px",
                }}
              >
                THE KERMAN ORGANIZATION
              </h1>

              <p
                style={{
                  fontSize: "clamp(20px, 2.6vw, 30px)",
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
                  maxWidth: "660px",
                  background: "rgba(20,20,20,0.55)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "16px 18px",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <p
                  style={{
                    fontSize: "clamp(16px, 1.8vw, 23px)",
                    lineHeight: "1.65",
                    color: "#dddddd",
                    margin: 0,
                  }}
                >
                  Tell us whether you want to sell, buy, rent or invest. Our AI will detect
                  your profile and route you according to the filter that best matches
                  your goals.
                </p>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "620px",
                justifySelf: "end",
                backgroundColor: "rgba(10,10,10,0.78)",
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
                  This is the main interaction of the platform. Soon this form will
                  be replaced by the AI assistant.
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
                  placeholder="Your email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />

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
                    placeholder="Phone number *"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={inputStyle}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setUserType("seller")}
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
                    onClick={() => setUserType("buyer")}
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
                    onClick={() => setUserType("rent")}
                    style={{
                      ...choiceButton,
                      backgroundColor: userType === "rent" ? "white" : "#111",
                      color: userType === "rent" ? "black" : "white",
                    }}
                  >
                    Rent
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType("investor")}
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
                    color: "#cfcfcf",
                    fontSize: "14px",
                    marginTop: "2px",
                    marginBottom: "-4px",
                  }}
                >
                  {getBudgetLabel()}
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

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "4px",
                  }}
                >
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token: string) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                  />
                </div>

                <textarea
                  placeholder="Tell us what you are looking for"
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
              title="Profile detection"
              text="The AI identifies whether the opportunity fits a seller, buyer, renter or investor journey."
            />
            <InfoCard
              title="Qualified routing"
              text="Requests can later be filtered and routed according to your matching theory."
            />
            <InfoCard
              title="Agency network"
              text="Approved agencies receive qualified opportunities through a private dashboard."
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

const buttonStyle = {
  padding: "15px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "white",
  color: "black",
  fontWeight: "bold",
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