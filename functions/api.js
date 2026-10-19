// ---------------------------------------------------------------------------
// Netlify Function — the whole /api/* surface.
//
// In development these routes are served by the node:http server in
// server/index.js. A function has no socket of its own, so server/http-adapter.js
// recreates the small req/res surface that router expects. One router, two
// environments — there is no second copy of the API to keep in sync.
//
// `config.path` (Netlify Functions v2) routes /api/* here while handing the
// function the original request URL, so query strings such as
// /api/bookings/track?ref=JL001&phone=... arrive intact.
// ---------------------------------------------------------------------------

import { handleApi } from "../server/index.js"
import { invokeHandler } from "../server/http-adapter.js"

export const config = { path: "/api/*", excludedPath: "/api/assistant" }

// Prefixed to avoid clashing with index.js's own CORS_HEADERS when a bundler
// concatenates every module into one scope.
const API_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "600",
}

const jsonResponse = (status, payload, extraHeaders = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...API_CORS_HEADERS,
      ...extraHeaders,
    },
  })

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: API_CORS_HEADERS })
  }

  const url = new URL(request.url)
  const headers = {}
  for (const [name, value] of request.headers) headers[name.toLowerCase()] = value

  const body = Buffer.from(await request.arrayBuffer())

  try {
    const result = await invokeHandler(handleApi, {
      method: request.method,
      url: url.pathname + url.search,
      headers,
      body,
      // Netlify terminates TLS in front of the function; the client IP only
      // survives in x-forwarded-for, which the rate limiter keys on.
      remoteAddress:
        (headers["x-forwarded-for"] || "").split(",")[0].trim() || "0.0.0.0",
    })

    return new Response(result.body, {
      status: result.statusCode || 200,
      headers: { ...API_CORS_HEADERS, ...result.headers },
    })
  } catch (err) {
    console.error("[api] Unhandled error:", err)
    return jsonResponse(500, { error: err?.message || "API error" })
  }
}
