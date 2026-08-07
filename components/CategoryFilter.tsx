"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types/database";

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams?.get("categoria");

  function selectCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams?.toString());
    if (slug) params.set("categoria", slug);
    else params.delete("categoria");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => selectCategory(null)}
        className={`whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-all ${
          !active
            ? "border-copper bg-copper text-graphite font-medium"
            : "border-graphite-border text-neutral-400 hover:border-paper/30 hover:text-paper"
        }`}
      >
        Todo
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => selectCategory(cat.slug)}
          className={`whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-all ${
            active === cat.slug
              ? "border-copper bg-copper text-graphite font-medium"
              : "border-graphite-border text-neutral-400 hover:border-paper/30 hover:text-paper"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
