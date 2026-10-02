"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { Product, ProductVariant, ProductWithVariants, ProductCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { ColorPicker } from "@/components/ui/color-picker";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "mug", label: "Taza" },
  { value: "clothing", label: "Ropa" },
  { value: "accessory", label: "Accesorio" },
];

export default function AdminProductsPage() {
  const sb = useSupabase();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: 0,
    cover_image: "",
    active: true,
    category: "mug" as ProductCategory,
  });
  const [editing, setEditing] = useState<ProductWithVariants | null>(null);

  // Fetch products on mount
  useEffect(() => {
    async function fetch() {
      const { data, error } = await sb
        .from("products")
        .select("*, product_variants(*)")
        .order("name");
      if (!error) setProducts(data as ProductWithVariants[]);
    }
    fetch();
  }, [sb]);

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.slug) {
      toast({ variant: "destructive", title: "Error", description: "Faltan campos obligatorios" });
      return;
    }

    const { error } = await sb.from("products").insert([
      {
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        base_price: newProduct.base_price,
        cover_image: newProduct.cover_image || null,
        active: newProduct.active,
        category: newProduct.category,
      },
    ]);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setNewProduct({
      name: "",
      slug: "",
      description: "",
      base_price: 0,
      cover_image: "",
      active: true,
      category: "mug",
    });
    toast({ title: "Éxito", description: "Producto creado" });
    await refreshProducts();
  };

  const refreshProducts = async () => {
    const { data, error } = await sb
      .from("products")
      .select("*, product_variants(*)")
      .order("name");
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    setProducts(data as ProductWithVariants[]);
  };

  const handleDeleteProduct = async (id: string) => {
    // Confirm deletion with the user
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este producto? Esta acción también eliminará las variantes asociadas y los diseños relacionados."
      )
    ) {
      return;
    }

    try {
      // First, delete designs that reference this product directly
      let { error: designsError1 } = await sb.from("designs").delete().eq("product_id", id);

      if (designsError1) {
        toast({ variant: "destructive", title: "Error", description: designsError1.message });
        return;
      }

      // Then, delete designs that reference variants of this product
      const { data: variantIds, error: variantError } = await sb
        .from("product_variants")
        .select("id")
        .eq("product_id", id);

      if (variantError) {
        toast({ variant: "destructive", title: "Error", description: variantError.message });
        return;
      }

      const ids = variantIds?.map((v) => v.id) || [];
      let { error: designsError2 } = await sb.from("designs").delete().in("variant_id", ids);

      if (designsError2) {
        toast({ variant: "destructive", title: "Error", description: designsError2.message });
        return;
      }

      // Finally, delete the product - variants will be deleted via CASCADE foreign key
      let { error } = await sb.from("products").delete().eq("id", id);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        return;
      }

      toast({ title: "Éxito", description: "Producto eliminado" });
      await refreshProducts();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error desconocido",
      });
    }
  };

  const handleStartEdit = (product: ProductWithVariants) => setEditing(product);
  const handleCancelEdit = () => setEditing(null);
  const handleUpdateProduct = async (updated: Product) => {
    const { error } = await sb
      .from("products")
      .update({
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        base_price: updated.base_price,
        cover_image: updated.cover_image,
        active: updated.active,
        category: updated.category,
      })
      .eq("id", updated.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    toast({ title: "Éxito", description: "Producto actualizado" });
    setEditing(null);
    await refreshProducts();
  };

  // Variant management
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState({
    name: "",
    color_hex: "",
    image_url: "",
    price_adj: 0,
    stock: 0,
    active: true,
    attributes: {} as Record<string, string | number>,
  });

  const openVariantForm = (variant?: ProductVariant) => {
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        name: variant.name,
        color_hex: variant.color_hex ?? "",
        image_url: variant.image_url ?? "",
        price_adj: variant.price_adj ?? 0,
        stock: variant.stock ?? 0,
        active: variant.active ?? true,
        attributes: (variant.attributes as Record<string, string | number>) ?? {},
      });
    } else {
      setEditingVariant(null);
      setVariantForm({
        name: "",
        color_hex: "",
        image_url: "",
        price_adj: 0,
        stock: 0,
        active: true,
        attributes: {},
      });
    }
    setShowVariantForm(true);
  };

  const handleSaveVariant = async () => {
    if (!variantForm.name || !variantForm.color_hex) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nombre y color son obligatorios",
      });
      return;
    }

    const targetProduct =
      editing ?? products.find((p) => p.product_variants?.[0]?.product_id === editingVariant?.id);
    const productId = editing?.id ?? targetProduct?.id;
    if (!productId) return;

    if (editingVariant) {
      const { error } = await sb
        .from("product_variants")
        .update({ ...variantForm, attributes: variantForm.attributes })
        .eq("id", editingVariant.id);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        return;
      }

      toast({ title: "Éxito", description: "Variante actualizada" });
    } else {
      const { error } = await sb.from("product_variants").insert([
        {
          ...variantForm,
          product_id: productId,
        },
      ]);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
        return;
      }

      toast({ title: "Éxito", description: "Variante agregada" });
    }

    setEditingVariant(null);
    await refreshProducts();
  };

  const handleDeleteVariant = async (variantId: string) => {
    const { error } = await sb.from("product_variants").delete().eq("id", variantId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    toast({ title: "Éxito", description: "Variante eliminada" });
    await refreshProducts();
  };

  // Use `editing` as the source of truth for editable fields so user changes
  // are not discarded, but pull fresh variants from the products array after
  // variant create/edit/delete operations.
  const currentProduct = editing
    ? {
        ...editing,
        product_variants:
          products.find((p) => p.id === editing.id)?.product_variants ?? editing.product_variants,
      }
    : null;

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gestión de Productos
        </h1>

        {/* Add new product */}
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Añadir nuevo producto
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProduct();
            }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="product-name">Nombre</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Nombre del producto"
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="product-slug">Slug (URL)</Label>
                <Input
                  id="product-slug"
                  value={newProduct.slug}
                  onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                  placeholder="ej. taza-ceramica"
                  className="h-10"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="product-description">Descripción</Label>
                <Input
                  id="product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Descripción corta"
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="product-price">Precio base (COP)</Label>
                <Input
                  type="number"
                  id="product-price"
                  value={newProduct.base_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, base_price: Number(e.target.value) })
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="product-category">Categoría</Label>
                <select
                  id="product-category"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })
                  }
                  className="h-10 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm focus:border-terracotta focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <ImageUpload
                  value={newProduct.cover_image || undefined}
                  onChange={(url) => setNewProduct({ ...newProduct, cover_image: url ?? "" })}
                  bucket="productos"
                  label="Imagen de portada"
                />
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  id="product-active"
                  checked={newProduct.active}
                  onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
                  className="rounded border border-slate-300 w-5 h-5 peer dark:border-slate-600"
                />
                <Label htmlFor="product-active">Activo</Label>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="submit" className="flex-1">
                Guardar producto
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setNewProduct({
                    name: "",
                    slug: "",
                    description: "",
                    base_price: 0,
                    cover_image: "",
                    active: true,
                    category: "mug",
                  })
                }
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>

        {/* List products */}
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Productos ({products.length})
          </h2>
          {products.length === 0 ? (
            <p className="text-slate-500">No hay productos aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Nombre
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Categoría
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Slug
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Imagen
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Precio
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Activo
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Variantes
                    </th>
                    <th className="text-left py-3 font-semibold text-slate-700 dark:text-slate-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-sm text-slate-500">{p.category}</td>
                      <td className="py-3">{p.slug}</td>
                      <td className="py-3 text-center">
                        {p.cover_image ? (
                          <img
                            src={p.cover_image}
                            alt={p.name}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : null}
                      </td>
                      <td className="py-3">${p.base_price.toLocaleString("es-CL")}</td>
                      <td className="py-3">{p.active ? "Sí" : "No"}</td>
                      <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                        {p.product_variants?.length ?? 0}
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(p)}
                          className="mr-2"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit product modal */}
        {currentProduct && (
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800 max-w-3xl mx-auto">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Editar producto: {currentProduct.name}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateProduct(currentProduct);
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    value={currentProduct.name}
                    onChange={(e) => setEditing({ ...currentProduct, name: e.target.value })}
                    placeholder="Nombre del producto"
                    className="h-10"
                  />
                </div>
                <div>
                  <Input
                    value={currentProduct.slug}
                    onChange={(e) => setEditing({ ...currentProduct!, slug: e.target.value })}
                    placeholder="ej. taza-ceramica"
                    className="h-10"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    value={currentProduct.description ?? ""}
                    onChange={(e) =>
                      setEditing({ ...currentProduct!, description: e.target.value })
                    }
                    placeholder="Descripción"
                    className="h-10"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={currentProduct.base_price}
                    onChange={(e) =>
                      setEditing({ ...currentProduct!, base_price: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Categoría</Label>
                  <select
                    id="edit-category"
                    value={currentProduct.category}
                    onChange={(e) =>
                      setEditing({
                        ...currentProduct!,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="h-10 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm focus:border-terracotta focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <ImageUpload
                    value={currentProduct.cover_image}
                    onChange={(url) => setEditing({ ...currentProduct!, cover_image: url })}
                    bucket="productos"
                    label="Imagen de portada"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="checkbox"
                      checked={currentProduct.active}
                      onChange={(e) => setEditing({ ...currentProduct!, active: e.target.checked })}
                      className="rounded border border-slate-300 w-5 h-5 peer dark:border-slate-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Variants section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Variantes
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => openVariantForm()}
                  >
                    + Agregar Variante
                  </Button>
                </div>

                {currentProduct.product_variants && currentProduct.product_variants.length > 0 && (
                  <div className="space-y-2">
                    {currentProduct.product_variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          {v.image_url ? (
                            <img
                              src={v.image_url}
                              alt={v.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : null}
                          <div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {v.name}
                            </span>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {v.color_hex} • Stock: {v.stock} • Precio: ${v.price_adj}
                              {v.attributes && Object.keys(v.attributes).length > 0 && (
                                <span> • Atributos: {JSON.stringify(v.attributes)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openVariantForm(v)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteVariant(v.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Button type="submit" className="flex-1">
                  Actualizar
                </Button>
                <Button variant="ghost" onClick={handleCancelEdit} className="text-slate-600">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Variant form modal */}
        {showVariantForm && editing && (
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800 max-w-md mx-auto mt-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingVariant ? "Editar variante" : "Nueva variante"}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="variant-name">Nombre</Label>
                <Input
                  id="variant-name"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  placeholder="ej. Rojo"
                  className="h-10"
                />
              </div>
              <div className="md:col-span-2">
                <ColorPicker
                  value={variantForm.color_hex}
                  onChange={(color) => setVariantForm({ ...variantForm, color_hex: color })}
                  label="Color hex"
                  imageUrl={variantForm.image_url || undefined}
                />
              </div>
              {/* Dynamic size field for clothing */}
              {editing?.category === "clothing" && (
                <div>
                  <Label htmlFor="variant-size">Talla (S/M/L/XL/XXL)</Label>
                  <Input
                    id="variant-size"
                    value={(variantForm.attributes as Record<string, string>)?.size ?? ""}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        attributes: { ...variantForm.attributes, size: e.target.value },
                      })
                    }
                    placeholder="ej. M"
                    className="h-10"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <ImageUpload
                  value={variantForm.image_url || undefined}
                  onChange={(url) => setVariantForm({ ...variantForm, image_url: url ?? "" })}
                  bucket="productos"
                  label="Imagen de variante"
                />
              </div>
              <div>
                <Label htmlFor="variant-price">Precio ajuste (COP)</Label>
                <Input
                  id="variant-price"
                  type="number"
                  value={variantForm.price_adj}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, price_adj: Number(e.target.value) })
                  }
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="variant-stock">Stock</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  value={variantForm.stock}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, stock: Number(e.target.value) })
                  }
                  className="h-10"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Input
                type="checkbox"
                checked={variantForm.active}
                onChange={(e) => setVariantForm({ ...variantForm, active: e.target.checked })}
                className="rounded border border-slate-300 w-5 h-5"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Activo</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSaveVariant} className="flex-1">
                {editingVariant ? "Actualizar" : "Guardar"}
              </Button>
              <Button variant="ghost" onClick={() => setShowVariantForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
