import "jsr:@supabase/functions-js@2";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItemInput {
  product_id: string;
  variant_id: string | null;
  qty: number;
  name: string;
  note?: string | null;
  design_id?: string | null;
}

interface CreateOrderRequest {
  items: OrderItemInput[];
  shipping_address: string;
  design_id?: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    // Validate user via getUser (not getSession — getUser uses getUser() which
    // verifies the JWT against the server and is more secure)
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json() as CreateOrderRequest;
    const { items, shipping_address } = body;
    const designId = body.design_id ?? body.items[0]?.design_id ?? null;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "items array is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!shipping_address || shipping_address.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "shipping_address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // --- Validate all prices server-side (single RPC call) ---
    const itemsForValidation = items.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
    }));

    const { data: validatedItems, error: validationError } = await supabase.rpc(
      "validate_cart_prices",
      { p_items: JSON.stringify(itemsForValidation) }
    );

    if (validationError) {
      console.error("[create-order] Price validation error:", validationError);
      return new Response(
        JSON.stringify({ error: "Error validating prices" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parsedItems = validatedItems as Array<{
      product_id: string;
      variant_id: string | null;
      qty: number;
      unit_price: number;
      valid: boolean;
    }>;

    // Check if any item failed validation
    const invalid = parsedItems.find((item) => !item.valid);
    if (invalid) {
      return new Response(
        JSON.stringify({
          error: "One or more items could not be validated. Prices have changed or items are unavailable.",
          invalid_items: parsedItems.filter((item) => !item.valid),
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Compute total server-side
    const total = parsedItems.reduce(
      (sum, item) => sum + Number(item.unit_price) * item.qty,
      0
    );

    // --- Create order and items in a transaction ---
    // Params order: p_user_id, p_total, p_shipping_address, p_items, p_design_id
    const { data: order, error: orderError } = await supabase.rpc("create_order_tx", {
      p_user_id: user.id,
      p_total: total,
      p_shipping_address: shipping_address,
      p_items: JSON.stringify(
        parsedItems.map((item, idx) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          qty: item.qty,
          unit_price: item.unit_price,
          name: items[idx].name,
          note: items[idx].note ?? null,
          design_id: items[idx].design_id ?? null,
        }))
      ),
      p_design_id: designId,
    });

    if (orderError) {
      console.error("[create-order] Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: orderError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ order_id: order.id, total }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[create-order] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
