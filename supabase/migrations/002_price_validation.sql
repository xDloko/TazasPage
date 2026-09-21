-- ============================================================
-- TazasPage - Security Hardening: Price Validation
-- Aplica: funciones RPC para validar precios desde servidor,
-- RLS estricta, trigger anti-modificacion de precios.
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

-- 1. Funcion RPC: get_product_price
CREATE OR REPLACE FUNCTION get_product_price(
  p_product_id UUID,
  p_variant_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result NUMERIC;
BEGIN
  SELECT COALESCE(pv.price_adj, 0)::NUMERIC + p.base_price::NUMERIC
  INTO result
  FROM products p
  JOIN product_variants pv ON pv.product_id = p.id
  WHERE p.id = p_product_id
    AND pv.id = p_variant_id
    AND p.active = true
    AND pv.active = true;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION get_product_price IS 'Retorna el precio unitario real de un producto activo y su variante.';

-- 2. Funcion RPC: validate_cart_prices (batch)
CREATE OR REPLACE FUNCTION validate_cart_prices(
  p_items JSONB
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '[]'::JSONB;
  item JSONB;
  price NUMERIC;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT COALESCE(pv.price_adj, 0)::NUMERIC + p.base_price::NUMERIC
    INTO price
    FROM products p
    JOIN product_variants pv ON pv.product_id = p.id
    WHERE p.id = (item->>'product_id')::UUID
      AND pv.id = (item->>'variant_id')::UUID
      AND p.active = true
      AND pv.active = true;

    result := result || jsonb_build_object(
      'product_id', item->>'product_id',
      'variant_id', item->>'variant_id',
      'qty', (item->>'qty')::INT,
      'unit_price', COALESCE(price, 0),
      'valid', price IS NOT NULL
    );
  END LOOP;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION validate_cart_prices IS 'Valida precios de un carrito completo en una sola llamada.';

-- 3. Trigger: impedir modificacion de unit_price en order_items
CREATE OR REPLACE FUNCTION prevent_price_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.unit_price IS DISTINCT FROM NEW.unit_price THEN
    RAISE EXCEPTION 'No se puede modificar el precio unitario de un order_item despues de su creacion';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_order_items_price_change ON order_items;
CREATE TRIGGER trigger_prevent_order_items_price_change
  BEFORE UPDATE OF unit_price ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION prevent_price_modification();

-- 4. RLS: orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_orders_read" ON orders;
CREATE POLICY "users_own_orders_read" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_orders_insert" ON orders;
CREATE POLICY "users_own_orders_insert" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_orders_update" ON orders;
CREATE POLICY "users_own_orders_update" ON orders
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_orders_delete" ON orders;
CREATE POLICY "users_own_orders_delete" ON orders
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 5. RLS: order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_order_items_read" ON order_items;
CREATE POLICY "users_own_order_items_read" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "users_own_order_items_insert" ON order_items;
CREATE POLICY "users_own_order_items_insert" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "users_own_order_items_update" ON order_items;
CREATE POLICY "users_own_order_items_update" ON order_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "users_own_order_items_delete" ON order_items;
CREATE POLICY "users_own_order_items_delete" ON order_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- 6. RLS: designs
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_designs_read" ON designs;
CREATE POLICY "users_own_designs_read" ON designs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_designs_insert" ON designs;
CREATE POLICY "users_own_designs_insert" ON designs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_designs_update" ON designs;
CREATE POLICY "users_own_designs_update" ON designs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_own_designs_delete" ON designs;
CREATE POLICY "users_own_designs_delete" ON designs
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 7. RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_profile_read" ON profiles;
CREATE POLICY "users_own_profile_read" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_own_profile_update" ON profiles;
CREATE POLICY "users_own_profile_update" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_own_profile_insert" ON profiles;
CREATE POLICY "users_own_profile_insert" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());