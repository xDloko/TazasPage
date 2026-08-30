import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(url, key);

const PRODUCTS = [
  {
    name: 'Taza Clasica',
    slug: 'taza-clasica',
    description: 'Taza de ceramica artesanal con acabado mate. Perfecta para el cafe de la manana.',
    base_price: 8990,
    cover_image: null,
    active: true,
  },
  {
    name: 'Taza Rustica',
    slug: 'taza-rustica',
    description: 'Diseno rustico con textura natural. Cada pieza es unica por su acabado organico.',
    base_price: 10990,
    cover_image: null,
    active: true,
  },
  {
    name: 'Taza Premium',
    slug: 'taza-premium',
    description: 'Acabado brillante de alta calidad. La opcion mas elegante para regalar o coleccionar.',
    base_price: 14990,
    cover_image: null,
    active: true,
  },
];

const VARIANTS = [
  // Taza Clasica
  { product_name: 'Taza Clasica', variants: [
    { color_hex: '#F5F1EB', name: 'Hueso', price_adj: 0, stock: 20 },
    { color_hex: '#3B3B3B', name: 'Negro Mate', price_adj: 1000, stock: 15 },
    { color_hex: '#D06B4E', name: 'Terracota', price_adj: 1000, stock: 12 },
  ]},
  // Taza Rustica
  { product_name: 'Taza Rustica', variants: [
    { color_hex: '#C4A882', name: 'Arena', price_adj: 0, stock: 10 },
    { color_hex: '#8B7355', name: 'Cafe', price_adj: 500, stock: 8 },
  ]},
  // Taza Premium
  { product_name: 'Taza Premium', variants: [
    { color_hex: '#FFFFFF', name: 'Blanco Brillante', price_adj: 0, stock: 25 },
    { color_hex: '#1a1a2e', name: 'Azul Noche', price_adj: 2000, stock: 18 },
  ]},
];

async function main() {
  for (const p of PRODUCTS) {
    const { data: product, error: pErr } = await supabase
      .from('products')
      .insert(p)
      .select('id')
      .single();
    if (pErr) { console.error('Error inserting', p.name, pErr); continue; }
    console.log(`Producto creado: ${p.name} (id: ${product.id})`);

    const vGroup = VARIANTS.find(v => v.product_name === p.name);
    if (vGroup) {
      const rows = vGroup.variants.map(v => ({ ...v, product_id: product.id, active: true }));
      const { error: vErr } = await supabase.from('product_variants').insert(rows);
      if (vErr) console.error('Error inserting variants for', p.name, vErr);
      else console.log(`  + ${rows.length} variantes`);
    }
  }
  console.log('Listo!');
}
main();