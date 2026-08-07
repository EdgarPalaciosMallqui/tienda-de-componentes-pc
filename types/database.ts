export type OrderStatus =
  | "pendiente_pago"
  | "pagado"
  | "preparando"
  | "enviado"
  | "entregado"
  | "cancelado";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  sku: string;
  name: string;
  brand: string | null;
  description: string | null;
  specs: Record<string, string>;
  price_cents: number;
  currency: string;
  stock: number;
  image_path: string | null;
  is_active: boolean;
  categories?: Category | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  shipping_address: string | null;
  tracking_code: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface CartItem {
  product_id: string;
  name: string;
  price_cents: number;
  image_path: string | null;
  quantity: number;
  stock: number;
}
