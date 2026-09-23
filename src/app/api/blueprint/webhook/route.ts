import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { verifyPaymongoSignature } from "@/lib/paymongo";
import { getUnlockedPdfBuffer } from "@/lib/google-drive";
import { sendUnlockedBlueprintEmail } from "@/lib/email";
import type { BlueprintOrder, PaymongoWebhookEvent } from "@/types/blueprint-types";
import { logInfo, logError } from "@/lib/logger";

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
  const eventId = event.data.id;
  const payment = event.data.attributes.data;

  if (event.data.attributes.type !== "payment.paid" || payment.attributes.status !== "paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const { data: existingEvent } = await supabase
    .from("blueprint_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const orderReference = payment.attributes.metadata?.order_reference;

  if (!orderReference) {
    console.error("PayMongo webhook event missing order_reference metadata:", eventId);
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

  if (payment.attributes.amount !== order.unlock_price_centavos) {
    console.error(
      `PayMongo webhook amount mismatch for order ${orderReference}: expected ${order.unlock_price_centavos}, got ${payment.attributes.amount}`
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (order.status === "pending") {
    await supabase
      .from("blueprint_orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("order_reference", orderReference);
  }

  if (order.delivery_status !== "sent") {
    try {
      const pdfBuffer = await getUnlockedPdfBuffer(order.drive_file_id);
      await sendUnlockedBlueprintEmail({
        to: order.client_email,
        clientName: order.client_name,
        pdfBuffer,
      });

      await supabase
        .from("blueprint_orders")
        .update({ delivery_status: "sent", delivered_at: new Date().toISOString() })
        .eq("order_reference", orderReference);

      logInfo("blueprint_delivered", { orderReference });
    } catch (err) {
      await supabase
        .from("blueprint_orders")
        .update({ delivery_status: "failed" })
        .eq("order_reference", orderReference);

      logError("blueprint_delivery_failed", { orderReference }, err);
    }
  }

  await supabase.from("blueprint_webhook_events").insert({ event_id: eventId });

  return NextResponse.json({ ok: true });
}
