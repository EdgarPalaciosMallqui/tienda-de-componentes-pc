-- Datos de ejemplo (opcional) para probar el catálogo sin imágenes reales.
-- Ejecuta esto DESPUÉS de schema.sql si quieres ver productos de inmediato.

insert into public.products (category_id, sku, name, brand, description, specs, price_cents, stock)
select
  c.id,
  'CPU-7700X',
  'AMD Ryzen 7 7700X',
  'AMD',
  'Procesador de 8 núcleos y 16 hilos, ideal para gaming y multitarea.',
  '{"nucleos": "8", "hilos": "16", "socket": "AM5", "tdp": "105W"}'::jsonb,
  129900,
  15
from public.categories c where c.slug = 'procesadores';

insert into public.products (category_id, sku, name, brand, description, specs, price_cents, stock)
select
  c.id,
  'GPU-4070S',
  'NVIDIA GeForce RTX 4070 Super',
  'NVIDIA',
  'Tarjeta gráfica de gama alta con soporte ray tracing y DLSS 3.',
  '{"vram": "12GB GDDR6X", "bus": "PCIe 4.0", "consumo": "220W"}'::jsonb,
  349900,
  8
from public.categories c where c.slug = 'tarjetas-graficas';

insert into public.products (category_id, sku, name, brand, description, specs, price_cents, stock)
select
  c.id,
  'RAM-32-6000',
  'Kit RAM 32GB (2x16GB) DDR5 6000MHz',
  'Corsair',
  'Memoria de alto rendimiento para plataformas AM5 e Intel de 12ª gen en adelante.',
  '{"capacidad": "32GB", "velocidad": "6000MHz", "latencia": "CL30"}'::jsonb,
  59900,
  20
from public.categories c where c.slug = 'memoria-ram';

insert into public.products (category_id, sku, name, brand, description, specs, price_cents, stock)
select
  c.id,
  'SSD-2TB-NVME',
  'SSD NVMe 2TB Gen4',
  'Western Digital',
  'Almacenamiento ultrarrápido para juegos y edición de video.',
  '{"capacidad": "2TB", "interfaz": "PCIe Gen4", "lectura": "7000MB/s"}'::jsonb,
  44900,
  25
from public.categories c where c.slug = 'almacenamiento';
