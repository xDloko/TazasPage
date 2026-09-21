import "jsr:@supabase/functions-js@2";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Content-Length",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Validate MIME type
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    // Validate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const contentType = req.headers.get("Content-Type");
    if (!contentType?.startsWith("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const contentLength = req.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE + 1024) {
      return new Response(
        JSON.stringify({ error: "Archivo demasiado grande. Máximo 5MB" }),
        { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse multipart form data
    const form = await parseMultipartFormData(req);
    const file = form.getFile("file");

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Tipo de archivo no válido. Permitidos: JPEG, PNG, WebP, GIF" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Archivo demasiado grande. Máximo 5MB" }),
        { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('designs')
      .uploadPublic(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload-design-image] Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Error al subir el archivo" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Return public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/designs/${filePath}`;

    return new Response(JSON.stringify({ public_url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[upload-design-image] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Simplified multipart parser
async function parseMultipartFormData(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  if (!boundaryMatch) return { getFile: () => null };

  const boundary = boundaryMatch[1].trim();
  const body = await request.text();

  const form = {
    getFile: (fieldName: string) => {
      const pattern = new RegExp(
        `Content-Disposition: form-data; name="${fieldName}"; filename="([^"]+)"[\\r\\n]+Content-Type: ([^\\r\\n]+)[\\r\\n\\n]`,
        'i'
      );
      const match = body.match(pattern);
      if (!match) return null;

      const filename = match[1];
      const type = match[2];
      const bodyStart = match.index + match[0].length;

      // Find end of file data
      const endPattern = new RegExp(`--${boundary}`);
      const endMatch = body.substring(bodyStart).match(endPattern);
      if (!endMatch) return null;

      const fileBody = body.substring(bodyStart, bodyStart + endMatch.index);

      return {
        name: filename,
        type: type,
        size: fileBody.length,
        arrayBuffer: () => new Blob([fileBody]).arrayBuffer(),
      };
    },
  };

  return form;
}