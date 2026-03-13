"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/agency-access");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: "12px 18px",
        borderRadius: "10px",
        border: "1px solid #2a2a2a",
        backgroundColor: "#111111",
        color: "white",
        fontSize: "15px",
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}