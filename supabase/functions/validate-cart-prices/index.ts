import "jsr:@supabase/functions-js@2";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Permitir CORS para cualquier origen durante el preflight
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Manejar preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const { items } = body; // [{product_id, variant_id, qty}]

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "items array es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate each item and get real price
    const validatedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.variant_id) {
        return new Response(
          JSON.stringify({ error: "Cada item debe tener product_id y variant_id" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: price, error } = await supabase.rpc("get_product_price", {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id,
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: `Error validando producto ${item.product_id}: ${error.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (price === null || price === undefined) {
        validatedItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          qty: item.qty || 1,
          unit_price: 0,
          valid: false,
          error: "Producto/variante no encontrado o inactivo"
        });
      } else {
        validatedItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          qty: item.qty || 1,
          unit_price: price,
          valid: true
        });
      }
    }

    return new Response(JSON.stringify(validatedItems), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[validate-cart-prices] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});