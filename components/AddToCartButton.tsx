"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/types/database";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem({
      product_id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      image_path: product.image_path,
      quantity: qty,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (outOfStock) {
    return (
      <button disabled className="w-full cursor-not-allowed rounded border border-graphite-border py-3 font-mono text-sm uppercase text-neutral-500">
        Agotado
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded border border-graphite-border">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-paper/70 hover:text-copper"
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-sm text-paper">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="px-3 py-2 text-paper/70 hover:text-copper"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="flex-1 rounded bg-copper py-3 font-mono text-sm uppercase tracking-wide text-graphite transition-colors hover:bg-copper-dim"
      >
        {added ? "Agregado ✓" : "Agregar al carrito"}
      </button>

      <button
        onClick={() => router.push("/cart")}
        className="hidden rounded border border-graphite-border px-4 py-3 font-mono text-xs uppercase text-paper/70 hover:border-cyan hover:text-cyan sm:block"
      >
        Ver carrito
      </button>
    </div>
  );
}
