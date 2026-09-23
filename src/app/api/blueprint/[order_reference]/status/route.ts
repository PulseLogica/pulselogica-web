import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ order_reference: string }> }
) {
  const { order_reference: orderReference } = await params;
  const supabase = getSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("blueprint_orders")
    .select("status")
    .eq("order_reference", orderReference)
    .single<{ status: "pending" | "paid" }>();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found!" }, { status: 404 });
  }

  return NextResponse.json({ status: order.status });
}
