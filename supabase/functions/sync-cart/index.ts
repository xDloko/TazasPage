import "jsr:@supabase/functions-js@2";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  qty: number;
  unit_price: number;
  name: string;
  image_url: string | null;
  note: string | null;
  design_id?: string | null;
}

interface SyncCartRequest {
  items: CartItem[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as SyncCartRequest;
    const items = body.items ?? [];

    // Delete all existing cart items for this user
    const { error: delError } = await supabase.from("cart_items").delete().eq("user_id", user.id);
    if (delError) {
      console.error("[sync-cart] Cart delete error:", delError);
      return new Response(JSON.stringify({ error: "Failed to sync cart" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (items.length > 0) {
      const rows = items.map((item) => ({
        user_id: user.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        qty: item.qty,
        unit_price: item.unit_price,
        name: item.name,
        image_url: item.image_url ?? null,
        note: item.note ?? null,
      }));

      const { error: insError } = await supabase.from("cart_items").insert(rows);
      if (insError) {
        console.error("[sync-cart] Cart insert error:", insError);
        return new Response(JSON.stringify({ error: "Failed to sync cart" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[sync-cart] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
