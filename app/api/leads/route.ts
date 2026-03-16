import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
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

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";

    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    formData.append("response", turnstileToken);

    if (ip) {
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