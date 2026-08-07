"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(cents / 100);
}

function imageUrl(path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

export default function CartPage() {
  const { items, removeItem, setQuantity, totalCents } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago");
      window.location.href = data.init_point;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="font-mono text-sm text-neutral-500">CART_EMPTY — tu carrito no tiene componentes.</p>
        <Link href="/" className="mt-4 inline-block font-mono text-sm text-cyan hover:underline">
          Ver catálogo →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-paper">Tu carrito</h1>

      <div className="mt-6 flex flex-col gap-3">
        {items.map((item) => {
          const img = imageUrl(item.image_path);
          return (
            <div key={item.product_id} className="flex items-center gap-4 rounded border border-graphite-border bg-graphite-surface p-3">
              <div className="relative h-16 w-16 flex-shrink-0 rounded bg-graphite">
                {img && <Image src={img} alt={item.name} fill className="object-contain p-2" />}
              </div>

              <div className="flex-1">
                <p className="text-sm text-paper">{item.name}</p>
                <p className="font-mono text-xs text-cyan">{formatPrice(item.price_cents)}</p>
              </div>

              <div className="flex items-center rounded border border-graphite-border">
                <button
                  onClick={() => setQuantity(item.product_id, item.quantity - 1)}
                  className="px-2.5 py-1 text-paper/70 hover:text-copper"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.product_id, item.quantity + 1)}
                  className="px-2.5 py-1 text-paper/70 hover:text-copper"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.product_id)}
                className="font-mono text-xs text-neutral-500 hover:text-danger"
              >
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-graphite-border pt-4">
        <span className="font-mono text-sm uppercase text-neutral-400">Total</span>
        <span className="font-mono text-2xl text-cyan">{formatPrice(totalCents)}</span>
      </div>

      {error && <p className="mt-3 font-mono text-xs text-danger">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 w-full rounded bg-copper py-3 font-mono text-sm uppercase tracking-wide text-graphite transition-colors hover:bg-copper-dim disabled:opacity-60"
      >
        {loading ? "Redirigiendo a Mercado Pago…" : "Pagar con Mercado Pago"}
      </button>
    </div>
  );
}
