"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("agency_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Error loading agency applications.");
        setLoading(false);
        return;
      }

      setApplications(data || []);
      setLoading(false);
    };

    loadApplications();
  }, [supabase]);

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