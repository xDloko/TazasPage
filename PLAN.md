# Plan de Resolución — TazasPage

Estado: 2026-09-23 · Prioridad: alta y media

## Decisiones confirmadas por Santiago

- Solo se conserva la **nota de personalización** como método de personalización.
- Se eliminan: subida de imagen, preview de diseño, capas (`layers`) y columna `preview_image` de `designs`.
- Se confirma borrar `preview_image` de Supabase (con verificación de integridad).
- Se elimina `layers` de la lógica del producto (no se toca como dato residual hasta verificación).
- Pago: preferencia PSE + Nequi; se investigará Stripe para comparar.
- Alcance admin: órdenes, usuarios y futuros banners/promociones de inicio.

## Checklist de avance

> Marca con `[x]` lo hecho y `[ ]` lo pendiente al avanzar.

### 🔴 Alta prioridad

- [ ] **P1 — Pasarela de pago**
  - [ ] P1.1 — Investigar Stripe vs PSE vs Nequi y decidir proveedor.
  - [ ] P1.2 — Implementar Edge Function `/functions/v1/process-payment`.
  - [ ] P1.3 — Integrar flujo en `app/checkout/page.tsx` antes de `create-order`.
  - [ ] P1.4 — Actualizar UI de checkout: estado de pago, éxito/fallo.
  - [ ] P1.5 — Probar flujo completo con webhook de confirmación.

- [ ] **P2 — Eliminar personalización por imágenes y capas**
- [x] P2.1 — Revisar `PersonalizarModal.tsx` y `app/productos/[slug]/page.tsx` para eliminar carga de imagen/previsualización. **Hecho** — `PersonalizarModal` ya solo usa `note` (no había carga de imagen).
  - [x] P2.2 — Verificar que no existan referencias a `layers` o `preview_image` en UI. **Hecho** — solo `lib/types.ts` (tipos) y archivos de graphify/logs.
  - [x] P2.3 — Borrar columna `preview_image` en Supabase. **Hecho** — migración `005_remove_design_image_fields`.
  - [x] P2.4 — Borrar columna `layers` en Supabase. **Hecho** — misma migración.
  - [x] P2.5 — Limpiar `lib/types.ts`: quitar campos `layers` y `preview_image`. **Hecho**.
  - [x] P2.6 — Eliminar Edge Function `upload-design-image` (código muerto). **Hecho** (borrado del directorio).
  - [ ] P2.7 — Probar flujo de compra solo con nota de personalización.

- [x] **P3 — Admin/CRUD básico** ✅ Completado 2026-09-25
  - [x] P3.1 — Crear rutas `/admin` protegidas con middleware. **Hecho** — `proxy.ts` middleware con verificación de rol admin; `app/admin/layout.tsx` con `AdminNav` de cliente (usePathname para tabs activos).
  - [x] P3.2 — CRUD de productos y variantes. **Hecho** — `app/admin/products/page.tsx` con create/edit/delete de productos y variantes (insert/update/delete). Verificado con pruebas E2E Playwright: crear, leer (6 productos), editar, eliminar (persistencia tras recarga), variantes CRUD.
  - [x] P3.3 — Gestión de órdenes (estado, detalle). **Hecho** — `app/admin/orders/page.tsx` muestra todos los pedidos con estado; 0 pedidos registrados al momento de la prueba.
  - [x] P3.4 — Gestión de usuarios (rol, estado). **Hecho** — `app/admin/users/page.tsx` muestra usuarios registrados con selector de rol (Cliente/Administrador). 1 usuario admin verificado.
  - [ ] P3.5 — Banner/promociones del homepage (fase futura, dejar tarea preparada).

### 🟠 Media prioridad

- [x] **P4 — Race condition en login**
  - [x] P4.1 — Confirmar `await signIn(...)` en `app/auth/signin/page.tsx` (ya tiene await, verificar que no haya regresión).
  - [x] P4.2 — Repetir verificación en `signup/page.tsx`.

- [x] **P5 — Rendimiento en tienda**
  - [x] P5.1 — Memoizar `allColors` en `app/tienda/page.tsx` con `useMemo`.
  - [x] P5.2 — Revisar `CartProvider` para refactor si es necesario.

- [x] **P6 — Manejo de errores** ✅ Completado 2026-10-01
  - [x] P6.1 — Añadir try/catch explícito en `app/productos/[slug]/page.tsx`. **Hecho** — try/catch en `fetch()` (líneas 27-54) y en `handleAdd()` (líneas 83-106).
  - [x] P6.2 — Notificar al usuario errores de sincronización de carrito (no solo `console.error`). **Hecho** — `syncError` se gestiona en `CartProvider` y se notifica vía toast en `site-header.tsx`.

- [x] **P7 — Tipos y consistencia** ✅ Completado 2026-10-01
  - [x] P7.1 — Alinear `CartItem` local con schema de `order_items` (`design_id`). **Hecho** — Agregado `design_id?: string | null` al interface `CartItem` en `components/providers/cart-provider.tsx`, `supabase/functions/sync-cart/index.ts` y `supabase/functions/get-cart/index.ts`. Verificado con `npx tsc --noEmit` (0 errores) y `npm run build` (Compiled successfully).
  - [x] P7.2 — Asegurar que `note` fluya hasta `order_items` vía Edge Function. **Hecho** — `create-order` Edge Function ya acepta y pasa `note` a `order_items` (línea 133); `CartItem` ya tiene campo `note`.

- [x] **P8 — Validación de inputs** ✅ Completado 2026-10-01
  - [x] P8.1 — Sanitizar dirección de envío en checkout. **Hecho** — `sanitizeAddress()` en `app/checkout/page.tsx` elimina HTML, caracteres de control, colapsa espacios, trunca a 500 chars. Aplicado antes de enviar a `create-order`.
  - [x] P8.2 — Limitar longitud de nota de personalización. **Hecho** — `MAX_NOTE_LENGTH = 500` en `components/productos/PersonalizarModal.tsx`; contador de caracteres visible; botones deshabilitados si excede límite; toast de error informativo. Verificado con `npx tsc --noEmit` (0 errores) y `npm run build` (13 routes compiled successfully).

## Notas técnicas importantes

- `PersonalizarModal.tsx` ya solo usa `note` — la UI de imagen ya no está presente. La eliminación es principalmente de esquemas y funciones huérfanas.
- `create-order` ya acepta `note` → no requiere cambio mayor, solo asegurar que el pago se ejecute antes.
- `CartProvider` es monolítico (+400 líneas) → refactor diferido a media prioridad si el tiempo lo permite.
- `app/layout.tsx` enlaza a `/personalizar/[slug]` que no existe → corregir o eliminar enlace (depende de si se quiere mantener la nota accesible desde ahí).

## Decisión de pagos — Stripe vs PSE/Nequi (pendiente)

- **Stripe**: documentación clara, SDKs maduros, pero en Colombia requiere cuenta internacional y puede no soportar PSE/Nequi directamente sin Wompi/PayU como intermediario.
- **PSE**: bancos colombianos, transferencia bancaria en tiempo real, requiere integración con pasarela local.
- **Nequi**: billetera digital colombiana, ideal para usuarios locales.
- **Recomendación preliminar**: evaluar Wompi o PayU como wrapper que unifique PSE + Nequi + tarjetas, ya que Stripe puro no cubre bien esos medios en Colombia.

## Fuentes consultadas

- https://cances.co/en/blog/payment-gateways-colombia
- https://doneapi.com/blog/colombia-payment-gateways-developer-guide-wompi-mercadopago-pse/
