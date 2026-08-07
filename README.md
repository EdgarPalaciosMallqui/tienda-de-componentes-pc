# NODO — Tienda de componentes de PC

Next.js 14 + Supabase (DB, Auth, Storage) + Mercado Pago + Google Analytics 4.

## 1. Requisitos
- Node.js 18+
- Cuenta en [supabase.com](https://supabase.com)
- Cuenta en [Mercado Pago Developers](https://www.mercadopago.com/developers)
- Proyecto en [Google Cloud Console](https://console.cloud.google.com) (para login con Google)
- Propiedad en [Google Analytics 4](https://analytics.google.com)

## 2. Instalar dependencias
```bash
npm install
```

## 3. Configurar Supabase
1. Crea un proyecto en supabase.com.
2. Ve a **SQL Editor** y ejecuta todo el contenido de `supabase/schema.sql`.
   Esto crea las tablas (`categories`, `products`, `profiles`, `orders`, `order_items`),
   las políticas de seguridad (RLS) y el bucket `product-images` en Storage.
3. Ve a **Project Settings > API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (¡no la expongas nunca en el frontend!)

### Login con Google
1. En **Authentication > Providers**, activa **Google**.
2. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crea credenciales OAuth 2.0
   (tipo "Aplicación web").
3. Como **URI de redirección autorizado**, agrega la URL que Supabase te muestra en esa misma pantalla
   (algo como `https://TU_PROYECTO.supabase.co/auth/v1/callback`).
4. Copia el **Client ID** y **Client Secret** de Google y pégalos en la configuración de Google dentro de Supabase.

### Subir imágenes de productos
Puedes subir imágenes desde **Storage > product-images** en el panel de Supabase, o insertar
productos directamente en la tabla `products` con el `image_path` correspondiente (ej: `procesadores/ryzen-7-9700x.jpg`).
La URL pública se construye así:
```
https://TU_PROYECTO.supabase.co/storage/v1/object/public/product-images/<image_path>
```

## 4. Configurar Mercado Pago
1. Entra a tus [credenciales](https://www.mercadopago.com/developers/panel/app).
2. Copia el **Access Token** (privado) → `MERCADOPAGO_ACCESS_TOKEN`.
3. Copia la **Public Key** → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`.
4. Usa credenciales de **prueba** mientras desarrollas, y las de **producción** solo cuando publiques.
5. El webhook (`/api/mercadopago/webhook`) necesita una URL pública para que Mercado Pago te avise
   de los pagos. En local puedes usar [ngrok](https://ngrok.com) para probarlo; en producción usa
   tu dominio real.

## 5. Configurar Google Analytics
1. Crea una propiedad GA4 y copia el **ID de medición** (`G-XXXXXXXXXX`) → `NEXT_PUBLIC_GA_ID`.
2. Los eventos de `add_to_cart` y las vistas de página ya están integrados
   (`lib/analytics.ts`, `components/GoogleAnalytics.tsx`).

## 6. Variables de entorno
Copia `.env.example` a `.env.local` y completa todos los valores:
```bash
cp .env.example .env.local
```

## 7. Correr en desarrollo
```bash
npm run dev
```
Abre http://localhost:3000

## 8. Estructura del proyecto
```
app/
  page.tsx                 → Catálogo (búsqueda + filtro por categoría)
  product/[id]/page.tsx    → Detalle de producto
  login/page.tsx           → Login (email + Google)
  cart/page.tsx            → Carrito de compras
  orders/page.tsx          → Lista de pedidos del usuario
  orders/[id]/page.tsx     → Tracking de un pedido
  api/mercadopago/         → Crear preferencia de pago + webhook de confirmación
components/                → UI reutilizable (tarjetas, header, filtros)
lib/                       → Clientes de Supabase, carrito, analítica, Mercado Pago
supabase/schema.sql        → Esquema completo de base de datos
```

## 9. Cómo se actualiza el estado de un pedido
El flujo de estados es: `pendiente_pago → pagado → preparando → enviado → entregado`.
- `pendiente_pago → pagado` lo hace automáticamente el webhook de Mercado Pago.
- `preparando → enviado → entregado` los actualiza tu equipo manualmente desde el
  **Table Editor** de Supabase (tabla `orders`, columnas `status` y `tracking_code`),
  o puedes construir un panel de administración más adelante — puedo ayudarte con eso si lo necesitas.

## 10. Desplegar a producción
Recomendado: [Vercel](https://vercel.com) (tiene integración nativa con Next.js).
1. Sube este proyecto a un repositorio de GitHub.
2. Impórtalo en Vercel.
3. Agrega todas las variables de `.env.example` en **Settings > Environment Variables**.
4. Actualiza `NEXT_PUBLIC_SITE_URL` con tu dominio real, y las URLs de redirección en
   Supabase (Auth) y Mercado Pago (webhook) apuntando a ese dominio.
