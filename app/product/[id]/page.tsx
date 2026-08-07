import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/AddToCartButton";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(cents / 100);
}

function imageUrl(path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const img = imageUrl(product.image_path);
  const specs = Object.entries(product.specs || {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square rounded border border-graphite-border bg-graphite-surface">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-contain p-10" />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-neutral-600">
              SIN IMAGEN
            </div>
          )}
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-neutral-500">
            {product.categories?.name} · SKU {product.sku}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-paper">{product.name}</h1>
          {product.brand && <p className="mt-1 text-sm text-neutral-400">{product.brand}</p>}

          <p className="mt-4 font-mono text-3xl font-medium text-cyan">
            {formatPrice(product.price_cents, product.currency)}
          </p>

          <p className={`mt-2 font-mono text-xs uppercase ${product.stock > 0 ? "text-cyan" : "text-danger"}`}>
            {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-paper/80">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {specs.length > 0 && (
            <div className="mt-8 rounded border border-graphite-border bg-graphite-surface p-4">
              <p className="mb-2 font-display text-xs font-medium uppercase tracking-wide text-neutral-400">
                Ficha técnica
              </p>
              {specs.map(([key, value]) => (
                <div key={key} className="spec-pin">
                  <span className="uppercase">{key}</span>
                  <span className="text-paper/80">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
