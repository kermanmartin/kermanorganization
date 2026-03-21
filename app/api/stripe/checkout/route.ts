import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { leadId, price } = await req.json();

    if (!leadId || !price) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Lead Unlock",
              description: `Lead ID: ${leadId}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/agency-dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/agency-dashboard?canceled=true`,
      metadata: {
        leadId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}