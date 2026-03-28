/**
 * Cloudflare Worker - Drogaria Runner Leaderboard API
 * Substitui o backend Python/FastAPI para rodar 100% na Cloudflare.
 *
 * Usa D1 (banco de dados SQLite da Cloudflare) em vez de SQLite local.
 * Usa KV como fallback se D1 não estiver configurado.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Visitor-Id",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // API routes
    if (path === "/api/leaderboard" && request.method === "GET") {
      return handleGetLeaderboard(request, env, corsHeaders);
    }

    if (path === "/api/leaderboard" && request.method === "POST") {
      return handlePostLeaderboard(request, env, corsHeaders);
    }

    if (path.startsWith("/api/leaderboard/rank/") && request.method === "GET") {
      return handleGetRank(request, env, corsHeaders);
    }

    // Serve static assets (index.html, cutscenes.js, videos, etc.)
    return env.ASSETS.fetch(request);
  },
};

async function handleGetLeaderboard(request, env, corsHeaders) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  try {
    // Try D1 first
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT id, name, score, distance, phase, character, created_at FROM scores ORDER BY score DESC LIMIT ?"
      ).bind(limit).all();

      return new Response(JSON.stringify(results || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to KV
    if (env.LEADERBOARD_KV) {
      const data = await env.LEADERBOARD_KV.get("leaderboard", "json");
      const scores = data ? JSON.parse(data) : [];
      return new Response(JSON.stringify(scores.slice(0, limit)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function handlePostLeaderboard(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 20);
    const score = parseInt(body.score) || 0;
    const distance = parseInt(body.distance) || 0;
    const phase = String(body.phase || "");
    const character = String(body.character || "male");
    const visitorId = request.headers.get("X-Visitor-Id") || "unknown";

    if (!name || score < 0 || distance < 0) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const createdAt = Date.now() / 1000;

    // Try D1 first
    if (env.DB) {
      const result = await env.DB.prepare(
        "INSERT INTO scores (name, score, distance, phase, character, visitor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(name, score, distance, phase, character, visitorId, createdAt).run();

      const rankResult = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM scores WHERE score > ?"
      ).bind(score).first();

      return new Response(
        JSON.stringify({ id: result.meta?.last_row_id || 0, rank: (rankResult?.count || 0) + 1 }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fallback to KV
    if (env.LEADERBOARD_KV) {
      let scores = [];
      const data = await env.LEADERBOARD_KV.get("leaderboard", "json");
      if (data) scores = JSON.parse(data);

      const entry = { id: scores.length + 1, name, score, distance, phase, character, visitor_id: visitorId, created_at: createdAt };
      scores.push(entry);
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 100);

      await env.LEADERBOARD_KV.put("leaderboard", JSON.stringify(scores));

      const rank = scores.findIndex((s) => s.id === entry.id) + 1;
      return new Response(JSON.stringify({ id: entry.id, rank }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Nenhum banco configurado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function handleGetRank(request, env, corsHeaders) {
  const url = new URL(request.url);
  const score = parseInt(url.pathname.split("/").pop()) || 0;

  try {
    if (env.DB) {
      const rankResult = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM scores WHERE score > ?"
      ).bind(score).first();
      const totalResult = await env.DB.prepare("SELECT COUNT(*) as count FROM scores").first();

      return new Response(
        JSON.stringify({ rank: (rankResult?.count || 0) + 1, total: totalResult?.count || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (env.LEADERBOARD_KV) {
      const data = await env.LEADERBOARD_KV.get("leaderboard", "json");
      const scores = data ? JSON.parse(data) : [];
      const rank = scores.filter((s) => s.score > score).length + 1;
      return new Response(JSON.stringify({ rank, total: scores.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ rank: 1, total: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
