import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(url, key);

const PRODUCTS = [
  {
    name: "Taza Clásica",
    slug: "taza-clasica",
    description:
      "Taza de cerámica artesanal con acabado mate. Ideal para disfrutar el café de cada mañana.",
    base_price: 8990,
    active: true,
  },
  {
    name: "Taza Rústica",
    slug: "taza-rustica",
    description:
      "Acabado rústico con textura natural. Cada pieza tiene detalles que la hacen especial.",
    base_price: 10990,
    active: true,
  },
  {
    name: "Taza Premium",
    slug: "taza-premium",
    description:
      "Acabado brillante de alta calidad. Una opción elegante para regalar o coleccionar.",
    base_price: 14990,
    active: true,
  },
  // Nuevos productos de ropa
  {
    name: "Camiseta Algodón Orgánico",
    slug: "camiseta-algodon",
    description:
      "Camiseta unisex de algodón orgánico de alta calidad. Disponible en varios colores y tallas.",
    base_price: 12990,
    active: true,
  },
  {
    name: "Sudaderas Premium",
    slug: "sudaderas-premium",
    description:
      "Sudadera con capucha de corte relajado. Confeccionada en mezcla de algodón y poliéster para mayor comodidad.",
    base_price: 18990,
    active: true,
  },
  {
    name: "Sudadera con Capucha Clásica",
    slug: "sudaderas-clasicas",
    description:
      "Sudadera con capucha clásica de peso medio. El básico perfecto para el día a día.",
    base_price: 15990,
    active: true,
  },
];

const VARIANTS = [
  // Taza Clásica
  {
    product_name: "Taza Clásica",
    variants: [
      { color_hex: "#F5F1EB", name: "Hueso", price_adj: 0, stock: 20, attributes: {} },
      { color_hex: "#3B3B3B", name: "Negro Mate", price_adj: 1000, stock: 15, attributes: {} },
      { color_hex: "#D06B4E", name: "Terracota", price_adj: 1000, stock: 12, attributes: {} },
    ],
  },
  // Taza Rústica
  {
    product_name: "Taza Rústica",
    variants: [
      { color_hex: "#C4A882", name: "Arena", price_adj: 0, stock: 10, attributes: {} },
      { color_hex: "#8B7355", name: "Cafe", price_adj: 500, stock: 8, attributes: {} },
    ],
  },
  // Taza Premium
  {
    product_name: "Taza Premium",
    variants: [
      { color_hex: "#FFFFFF", name: "Blanco Brillante", price_adj: 0, stock: 25, attributes: {} },
      { color_hex: "#1a1a2e", name: "Azul Noche", price_adj: 2000, stock: 18, attributes: {} },
    ],
  },
  // Camiseta Algodón Orgánico
  {
    product_name: "Camiseta Algodón Orgánico",
    variants: [
      {
        color_hex: "#FFFFFF",
        name: "Blanco",
        price_adj: 0,
        stock: 50,
        attributes: { size: "S", color: "blanco", color_hex: "#FFFFFF" },
      },
      {
        color_hex: "#F5F5F5",
        name: "Blanco Off-White",
        price_adj: 0,
        stock: 50,
        attributes: { size: "M", color: "off-white", color_hex: "#F5F5F5" },
      },
      {
        color_hex: "#E0E0E0",
        name: "Gris Claro",
        price_adj: 0,
        stock: 45,
        attributes: { size: "L", color: "gris claro", color_hex: "#E0E0E0" },
      },
      {
        color_hex: "#A0A0A0",
        name: "Gris Oscuro",
        price_adj: 500,
        stock: 40,
        attributes: { size: "XL", color: "gris oscuro", color_hex: "#A0A0A0", price_adj: 500 },
      },
      {
        color_hex: "#2D3748",
        name: "Negro",
        price_adj: 0,
        stock: 60,
        attributes: { size: "XXL", color: "negro", color_hex: "#2D3748" },
      },
    ],
  },
  // Sudaderas Premium
  {
    product_name: "Sudaderas Premium",
    variants: [
      {
        color_hex: "#2D3748",
        name: "Negro",
        price_adj: 0,
        stock: 30,
        attributes: { size: "M", color: "negro", color_hex: "#2D3748" },
      },
      {
        color_hex: "#FFFFFF",
        name: "Blanco",
        price_adj: 300,
        stock: 25,
        attributes: { size: "L", color: "blanco", color_hex: "#FFFFFF" },
      },
    ],
  },
  // Sudadera con Capucha Clásica
  {
    product_name: "Sudadera con Capucha Clásica",
    variants: [
      {
        color_hex: "#2D3748",
        name: "Negro",
        price_adj: 0,
        stock: 35,
        attributes: { size: "M", color: "negro", color_hex: "#2D3748" },
      },
      {
        color_hex: "#FFFFFF",
        name: "Blanco",
        price_adj: 200,
        stock: 30,
        attributes: { size: "L", color: "blanco", color_hex: "#FFFFFF" },
      },
      {
        color_hex: "#F2A900",
        name: "Terracota",
        price_adj: 300,
        stock: 20,
        attributes: { size: "S", color: "terracota", color_hex: "#F2A900" },
      },
      {
        color_hex: "#8B7355",
        name: "Cafe",
        price_adj: 200,
        stock: 20,
        attributes: { size: "XL", color: "cafe", color_hex: "#8B7355" },
      },
    ],
  },
];

async function main() {
  for (const p of PRODUCTS) {
    const { data: product, error: pErr } = await supabase
      .from("products")
      .insert(p)
      .select("id")
      .single();
    if (pErr) {
      console.error("Error inserting", p.name, pErr);
      continue;
    }
    console.log(`Producto creado: ${p.name} (id: ${product.id})`);

    const vGroup = VARIANTS.find((v) => v.product_name === p.name);
    if (vGroup) {
      const rows = vGroup.variants.map((v) => ({ ...v, product_id: product.id, active: true }));
      const { error: vErr } = await supabase.from("product_variants").insert(rows);
      if (vErr) console.error("Error inserting variants for", p.name, vErr);
      else console.log(`  + ${rows.length} variantes`);
    }
  }
  console.log("Listo!");
}
main();
