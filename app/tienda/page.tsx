"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/ui/use-toast";
import { Product, ProductVariant, ProductCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Coffee, Shirt, Package } from "lucide-react";

// Tipo para el resultado de Supabase con la relación product_variants
type ProductWithVariants = Product & { variants: ProductVariant[] };
type SupabaseProductRow = Product & { product_variants: ProductVariant[] };

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  mug: "Tazas",
  clothing: "Ropa",
  accessory: "Accesorios",
};

const CATEGORY_ICONS: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  mug: Coffee,
  clothing: Shirt,
  accessory: Package,
};

export default function TiendaPage() {
  const sb = useSupabase();
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterColor, setFilterColor] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<ProductCategory | "all">("all");

  useEffect(() => {
    // Initialize category filter from URL query param on first load
    const urlCategory = searchParams.get("category");
    if (urlCategory && ["mug", "clothing", "accessory"].includes(urlCategory as ProductCategory)) {
      setFilterCategory(urlCategory as ProductCategory);
    }

    let cancelled = false;
    async function fetchProducts() {
      const { data } = await sb
        .from("products")
        .select("*, product_variants(*)")
        .eq("active", true)
        .order("name");
      if (cancelled) return;
      const rows = (data as SupabaseProductRow[] | null) ?? [];
      setProducts(rows.map((r) => ({ ...r, variants: r.product_variants })));
      setLoading(false);
    }
    fetchProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const allColors = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((p) => p.variants.map((v) => v.color_hex).filter(Boolean) as string[])
        )
      ),
    [products]
  );

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchLower);
      const matchesColor =
        filterColor === "all" || p.variants.some((v) => v.color_hex === filterColor);
      const matchesCategory = filterCategory === "all" || p.category === filterCategory;
      return matchesSearch && matchesColor && matchesCategory && p.active;
    });
  }, [products, search, filterColor, filterCategory]);

  const handleQuickAdd = async (e: React.MouseEvent, product: ProductWithVariants) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = product.variants.find((v) => v.active) ?? product.variants[0];
    if (firstVariant) {
      try {
        await addItem({
          product_id: product.id,
          variant_id: firstVariant.id,
          qty: 1,
          unit_price: product.base_price + (firstVariant.price_adj ?? 0), // visual, will be overridden
          name: product.name,
          image_url: firstVariant.image_url ?? product.cover_image,
          note: null,
          category: product.category,
          variant_attributes: firstVariant.attributes,
        });
        toast({
          title: "Agregado al carrito",
          description: `${product.name} ahora está en tu carrito.`,
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error al agregar al carrito",
          description: err instanceof Error ? err.message : "No se pudo validar el precio.",
        });
        console.error("[tienda] No se pudo agregar al carrito:", err);
      }
    }
  };

  const renderCategoryTabs = () => (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => setFilterCategory("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
          filterCategory === "all"
            ? "bg-terracotta text-white"
            : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        Todas
      </button>
      {(["mug", "clothing", "accessory"] as ProductCategory[]).map((cat) => {
        const CatIcon = CATEGORY_ICONS[cat];
        return (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filterCategory === cat
                ? "bg-terracotta text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <CatIcon className="h-4 w-4" />
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );

  const renderColorFilters = () => (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => setFilterColor("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
          filterColor === "all"
            ? "bg-terracotta text-white"
            : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        Todos los colores
      </button>
      {allColors.map((color) => (
        <button
          key={color}
          onClick={() => setFilterColor(color)}
          className={`group relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            filterColor === color
              ? "bg-terracotta text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
          }`}
          title={color}
        >
          <span className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600"
              style={{ backgroundColor: color }}
            />
            <span className="hidden group-hover:inline">{color}</span>
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tienda
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Tazas, ropa y accesorios para personalizar
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-2.5 pl-10 pr-4 text-base focus:border-terracotta focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {renderCategoryTabs()}
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filtrar por color
            </label>
            {renderColorFilters()}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-white p-4 dark:bg-slate-800">
                <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <div className="mt-4 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-lg text-slate-500">No se encontraron productos</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const basePrice = product.base_price;
              // Defensive: product.category may be undefined if migration 006 hasn't
              // been applied yet — fall back to the generic Package icon so the store
              // page never crashes on an unknown category value.
              const CategoryIcon = CATEGORY_ICONS[product.category as ProductCategory] ?? Package;
              return (
                <Link
                  key={product.id}
                  href={`/productos/${product.slug}`}
                  className="group rounded-3xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800"
                >
                  <div className="aspect-square min-h-[200px] overflow-hidden rounded-2xl bg-slate-100 relative">
                    {product.cover_image ? (
                      <Image
                        src={product.cover_image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        <CategoryIcon className="h-12 w-12 text-terracotta" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <CategoryIcon className="h-3 w-3" />
                      <span>
                        {CATEGORY_LABELS[product.category as ProductCategory] ?? "Producto"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xl font-bold text-terracotta">
                        Desde ${basePrice.toLocaleString("es-CL")}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleQuickAdd(e, product)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
