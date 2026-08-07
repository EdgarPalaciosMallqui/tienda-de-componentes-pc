"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correo o contraseña incorrectos.");
      else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setNotice("Revisa tu correo para confirmar la cuenta.");
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-paper">
        {mode === "login" ? "Ingresar" : "Crear cuenta"}
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {mode === "login" ? "Accede para ver tus pedidos." : "Regístrate para comprar y rastrear pedidos."}
      </p>

      <button
        onClick={handleGoogleLogin}
        className="mt-6 flex items-center justify-center gap-2 rounded border border-graphite-border bg-graphite-surface py-2.5 text-sm text-paper transition-colors hover:border-paper/40"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.4-6.4C35.6 2.9 30.2 1 24 1 14.8 1 6.9 6.2 3.1 13.7l7.4 5.7C12.4 13.8 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.7-.4-4H24v8.1h12.9c-.3 2.1-1.7 5.3-4.9 7.4l7.5 5.8c4.5-4.2 7-10.3 7-17.3z"/>
          <path fill="#FBBC05" d="M10.5 19.4a14.4 14.4 0 0 0 0 9.2l-7.4 5.7a24 24 0 0 1 0-20.6z"/>
          <path fill="#34A853" d="M24 47c6.2 0 11.5-2 15.3-5.6l-7.5-5.8c-2 1.4-4.7 2.4-7.8 2.4-6.3 0-11.6-4.3-13.5-10l-7.4 5.7C6.9 41.8 14.8 47 24 47z"/>
        </svg>
        Continuar con Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-graphite-border" />
        <span className="font-mono text-[10px] uppercase text-neutral-500">o con correo</span>
        <div className="h-px flex-1 bg-graphite-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-graphite-border bg-graphite-surface px-3 py-2.5 text-sm text-paper placeholder:text-neutral-500 focus:border-cyan focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-graphite-border bg-graphite-surface px-3 py-2.5 text-sm text-paper placeholder:text-neutral-500 focus:border-cyan focus:outline-none"
        />

        {error && <p className="font-mono text-xs text-danger">{error}</p>}
        {notice && <p className="font-mono text-xs text-cyan">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded bg-copper py-2.5 font-mono text-sm uppercase tracking-wide text-graphite transition-colors hover:bg-copper-dim disabled:opacity-60"
        >
          {loading ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 text-center font-mono text-xs text-neutral-400 hover:text-cyan"
      >
        {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
      </button>
    </div>
  );
}
