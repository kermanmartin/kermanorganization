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
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-top-label">REAL ESTATE INTELLIGENCE</div>

          <div className="home-title">
            The Kerman
            <br />
            Organization
          </div>

          <div className="home-divider" />

          <p className="home-subtitle">
            A more selective approach to structured real estate demand.
          </p>

          <p className="home-description">
            We qualify buyer, seller, tenant, landlord and investor demand,
            then route each opportunity according to territory, profile and fit.
          </p>

          <div className="home-cta-row">
            <Link href="/start" style={primaryCta}>
              Start
            </Link>

            <Link href="/about" style={secondaryCta}>
              About Us
            </Link>
          </div>

          <div className="home-footnote">
            Structured requests. Better matching. Higher-quality lead flow.
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "34px 20px 42px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          backgroundColor: "#050505",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            color: "#bdbdbd",
            fontSize: "14px",
            lineHeight: "1.8",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            Contact:{" "}
            <a
              href="mailto:thekermanorganization@gmail.com"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              thekermanorganization@gmail.com
            </a>
          </div>

          <div style={{ opacity: 0.72 }}>
            © {new Date().getFullYear()} The Kerman Organization. All rights
            reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-hero {
          min-height: calc(100vh - 90px);
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.42),
              rgba(0, 0, 0, 0.78)
            ),
            url("/wpaper.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px 80px;
        }

        .home-hero-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .home-top-label {
          font-size: 11px;
          letter-spacing: 1.6px;
          color: #bdbdbd;
          margin-bottom: 22px;
        }

        .home-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(42px, 6vw, 78px);
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: -1.2px;
          text-transform: uppercase;
          margin-bottom: 20px;
          color: #f5f5f5;
          text-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
        }

        .home-divider {
          width: 80px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.22);
          margin: 0 auto 24px;
        }

        .home-subtitle {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(20px, 2.4vw, 30px);
          line-height: 1.35;
          color: #f0f0f0;
          margin: 0 auto 16px;
          max-width: 680px;
        }

        .home-description {
          font-size: clamp(14px, 1.4vw, 17px);
          line-height: 1.8;
          color: #cfcfcf;
          margin: 0 auto;
          max-width: 640px;
        }

        .home-cta-row {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 36px;
        }

        .home-footnote {
          margin-top: 18px;
          font-size: 13px;
          color: #a7a7a7;
          letter-spacing: 0.3px;
        }

        @media (max-width: 640px) {
          .home-hero {
            min-height: auto;
            padding: 42px 14px 60px;
            align-items: flex-start;
          }

          .home-top-label {
            font-size: 10px;
            letter-spacing: 1.3px;
            margin-bottom: 18px;
          }

          .home-title {
            font-size: 48px;
            line-height: 0.98;
            margin-bottom: 16px;
          }

          .home-divider {
            margin-bottom: 18px;
          }

          .home-subtitle {
            font-size: 19px;
            line-height: 1.35;
            margin-bottom: 14px;
          }

          .home-description {
            font-size: 14px;
            line-height: 1.75;
          }

          .home-cta-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-top: 28px;
          }

          .home-footnote {
            font-size: 12px;
            line-height: 1.6;
          }
        }
      `}</style>
    </main>
  );
}

const primaryCta: React.CSSProperties = {
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

const secondaryCta: React.CSSProperties = {
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