import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { OrderStatus, OrderItem } from "@/types/database";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(cents / 100);
}

const STEPS: OrderStatus[] = ["pagado", "preparando", "enviado", "entregado"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  const isCancelled = order.status === "cancelado";
  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-paper">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 font-mono text-xs text-neutral-500">
        {new Date(order.created_at).toLocaleString("es-PE")}
      </p>

      {/* Línea de tiempo de tracking */}
      {!isCancelled && (
        <div className="mt-8 flex items-center">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                  i <= currentStepIndex ? "border-cyan bg-cyan/10 text-cyan" : "border-graphite-border text-neutral-500"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${i < currentStepIndex ? "bg-cyan" : "bg-graphite-border"}`} />
              )}
            </div>
          ))}
        </div>
      )}
      {!isCancelled && (
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase text-neutral-500">
          <span>Pagado</span>
          <span>Preparando</span>
          <span>Enviado</span>
          <span>Entregado</span>
        </div>
      )}

      {order.tracking_code && (
        <div className="mt-6 rounded border border-graphite-border bg-graphite-surface p-4">
          <p className="font-mono text-[10px] uppercase text-neutral-500">Código de rastreo</p>
          <p className="mt-1 font-mono text-lg text-copper">{order.tracking_code}</p>
        </div>
      )}

      <div className="mt-8">
        <p className="mb-2 font-display text-sm font-medium text-paper">Productos</p>
        <div className="flex flex-col gap-2">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex justify-between rounded border border-graphite-border bg-graphite-surface p-3">
              <span className="text-sm text-paper/90">
                {item.quantity}× {item.product_name}
              </span>
              <span className="font-mono text-sm text-cyan">
                {formatPrice(item.unit_price_cents * item.quantity, order.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-graphite-border pt-4">
        <span className="font-mono text-sm uppercase text-neutral-400">Total</span>
        <span className="font-mono text-xl text-cyan">{formatPrice(order.total_cents, order.currency)}</span>
      </div>
    </div>
  );
}
