import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderStatusBadge from "@/components/OrderStatusBadge";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(cents / 100);
}

export default async function OrdersPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-paper">Mis pedidos</h1>

      {!orders || orders.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-neutral-500">
          NO_ORDERS — todavía no has hecho ningún pedido.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded border border-graphite-border bg-graphite-surface p-4 transition-colors hover:border-copper"
            >
              <div>
                <p className="font-mono text-xs text-neutral-500">
                  Pedido #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("es-PE")}
                </p>
                <p className="mt-1 font-mono text-sm text-cyan">
                  {formatPrice(order.total_cents, order.currency)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
