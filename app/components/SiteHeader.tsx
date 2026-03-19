"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "rgba(5,5,5,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: "white",
              textDecoration: "none",
              minWidth: 0,
            }}
          >
            <img
              src="/LogoKnuevo.jpeg"
              alt="The Kerman Organization"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.12)",
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: "clamp(18px, 3.2vw, 28px)",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                lineHeight: 1.05,
                textTransform: "uppercase",
              }}
            >
              The Kerman Organization
            </span>
          </Link>

          <nav
            className="desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "26px",
            }}
          >
            <Link href="/" style={navLinkStyle}>
              Home
            </Link>

            <Link href="/about" style={navLinkStyle}>
              About
            </Link>

            <Link href="/agencies" style={navLinkStyle}>
              Agencies
            </Link>

            <Link href="/agency-access" style={secondaryCtaStyle}>
              Agency Access
            </Link>

            <Link href="/start" style={primaryCtaStyle}>
              Start
            </Link>
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="mobile-menu-button"
            style={{
              display: "none",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.04)",
              color: "white",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <span style={burgerLine} />
              <span style={burgerLine} />
              <span style={burgerLine} />
            </div>
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              zIndex: 1001,
            }}
          />

          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "min(84vw, 370px)",
              height: "100vh",
              backgroundColor: "#0b0b0b",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              zIndex: 1002,
              padding: "24px 18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "white",
                  fontSize: "28px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                style={mobileLinkStyle}
              >
                Home
              </Link>

              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                style={mobileLinkStyle}
              >
                About
              </Link>

              <Link
                href="/agencies"
                onClick={() => setMenuOpen(false)}
                style={mobileLinkStyle}
              >
                Agencies
              </Link>

              <Link
                href="/agency-access"
                onClick={() => setMenuOpen(false)}
                style={mobileSecondaryButtonStyle}
              >
                Agency Access
              </Link>

              <Link
                href="/start"
                onClick={() => setMenuOpen(false)}
                style={mobilePrimaryButtonStyle}
              >
                Start
              </Link>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @media (max-width: 1080px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-menu-button {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: "17px",
  fontWeight: 500,
};

const secondaryCtaStyle: React.CSSProperties = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  textDecoration: "none",
  fontSize: "17px",
  fontWeight: 700,
  padding: "13px 18px",
  borderRadius: "14px",
};

const primaryCtaStyle: React.CSSProperties = {
  color: "black",
  backgroundColor: "white",
  textDecoration: "none",
  fontSize: "17px",
  fontWeight: 700,
  padding: "13px 22px",
  borderRadius: "14px",
};

const mobileLinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  padding: "14px 12px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const mobileSecondaryButtonStyle: React.CSSProperties = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 700,
  padding: "16px 18px",
  borderRadius: "14px",
  marginTop: "8px",
};

const mobilePrimaryButtonStyle: React.CSSProperties = {
  color: "black",
  backgroundColor: "white",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 700,
  padding: "16px 18px",
  borderRadius: "14px",
};

const burgerLine: React.CSSProperties = {
  width: "22px",
  height: "2px",
  backgroundColor: "white",
  borderRadius: "999px",
};