import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    const { data: agency, error: fetchError } = await supabase
      .from("agency_applications")
      .select("email, agency_name, contact_name, status")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const previousStatus = agency.status;

    const { error: updateError } = await supabase
      .from("agency_applications")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const shouldSendApprovedEmail =
      status === "approved" && previousStatus !== "approved";

    const shouldSendRejectedEmail =
      status === "rejected" && previousStatus !== "rejected";

    if (shouldSendApprovedEmail) {
      try {
        await resend.emails.send({
          from: "The Kerman Organization <contact@kermanorganization.com>",
          to: agency.email,
          subject: "Your agency has been approved",
          html: `
            <h2>Your agency has been approved</h2>

            <p>Hello ${agency.contact_name || agency.agency_name || ""},</p>

            <p>Your agency has successfully passed verification.</p>

            <p>
              You can now access the full information inside the dashboard,
              including the content that was previously locked.
            </p>

            <p>
              Access here:
            </p>

            <p>
              https://kermanorganization.com/agency-access
            </p>

            <p>
              The Kerman Organization
            </p>
          `,
        });
      } catch (emailError) {
        console.error("Approved email error:", emailError);
      }
    }

    if (shouldSendRejectedEmail) {
      try {
        await resend.emails.send({
          from: "The Kerman Organization <contact@kermanorganization.com>",
          to: agency.email,
          subject: "Your agency application was not approved",
          html: `
            <h2>Your agency application was not approved</h2>

            <p>Hello ${agency.contact_name || agency.agency_name || ""},</p>

            <p>
              At this time, your agency application has been marked as rejected.
            </p>

            <p>
              If you believe this was a mistake, please contact us at:
            </p>

            <p>
              thekermanorganization@gmail.com
            </p>

            <p>
              The Kerman Organization
            </p>
          `,
        });
      } catch (emailError) {
        console.error("Rejected email error:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}