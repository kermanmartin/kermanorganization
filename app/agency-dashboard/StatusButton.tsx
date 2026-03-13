"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StatusButton({
  leadId,
  currentStatus,
}: {
  leadId: number;
  currentStatus: string;
}) {
  const supabase = createClient();
  const [status, setStatus] = useState(currentStatus);

  const updateStatus = async () => {
    let newStatus = "contacted";

    if (status === "contacted") newStatus = "closed";
    if (status === "closed") newStatus = "new";

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (!error) {
      setStatus(newStatus);
    }
  };

  const getColors = () => {
    if (status === "new") {
      return {
        background: "#0f2d16",
        color: "#66ff9a",
      };
    }

    if (status === "contacted") {
      return {
        background: "#2d240f",
        color: "#ffd76a",
      };
    }

    return {
      background: "#2a2a2a",
      color: "#cccccc",
    };
  };

  const colors = getColors();

  return (
    <button
      onClick={updateStatus}
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid #333",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        backgroundColor: colors.background,
        color: colors.color,
      }}
    >
      {status}
    </button>
  );
}