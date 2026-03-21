"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AgencyAccessPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setCheckingSession(false);
        return;
      }

      const { data: application } = await supabase
        .from("agency_applications")
        .select("status")
        .eq("email", session.user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!application) {
        await supabase.auth.signOut();
        setCheckingSession(false);
        return;
      }

      router.replace("/agency-dashboard");
    };

    checkSession();
  }, [router, supabase]);

  const handleAgencyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Signing in...");

    const normalizedEmail = loginEmail.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: loginPassword,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    const { data: application } = await supabase
      .from("agency_applications")
      .select("status")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!application) {
      await supabase.auth.signOut();
      setStatus("This agency account does not have an application record.");
      return;
    }

    setStatus("Login successful.");
    router.replace("/agency-dashboard");
    router.refresh();
  };

  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('/wpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          fontFamily: "Arial",
          padding: "40px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: "18px", textAlign: "center" }}>Checking session...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('/wpaper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        fontFamily: "Arial",
        padding: "40px 14px 64px",
      }}
    >
      <section style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(18,18,18,0.9)",
              color: "#b8b8b8",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Agency login
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 7vw, 48px)",
              textAlign: "center",
              marginBottom: "16px",
              lineHeight: "0.98",
              fontWeight: 400,
              letterSpacing: "-1px",
            }}
          >
            Agency Access
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2.2vw, 20px)",
              textAlign: "center",
              maxWidth: "760px",
              margin: "0 auto",
              color: "#d0d0d0",
              lineHeight: "1.7",
            }}
          >
            Log in to your agency dashboard. New agencies should first apply and
            create their account through the Agencies page.
          </p>
        </div>

        <div style={panelStyle}>
          <h2 style={panelTitle}>Log in</h2>
          <p style={panelText}>
            Use the same business email and password you created during your agency
            application.
          </p>

          <form
            onSubmit={handleAgencyLogin}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <input
              type="email"
              placeholder="Business email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              style={inputStyle}
            />

            <button type="submit" style={buttonStyle}>
              Log in
            </button>
          </form>
        </div>

        {status && (
          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(17,17,17,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            {status}
          </div>
        )}
      </section>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  backgroundColor: "rgba(17,17,17,0.96)",
  border: "1px solid #1f1f1f",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.26)",
};

const panelTitle: React.CSSProperties = {
  fontSize: "clamp(24px, 4vw, 28px)",
  marginBottom: "12px",
  fontWeight: 400,
};

const panelText: React.CSSProperties = {
  color: "#cfcfcf",
  lineHeight: "1.7",
  marginBottom: "22px",
  fontSize: "16px",
};

const inputStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1a1a1a",
  color: "white",
  fontSize: "16px",
  width: "100%",
};

const buttonStyle: React.CSSProperties = {
  padding: "15px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "white",
  color: "black",
  fontWeight: "bold",
  cursor: "pointer",
};