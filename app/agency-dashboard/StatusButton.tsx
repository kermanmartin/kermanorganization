"use client";

type LeadStatus = "new" | "contacted" | "closed";

export default function StatusButton({
  status,
  onChange,
}: {
  status: LeadStatus;
  onChange: () => void;
}) {
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
      onClick={onChange}
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