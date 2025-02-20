export default {
  async fetch(request, env) {
    // Add CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range",
    };

    // Handle OPTIONS request for CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const key = decodeURIComponent(url.pathname.slice(1));

      if (request.headers.get("range")) {
        const object = await env.MY_BUCKET.head(key);
        
        if (!object) {
          return new Response("Not Found", { status: 404, headers: corsHeaders });
        }

        const range = request.headers.get("range");
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        
        // Limit chunk size to 1MB
        const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB
        const end = parts[1] 
          ? Math.min(parseInt(parts[1], 10), start + MAX_CHUNK_SIZE - 1)
          : Math.min(object.size - 1, start + MAX_CHUNK_SIZE - 1);
        
        const contentLength = end - start + 1;

        const headers = {
          ...corsHeaders,
          "Content-Range": `bytes ${start}-${end}/${object.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=31536000",
        };

        const rangeObject = await env.MY_BUCKET.get(key, {
          range: { offset: start, length: contentLength },
        });

        if (!rangeObject) {
          return new Response("Range Not Satisfiable", { 
            status: 416, 
            headers: corsHeaders 
          });
        }

        return new Response(rangeObject.body, {
          status: 206,
          headers
        });
      }

      // Handle non-range requests (images, etc.)
      const object = await env.MY_BUCKET.get(key);

      if (!object) {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }

      const headers = {
        ...corsHeaders,
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "Content-Length": object.size,
        "Cache-Control": "public, max-age=31536000",
        "Accept-Ranges": "bytes"
      };

      return new Response(object.body, { headers });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}; 