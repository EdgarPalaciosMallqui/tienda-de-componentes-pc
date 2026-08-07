import { OrderStatus } from "@/types/database";

const LABELS: Record<OrderStatus, string> = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const COLORS: Record<OrderStatus, string> = {
  pendiente_pago: "border-neutral-500 text-neutral-400",
  pagado: "border-cyan text-cyan",
  preparando: "border-cyan text-cyan",
  enviado: "border-copper text-copper",
  entregado: "border-emerald-500 text-emerald-400",
  cancelado: "border-danger text-danger",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  );
}
