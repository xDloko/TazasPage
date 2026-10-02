"use client";
import { ProductCategory } from "@/lib/types";
import { CustomizeMug } from "./CustomizeMug";
import { CustomizeClothing } from "./CustomizeClothing";

interface CustomizeModalProps {
  open: boolean;
  onClose: () => void;
  product: { id: string; name: string; base_price: number };
  variant: {
    id: string;
    name: string;
    price_adj: number;
    image_url?: string | null;
    color_hex?: string | null;
    attributes?: Record<string, string | number>;
  } | null;
  category: ProductCategory;
}

/**
 * Category-aware customization wrapper.
 * Dispatches to the appropriate customization component based on product category.
 * Currently supports: mug, clothing. Accessories fall back to the mug (note-based) UI.
 */
export function CustomizeModal({ open, onClose, product, variant, category }: CustomizeModalProps) {
  if (category === "clothing") {
    return <CustomizeClothing open={open} onClose={onClose} product={product} variant={variant} />;
  }
  // mug and accessory both use the note-based personalization flow
  return <CustomizeMug open={open} onClose={onClose} product={product} variant={variant} />;
}
