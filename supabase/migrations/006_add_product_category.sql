-- ============================================================
-- Add product category and flexible variant attributes
-- Supports multiple product types (mugs, clothing, accessories)
-- ============================================================

-- 1. Add category column to products table
ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'mug'
CHECK (category IN ('mug', 'clothing', 'accessory'));

-- Create index for efficient category-based queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 2. Add attributes JSONB column to product_variants for flexible variant data
ALTER TABLE product_variants ADD COLUMN attributes JSONB;

-- Example usage for clothing variants:
-- {"size": "M", "color": "black", "color_hex": "#000000"}
-- Example usage for mug variants (backward compatible):
-- {"color": "white", "color_hex": "#FFFFFF"}

-- 3. Update existing products to have explicit category (backward compatibility)
UPDATE products SET category = 'mug' WHERE category IS NULL;

-- 4. Update existing variants to populate attributes from existing fields (backward compatibility)
-- For mugs: migrate color_hex to attributes
UPDATE product_variants
SET attributes = jsonb_build_object(
    'color_hex', color_hex,
    'color', name
)
WHERE attributes IS NULL;

-- 5. Add helpful comments
COMMENT ON COLUMN products.category IS 'Product category: mug, clothing, or accessory';
COMMENT ON COLUMN product_variants.attributes IS 'Flexible JSONB field for variant attributes (size, color, material, etc.)';