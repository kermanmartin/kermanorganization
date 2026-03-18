import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:leads",
});

const ALLOWED_USER_TYPES = ["buyer", "seller", "rental", "investor"];
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
const ALLOWED_RENTAL_PROFILES = [
  "tenant",
  "landlord",
  "short_term",
  "long_term",
];

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidOption(value: string, allowed: string[]) {
  return allowed.includes(value);
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
    const city = cleanString(body?.city);
    const preferredArea = cleanString(body?.preferred_area);
    const propertyType = cleanString(body?.property_type);
    const timeframe = cleanString(body?.timeframe);
    const financingStatus = cleanString(body?.financing_status);
    const sellerStatus = cleanString(body?.seller_status);
    const rentalProfile = cleanString(body?.rental_profile);
    const budget = cleanString(body?.budget);
    const userType = cleanString(body?.user_type);
    const message = cleanString(body?.message);
    const turnstileToken = cleanString(body?.turnstileToken);

    if (
      !name ||
      !email ||
      !phone ||
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
      userType === "rental" &&
      !isValidOption(rentalProfile, ALLOWED_RENTAL_PROFILES)
    ) {
      return NextResponse.json(
        { error: "Invalid rental profile." },
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
      city,
      preferred_area: preferredArea,
      property_type: propertyType,
      timeframe,
      financing_status:
        userType === "buyer" || userType === "investor"
          ? financingStatus
          : null,
      seller_status: userType === "seller" ? sellerStatus : null,
      rental_profile: userType === "rental" ? rentalProfile : null,
      budget,
      user_type: userType,
      message,
      status: "new",
    };

    const { error } = await supabase.from("leads").insert([insertPayload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}