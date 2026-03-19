import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_COUNTRIES = [
  "spain",
  "portugal",
  "france",
  "united_kingdom",
  "united_states",
  "uae",
];

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isNonEmptyArray(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function isValidOption(value: string, allowed: string[]) {
  return allowed.includes(value);
}

function formatOption(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const agency_name = cleanString(body?.agency_name);
    const country = cleanString(body?.country);
    const city = cleanString(body?.city);
    const website = cleanString(body?.website);
    const contact_name = cleanString(body?.contact_name);
    const business_phone = cleanString(body?.business_phone);
    const email = cleanString(body?.email).toLowerCase();
    const password = cleanString(body?.password);

    const preferred_cities = cleanString(body?.preferred_cities);
    const preferred_areas = cleanString(body?.preferred_areas);
    const property_types = body?.property_types;
    const client_types = body?.client_types;
    const min_budget = cleanString(body?.min_budget);
    const max_budget = cleanString(body?.max_budget);
    const budget_range = cleanString(body?.budget_range);
    const deals_per_month = cleanString(body?.deals_per_month);
    const coverage_details = cleanString(body?.coverage_details);
    const message = cleanString(body?.message);

    if (
      !agency_name ||
      !country ||
      !city ||
      !website ||
      !contact_name ||
      !business_phone ||
      !email ||
      !password ||
      !preferred_areas ||
      !min_budget ||
      !max_budget ||
      !budget_range ||
      !deals_per_month ||
      !coverage_details ||
      !message
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isValidOption(country, ALLOWED_COUNTRIES)) {
      return NextResponse.json({ error: "Invalid country." }, { status: 400 });
    }

    if (!isNonEmptyArray(property_types)) {
      return NextResponse.json(
        { error: "Please select at least one property type." },
        { status: 400 }
      );
    }

    if (!isNonEmptyArray(client_types)) {
      return NextResponse.json(
        { error: "Please select at least one client type." },
        { status: 400 }
      );
    }

    const { data: existingApplication, error: existingError } = await supabase
      .from("agency_applications")
      .select("id, status")
      .eq("email", email)
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
      email,
      password,
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
          agency_name,
          country,
          city,
          website,
          contact_name,
          business_phone,
          email,
          preferred_cities,
          preferred_areas,
          property_types,
          client_types,
          min_budget,
          max_budget,
          budget_range,
          deals_per_month,
          coverage_details,
          message,
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

          <p><strong>Agency name:</strong> ${agency_name}</p>
          <p><strong>Country:</strong> ${formatOption(country)}</p>
          <p><strong>Main city:</strong> ${formatOption(city)}</p>
          <p><strong>Website:</strong> ${website}</p>
          <p><strong>Contact name:</strong> ${contact_name}</p>
          <p><strong>Business phone:</strong> ${business_phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Additional covered cities:</strong> ${
            preferred_cities || "-"
          }</p>
          <p><strong>Preferred areas:</strong> ${preferred_areas}</p>
          <p><strong>Property types:</strong> ${property_types.join(", ")}</p>
          <p><strong>Client types:</strong> ${client_types.join(", ")}</p>
          <p><strong>Budget range:</strong> ${budget_range}</p>
          <p><strong>Deals per month:</strong> ${deals_per_month}</p>
          <p><strong>Coverage details:</strong> ${coverage_details}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>

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
        to: email,
        subject: "Your agency account has been created and is under review",
        html: `
          <h2>Your agency account has been created</h2>

          <p>Hello ${contact_name || agency_name},</p>

          <p>
            Thank you for submitting your agency application to The Kerman Organization.
          </p>

          <p>
            Your account has been created successfully and you can already log in through the Agency Access page.
          </p>

          <p>
            Please note that contact details inside the dashboard will remain locked until your agency is reviewed and approved.
          </p>

          <p>
            We will review your application shortly and notify you in either case, whether your agency is approved or not approved.
          </p>

          <p>
            Agency Access:
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