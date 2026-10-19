// ---------------------------------------------------------------------------
// Serverless adapter.
//
// `server/index.js` is written against the node:http (req, res) pair so it can
// serve the production build directly. On Netlify the platform owns the socket,
// so a Function receives a plain event object instead. This module recreates the
// tiny slice of the req/res surface the router actually uses — a readable body
// stream, `headers`, `socket.remoteAddress`, and the writeHead/end pair — which
// lets the exact same router run in both places.
// ---------------------------------------------------------------------------

import { EventEmitter } from "node:events"

/** Builds an EventEmitter that satisfies the router's request-side reading. */
export function createFakeRequest({ method, url, headers, body, remoteAddress }) {
  const req = new EventEmitter()
  req.method = method || "GET"
  req.url = url || "/"
  req.headers = headers || {}
  req.socket = { remoteAddress: remoteAddress || "0.0.0.0" }
  req.connection = req.socket

  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body || "", "utf8")
  // The router attaches its listeners synchronously, so emit on the next tick.
  setImmediate(() => {
    if (payload.length) req.emit("data", payload)
    req.emit("end")
  })
  return req
}

/** Captures whatever the router writes so it can be returned as a JSON result. */
export function createFakeResponse() {
  const res = new EventEmitter()
  const chunks = []
  res.statusCode = 200
  res.statusMessage = "OK"
  res.headers = {}
  res.headersSent = false
  res.writableEnded = false

  res.writeHead = (code, headers) => {
    res.statusCode = code
    if (headers && typeof headers === "object") Object.assign(res.headers, headers)
    res.headersSent = true
    return res
  }
  res.setHeader = (name, value) => {
    res.headers[name] = value
    return res
  }
  res.getHeader = (name) => res.headers[name]
  res.removeHeader = (name) => {
    delete res.headers[name]
  }
  res.write = (chunk) => {
    if (chunk != null) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
    }
    return true
  }
  res.end = (chunk) => {
    if (chunk != null) res.write(chunk)
    if (!res.writableEnded) {
      res.writableEnded = true
      res.emit("finish")
    }
    return res
  }
  res.bufferedBody = () => Buffer.concat(chunks)
  return res
}

/**
 * Runs `handler(req, res, url)` against a synthesized pair.
 * Returns the captured response, ready to hand back to the platform.
 */
export async function invokeHandler(handler, request) {
  const req = createFakeRequest(request)
  const res = createFakeResponse()
  const url = new URL(request.url || "/", "http://netlify.local")
  const handled = await handler(req, res, url)
  return {
    handled: Boolean(handled),
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.bufferedBody(),
  }
}
