"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      setStatusMessage("Please select whether you want to sell, buy or invest.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    const { error } = await supabase.from("leads").insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        user_type: userType,
        message: message.trim(),
      },
    ]);

    if (error) {
      setStatusMessage("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setStatusMessage("Submitted successfully. We will review your request.");

    setName("");
    setEmail("");
    setUserType("");
    setMessage("");

    setLoading(false);
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
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.58)), url('/wpaper.jpg')",
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
            maxWidth: "1450px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div>
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
                  fontSize: "clamp(42px, 9vw, 92px)",
                  lineHeight: "0.96",
                  fontWeight: 300,
                  letterSpacing: "-2px",
                  margin: "0 0 20px 0",
                  textTransform: "uppercase",
                  maxWidth: "950px",
                }}
              >
                THE KERMAN ORGANIZATION
              </h1>

              <p
                style={{
                  fontSize: "clamp(20px, 3.4vw, 28px)",
                  lineHeight: "1.45",
                  color: "#f1f1f1",
                  maxWidth: "900px",
                  margin: "0 0 16px 0",
                }}
              >
                AI-powered real estate intelligence.
              </p>

              <p
                style={{
                  fontSize: "clamp(16px, 2.8vw, 24px)",
                  lineHeight: "1.65",
                  color: "#d9d9d9",
                  maxWidth: "920px",
                  margin: 0,
                }}
              >
                Tell us whether you want to sell, buy or invest. Our AI will detect
                your profile and route you according to the filter that best
                matches your goals.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "rgba(10,10,10,0.78)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "clamp(20px, 4vw, 30px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                width: "100%",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    fontSize: "clamp(28px, 5vw, 38px)",
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
                    fontSize: "clamp(15px, 2.4vw, 17px)",
                  }}
                >
                  This is the main interaction of the platform. Soon this form
                  will be replaced by the AI assistant.
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
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setUserType("seller")}
                    style={{
                      ...choiceButton,
                      backgroundColor:
                        userType === "seller" ? "white" : "#111",
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
                      backgroundColor:
                        userType === "buyer" ? "white" : "#111",
                      color: userType === "buyer" ? "black" : "white",
                    }}
                  >
                    Buy
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType("investor")}
                    style={{
                      ...choiceButton,
                      backgroundColor:
                        userType === "investor" ? "white" : "#111",
                      color: userType === "investor" ? "black" : "white",
                    }}
                  >
                    Invest
                  </button>
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
              text="The AI identifies whether the opportunity fits a seller, buyer or investor journey."
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
  width: "100%",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  backgroundColor: "rgba(24,24,24,0.86)",
  color: "white",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box" as const,
};

const choiceButton = {
  width: "100%",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #333",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 700,
};