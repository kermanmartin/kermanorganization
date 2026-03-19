import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:leads",
});

const ALLOWED_USER_TYPES = [
  "buyer",
  "seller",
  "tenant",
  "landlord",
  "investor",
];

const ALLOWED_COUNTRIES = [
  "spain",
  "portugal",
  "france",
  "united_kingdom",
  "united_states",
  "uae",
];

const ALLOWED_CITIES = [
  "madrid",
  "barcelona",
  "valencia",
  "malaga",
  "sevilla",
  "bilbao",
  "alicante",
  "marbella",
  "palma",
  "lisbon",
  "porto",
  "faro",
  "cascais",
  "paris",
  "nice",
  "lyon",
  "marseille",
  "london",
  "manchester",
  "birmingham",
  "new_york",
  "miami",
  "los_angeles",
  "dallas",
  "dubai",
  "abu_dhabi",
];

const ALLOWED_PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "penthouse",
  "studio",
  "office",
  "retail",
  "building",
  "land",
  "other",
];

const ALLOWED_TIMEFRAMES = [
  "asap",
  "within_30_days",
  "1_3_months",
  "3_6_months",
  "6_plus_months",
  "just_exploring",
];

const ALLOWED_FINANCING_STATUSES = [
  "cash_ready",
  "mortgage_preapproved",
  "needs_financing",
  "evaluating_options",
];

const ALLOWED_SELLER_STATUSES = [
  "ready_to_list",
  "comparing_agencies",
  "just_exploring",
  "already_listed",
];

const ALLOWED_LANGUAGES = [
  "english",
  "spanish",
  "french",
  "portuguese",
  "arabic",
];

const ALLOWED_PURPOSES = [
  "primary_residence",
  "second_home",
  "investment",
  "relocation",
  "other",
];

const ALLOWED_URGENCY = [
  "ready_now",
  "actively_searching",
  "evaluating_options",
  "just_exploring",
];

const ALLOWED_WORKING_WITH_AGENCY = ["yes", "no"];

const ALLOWED_FLEXIBILITY = [
  "strict",
  "moderately_flexible",
  "very_flexible",
];

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many submissions from this connection. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    const name = cleanString(body?.name);
    const email = cleanString(body?.email).toLowerCase();
    const phone = cleanString(body?.phone);
    const language = cleanString(body?.language);
    const country = cleanString(body?.country);
    const city = cleanString(body?.city);
    const preferredArea = cleanString(body?.preferred_area);
    const propertyType = cleanString(body?.property_type);
    const timeframe = cleanString(body?.timeframe);
    const financingStatus = cleanString(body?.financing_status);
    const sellerStatus = cleanString(body?.seller_status);
    const budget = cleanString(body?.budget);
    const userType = cleanString(body?.user_type);
    const purpose = cleanString(body?.purpose);
    const urgency = cleanString(body?.urgency);
    const workingWithAgency = cleanString(body?.working_with_agency);
    const flexibility = cleanString(body?.flexibility);
    const message = cleanString(body?.message);
    const turnstileToken = cleanString(body?.turnstileToken);

    if (
      !name ||
      !email ||
      !phone ||
      !language ||
      !country ||
      !city ||
      !preferredArea ||
      !propertyType ||
      !timeframe ||
      !budget ||
      !userType ||
      !message
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Missing security verification." },
        { status: 400 }
      );
    }

    if (!isValidOption(userType, ALLOWED_USER_TYPES)) {
      return NextResponse.json(
        { error: "Invalid user type." },
        { status: 400 }
      );
    }

    if (!isValidOption(language, ALLOWED_LANGUAGES)) {
      return NextResponse.json(
        { error: "Invalid language." },
        { status: 400 }
      );
    }

    if (!isValidOption(country, ALLOWED_COUNTRIES)) {
      return NextResponse.json(
        { error: "Invalid country." },
        { status: 400 }
      );
    }

    if (!isValidOption(city, ALLOWED_CITIES)) {
      return NextResponse.json(
        { error: "Invalid city." },
        { status: 400 }
      );
    }

    if (!isValidOption(propertyType, ALLOWED_PROPERTY_TYPES)) {
      return NextResponse.json(
        { error: "Invalid property type." },
        { status: 400 }
      );
    }

    if (!isValidOption(timeframe, ALLOWED_TIMEFRAMES)) {
      return NextResponse.json(
        { error: "Invalid timeframe." },
        { status: 400 }
      );
    }

    if (
      (userType === "buyer" || userType === "investor") &&
      !isValidOption(financingStatus, ALLOWED_FINANCING_STATUSES)
    ) {
      return NextResponse.json(
        { error: "Invalid financing status." },
        { status: 400 }
      );
    }

    if (
      userType === "seller" &&
      !isValidOption(sellerStatus, ALLOWED_SELLER_STATUSES)
    ) {
      return NextResponse.json(
        { error: "Invalid seller status." },
        { status: 400 }
      );
    }

    if (
      (userType === "buyer" ||
        userType === "investor" ||
        userType === "tenant") &&
      !purpose
    ) {
      return NextResponse.json(
        { error: "Missing purpose." },
        { status: 400 }
      );
    }

    if (purpose && !isValidOption(purpose, ALLOWED_PURPOSES)) {
      return NextResponse.json(
        { error: "Invalid purpose." },
        { status: 400 }
      );
    }

    if (!urgency) {
      return NextResponse.json(
        { error: "Missing urgency." },
        { status: 400 }
      );
    }

    if (!isValidOption(urgency, ALLOWED_URGENCY)) {
      return NextResponse.json(
        { error: "Invalid urgency." },
        { status: 400 }
      );
    }

    if (!workingWithAgency) {
      return NextResponse.json(
        { error: "Missing working_with_agency." },
        { status: 400 }
      );
    }

    if (
      !isValidOption(workingWithAgency, ALLOWED_WORKING_WITH_AGENCY)
    ) {
      return NextResponse.json(
        { error: "Invalid working_with_agency value." },
        { status: 400 }
      );
    }

    if (!flexibility) {
      return NextResponse.json(
        { error: "Missing flexibility." },
        { status: 400 }
      );
    }

    if (!isValidOption(flexibility, ALLOWED_FLEXIBILITY)) {
      return NextResponse.json(
        { error: "Invalid flexibility." },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    formData.append("response", turnstileToken);

    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          error: "Security verification failed.",
          details: turnstileResult["error-codes"] ?? [],
        },
        { status: 400 }
      );
    }

    const insertPayload = {
      name,
      email,
      phone,
      language,
      country,
      city,
      preferred_area: preferredArea,
      property_type: propertyType,
      timeframe,
      financing_status:
        userType === "buyer" || userType === "investor"
          ? financingStatus
          : null,
      seller_status: userType === "seller" ? sellerStatus : null,
      rental_profile: null,
      budget,
      user_type: userType,
      purpose:
        userType === "buyer" ||
        userType === "investor" ||
        userType === "tenant"
          ? purpose
          : null,
      urgency,
      working_with_agency: workingWithAgency,
      flexibility,
      message,
      status: "new",
    };

    const { error } = await supabase.from("leads").insert([insertPayload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await resend.emails.send({
        from: "The Kerman Organization <contact@kermanorganization.com>",
        to: email,
        subject: "Your request is being reviewed",
        html: `
          <h2>Your request has been received</h2>

          <p>Hello ${name},</p>

          <p>
            Thank you for submitting your request to The Kerman Organization.
          </p>

          <p>
            An agency is currently reviewing your case and you will be contacted shortly if your request matches the current profile and territory criteria.
          </p>

          <p>
            Summary of your request:
          </p>

          <p><strong>Profile:</strong> ${formatOption(userType)}</p>
          <p><strong>Language:</strong> ${formatOption(language)}</p>
          <p><strong>Country:</strong> ${formatOption(country)}</p>
          <p><strong>City:</strong> ${formatOption(city)}</p>
          <p><strong>Preferred area:</strong> ${preferredArea}</p>
          <p><strong>Property type:</strong> ${formatOption(propertyType)}</p>
          <p><strong>Timeframe:</strong> ${formatOption(timeframe)}</p>
          <p><strong>Budget:</strong> ${budget}</p>
          ${
            purpose
              ? `<p><strong>Purpose:</strong> ${formatOption(purpose)}</p>`
              : ""
          }
          <p><strong>Urgency:</strong> ${formatOption(urgency)}</p>

          <p>
            The Kerman Organization
          </p>
        `,
      });
    } catch (emailError) {
      console.error("Lead confirmation email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}