"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AgenciesPage() {
  const supabase = createClient();

  const [agencyName, setAgencyName] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessPhonePrefix, setBusinessPhonePrefix] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedWebsite = normalizeWebsite(website);
    const fullBusinessPhone = buildFullPhone();

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
      setStatusMessage(
        "You already have a pending agency application. Please go to Agency Access to log in if your account is already created."
      );
      setLoading(false);
      return;
    }

    if (existingApplication?.status === "approved") {
      setStatusMessage(
        "This email is already approved. Please go to Agency Access to log in."
      );
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password.trim(),
    });

    if (signUpError) {
      setStatusMessage(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("agency_applications").insert([
      {
        agency_name: agencyName.trim(),
        city: city.trim(),
        website: normalizedWebsite,
        contact_name: contactName.trim(),
        business_phone: fullBusinessPhone,
        email: normalizedEmail,
        message: message.trim(),
        status: "pending",
      },
    ]);

    if (insertError) {
      setStatusMessage(
        "Your account was created, but we could not save the agency application. Please contact support or try again."
      );
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setStatusMessage(
      "Agency account created successfully. You can now log in through Agency Access. Your account is under review."
    );

    setAgencyName("");
    setCity("");
    setWebsite("");
    setContactName("");
    setBusinessPhonePrefix("");
    setBusinessPhoneNumber("");
    setEmail("");
    setPassword("");
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
          Apply to join The Kerman Organization agency network. Create your account
          and submit your agency details in one step. Approved agencies unlock full
          contact access inside the private dashboard.
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
              style={{ ...inputStyle, gridColumn: "1 / -1" }}
            />

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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