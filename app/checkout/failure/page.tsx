import Link from "next/link";

export default function CheckoutFailurePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-danger text-danger">
        ✕
      </div>
      <h1 className="font-display text-2xl font-bold text-paper">El pago no se completó</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Mercado Pago no pudo procesar el pago. No se hizo ningún cargo. Puedes intentarlo de nuevo.
      </p>
      <Link href="/cart" className="mt-6 inline-block font-mono text-sm text-cyan hover:underline">
        Volver al carrito →
      </Link>
    </div>
  );
}
