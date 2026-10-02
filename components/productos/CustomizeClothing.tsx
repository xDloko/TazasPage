"use client";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomizeClothingProps {
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
}

const MAX_NOTE_LENGTH = 500;

export function CustomizeClothing({ open, onClose, product, variant }: CustomizeClothingProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open || !variant) return null;

  const price = product.base_price + (variant.price_adj ?? 0);
  const noteLength = note.length;
  const isNoteTooLong = noteLength > MAX_NOTE_LENGTH;
  const isNoteEmpty = !note.trim();

  // Extract variant attributes for display
  const attrs = variant.attributes || {};
  const size = attrs.size;
  const colorName = attrs.color || variant.name;
  // colorHex can be string | number from attributes or string | null from the DB; ensure a valid CSS color string
  const colorHex = (attrs.color_hex ?? variant.color_hex ?? "#000000") as string;

  const handleSave = async (gotoCheckout: boolean) => {
    if (isNoteEmpty) {
      toast({
        variant: "destructive",
        title: "Nota requerida",
        description:
          "Describe brevemente cómo deseas personalizar la prenda para que el fabricante pueda contactarte.",
      });
      return;
    }
    if (isNoteTooLong) {
      toast({
        variant: "destructive",
        title: "Nota demasiado larga",
        description: `La nota no puede exceder los ${MAX_NOTE_LENGTH} caracteres.`,
      });
      return;
    }
    setSaving(true);
    try {
      await addItem({
        product_id: product.id,
        variant_id: variant.id,
        qty: 1,
        unit_price: price,
        name: product.name,
        image_url: variant.image_url ?? null,
        note: note.trim(),
      });
      toast({
        title: "Nota guardada",
        description: `${product.name} con tu nota de personalización.`,
      });
      setNote("");
      if (gotoCheckout) {
        router.push("/checkout");
      }
      onClose();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al agregar",
        description: err instanceof Error ? err.message : "No se pudo agregar.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Personaliza tu prenda
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Déjanos una nota de cómo te gustaría personalizar esta prenda y te contactamos para
          llevarla a cabo.
        </p>

        <div className="mt-4">
          <label htmlFor="customize-note" className="sr-only">
            Nota de personalización
          </label>
          <Textarea
            id="customize-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Quiero agregar mi nombre en el pecho y un número en la espalda…"
            rows={4}
            className="resize-none"
          />
          {noteLength > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
              {noteLength}/{MAX_NOTE_LENGTH}
            </p>
          )}
        </div>

        {/* Show selected variant details */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Variante seleccionada
          </h3>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border border-slate-300"
                style={{ backgroundColor: colorHex }}
              />
              <span className="text-slate-600 dark:text-slate-400">{colorName}</span>
            </div>
            {size && (
              <>
                <span className="mx-2">|</span>
                <span className="text-slate-600 dark:text-slate-400">{size}</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => handleSave(true)}
            disabled={saving || isNoteEmpty || isNoteTooLong}
          >
            {saving ? (
              "Guardando…"
            ) : (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" /> Guardar y proceder al pago
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => handleSave(false)}
            disabled={saving || isNoteEmpty || isNoteTooLong}
          >
            {saving ? (
              "Guardando…"
            ) : (
              <>
                <ArrowRight className="mr-2 h-5 w-5" /> Guardar y continuar comprando
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
