"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusButton from "./StatusButton";

type LeadStatus = "new" | "contacted" | "closed";
type LeadTier = "exclusive" | "premium" | "standard";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  preferred_area: string | null;
  property_type: string | null;
  timeframe: string | null;
  financing_status: string | null;
  seller_status: string | null;
  rental_profile: string | null;
  budget: string | null;
  user_type: string | null;
  urgency?: string | null;
  status: string | null;
  message: string | null;
  created_at: string | null;
  contact_locked?: boolean;
  match_score?: number;
  match_reason?: string | null;
  match_label?: string | null;
  lead_tier?: LeadTier;
  lead_price?: number | null;
  is_purchased?: boolean;
  purchased_at?: string | null;
};

export default function AgencyDashboardClient({
  initialLeads,
  isApproved,
  agencyName,
}: {
  initialLeads: Lead[];
  isApproved: boolean;
  agencyName: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [buyingLeadId, setBuyingLeadId] = useState<string | null>(null);
  const [isCheckingCheckout, setIsCheckingCheckout] = useState(false);

  const checkoutStatus = searchParams.get("checkout");
  const checkoutLeadId = searchParams.get("lead");

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  useEffect(() => {
    if (checkoutStatus !== "success") {
      setIsCheckingCheckout(false);
      return;
    }

    setIsCheckingCheckout(true);

    const firstRefresh = window.setTimeout(() => {
      router.refresh();
    }, 1200);

    const secondRefresh = window.setTimeout(() => {
      router.refresh();
    }, 3000);

    const finalCleanup = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("checkout");
      params.delete("lead");

      const nextUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(nextUrl);
      router.refresh();
      setIsCheckingCheckout(false);
    }, 5200);

    return () => {
      window.clearTimeout(firstRefresh);
      window.clearTimeout(secondRefresh);
      window.clearTimeout(finalCleanup);
    };
  }, [checkoutStatus, pathname, router, searchParams]);

  const getNextStatus = (currentStatus: string | null): LeadStatus => {
    if (currentStatus === "new" || !currentStatus) return "contacted";
    if (currentStatus === "contacted") return "closed";
    return "new";
  };

  const updateLeadStatus = async (
    leadId: string,
    currentStatus: string | null
  ) => {
    const lead = leads.find((item) => item.id === leadId);

    if (!lead?.is_purchased) {
      alert("Unlock this lead first before updating its pipeline status.");
      return;
    }

    const newStatus = getNextStatus(currentStatus);
    const previousLeads = leads;

    setLeads((prev) =>
      prev.map((item) =>
        item.id === leadId ? { ...item, status: newStatus } : item
      )
    );

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      setLeads(previousLeads);
      alert("Could not update lead status.");
    }
  };

  const unlockLead = async (leadId: string) => {
    if (!isApproved) {
      alert("Your agency must be approved before unlocking leads.");
      return;
    }

    const lead = leads.find((item) => item.id === leadId);

    if (!lead) {
      alert("Lead not found.");
      return;
    }

    if (!lead.lead_price || lead.lead_price <= 0) {
      alert("This lead does not have a valid price.");
      return;
    }

    setBuyingLeadId(leadId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          price: lead.lead_price,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        alert(payload?.error ?? "Could not start payment.");
        return;
      }

      if (!payload?.url) {
        alert("Stripe checkout URL was not returned.");
        return;
      }

      window.location.href = payload.url;
    } catch {
      alert("Could not start payment.");
    } finally {
      setBuyingLeadId(null);
    }
  };

  const checkoutBanner =
    checkoutStatus === "success"
      ? {
          title: "Payment received.",
          text: checkoutLeadId
            ? "We are finalizing lead access. The desk will refresh automatically in a few seconds."
            : "We are finalizing your lead access. The desk will refresh automatically in a few seconds.",
          tone: "success" as const,
        }
      : checkoutStatus === "cancelled"
      ? {
          title: "Payment cancelled.",
          text: "No charge was completed. You can unlock the lead again whenever you want.",
          tone: "neutral" as const,
        }
      : null;

  if (!leads || leads.length === 0) {
    return (
      <div
        style={{
          padding: "32px 20px",
          borderRadius: "22px",
          background:
            "linear-gradient(180deg, rgba(16,16,16,0.96) 0%, rgba(10,10,10,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 500,
            marginBottom: "12px",
            letterSpacing: "-0.7px",
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          No matched leads yet
        </div>

        <p
          style={{
            margin: 0,
            color: "#a9a9a9",
            fontSize: "15px",
            lineHeight: "1.8",
            maxWidth: "760px",
            marginInline: "auto",
          }}
        >
          {agencyName} will see new opportunities here as soon as incoming demand
          aligns with your territory, property focus and client profile.
        </p>
      </div>
    );
  }

  return (
    <>
      {checkoutBanner && (
        <div
          style={{
            marginBottom: "18px",
            padding: "16px 18px",
            borderRadius: "18px",
            border:
              checkoutBanner.tone === "success"
                ? "1px solid rgba(43, 104, 67, 0.9)"
                : "1px solid rgba(255,255,255,0.08)",
            background:
              checkoutBanner.tone === "success"
                ? "linear-gradient(180deg, rgba(18,49,31,0.96) 0%, rgba(11,31,20,0.98) 100%)"
                : "linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(11,11,11,0.98) 100%)",
            color: "#d9d9d9",
            lineHeight: "1.7",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "6px",
              color:
                checkoutBanner.tone === "success" ? "#b6f0c8" : "#f1f1f1",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            {checkoutBanner.title}
          </div>

          <div style={{ fontSize: "14px" }}>{checkoutBanner.text}</div>

          {isCheckingCheckout && checkoutBanner.tone === "success" && (
            <div
              style={{
                marginTop: "12px",
                height: "6px",
                width: "100%",
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  background:
                    "linear-gradient(90deg, rgba(100, 220, 145, 0.3) 0%, rgba(143, 240, 177, 1) 100%)",
                  animation: "checkoutProgress 4.8s linear forwards",
                }}
              />
            </div>
          )}
        </div>
      )}

      {!isApproved && (
        <div
          style={{
            marginBottom: "18px",
            padding: "16px 18px",
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(16,16,16,0.95) 0%, rgba(10,10,10,0.99) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#cfcfcf",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          <strong style={{ color: "white" }}>Lead unlocking unavailable:</strong>{" "}
          your agency must be approved before payment and lead access are enabled.
        </div>
      )}

      <div className="lead-desk-shell">
        <div className="lead-desk-header">
          <div>
            <h2 className="lead-desk-title">Lead desk</h2>
            <p className="lead-desk-copy">
              Review fit, unlock serious opportunities, and move purchased leads
              into your active pipeline.
            </p>
          </div>

          <div className="lead-desk-chip">{leads.length} opportunities</div>
        </div>

        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th style={thStyle}>Match</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Access</th>
                <th style={thStyle}>Why it fits</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Area</th>
                <th style={thStyle}>Property</th>
                <th style={thStyle}>Budget</th>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Timeframe</th>
                <th style={thStyle}>Pipeline</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Unlocked at</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => {
                const isBuying = buyingLeadId === lead.id;

                return (
                  <tr key={lead.id} style={{ borderTop: "1px solid rgba(255,255,255,0.045)" }}>
                    <td style={tdStyleScore}>
                      <MatchScoreBadge
                        score={lead.match_score ?? 0}
                        label={lead.match_label ?? null}
                      />
                    </td>

                    <td style={tdStylePrice}>
                      <PriceCell
                        price={lead.lead_price ?? 0}
                        purchased={Boolean(lead.is_purchased)}
                      />
                    </td>

                    <td style={tdStyleAction}>
                      {lead.is_purchased ? (
                        <UnlockedBadge />
                      ) : (
                        <button
                          onClick={() => unlockLead(lead.id)}
                          disabled={isBuying || !isApproved}
                          style={{
                            border: "1px solid #3d6b52",
                            background: isApproved
                              ? "linear-gradient(180deg, #193728 0%, #102219 100%)"
                              : "#1b1b1b",
                            color: isApproved ? "#e5f7ec" : "#7c7c7c",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor:
                              isBuying || !isApproved ? "not-allowed" : "pointer",
                            minWidth: "182px",
                            lineHeight: "1.35",
                            boxShadow: isApproved
                              ? "0 10px 28px rgba(11, 46, 27, 0.22)"
                              : "none",
                          }}
                        >
                          {isBuying
                            ? "Redirecting..."
                            : `Unlock lead for €${lead.lead_price ?? 0}`}
                        </button>
                      )}
                    </td>

                    <td style={tdStyleAccess}>
                      <AccessCell
                        purchased={Boolean(lead.is_purchased)}
                        approved={isApproved}
                      />
                    </td>

                    <td style={tdStyleReason}>
                      <FitSummary
                        score={lead.match_score ?? 0}
                        reason={lead.match_reason ?? ""}
                      />
                    </td>

                    <td style={tdStyle}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.name ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyle}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.email ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyle}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.phone ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyle}>{formatValue(lead.city)}</td>
                    <td style={tdStyle}>{lead.preferred_area ?? "-"}</td>
                    <td style={tdStyle}>{formatValue(lead.property_type)}</td>
                    <td style={tdStyleBudget}>{lead.budget ?? "-"}</td>
                    <td style={tdStyle}>{formatValue(lead.user_type)}</td>
                    <td style={tdStyle}>{formatValue(lead.timeframe)}</td>

                    <td style={tdStyle}>
                      {lead.is_purchased ? (
                        <StatusButton
                          status={(lead.status as LeadStatus) ?? "new"}
                          onChange={() => updateLeadStatus(lead.id, lead.status)}
                        />
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "8px 10px",
                            borderRadius: "10px",
                            border: "1px solid #343434",
                            backgroundColor: "#191919",
                            color: "#8f8f8f",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Unlock first
                        </span>
                      )}
                    </td>

                    <td style={tdStyleMessage}>
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.message ?? "-"}
                      </LockedCell>
                    </td>

                    <td style={tdStyleDate}>
                      {lead.purchased_at
                        ? new Date(lead.purchased_at).toLocaleString()
                        : "-"}
                    </td>

                    <td style={tdStyleDate}>
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lead-cards-mobile">
          {leads.map((lead) => {
            const isBuying = buyingLeadId === lead.id;

            return (
              <div key={lead.id} className="lead-card">
                <div className="lead-card-top">
                  <MatchScoreBadge
                    score={lead.match_score ?? 0}
                    label={lead.match_label ?? null}
                  />

                  <div style={{ minWidth: "112px" }}>
                    <PriceCell
                      price={lead.lead_price ?? 0}
                      purchased={Boolean(lead.is_purchased)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  {lead.is_purchased ? (
                    <UnlockedBadge />
                  ) : (
                    <button
                      onClick={() => unlockLead(lead.id)}
                      disabled={isBuying || !isApproved}
                      style={{
                        width: "100%",
                        border: "1px solid #3d6b52",
                        background: isApproved
                          ? "linear-gradient(180deg, #193728 0%, #102219 100%)"
                          : "#1b1b1b",
                        color: isApproved ? "#e5f7ec" : "#7c7c7c",
                        padding: "13px 14px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor:
                          isBuying || !isApproved ? "not-allowed" : "pointer",
                        lineHeight: "1.35",
                        boxShadow: isApproved
                          ? "0 10px 28px rgba(11, 46, 27, 0.22)"
                          : "none",
                      }}
                    >
                      {isBuying
                        ? "Redirecting..."
                        : `Unlock lead for €${lead.lead_price ?? 0}`}
                    </button>
                  )}
                </div>

                <div className="lead-card-grid">
                  <MobileRow
                    label="Access"
                    value={
                      <AccessCell
                        purchased={Boolean(lead.is_purchased)}
                        approved={isApproved}
                      />
                    }
                  />

                  <MobileRow
                    label="Why it fits"
                    value={
                      <FitSummary
                        score={lead.match_score ?? 0}
                        reason={lead.match_reason ?? ""}
                      />
                    }
                  />

                  <MobileRow
                    label="Name"
                    value={
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.name ?? "-"}
                      </LockedCell>
                    }
                  />

                  <MobileRow
                    label="Email"
                    value={
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.email ?? "-"}
                      </LockedCell>
                    }
                  />

                  <MobileRow
                    label="Phone"
                    value={
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.phone ?? "-"}
                      </LockedCell>
                    }
                  />

                  <MobileRow label="City" value={formatValue(lead.city)} />
                  <MobileRow label="Area" value={lead.preferred_area ?? "-"} />
                  <MobileRow
                    label="Property"
                    value={formatValue(lead.property_type)}
                  />
                  <MobileRow label="Budget" value={lead.budget ?? "-"} />
                  <MobileRow
                    label="Client"
                    value={formatValue(lead.user_type)}
                  />
                  <MobileRow
                    label="Timeframe"
                    value={formatValue(lead.timeframe)}
                  />

                  <MobileRow
                    label="Pipeline"
                    value={
                      lead.is_purchased ? (
                        <StatusButton
                          status={(lead.status as LeadStatus) ?? "new"}
                          onChange={() => updateLeadStatus(lead.id, lead.status)}
                        />
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "8px 10px",
                            borderRadius: "10px",
                            border: "1px solid #343434",
                            backgroundColor: "#191919",
                            color: "#8f8f8f",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Unlock first
                        </span>
                      )
                    }
                  />

                  <MobileRow
                    label="Message"
                    value={
                      <LockedCell locked={Boolean(lead.contact_locked)}>
                        {lead.message ?? "-"}
                      </LockedCell>
                    }
                  />

                  <MobileRow
                    label="Unlocked at"
                    value={
                      lead.purchased_at
                        ? new Date(lead.purchased_at).toLocaleString()
                        : "-"
                    }
                  />

                  <MobileRow
                    label="Created"
                    value={
                      lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : "-"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .lead-desk-shell {
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: linear-gradient(
            180deg,
            rgba(14, 14, 14, 0.96) 0%,
            rgba(8, 8, 8, 0.995) 100%
          );
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
        }

        .lead-desk-header {
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .lead-desk-title {
          margin: 0;
          font-size: 28px;
          font-weight: 500;
          letter-spacing: -0.7px;
          font-family: Georgia, "Times New Roman", serif;
        }

        .lead-desk-copy {
          margin: 8px 0 0 0;
          color: #9f9f9f;
          font-size: 14px;
          line-height: 1.75;
          max-width: 760px;
        }

        .lead-desk-chip {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background-color: rgba(255, 255, 255, 0.03);
          color: #d7d7d7;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.45px;
          text-transform: uppercase;
        }

        .lead-table-wrap {
          display: block;
          overflow-x: auto;
        }

        .lead-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1960px;
        }

        .lead-cards-mobile {
          display: none;
        }

        .lead-card {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 18px 16px;
        }

        .lead-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .lead-card-grid {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        @media (max-width: 860px) {
          .lead-desk-header {
            padding: 18px 16px;
          }

          .lead-desk-title {
            font-size: 24px;
          }

          .lead-table-wrap {
            display: none;
          }

          .lead-cards-mobile {
            display: block;
          }
        }

        @keyframes checkoutProgress {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </>
  );
}

function MobileRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        paddingTop: "12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#8f8f8f",
          textTransform: "uppercase",
          letterSpacing: "0.55px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "#f1f1f1",
          lineHeight: "1.65",
          minHeight: "20px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatValue(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function MatchScoreBadge({
  score,
  label,
}: {
  score: number;
  label: string | null;
}) {
  const getStyles = () => {
    if (score >= 80) {
      return {
        background: "#10311c",
        border: "#1d5a34",
        color: "#8ff0b1",
        label: label ?? "STRONG",
      };
    }

    if (score >= 60) {
      return {
        background: "#2e2610",
        border: "#5a4a1d",
        color: "#f2d37d",
        label: label ?? "GOOD",
      };
    }

    return {
      background: "#262626",
      border: "#3a3a3a",
      color: "#d7d7d7",
      label: label ?? "BASIC",
    };
  };

  const styles = getStyles();

  return (
    <div style={{ minWidth: "102px" }}>
      <div
        style={{
          padding: "8px 10px",
          borderRadius: "13px",
          backgroundColor: styles.background,
          border: `1px solid ${styles.border}`,
          color: styles.color,
          fontWeight: 700,
          fontSize: "13px",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        {score}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#9f9f9f",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          fontWeight: 700,
        }}
      >
        {styles.label}
      </div>
    </div>
  );
}

function PriceCell({
  price,
  purchased,
}: {
  price: number;
  purchased: boolean;
}) {
  return (
    <div style={{ minWidth: "120px" }}>
      <div
        style={{
          padding: "8px 10px",
          borderRadius: "13px",
          backgroundColor: purchased ? "#0f2e23" : "#151515",
          border: purchased ? "1px solid #24533f" : "1px solid #2b2b2b",
          color: purchased ? "#9df0c5" : "#f1f1f1",
          fontWeight: 700,
          fontSize: "14px",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        €{price}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#9f9f9f",
          lineHeight: "1.4",
        }}
      >
        {purchased ? "Purchased access" : "Launch price"}
      </div>
    </div>
  );
}

function AccessCell({
  purchased,
  approved,
}: {
  purchased: boolean;
  approved: boolean;
}) {
  if (purchased) {
    return (
      <div style={{ minWidth: "148px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#9df0c5",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "6px",
          }}
        >
          Full access
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#9f9f9f",
            lineHeight: "1.5",
          }}
        >
          Contact and message visible
        </div>
      </div>
    );
  }

  if (!approved) {
    return (
      <div style={{ minWidth: "148px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#d2d2d2",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "6px",
          }}
        >
          Approval required
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#9f9f9f",
            lineHeight: "1.5",
          }}
        >
          Payment disabled
        </div>
      </div>
    );
  }

  return (
    <div style={{ minWidth: "148px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#f2d37d",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          marginBottom: "6px",
        }}
      >
        Locked preview
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#9f9f9f",
          lineHeight: "1.5",
        }}
      >
        Unlock to reveal details
      </div>
    </div>
  );
}

function UnlockedBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 12px",
        borderRadius: "12px",
        border: "1px solid #24533f",
        background: "linear-gradient(180deg, #143325 0%, #10261b 100%)",
        color: "#c8f7da",
        fontSize: "12px",
        fontWeight: 700,
        minWidth: "182px",
      }}
    >
      Lead unlocked
    </div>
  );
}

function FitSummary({
  score,
  reason,
}: {
  score: number;
  reason: string;
}) {
  const items = reason
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div style={{ minWidth: "0", maxWidth: "330px" }}>
      <div
        style={{
          marginBottom: "8px",
          fontSize: "12px",
          color: score >= 80 ? "#8ff0b1" : score >= 60 ? "#f2d37d" : "#b3b3b3",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
        }}
      >
        {score >= 80 ? "High fit" : score >= 60 ? "Good fit" : "Basic fit"}
      </div>

      <div style={{ color: "#d8d8d8", lineHeight: "1.68", fontSize: "14px" }}>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} style={{ marginBottom: "5px" }}>
              <span style={{ color: "#858585" }}>• </span>
              {capitalizeWords(item)}
            </div>
          ))
        ) : (
          "-"
        )}
      </div>
    </div>
  );
}

function capitalizeWords(value: string) {
  return value
    .split(" ")
    .map((part) =>
      part.length ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join(" ");
}

function LockedCell({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "22px",
      }}
    >
      <div
        style={{
          filter: locked ? "blur(4px)" : "none",
          userSelect: locked ? "none" : "text",
          pointerEvents: locked ? "none" : "auto",
          opacity: locked ? 0.82 : 1,
          wordBreak: "break-word",
        }}
      >
        {children}
      </div>

      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            color: "#f1f1f1",
            pointerEvents: "none",
          }}
        >
          Locked
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "16px 18px",
  textAlign: "left" as const,
  fontSize: "11px",
  whiteSpace: "nowrap" as const,
  color: "#bfbfbf",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.65px",
};

const tdStyle = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  color: "#f1f1f1",
};

const tdStyleScore = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "118px",
  color: "#f1f1f1",
};

const tdStylePrice = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "122px",
  color: "#f1f1f1",
};

const tdStyleAction = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "194px",
  color: "#f1f1f1",
};

const tdStyleAccess = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "156px",
  color: "#f1f1f1",
};

const tdStyleReason = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  minWidth: "260px",
  maxWidth: "340px",
  color: "#f1f1f1",
};

const tdStyleMessage = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "320px",
  maxWidth: "420px",
  lineHeight: "1.7",
  color: "#f1f1f1",
};

const tdStyleBudget = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "130px",
  lineHeight: "1.6",
  color: "#f1f1f1",
};

const tdStyleDate = {
  padding: "18px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  fontSize: "14px",
  minWidth: "175px",
  lineHeight: "1.6",
  color: "#f1f1f1",
};