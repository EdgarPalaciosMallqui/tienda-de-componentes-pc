import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getMpPayment } from "@/lib/mercadopago";

// Mercado Pago llama a esta URL cuando cambia el estado de un pago.
// Usamos el cliente admin (Service Role) porque no hay sesión de usuario en este contexto.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id;
  const type = body?.type;

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  try {
    const payment = await getMpPayment().get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    let status: "pagado" | "cancelado" | "pendiente_pago" = "pendiente_pago";
    if (payment.status === "approved") status = "pagado";
    else if (payment.status === "rejected" || payment.status === "cancelled") status = "cancelado";

    await supabase
      .from("orders")
      .update({ status, mp_payment_id: String(paymentId), updated_at: new Date().toISOString() })
      .eq("id", orderId);

    // Descuenta stock solo cuando el pago se aprueba
    if (status === "pagado") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      for (const item of items ?? []) {
        if (!item.product_id) continue;
        await supabase.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err);
    // Igual respondemos 200 para que MP no reintente indefinidamente un error nuestro
    return NextResponse.json({ received: true });
  }
}
