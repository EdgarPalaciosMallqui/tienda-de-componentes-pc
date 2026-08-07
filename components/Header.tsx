"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalItems } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState(searchParams?.get("q") ?? "");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    router.push(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-graphite-border bg-graphite/90 backdrop-blur-md">
      {/* Franja de acento superior, sutil, para dar remate premium */}
      <div className="h-[2px] w-full bg-gradient-to-r from-copper via-copper/20 to-transparent" />

      <div className="flex w-full items-center gap-4 px-5 py-3 lg:gap-8 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-1.5">
          <span className="font-display text-xl font-bold tracking-tight text-paper">
            NODO<span className="text-copper transition-colors group-hover:text-cyan">.</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="min-w-0 flex-1">
          <div className="flex items-center rounded-full border border-graphite-border bg-graphite-surface px-4 transition-colors focus-within:border-cyan/60">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-neutral-500">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar procesador, GPU, RAM…"
              className="w-full bg-transparent px-2.5 py-2 text-sm text-paper placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Acciones — siempre pegadas al extremo derecho */}
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/orders"
                className="hidden rounded-full px-3.5 py-2 font-mono text-xs uppercase tracking-wide text-paper/75 transition-colors hover:text-cyan sm:block"
              >
                Mis pedidos
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden rounded-full border border-graphite-border px-3.5 py-2 font-mono text-xs uppercase tracking-wide text-paper/75 transition-colors hover:border-copper hover:text-copper sm:block"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-graphite-border px-4 py-2 text-sm font-medium text-paper transition-colors hover:border-cyan hover:text-cyan"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Ingresar
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-graphite-border text-paper/85 transition-colors hover:border-copper hover:text-copper"
            aria-label="Ver carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1 font-mono text-[10px] font-medium text-graphite">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
