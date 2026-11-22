/* CRM · endpoint /api/crm?op=…
   Público:  POST op=intake  (pedido del checkout del sitio; precios recalculados acá)
   Sesión:   POST op=login {password, name} · POST op=logout · GET op=session
   Privado:  GET op=data · POST op=upsert {col,item} · POST op=remove {col,id} · POST op=settings {settings}
             POST op=import {customers:[…]} · POST op=demo {action:"load"|"clear"}
   Seguridad: cookie HttpOnly firmada (HMAC con CRM_SECRET, 12 h), SameSite=Strict, y toda escritura
   exige el encabezado X-CRM: 1 (un formulario de otro sitio no puede enviarlo). */
"use strict";
const crypto = require("crypto");
const store = require("./_crmstore");
const L = require("./_crmlogic");

const COOKIE = "bf_crm";
const TTL = 12 * 3600 * 1000;
const EDITABLE = { customers: L.cleanCustomer, orders: L.cleanOrder, lots: L.cleanLot, tasks: L.cleanTask, campaigns: L.cleanCampaign };

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now(), arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
function json(res, code, obj, headers) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(headers || {})) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  let data = ""; for await (const c of req) { data += c; if (data.length > 3_000_000) break; }
  try { return JSON.parse(data || "{}"); } catch (e) { return {}; }
}
const ipOf = (req) => String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "?").split(",")[0].trim();
const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest("base64url");
function makeToken(user, secret) { const p = b64(JSON.stringify({ u: user, exp: Date.now() + TTL })); return p + "." + sign(p, secret); }
function readToken(req, secret) {
  const raw = String(req.headers.cookie || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw || !secret) return null;
  const [p, s] = raw.slice(COOKIE.length + 1).split(".");
  if (!p || !s) return null;
  const good = sign(p, secret);
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return null;
  try { const v = JSON.parse(Buffer.from(p, "base64url").toString()); return v.exp > Date.now() ? v : null; } catch (e) { return null; }
}
const cookie = (val, maxAge, secure) => COOKIE + "=" + val + "; Path=/api/crm; HttpOnly; SameSite=Strict; Max-Age=" + maxAge + (secure ? "; Secure" : "");
const sameSecret = (a, b) => { const x = crypto.createHash("sha256").update(String(a)).digest(), y = crypto.createHash("sha256").update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };

function logActivity(db, by, action, col, item, extra) {
  db.activity.unshift({ at: new Date().toISOString(), by: by || "", action, col, id: item && item.id, label: (item && (item.name || item.title || item.customerName || item.lot || item.id)) || "", extra: extra || "" });
  db.activity = db.activity.slice(0, 500);
}
function publicCatalog(now) {
  const cat = L.catalog(now);
  return Object.values(cat).map((p) => ({ id: p.id, name: p.name, short: p.short, brand: p.brand, cat: p.cat, line: p.line, size: p.size, servings: p.servings, flavor: p.flavor, price: p.price, before: p.before, img: p.img }));
}

async function handler(req, res, opts) {
  const env = (opts && opts.env) || process.env;
  const now = (opts && opts.now) || new Date();
  const url = new URL(req.url, "http://x");
  const op = url.searchParams.get("op") || "";
  const ip = ipOf(req);
  const secure = env.NODE_ENV === "production" || !!env.VERCEL;
  const secret = env.CRM_SECRET || "";
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  // ---------- público: pedido desde el checkout ----------
  if (op === "intake") {
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    if (limited("in:" + ip, 6, 60000)) return json(res, 429, { error: "rate_limited" });
    const body = await readBody(req);
    if (body.website) return json(res, 200, { ok: true }); // trampa para bots
    try {
      const out = await withDb(["customers", "orders", "activity"], async (db) => {
        const r = L.intake(db, body, "web", now);
        if (r.ok && !r.duplicate) logActivity(db, "web", "intake", "orders", { id: r.id }, "web");
        return r;
      });
      return json(res, out.error ? 400 : 200, out);
    } catch (e) { console.log(JSON.stringify({ evt: "crm_intake_error", msg: String(e && e.message).slice(0, 200) })); return json(res, 500, { error: "storage" }); }
  }

  if (!secret || !env.CRM_PASSWORD) return json(res, 503, { error: "not_configured" });

  // diagnóstico del almacenamiento (escribe, lee y borra un archivo de prueba). Clave: sha256(CRM_SECRET + "health"), 16 hex.
  if (op === "health") {
    const want = crypto.createHash("sha256").update(secret + "health").digest("hex").slice(0, 16);
    if (url.searchParams.get("k") !== want) return json(res, 404, { error: "unknown_op" });
    const out = { storage: store.hasBlob(env) ? "blob" : "local" };
    try { out.roundtrip = await store.healthcheck(); out.ok = true; } catch (e) { out.ok = false; out.error = String(e && e.message).slice(0, 200); }
    return json(res, out.ok ? 200 : 500, out);
  }

  // ---------- sesión ----------
  if (op === "login") {
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    if (limited("lg:" + ip, 8, 10 * 60000)) return json(res, 429, { error: "rate_limited" });
    const body = await readBody(req);
    if (!sameSecret(body.password || "", env.CRM_PASSWORD)) return json(res, 401, { error: "bad_password" });
    const name = String(body.name || "").trim().slice(0, 40) || "Equipo";
    return json(res, 200, { ok: true, user: name }, { "Set-Cookie": cookie(makeToken(name, secret), TTL / 1000, secure) });
  }
  if (op === "logout") return json(res, 200, { ok: true }, { "Set-Cookie": cookie("", 0, secure) });

  const session = readToken(req, secret);
  if (!session) return json(res, 401, { error: "unauthorized" });
  if (op === "session") return json(res, 200, { ok: true, user: session.u, storage: store.hasBlob(env) ? "blob" : "local" });
  if (req.method === "POST" && req.headers["x-crm"] !== "1") return json(res, 403, { error: "csrf" });
  if (limited("op:" + ip, 240, 60000)) return json(res, 429, { error: "rate_limited" });
  const by = session.u;

  try {
    if (op === "data" && req.method === "GET") {
      const db = await store.loadAll();
      db.activity = db.activity.slice(0, 150);
      return json(res, 200, Object.assign(db, { catalog: publicCatalog(now), branches: L.B.branches.map((b) => ({ id: b.id, name: b.name })), categories: L.B.categories, now: now.toISOString(), user: by, storage: store.hasBlob(env) ? "blob" : "local" }));
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    const body = await readBody(req);

    if (op === "upsert") {
      const col = body.col, clean = EDITABLE[col];
      if (!clean) return json(res, 400, { error: "bad_collection" });
      const cols = col === "orders" ? ["orders", "lots", "customers", "activity"] : [col, "activity"];
      const out = await withDb(cols, async (db) => {
        const list = db[col], prev = body.item && body.item.id ? list.find((x) => x.id === body.item.id) : null;
        if (body.item && body.item.id && !prev && col !== "orders") return { error: "not_found" };
        const item = clean(body.item, prev, by, now);
        if (col === "customers" && item.phone) { const dup = list.find((x) => x.phone === item.phone && x.id !== item.id); if (dup) return { error: "duplicate_phone", id: dup.id }; }
        if (col === "orders") {
          if (!item.lines.length) return { error: "empty_order" };
          if (!item.customerId && (item.phone || item.customerName)) {
            let c = item.phone ? db.customers.find((x) => x.phone === item.phone) : null;
            if (!c) { c = L.cleanCustomer({ name: item.customerName, phone: item.phone, branch: item.branch, source: item.channel === "tienda" ? "tienda" : item.channel }, null, by); db.customers.push(c); }
            item.customerId = c.id; item.customerName = item.customerName || c.name;
          }
          if (!(item.stock && item.stock.skipped)) L.applyStock(item, db.lots);
        }
        if (prev) list[list.indexOf(prev)] = item; else list.push(item);
        logActivity(db, by, prev ? "update" : "create", col, item, col === "orders" ? item.status : "");
        return { ok: true, item, lots: col === "orders" ? db.lots : undefined, customers: col === "orders" ? db.customers : undefined };
      });
      return json(res, out.error ? (out.error === "not_found" ? 404 : 409) : 200, out);
    }

    if (op === "remove") {
      const col = body.col;
      if (!EDITABLE[col]) return json(res, 400, { error: "bad_collection" });
      const cols = col === "customers" ? ["customers", "orders", "tasks", "activity"] : col === "orders" ? ["orders", "lots", "activity"] : [col, "activity"];
      const out = await withDb(cols, async (db) => {
        const i = db[col].findIndex((x) => x.id === body.id); if (i < 0) return { error: "not_found" };
        const [gone] = db[col].splice(i, 1);
        if (col === "orders" && gone.stock && gone.stock.applied) { gone.status = "cancelado"; L.applyStock(gone, db.lots); }
        if (col === "customers") { // derecho al olvido: los pedidos quedan para la contabilidad, sin datos personales
          for (const o of db.orders) if (o.customerId === gone.id) { o.customerId = ""; o.customerName = "Cliente eliminado"; o.phone = ""; o.address = ""; }
          for (const t of db.tasks) if (t.customerId === gone.id) t.customerId = "";
        }
        logActivity(db, by, "delete", col, { id: gone.id, name: col === "customers" ? "(cliente eliminado)" : gone.name || gone.title || gone.lot || gone.id });
        return { ok: true };
      });
      return json(res, out.error ? 404 : 200, out);
    }

    if (op === "settings") {
      const out = await withDb(["settings", "activity"], async (db) => { db.settings = L.cleanSettings(body.settings, db.settings); logActivity(db, by, "update", "settings", { id: "settings", name: "Ajustes" }); return { ok: true, settings: db.settings }; });
      return json(res, 200, out);
    }

    if (op === "import") {
      const rows = Array.isArray(body.customers) ? body.customers.slice(0, 5000) : [];
      const out = await withDb(["customers", "activity"], async (db) => {
        let added = 0, merged = 0, skipped = 0;
        for (const r of rows) {
          const phone = L.normPhone(r.phone);
          const prev = phone ? db.customers.find((x) => x.phone === phone) : null;
          if (!phone && !String(r.name || "").trim()) { skipped++; continue; }
          const c = L.cleanCustomer(Object.assign({}, r, { source: r.source || "otro" }), prev, by);
          if (prev) { db.customers[db.customers.indexOf(prev)] = c; merged++; } else { db.customers.push(c); added++; }
        }
        logActivity(db, by, "import", "customers", { id: "import", name: added + " nuevos, " + merged + " actualizados" });
        return { ok: true, added, merged, skipped };
      });
      return json(res, 200, out);
    }

    if (op === "demo") {
      const out = await withDb(["customers", "orders", "lots", "tasks", "campaigns", "activity"], async (db) => {
        for (const c of ["customers", "orders", "lots", "tasks", "campaigns"]) db[c] = db[c].filter((x) => !x.demo);
        if (body.action === "load") { const d = L.demoData(now); for (const c of Object.keys(d)) db[c] = db[c].concat(d[c]); }
        logActivity(db, by, body.action === "load" ? "demo_load" : "demo_clear", "demo", { id: "demo", name: "Datos de ejemplo" });
        return { ok: true };
      });
      return json(res, 200, out);
    }
    return json(res, 404, { error: "unknown_op" });
  } catch (e) {
    console.log(JSON.stringify({ evt: "crm_error", op, msg: String(e && e.message).slice(0, 300) }));
    return json(res, 500, { error: "storage" });
  }
}

/* Carga las colecciones, ejecuta fn y guarda solo las que cambiaron. */
async function withDb(cols, fn) {
  const db = {}; await Promise.all(cols.map(async (c) => { db[c] = await store.load(c); }));
  const before = {}; for (const c of cols) before[c] = JSON.stringify(db[c]);
  const out = await fn(db);
  if (!out || !out.error) await Promise.all(cols.filter((c) => JSON.stringify(db[c]) !== before[c]).map((c) => store.save(c, db[c])));
  return out;
}

/* LeonIA: registra el pedido confirmado en el CRM (sin bloquear la respuesta si falla). */
async function recordFromLeonia(state, now) {
  const o = state && state.order, placed = state && state.placed;
  if (!placed || !state.history || !state.history[0]) return;
  const h = state.history[0];
  await withDb(["customers", "orders", "activity"], async (db) => {
    const r = L.intake(db, { id: placed.id, name: o.name, phone: o.phone, branch: h.branch || o.branch, mode: h.service || o.service, address: o.address, reference: o.reference, gift: o.gift, note: o.notes, lines: Object.entries(h.cart || {}).map(([id, qty]) => ({ id, qty })) }, "leonia", now);
    if (r.ok && !r.duplicate) logActivity(db, "leonia", "intake", "orders", { id: r.id }, "leonia");
    return r;
  });
}

module.exports = handler;
module.exports.default = handler;
module.exports.recordFromLeonia = recordFromLeonia;
module.exports._internals = { makeToken, readToken, withDb };
