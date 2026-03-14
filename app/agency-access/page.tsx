"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AgencyAccessPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/agency-dashboard");
        return;
      }

      setCheckingSession(false);
    };

    checkSession();
  }, [router, supabase]);

  const handleAgencySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Checking approval...");

    const normalizedEmail = signUpEmail.trim().toLowerCase();

    const { data: application, error: appError } = await supabase
      .from("agency_applications")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("status", "approved")
      .maybeSingle();

    if (appError || !application) {
      setStatus("This email is not approved for agency access yet.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: signUpPassword,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Account created. You can now log in.");
    setSignUpEmail("");
    setSignUpPassword("");
  };

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
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
          Approved agencies can create an account and access their private dashboard.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          <div style={panelStyle}>
            <h2 style={panelTitle}>Create account</h2>
            <p style={panelText}>
              Only approved agencies can create an account. Use the same business
              email you used in your agency application.
            </p>

            <form
              onSubmit={handleAgencySignup}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <input
                type="email"
                placeholder="Approved business email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Create password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                style={inputStyle}
              />

              <button type="submit" style={buttonStyle}>
                Create agency account
              </button>
            </form>
          </div>

          <div style={panelStyle}>
            <h2 style={panelTitle}>Log in</h2>
            <p style={panelText}>
              Already have an approved agency account? Log in below.
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
