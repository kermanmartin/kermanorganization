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
      const rejectedFromUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("rejected")
          : null;

      if (rejectedFromUrl === "1") {
        await supabase.auth.signOut();
        setStatus(
          "This agency account is blocked. Dashboard access is not available."
        );
        setCheckingSession(false);
        return;
      }

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

      if (!application || application.status === "rejected") {
        await supabase.auth.signOut();
        setStatus(
          "This agency account is blocked. Dashboard access is not available."
        );
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

    if (!application || application.status === "rejected") {
      await supabase.auth.signOut();
      setStatus(
        "This agency account is blocked. Dashboard access is not available."
      );
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
          padding: "70px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: "18px" }}>Checking session...</p>
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
        padding: "70px 20px",
      }}
    >
      <section style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "48px", textAlign: "center", marginBottom: "16px" }}>
          Agency Access
        </h1>

        <p
          style={{
            fontSize: "20px",
            textAlign: "center",
            maxWidth: "760px",
            margin: "0 auto 50px",
            color: "#d0d0d0",
            lineHeight: "1.6",
          }}
        >
          Log in to your agency dashboard. New agencies should first apply and create
          their account through the Agencies page.
        </p>

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
          <p style={{ marginTop: "20px", textAlign: "center", fontSize: "16px" }}>
            {status}
          </p>
        )}
      </section>
    </main>
  );
}

const panelStyle = {
  backgroundColor: "#111111",
  border: "1px solid #1f1f1f",
  borderRadius: "16px",
  padding: "28px",
};

const panelTitle = {
  fontSize: "28px",
  marginBottom: "12px",
};

const panelText = {
  color: "#cfcfcf",
  lineHeight: "1.6",
  marginBottom: "22px",
};

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1a1a1a",
  color: "white",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "15px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "white",
  color: "black",
  fontWeight: "bold",
  cursor: "pointer",
};
