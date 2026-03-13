"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AgenciesPage() {
  const supabase = createClient();

  const [agencyName, setAgencyName] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingApplication, error: existingError } = await supabase
      .from("agency_applications")
      .select("id, status")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      setStatusMessage("Could not check existing application. Please try again.");
      setLoading(false);
      return;
    }

    if (existingApplication?.status === "pending") {
      setStatusMessage("You already have a pending application under review.");
      setLoading(false);
      return;
    }

    if (existingApplication?.status === "approved") {
      setStatusMessage(
        "This email has already been approved. Go to Agency Access to create your account or log in."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("agency_applications").insert([
      {
        agency_name: agencyName.trim(),
        city: city.trim(),
        website: website.trim(),
        contact_name: contactName.trim(),
        email: normalizedEmail,
        message: message.trim(),
        status: "pending",
      },
    ]);

    if (error) {
      setStatusMessage("Could not submit your application. Please try again.");
      setLoading(false);
      return;
    }

    setStatusMessage(
      "Application submitted successfully. We will review it and contact you if approved."
    );

    setAgencyName("");
    setCity("");
    setWebsite("");
    setContactName("");
    setEmail("");
    setMessage("");
    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/wpaper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "70px 20px",
      }}
    >
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
            maxWidth: "820px",
            margin: "0 auto 50px",
            color: "#d0d0d0",
            lineHeight: "1.7",
          }}
        >
          Apply to join The Kerman Organization agency network. Approved agencies
          will receive access to a private dashboard and lead flow.
        </p>

        <div
          style={{
            maxWidth: "820px",
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
            Apply for access
          </h2>

          <p
            style={{
              color: "#cfcfcf",
              lineHeight: "1.7",
              marginBottom: "24px",
              fontSize: "16px",
            }}
          >
            Submit your agency details below. Once reviewed, approved agencies can
            create an account from the Agency Access page.
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

            <input
              type="email"
              placeholder="Business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ ...inputStyle, gridColumn: "1 / -1" }}
            />

            <textarea
              placeholder="Tell us what type of clients or properties you are looking for"
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
              {loading ? "Submitting..." : "Submit application"}
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