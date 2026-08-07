import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMpPreference } from "@/lib/mercadopago";
import { CartItem } from "@/types/database";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión para pagar." }, { status: 401 });
  }

  const { items }: { items: CartItem[] } = await request.json();
  if (!items?.length) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  // Revalida precios y stock reales contra la base de datos (nunca confiar en el cliente)
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price_cents, stock, currency")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json({ error: "No se pudieron validar los productos." }, { status: 500 });
  }

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) throw new Error(`Producto ${item.product_id} no existe`);
    if (product.stock < item.quantity) {
      throw new Error(`Sin stock suficiente de "${product.name}"`);
    }
    return {
      product_id: product.id,
      product_name: product.name,
      unit_price_cents: product.price_cents,
      quantity: item.quantity,
    };
  });

  const totalCents = orderItems.reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0);

  // 1. Crear el pedido en estado "pendiente_pago"
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total_cents: totalCents, status: "pendiente_pago" })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  await supabase.from("order_items").insert(
    orderItems.map((i) => ({ ...i, order_id: order.id }))
  );

  // 2. Crear la preferencia de pago en Mercado Pago
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const preference = await getMpPreference().create({
      body: {
        items: orderItems.map((i) => ({
          id: i.product_id,
          title: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price_cents / 100,
          currency_id: "PEN",
        })),
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/checkout/success?order=${order.id}`,
          failure: `${siteUrl}/checkout/failure?order=${order.id}`,
          pending: `${siteUrl}/checkout/success?order=${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
      },
    });

    await supabase.from("orders").update({ mp_preference_id: preference.id }).eq("id", order.id);

    return NextResponse.json({ init_point: preference.init_point, order_id: order.id });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 500 }
    );
  }
}
