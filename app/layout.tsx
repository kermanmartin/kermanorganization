import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";

export const metadata: Metadata = {
  title: "The Kerman Organization",
  description: "AI-powered real estate intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#050505",
        }}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}