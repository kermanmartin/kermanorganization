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
            "linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.78)), url('/wpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          padding: "36px 16px 72px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1380px",
            margin: "0 auto",
          }}
        >
          <div style={{ maxWidth: "780px" }}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <Badge text="AI-powered qualification" />
              <Badge text="Premium routing" />
              <Badge text="Real estate intelligence" />
            </div>

            <h1
              style={{
                fontSize: "clamp(46px, 7vw, 92px)",
                lineHeight: "0.94",
                fontWeight: 300,
                letterSpacing: "-2.4px",
                textTransform: "uppercase",
                margin: "0 0 18px 0",
                maxWidth: "880px",
              }}
            >
              THE KERMAN ORGANIZATION
            </h1>

            <p
              style={{
                fontSize: "clamp(22px, 2.8vw, 34px)",
                lineHeight: "1.35",
                color: "#f3f3f3",
                margin: "0 0 18px 0",
                maxWidth: "720px",
              }}
            >
              AI-powered real estate intelligence.
            </p>

            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 19px)",
                lineHeight: "1.8",
                color: "#d6d6d6",
                margin: 0,
                maxWidth: "700px",
              }}
            >
              Structured requests. Better matching. Higher-quality lead flow.
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
                Start
              </Link>

              <Link href="/about" style={secondaryCta}>
                About us
              </Link>
            </div>
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

const primaryCta = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px 28px",
  borderRadius: "14px",
  backgroundColor: "white",
  color: "black",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "17px",
  minWidth: "180px",
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
  fontSize: "17px",
  minWidth: "180px",
};