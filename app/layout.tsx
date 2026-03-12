import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "The Kerman Organization",
  description: "AI-powered real estate intelligence",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#0a0a0a",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #1f1f1f",
            position: "sticky",
            top: 0,
            backgroundColor: "#0a0a0a",
            zIndex: 1000,
          }}
        >
          <nav
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 20px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "20px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <img
                src="/logo.png"
                alt="The Kerman Organization logo"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  objectFit: "cover",
                }}
              />
              <span>THE KERMAN ORGANIZATION</span>
            </Link>

            <div
              style={{
                display: "flex",
                gap: "22px",
                alignItems: "center",
              }}
            >
              <Link href="/" style={navLink}>
                Home
              </Link>

              <Link href="/agencies" style={navLink}>
                Agencies
              </Link>

              <Link
                href="/agency-access"
                style={{
                  textDecoration: "none",
                  backgroundColor: "white",
                  color: "black",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Agency Access
              </Link>
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}

const navLink = {
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
};