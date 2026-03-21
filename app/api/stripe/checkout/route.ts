import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  return new Stripe(secretKey);
}

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const origin = req.headers.get("origin")?.trim();

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  throw new Error("Missing NEXT_PUBLIC_SITE_URL environment variable.");
}

export async function POST(req: Request) {
  try {
    const { leadId, price } = await req.json();

    if (!leadId || !price) {
      return NextResponse.json({ error: "Missing data." }, { status: 400 });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    }

    const stripe = getStripeClient();
    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(numericPrice * 100),
            product_data: {
              name: "Lead Unlock",
              description: `Lead ID: ${leadId}`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/agency-dashboard?success=true`,
      cancel_url: `${baseUrl}/agency-dashboard?canceled=true`,
      metadata: {
        leadId: String(leadId),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout URL was not generated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe checkout failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}