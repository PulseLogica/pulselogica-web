import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createQrPaymentIntent } from "@/lib/paymongo";
import type { BlueprintOrder } from "@/types/blueprint-types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ order_reference: string }> }
) {
  const { order_reference: orderReference } = await params;
  const supabase = getSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("blueprint_orders")
    .select("*")
    .eq("order_reference", orderReference)
    .single<BlueprintOrder>();

  if (error || !order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ error: "order already paid" }, { status: 400 });
  }

  try {
    const { intentId, qrImageUrl, expiresAt } = await createQrPaymentIntent(
      orderReference,
      order.unlock_price_centavos
    );

    await supabase
      .from("blueprint_orders")
      .update({ paymongo_payment_intent_id: intentId })
      .eq("order_reference", orderReference);

    return NextResponse.json({ qrImageUrl, expiresAt });
  } catch (err) {
    console.error("Failed to create PayMongo payment intent:", err);
    return NextResponse.json({ error: "failed to create payment intent" }, { status: 500 });
  }
}
