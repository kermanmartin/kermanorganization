"use client";

import { useEffect, useState } from "react";
import AgencyApplicationsTable from "./AgencyApplicationsTable";

type AgencyApplication = {
  id: string;
  agency_name: string;
  city: string;
  website: string;
  contact_name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminAgenciesPage() {
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agency-applications/list", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Could not load applications");
      }

      const data = await res.json();
      setApplications(data);
    } catch {
      setError("Error loading agency applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        fontFamily: "Arial",
        padding: "40px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "40px",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        THE KERMAN ORGANIZATION — AGENCY APPLICATIONS
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={loadApplications}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "white",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Refresh data
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {error && (
        <p style={{ textAlign: "center", color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && applications.length === 0 ? (
        <p style={{ textAlign: "center" }}>No agency applications yet.</p>
      ) : null}

      {!loading && !error && applications.length > 0 ? (
        <AgencyApplicationsTable initialApplications={applications} />
      ) : null}
    </main>
  );
}