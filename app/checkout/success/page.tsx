import Link from "next/link";

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan text-cyan">
        ✓
      </div>
      <h1 className="font-display text-2xl font-bold text-paper">Pago recibido</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Estamos confirmando tu pago con Mercado Pago. Te avisaremos por correo y podrás rastrear el
        envío en "Mis pedidos".
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {searchParams.order && (
          <Link href={`/orders/${searchParams.order}`} className="font-mono text-sm text-cyan hover:underline">
            Ver estado del pedido →
          </Link>
        )}
        <Link href="/" className="font-mono text-sm text-neutral-400 hover:text-copper">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
