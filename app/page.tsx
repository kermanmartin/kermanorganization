"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#040404",
        color: "white",
        fontFamily: 'Georgia, "Times New Roman", serif',
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
          padding: "48px 16px 84px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1440px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
            }}
          >
            <div
              style={{
                marginBottom: "18px",
                color: "rgba(255,255,255,0.82)",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "Arial, sans-serif",
                fontWeight: 700,
              }}
            >
              Real Estate Intelligence
            </div>

            <h1
              style={{
                fontSize: "clamp(54px, 8vw, 110px)",
                lineHeight: "0.92",
                fontWeight: 400,
                letterSpacing: "-2px",
                textTransform: "uppercase",
                margin: "0 0 22px 0",
                maxWidth: "980px",
              }}
            >
              The Kerman Organization
            </h1>

            <div
              style={{
                width: "140px",
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.35)",
                marginBottom: "22px",
              }}
            />

            <p
              style={{
                fontSize: "clamp(24px, 3vw, 40px)",
                lineHeight: "1.2",
                color: "#f4f4f4",
                margin: "0 0 18px 0",
                maxWidth: "820px",
              }}
            >
              A more selective approach to structured real estate demand.
            </p>

            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 20px)",
                lineHeight: "1.9",
                color: "rgba(255,255,255,0.82)",
                margin: "0 0 34px 0",
                maxWidth: "760px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              We qualify buyer, seller, tenant, landlord and investor demand,
              then route each opportunity according to territory, profile and fit.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link href="/start" style={primaryCta}>
                Begin
              </Link>

              <Link href="/about" style={secondaryCta}>
                About The Organization
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          backgroundColor: "#040404",
          padding: "70px 16px 96px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1380px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            <FeatureCard
              label="01"
              title="Structured Requests"
              text="A guided intake captures the commercial detail required for serious qualification."
            />
            <FeatureCard
              label="02"
              title="Selective Matching"
              text="Leads are routed according to geography, property profile, intent and budget range."
            />
            <FeatureCard
              label="03"
              title="Agency Visibility"
              text="Approved agencies access only the opportunities that align with their current market profile."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(13,13,13,0.98) 0%, rgba(8,8,8,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "30px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.56)",
          letterSpacing: "1.8px",
          textTransform: "uppercase",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        {label}
      </div>

      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "32px",
          lineHeight: "1.05",
          fontWeight: 400,
          letterSpacing: "-0.8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.78)",
          lineHeight: "1.8",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {text}
      </p>
    </div>
  );
}

const primaryCta: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "17px 30px",
  borderRadius: "12px",
  backgroundColor: "white",
  color: "black",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "17px",
  minWidth: "170px",
  fontFamily: "Arial, sans-serif",
};

const secondaryCta: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "17px 26px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "17px",
  minWidth: "240px",
  fontFamily: "Arial, sans-serif",
};