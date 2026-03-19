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
            "linear-gradient(rgba(0,0,0,0.34), rgba(0,0,0,0.74)), url('/wpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          padding: "36px 16px 64px",
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
              maxWidth: "860px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <Badge text="AI-powered qualification" />
              <Badge text="Structured real estate leads" />
              <Badge text="Premium agency routing" />
            </div>

            <h1
              style={{
                fontSize: "clamp(46px, 7vw, 92px)",
                lineHeight: "0.94",
                fontWeight: 300,
                letterSpacing: "-2.4px",
                textTransform: "uppercase",
                margin: "0 0 18px 0",
                maxWidth: "900px",
              }}
            >
              THE KERMAN ORGANIZATION
            </h1>

            <p
              style={{
                fontSize: "clamp(22px, 2.8vw, 34px)",
                lineHeight: "1.35",
                color: "#f3f3f3",
                margin: "0 0 16px 0",
                maxWidth: "760px",
              }}
            >
              AI-powered real estate intelligence.
            </p>

            <p
              style={{
                fontSize: "clamp(16px, 1.9vw, 20px)",
                lineHeight: "1.8",
                color: "#d4d4d4",
                margin: 0,
                maxWidth: "760px",
              }}
            >
              We structure buyer, seller, tenant, landlord and investor demand
              into qualified opportunities, then route each request to the right
              agency profile.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "34px",
              }}
            >
              <Link href="/start" style={primaryCta}>
                Start your request
              </Link>

              <Link href="/agencies" style={secondaryCta}>
                Agency applications
              </Link>
            </div>

            <div
              style={{
                marginTop: "18px",
                color: "#a9a9a9",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Structured intake. Better matching. Stronger lead quality.
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          backgroundColor: "#050505",
          padding: "72px 16px 90px",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
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
            <InfoCard
              step="01"
              title="Submit a structured request"
              text="A short guided flow captures the data that actually matters for real estate qualification and routing."
            />
            <InfoCard
              step="02"
              title="AI-assisted lead structuring"
              text="Each request is normalized into a clearer commercial profile: location, type, urgency, intent and budget."
            />
            <InfoCard
              step="03"
              title="Matched agency distribution"
              text="Approved agencies only see leads that align with their territory, property focus and client profile."
            />
          </div>

          <div
            style={{
              marginTop: "46px",
              textAlign: "center",
            }}
          >
            <Link href="/start" style={largeCta}>
              Begin now
            </Link>

            <p
              style={{
                marginTop: "18px",
                color: "#b8b8b8",
                fontSize: "15px",
                lineHeight: "1.8",
                maxWidth: "760px",
                marginInline: "auto",
              }}
            >
              Start with a fast guided intake and let the platform structure your
              opportunity properly from the beginning.
            </p>
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
        backgroundColor: "rgba(17,17,17,0.72)",
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

function InfoCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(10,10,10,1) 100%)",
        border: "1px solid #1d1d1d",
        borderRadius: "20px",
        padding: "30px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#8f8f8f",
          letterSpacing: "0.7px",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        Step {step}
      </div>

      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "28px",
          lineHeight: "1.1",
          fontWeight: 400,
          letterSpacing: "-0.6px",
          color: "white",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#cfcfcf",
          lineHeight: "1.8",
          fontSize: "16px",
        }}
      >
        {text}
      </p>
    </div>
  );
}

const primaryCta = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px 24px",
  borderRadius: "14px",
  backgroundColor: "white",
  color: "black",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "16px",
  minWidth: "220px",
};

const secondaryCta = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px 24px",
  borderRadius: "14px",
  backgroundColor: "rgba(17,17,17,0.72)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "16px",
  minWidth: "220px",
};

const largeCta = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "18px 30px",
  borderRadius: "16px",
  backgroundColor: "white",
  color: "black",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "18px",
  minWidth: "240px",
};