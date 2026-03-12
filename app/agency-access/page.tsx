"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AgencyAccessPage() {
  const [agencyName, setAgencyName] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    const { error } = await supabase.from("agency_applications").insert([
      {
        agency_name: agencyName,
        city,
        website,
        contact_name: contactName,
        email,
        message,
      },
    ]);

    if (error) {
      setStatus("Something went wrong. Please try again.");
      return;
    }

    setStatus("Application received. We’ll review it and get back to you.");
    setAgencyName("");
    setCity("");
    setWebsite("");
    setContactName("");
    setEmail("");
    setMessage("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        padding: "70px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Agency Access
        </h1>

        <p
          style={{
            fontSize: "20px",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto 50px",
            lineHeight: "1.6",
            color: "#d0d0d0",
          }}
        >
          Work with The Kerman Organization. Apply for access to qualified,
          AI-filtered real estate leads.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              backgroundColor: "#111111",
              border: "1px solid #1f1f1f",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>
              Apply as an agency
            </h2>

            <p style={{ color: "#cfcfcf", lineHeight: "1.6", marginBottom: "24px" }}>
              Tell us about your agency. We manually review applications to keep
              the network selective and relevant.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <input
                type="text"
                placeholder="Agency name"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
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

              <input
                type="email"
                placeholder="Business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              <textarea
                placeholder="Tell us what type of clients or properties you focus on"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <button
                type="submit"
                style={{
                  padding: "15px",
                  fontSize: "17px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "white",
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Apply for access
              </button>
            </form>

            {status && (
              <p style={{ marginTop: "16px", textAlign: "center", color: "#dcdcdc" }}>
                {status}
              </p>
            )}
          </div>

          <div
            style={{
              backgroundColor: "#111111",
              border: "1px solid #1f1f1f",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>
              Already approved?
            </h2>

            <p style={{ color: "#cfcfcf", lineHeight: "1.6", marginBottom: "20px" }}>
              Approved partner agencies will soon be able to log in and access
              their private lead dashboard.
            </p>

            <div
              style={{
                backgroundColor: "#0f0f0f",
                border: "1px solid #222",
                borderRadius: "12px",
                padding: "18px",
                color: "#bdbdbd",
                lineHeight: "1.7",
              }}
            >
              <p style={{ marginTop: 0 }}>Private agency dashboard</p>
              <p>Approved agencies only</p>
              <p style={{ marginBottom: 0 }}>Access coming next</p>
            </div>
          </div>
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
};