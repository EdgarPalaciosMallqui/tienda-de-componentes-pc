import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Product, Category } from "@/types/database";

interface PageProps {
  searchParams: { q?: string; categoria?: string };
}

async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

async function getProducts(q?: string, categoria?: string): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (categoria) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categoria).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (q) {
    query = query.textSearch("name", q, { type: "websearch", config: "spanish" });
  }

  const { data, error } = await query;
  if (error) {
    // Fallback simple si la búsqueda de texto completo no encuentra coincidencias exactas
    const fallback = await supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("is_active", true)
      .ilike("name", `%${q ?? ""}%`);
    return fallback.data ?? [];
  }
  return data ?? [];
}

export default async function HomePage({ searchParams }: PageProps) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(searchParams.q, searchParams.categoria),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <div className="mb-10 border-b border-graphite-border pb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-copper">Catálogo NODO</p>
        <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.1] text-paper">
          Componentes para tu <span className="text-copper">próximo build</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-neutral-400">
          {searchParams.q ? `Resultados para "${searchParams.q}"` : "Piezas verificadas, stock real, envío rastreado."}
        </p>
      </div>

      <Suspense fallback={null}>
        <CategoryFilter categories={categories} />
      </Suspense>

      {products.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <p className="font-mono text-sm text-neutral-500">NO_RESULTS — no encontramos componentes con ese criterio.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
