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

    const {
      name,
      email,
      phone,
      city,
      budget,
      user_type,
      message,
      turnstileToken,
    } = body ?? {};

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !budget?.trim() ||
      !user_type?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!turnstileToken?.trim()) {
      return NextResponse.json(
        { error: "Missing security verification." },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    formData.append("response", turnstileToken);

    if (ip && ip !== "unknown") {
      formData.append("remoteip", ip);
    }

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
        { error: "Security verification failed." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.from("leads").insert([
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        city: city.trim(),
        budget: budget.trim(),
        user_type: user_type.trim(),
        message: message.trim(),
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}