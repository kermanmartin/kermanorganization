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
    const body = await req.json();

    const {
      agency_name,
      city,
      website,
      contact_name,
      business_phone,
      email,
      password,
      message,
    } = body ?? {};

    if (
      !agency_name?.trim() ||
      !city?.trim() ||
      !website?.trim() ||
      !contact_name?.trim() ||
      !business_phone?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingApplication, error: existingError } = await supabase
      .from("agency_applications")
      .select("id, status")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Could not check existing application. Please try again." },
        { status: 500 }
      );
    }

    if (existingApplication?.status === "pending") {
      return NextResponse.json(
        {
          error:
            "You already have a pending agency application. Please go to Agency Access to log in if your account is already created.",
        },
        { status: 400 }
      );
    }

    if (existingApplication?.status === "approved") {
      return NextResponse.json(
        {
          error:
            "This email is already approved. Please go to Agency Access to log in.",
        },
        { status: 400 }
      );
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password.trim(),
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("agency_applications")
      .insert([
        {
          agency_name: agency_name.trim(),
          city: city.trim(),
          website: website.trim(),
          contact_name: contact_name.trim(),
          business_phone: business_phone.trim(),
          email: normalizedEmail,
          message: message.trim(),
          status: "pending",
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        {
          error:
            "Your account was created, but we could not save the agency application. Please contact support or try again.",
        },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    try {
      await resend.emails.send({
        from: "The Kerman Organization <contact@kermanorganization.com>",
        to: "thekermanorganization@gmail.com",
        subject: "New agency application submitted",
        html: `
          <h2>New agency application submitted</h2>

          <p><strong>Agency name:</strong> ${agency_name.trim()}</p>
          <p><strong>City:</strong> ${city.trim()}</p>
          <p><strong>Website:</strong> ${website.trim()}</p>
          <p><strong>Contact name:</strong> ${contact_name.trim()}</p>
          <p><strong>Business phone:</strong> ${business_phone.trim()}</p>
          <p><strong>Email:</strong> ${normalizedEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${message.trim()}</p>

          <p>Review here:</p>
          <p>https://kermanorganization.com/admin/agencies</p>
        `,
      });
    } catch (emailError) {
      console.error("Admin notification email error:", emailError);
    }

    try {
      await resend.emails.send({
        from: "The Kerman Organization <contact@kermanorganization.com>",
        to: normalizedEmail,
        subject: "Your agency application is under review",
        html: `
          <h2>Your agency application has been received</h2>

          <p>Hello ${contact_name.trim() || agency_name.trim()},</p>

          <p>
            We have received your agency application for The Kerman Organization.
          </p>

          <p>
            Your account will be reviewed shortly. Once verified, you will be able
            to view the currently locked content inside the dashboard.
          </p>

          <p>
            Access page:
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
      console.error("Agency pending email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}