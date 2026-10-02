"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Coffee, Shirt, Package } from "lucide-react";

type ItemWithCategory = import("@/components/providers/cart-provider").CartItem & {
  category?: "mug" | "clothing" | "accessory";
  variant_attributes?: Record<string, string | number>;
};

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  mug: Coffee,
  clothing: Shirt,
  accessory: Package,
};

const CATEGORY_LABEL: Record<string, string> = {
  mug: "Taza",
  clothing: "Prenda",
  accessory: "Accesorio",
};

function renderVariantLabel(item: ItemWithCategory): React.ReactNode {
  if (!item.variant_attributes) return null;
  const attrs = item.variant_attributes as Record<string, string | number>;
  const size = attrs.size as string | undefined;
  const color = attrs.color as string | undefined;
  const colorHex = attrs.color_hex as string | undefined;

  if (item.category === "clothing") {
    const hex = colorHex ? `${colorHex}${colorHex === "#000000" ? "00" : ""}` : undefined;
    const colorLabel = color ?? hex;
    return (
      <>
        {size && <span>Talla {size}</span>}
        {size && colorLabel && <span> • </span>}
        {colorLabel && <span>{colorLabel}</span>}
      </>
    );
  }
  if (colorHex) {
    return (
      <>
        <span
          className="inline-block h-2.5 w-2.5 rounded-full mr-1"
          style={{ backgroundColor: colorHex }}
        />
        <span>{color || "color"}</span>
      </>
    );
  }
  return null;
}

export default function CarritoPage() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bone dark:bg-slate-950">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Tu carrito esta vacio
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Explora nuestra tienda y encuentra el producto perfecto
          </p>
          <Link
            href="/tienda"
            className="inline-flex items-center justify-center rounded-2xl px-5 text-base font-semibold bg-terracotta text-white shadow-sm active:scale-[0.97] mt-6"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Carrito</h1>
          <button onClick={clear} className="text-sm text-slate-400 hover:text-terracotta">
            Vaciar carrito
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => {
              const itemWithCat = item as ItemWithCategory;
              const Icon = CATEGORY_ICON[item.category || "mug"]!;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-800"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 relative">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Icon className="h-8 w-8 text-terracotta" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </h3>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        <span>{CATEGORY_LABEL[item.category || "mug"]}</span>
                        {renderVariantLabel(itemWithCat)}
                      </div>
                      <p className="text-sm text-slate-500">
                        Precio unitario: ${item.unit_price.toLocaleString("es-CL")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold text-terracotta">
                        ${(item.unit_price * item.qty).toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 self-start text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resumen</h2>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span>${total.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Envío a todo Colombia</span>
                  <span className="text-green-600">Sujeto a la dirección de entrega</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
                  <span>Total</span>
                  <span className="text-terracotta">${total.toLocaleString("es-CL")}</span>
                </div>
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/checkout")}>
                Ir a checkout
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="mt-2 w-full"
                onClick={() => router.push("/tienda")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Seguir comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
