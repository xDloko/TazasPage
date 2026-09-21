-- ============================================================
-- C-2 Fix: Create Order Transaction Function
-- Creates order + order_items atomically to prevent price manipulation
-- Total and unit_price are stored as INTEGER (cents) in the schema
-- ============================================================

CREATE OR REPLACE FUNCTION create_order_tx(
  p_user_id UUID,
  p_total INTEGER,
  p_shipping_address TEXT,
  p_design_id UUID DEFAULT NULL,
  p_items JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create the order (price is computed server-side from validated items)
  INSERT INTO orders (user_id, total, shipping_address, status, design_id)
  VALUES (p_user_id, p_total, p_shipping_address, 'pending', p_design_id)
  RETURNING id INTO v_order_id;

  -- Insert each order item with validated prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      variant_id,
      qty,
      unit_price,
      design_id
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      NULLIF(v_item->>'variant_id', '')::UUID,
      (v_item->>'qty')::INT,
      (v_item->>'unit_price')::INTEGER,
      NULLIF(v_item->>'design_id', '')::UUID
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

COMMENT ON FUNCTION create_order_tx IS
'Creates an order with its items atomically. Prices must be validated server-side before calling this function.';
