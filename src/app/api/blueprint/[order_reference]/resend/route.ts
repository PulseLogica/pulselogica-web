import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getUnlockedPdfBuffer } from "@/lib/google-drive";
import { sendUnlockedBlueprintEmail } from "@/lib/email";
import { logInfo, logError } from "@/lib/logger";
import type { BlueprintOrder } from "@/types/blueprint-types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ order_reference: string }> }
) {
  const adminKey = req.headers.get("x-admin-key");

  if (!adminKey || adminKey !== process.env.BLUEPRINT_ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  if (order.status !== "paid") {
    return NextResponse.json({ error: "order is not paid" }, { status: 400 });
  }

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

    logInfo("blueprint_delivered", { orderReference, trigger: "manual_resend" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await supabase
      .from("blueprint_orders")
      .update({ delivery_status: "failed" })
      .eq("order_reference", orderReference);

    logError("blueprint_delivery_failed", { orderReference, trigger: "manual_resend" }, err);

    return NextResponse.json({ error: "failed to resend blueprint" }, { status: 500 });
  }
}
