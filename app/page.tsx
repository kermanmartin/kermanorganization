"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "rgba(4,4,4,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="site-header-shell">
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              color: "white",
              textDecoration: "none",
              minWidth: 0,
              flex: 1,
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

            <span className="site-header-brand">
              The Kerman Organization
            </span>
          </Link>

          <nav className="desktop-nav" style={{ alignItems: "center", gap: "20px" }}>
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
              width: "46px",
              height: "46px",
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
              backgroundColor: "rgba(0,0,0,0.58)",
              zIndex: 1001,
            }}
          />

          <div className="mobile-drawer">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  color: "#f2f2f2",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Menu
              </div>

              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                style={{
                  width: "46px",
                  height: "46px",
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
                gap: "12px",
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
        .site-header-shell {
          max-width: 1460px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .site-header-brand {
          font-size: clamp(13px, 1.45vw, 21px);
          font-weight: 700;
          letter-spacing: 0.2px;
          line-height: 1.05;
          text-transform: uppercase;
          font-family: Georgia, "Times New Roman", serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: min(88vw, 380px);
          height: 100vh;
          background: linear-gradient(
            180deg,
            rgba(13, 13, 13, 0.98) 0%,
            rgba(7, 7, 7, 0.995) 100%
          );
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 1002;
          padding: 22px 16px 24px;
          display: flex;
          flex-direction: column;
          box-shadow: -18px 0 50px rgba(0, 0, 0, 0.35);
        }

        @media (max-width: 1080px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-menu-button {
            display: flex !important;
          }
        }

        @media (max-width: 640px) {
          .site-header-shell {
            padding: 10px 12px;
            gap: 10px;
          }

          .site-header-brand {
            font-size: 12px;
            letter-spacing: 0.15px;
            max-width: 170px;
          }
        }

        @media (max-width: 420px) {
          .site-header-brand {
            max-width: 145px;
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
  fontSize: "20px",
  padding: "14px 14px",
  borderRadius: "14px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const mobileSecondaryButtonStyle: React.CSSProperties = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: 700,
  padding: "15px 16px",
  borderRadius: "14px",
  marginTop: "6px",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const mobilePrimaryButtonStyle: React.CSSProperties = {
  color: "black",
  backgroundColor: "white",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: 700,
  padding: "15px 16px",
  borderRadius: "14px",
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const burgerLine: React.CSSProperties = {
  width: "20px",
  height: "2px",
  backgroundColor: "white",
  borderRadius: "999px",
};