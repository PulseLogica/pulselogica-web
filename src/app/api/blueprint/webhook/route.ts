import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { verifyPaymongoSignature } from "@/lib/paymongo";
import { getUnlockedPdfBuffer } from "@/lib/google-drive";
import { sendUnlockedBlueprintEmail } from "@/lib/email";
import type { BlueprintOrder, PaymongoWebhookEvent } from "@/types/blueprint-types";
import { logInfo } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("PAYMONGO_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("paymongo-signature");

  logInfo("paymongo_webhook_received", {
    method: req.method,
    path: req.nextUrl.pathname,
    headers: Object.fromEntries(req.headers.entries()),
    hasSignatureHeader: Boolean(signatureHeader),
    bodyLength: rawBody.length,
    rawBody
  });

  if (!signatureHeader || !verifyPaymongoSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PaymongoWebhookEvent;
  const supabase = getSupabaseServerClient();

  if (event.type !== "payment" || event.attributes.status !== "paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const { data: existingEvent } = await supabase
    .from("blueprint_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const orderReference = event.attributes.metadata?.order_reference;

  if (!orderReference) {
    console.error("PayMongo webhook event missing order_reference metadata:", event.id);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const { data: order } = await supabase
    .from("blueprint_orders")
    .select("*")
    .eq("order_reference", orderReference)
    .single<BlueprintOrder>();

  if (!order) {
    console.error(`PayMongo webhook: no order found for reference ${orderReference}`);
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (event.attributes.amount !== order.unlock_price_centavos) {
    console.error(
      `PayMongo webhook amount mismatch for order ${orderReference}: expected ${order.unlock_price_centavos}, got ${event.attributes.amount}`
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (order.status === "pending") {
    await supabase
      .from("blueprint_orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("order_reference", orderReference);

    try {
      const pdfBuffer = await getUnlockedPdfBuffer(order.drive_file_id);
      await sendUnlockedBlueprintEmail({
        to: order.client_email,
        clientName: order.client_name,
        pdfBuffer,
      });
    } catch (err) {
      console.error(`Failed to deliver unlocked blueprint for order ${orderReference}:`, err);
    }
  }

  await supabase.from("blueprint_webhook_events").insert({ event_id: event.id });

  return NextResponse.json({ ok: true });
}
