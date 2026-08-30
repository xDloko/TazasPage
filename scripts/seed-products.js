require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const PRODUCTS = [
  { name: 'Taza Clasica',   slug: 'taza-clasica',   description: 'Taza de ceramica artesanal con acabado mate. Perfecta para el cafe de la manana.', base_price: 8990,  cover_image: null, active: true },
  { name: 'Taza Rustica',   slug: 'taza-rustica',   description: 'Diseno rustico con textura natural. Cada pieza es unica por su acabado organico.',      base_price: 10990, cover_image: null, active: true },
  { name: 'Taza Premium',   slug: 'taza-premium',   description: 'Acabado brillante de alta calidad. La opcion mas elegante para regalar o coleccionar.',  base_price: 14990, cover_image: null, active: true },
  { name: 'Taza Personalizada', slug: 'taza-personalizada', description: 'Disena tu propia taza. Elige color, agrega texto o imagen y crea algo unico.',       base_price: 12990, cover_image: null, active: true },
];

const VARIANTS = {
  'Taza Clasica': [
    { color_hex: '#F5F1EB', name: 'Hueso',      price_adj: 0,    stock: 20 },
    { color_hex: '#3B3B3B', name: 'Negro Mate',  price_adj: 1000, stock: 15 },
    { color_hex: '#D06B4E', name: 'Terracota',   price_adj: 1000, stock: 12 },
  ],
  'Taza Rustica': [
    { color_hex: '#C4A882', name: 'Arena',    price_adj: 0,    stock: 10 },
    { color_hex: '#8B7355', name: 'Cafe',     price_adj: 500,  stock: 8  },
  ],
  'Taza Premium': [
    { color_hex: '#FFFFFF', name: 'Blanco Brillante', price_adj: 0,    stock: 25 },
    { color_hex: '#1a1a2e', name: 'Azul Noche',       price_adj: 2000, stock: 18 },
  ],
  'Taza Personalizada': [
    { color_hex: '#F5F1EB', name: 'Hueso',      price_adj: 0,    stock: 30 },
    { color_hex: '#D06B4E', name: 'Terracota',  price_adj: 0,    stock: 30 },
    { color_hex: '#3B3B3B', name: 'Negro',      price_adj: 0,    stock: 30 },
  ],
};

async function main() {
  for (const p of PRODUCTS) {
    const { data: product, error: pErr } = await supabase
      .from('products').insert(p).select('id').single();

    if (pErr) {
      console.error(`Error insertando ${p.name}:`, pErr.message);
      continue;
    }
    console.log(`Producto creado: ${p.name} (id: ${product.id})`);

    const variants = VARIANTS[p.name];
    if (variants) {
      const rows = variants.map(v => ({ ...v, product_id: product.id, active: true }));
      const { error: vErr } = await supabase.from('product_variants').insert(rows);
      if (vErr) console.error(`  Error variantes:`, vErr.message);
      else console.log(`  + ${rows.length} variantes`);
    }
  }
  console.log('Listo!');
}

main().catch(e => { console.error(e); process.exit(1); });