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
          backgroundColor: "rgba(4,4,4,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1460px",
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "white",
              textDecoration: "none",
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            <img
              src="/LogoKnuevo.jpeg"
              alt="The Kerman Organization"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "999px",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: "clamp(14px, 1.5vw, 21px)",
                fontWeight: 700,
                letterSpacing: "0.2px",
                lineHeight: 1.05,
                textTransform: "uppercase",
                fontFamily: 'Georgia, "Times New Roman", serif',
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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
              gap: "22px",
              flexShrink: 0,
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
              Begin
            </Link>
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="mobile-menu-button"
            style={{
              display: "none",
              width: "48px",
              height: "48px",
              borderRadius: "13px",
              border: "1px solid rgba(255,255,255,0.1)",
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
                Begin
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
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const secondaryCtaStyle: React.CSSProperties = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 700,
  padding: "11px 18px",
  borderRadius: "14px",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const primaryCtaStyle: React.CSSProperties = {
  color: "black",
  backgroundColor: "white",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 700,
  padding: "11px 20px",
  borderRadius: "14px",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const mobileLinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  padding: "14px 12px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const mobileSecondaryButtonStyle: React.CSSProperties = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 700,
  padding: "16px 18px",
  borderRadius: "14px",
  marginTop: "8px",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const mobilePrimaryButtonStyle: React.CSSProperties = {
  color: "black",
  backgroundColor: "white",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 700,
  padding: "16px 18px",
  borderRadius: "14px",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const burgerLine: React.CSSProperties = {
  width: "22px",
  height: "2px",
  backgroundColor: "white",
  borderRadius: "999px",
};