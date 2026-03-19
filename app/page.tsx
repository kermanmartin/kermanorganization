"use client";

import Link from "next/link";

export default function HomePage() {
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
            "linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.78)), url('/wpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px 80px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {/* SMALL TOP LABEL */}
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "1.6px",
              color: "#bdbdbd",
              marginBottom: "22px",
            }}
          >
            REAL ESTATE INTELLIGENCE
          </div>

          {/* MAIN TITLE */}
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(42px, 6vw, 78px)",
              lineHeight: "0.95",
              fontWeight: 500,
              letterSpacing: "-1.2px",
              textTransform: "uppercase",
              marginBottom: "20px",
              color: "#f5f5f5",
              textShadow: "0 6px 18px rgba(0,0,0,0.28)",
            }}
          >
            The Kerman
            <br />
            Organization
          </div>

          {/* LINE */}
          <div
            style={{
              width: "80px",
              height: "1px",
              backgroundColor: "rgba(255,255,255,0.22)",
              margin: "0 auto 24px",
            }}
          />

          {/* SUBTITLE */}
          <p
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(20px, 2.4vw, 30px)",
              lineHeight: "1.35",
              color: "#f0f0f0",
              margin: "0 auto 16px",
              maxWidth: "680px",
            }}
          >
            A more selective approach to structured real estate demand.
          </p>

          {/* DESCRIPTION */}
          <p
            style={{
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: "1.8",
              color: "#cfcfcf",
              margin: "0 auto",
              maxWidth: "640px",
            }}
          >
            We qualify buyer, seller, tenant, landlord and investor demand,
            then route each opportunity according to territory, profile and fit.
          </p>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "36px",
            }}
          >
            <Link href="/start" style={primaryCta}>
              Start
            </Link>

            <Link href="/about" style={secondaryCta}>
              About Us
            </Link>
          </div>

          {/* FOOT NOTE */}
          <div
            style={{
              marginTop: "18px",
              fontSize: "13px",
              color: "#a7a7a7",
              letterSpacing: "0.3px",
            }}
          >
            Structured requests. Better matching. Higher-quality lead flow.
          </div>
        </div>
      </section>
    </main>
  );
}

const primaryCta = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "180px",
  padding: "15px 26px",
  borderRadius: "12px",
  backgroundColor: "white",
  color: "black",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 700,
  boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
};

const secondaryCta = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "180px",
  padding: "15px 24px",
  borderRadius: "12px",
  backgroundColor: "rgba(10,10,10,0.36)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 700,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};