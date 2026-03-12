"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    const { error } = await supabase.from("leads").insert([
      {
        name,
        email,
        user_type: userType,
        message,
      },
    ]);

    if (error) {
      setStatus("Something went wrong. Please try again.");
      return;
    }

    setStatus("Thanks, we’ll contact you soon.");
    setName("");
    setEmail("");
    setUserType("");
    setMessage("");
  };

  return (
    <main
      style={{
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <section
        style={{
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.78)), url('/wpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: "1100px" }}>
          <h1
            style={{
              fontSize: "68px",
              marginBottom: "24px",
              letterSpacing: "2px",
            }}
          >
            THE KERMAN ORGANIZATION
          </h1>

          <p
            style={{
              fontSize: "28px",
              maxWidth: "900px",
              margin: "0 auto",
              lineHeight: "1.5",
              color: "#f2f2f2",
            }}
          >
            AI-powered real estate intelligence.
            <br />
            We connect serious buyers, sellers and investors with the right
            opportunities.
          </p>

          <div
            style={{
              marginTop: "32px",
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={pill}>AI-powered analysis</span>
            <span style={pill}>Qualified leads</span>
            <span style={pill}>Real estate intelligence</span>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={card}>
            <h3 style={cardTitle}>AI-powered analysis</h3>
            <p style={cardText}>
              We analyze property demand, buyer intent and market signals to
              identify the most relevant opportunities.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>Qualified clients</h3>
            <p style={cardText}>
              We focus on serious buyers, sellers and investors, not random
              traffic with no real intent.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>Better decisions</h3>
            <p style={cardText}>
              We help clients move faster with better information, better
              matching and a more intelligent process.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 20px 80px",
        }}
      >
        <h2
          style={{
            fontSize: "40px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={card}>
            <div style={stepText}>STEP 1</div>
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>
              Tell us what you need
            </h3>
            <p style={cardText}>
              Share your property goals, preferred location, budget and
              investment profile.
            </p>
          </div>

          <div style={card}>
            <div style={stepText}>STEP 2</div>
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>
              Our AI analyzes the market
            </h3>
            <p style={cardText}>
              We evaluate demand, opportunities and fit to identify the most
              relevant path forward.
            </p>
          </div>

          <div style={card}>
            <div style={stepText}>STEP 3</div>
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>
              Get connected
            </h3>
            <p style={cardText}>
              We connect you with the most relevant opportunities, partners or
              real estate routes based on your profile.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 20px 80px",
        }}
      >
        <h2
          style={{
            fontSize: "40px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Who we help
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={card}>
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>Investors</h3>
            <p style={cardText}>
              Find better-fit opportunities, off-market style flows and
              data-driven real estate insights.
            </p>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>Buyers</h3>
            <p style={cardText}>
              Access a more guided, intelligent and personalized way to find the
              right property.
            </p>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>Sellers</h3>
            <p style={cardText}>
              Connect with serious and qualified interest instead of wasting time
              on weak or unfiltered leads.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 20px 90px",
        }}
      >
        <div
          style={{
            backgroundColor: "#111111",
            padding: "34px",
            borderRadius: "16px",
            textAlign: "left",
            border: "1px solid #1f1f1f",
          }}
        >
          <h2
            style={{
              fontSize: "34px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Get in touch
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
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

            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                I am a...
              </option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="investor">Investor</option>
            </select>

            <textarea
              placeholder="Tell us what you are looking for"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <button type="submit" style={buttonStyle}>
              Send
            </button>
          </form>

          {status && (
            <p style={{ marginTop: "16px", textAlign: "center" }}>{status}</p>
          )}
        </div>
      </section>

      <footer style={footer}>
        <p style={{ marginBottom: "8px", fontSize: "18px" }}>
          THE KERMAN ORGANIZATION
        </p>
        <p style={{ marginBottom: "8px" }}>
          AI-powered real estate intelligence.
        </p>
        <p>contact@kermanorganization.com</p>
      </footer>
    </main>
  );
}

const pill = {
  padding: "10px 16px",
  border: "1px solid #2a2a2a",
  borderRadius: "999px",
  backgroundColor: "rgba(17,17,17,0.85)",
};

const card = {
  backgroundColor: "#111111",
  border: "1px solid #1f1f1f",
  borderRadius: "14px",
  padding: "26px",
};

const cardTitle = {
  fontSize: "22px",
  marginBottom: "12px",
};

const cardText = {
  color: "#d0d0d0",
  lineHeight: "1.6",
};

const stepText = {
  fontSize: "14px",
  color: "#9c9c9c",
  marginBottom: "10px",
};

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1a1a1a",
  color: "white",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "16px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "none",
  background: "white",
  color: "black",
  cursor: "pointer",
  fontWeight: "bold",
};

const footer = {
  borderTop: "1px solid #1f1f1f",
  padding: "28px 20px 40px",
  textAlign: "center" as const,
  color: "#bdbdbd",
};