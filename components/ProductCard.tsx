import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/database";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(cents / 100);
}

function imageUrl(path: string | null) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/product-images/${path}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const specEntries = Object.entries(product.specs || {}).slice(0, 3);
  const img = imageUrl(product.image_path);
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-graphite-border bg-graphite-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-copper/70 hover:shadow-[0_8px_24px_-8px_rgba(199,123,74,0.25)]"
    >
      <div className="relative aspect-square bg-gradient-to-b from-graphite-surface to-graphite">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.04]" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-neutral-600">
            SIN IMAGEN
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-danger px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-paper">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-neutral-500">{product.sku}</p>
        <h3 className="font-display text-sm font-medium leading-snug text-paper transition-colors group-hover:text-copper">
          {product.name}
        </h3>

        {specEntries.length > 0 && (
          <div className="mt-1">
            {specEntries.map(([key, value]) => (
              <div key={key} className="spec-pin">
                <span className="uppercase">{key}</span>
                <span className="text-paper/80">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-mono text-base font-medium text-cyan">
            {formatPrice(product.price_cents, product.currency)}
          </p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-graphite-border text-paper/60 transition-colors group-hover:border-copper group-hover:text-copper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
