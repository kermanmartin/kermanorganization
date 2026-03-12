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
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "52px", marginBottom: "20px" }}>
        THE KERMAN ORGANIZATION
      </h1>

      <p style={{ fontSize: "24px", maxWidth: "800px", margin: "0 auto" }}>
        AI-powered real estate intelligence.
        <br />
        We connect serious buyers, sellers and investors with the right opportunities.
      </p>

      <div style={{ marginTop: "60px" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>
          What we do
        </h2>

        <p
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            fontSize: "18px",
            lineHeight: "1.6",
          }}
        >
          Our platform analyzes property demand using artificial intelligence
          and connects qualified real estate clients with the most relevant
          agencies and opportunities.
        </p>
      </div>

      <div
        style={{
          marginTop: "80px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#111111",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "left",
        }}
      >
        <h2
          style={{ fontSize: "30px", marginBottom: "20px", textAlign: "center" }}
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
            style={{
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: "16px",
            }}
          />

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: "16px",
            }}
          />

          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
            style={{
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: "16px",
            }}
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
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: "16px",
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "16px",
              fontSize: "18px",
              borderRadius: "8px",
              border: "none",
              background: "white",
              color: "black",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send
          </button>
        </form>

        {status && (
          <p style={{ marginTop: "16px", textAlign: "center" }}>{status}</p>
        )}
      </div>
    </main>
  );
}