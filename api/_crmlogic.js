/* CRM · lógica pura (sin red ni disco): validación, precios desde el catálogo, stock FEFO,
   alta de pedidos que llegan del sitio y de LeonIA, y datos de ejemplo. La usan api/crm.js y los tests. */
"use strict";
const crypto = require("crypto");
const B = require("../js/data.js");

const STATUSES = ["nuevo", "confirmado", "preparado", "enviado", "entregado", "cancelado"];
const FULFILLED = new Set(["preparado", "enviado", "entregado"]); // a partir de acá el stock sale de los lotes
const CHANNELS = ["web", "leonia", "whatsapp", "tienda", "instagram", "telefono", "otro"];
const MODES = ["delivery", "pickup", "national"];
const PAYMENTS = ["", "qr", "efectivo", "transferencia", "tarjeta"];
const GOALS = ["", "masa", "grasa", "rendimiento", "salud", "principiante"];
const CUSTOMER_SOURCES = ["web", "leonia", "whatsapp", "tienda", "instagram", "referido", "evento", "otro"];

const str = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max || 200);
const txt = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max || 2000);
const pick = (v, list, d) => (list.includes(v) ? v : d);
const num = (v, min, max, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : "");
const isoTime = (v, d) => { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : d; };
const id = (p) => p + "-" + crypto.randomBytes(5).toString("base64url").replace(/[-_]/g, "").slice(0, 6).toUpperCase().padEnd(6, "X");

/* Teléfonos de Bolivia: se guardan como 591 + 8 dígitos. Otros países: dígitos tal cual (7–15). */
function normPhone(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 8 && /^[67]/.test(d)) d = "591" + d;
  if (d.length === 8 && /^[234]/.test(d)) d = "591" + d; // fijo con código de ciudad
  return d.length >= 7 && d.length <= 15 ? d : "";
}

let CAT = null, CAT_DAY = "";
function catalog(now) {
  const day = B.localDate(now);
  if (!CAT || CAT_DAY !== day) { CAT = B.catalog(now); CAT_DAY = day; }
  return CAT;
}
const branchIds = () => B.branches.map((b) => b.id);

/* ---------- limpieza por colección ---------- */
function cleanCustomer(raw, prev, by) {
  const c = Object.assign({}, prev || {});
  const r = raw || {};
  c.id = prev ? prev.id : id("C");
  c.name = str(r.name, 80) || c.name || "";
  c.phone = r.phone !== undefined ? normPhone(r.phone) : (c.phone || "");
  c.email = r.email !== undefined ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(r.email, 120)) ? str(r.email, 120).toLowerCase() : "") : (c.email || "");
  c.branch = r.branch !== undefined ? pick(r.branch, branchIds(), "") : (c.branch || "");
  c.goal = r.goal !== undefined ? pick(r.goal, GOALS, "") : (c.goal || "");
  c.source = r.source !== undefined ? pick(r.source, CUSTOMER_SOURCES, "otro") : (c.source || "otro");
  c.birthday = r.birthday !== undefined ? isoDate(r.birthday) : (c.birthday || "");
  c.tags = r.tags !== undefined ? (Array.isArray(r.tags) ? r.tags : String(r.tags).split(",")).map((t) => str(t, 30).toLowerCase()).filter(Boolean).slice(0, 12) : (c.tags || []);
  c.notes = r.notes !== undefined ? txt(r.notes, 2000) : (c.notes || "");
  c.pointsAdj = r.pointsAdj !== undefined ? Math.round(num(r.pointsAdj, -100000, 100000, 0)) : (c.pointsAdj || 0);
  if (r.consent !== undefined) {
    const on = !!(r.consent === true || (r.consent && r.consent.whatsapp));
    if (!c.consent || c.consent.whatsapp !== on) c.consent = { whatsapp: on, at: new Date().toISOString(), by: by || "" };
  } else c.consent = c.consent || { whatsapp: false, at: "", by: "" };
  c.timeline = Array.isArray(c.timeline) ? c.timeline : [];
  if (r.addNote && str(r.addNote.text, 600)) c.timeline.unshift({ at: new Date().toISOString(), by: by || "", type: pick(r.addNote.type, ["note", "call", "whatsapp", "visit", "reminder", "winback"], "note"), text: txt(r.addNote.text, 600), ref: str(r.addNote.ref, 60) });
  c.timeline = c.timeline.slice(0, 200);
  c.demo = !!(prev ? prev.demo : r.demo);
  c.createdAt = prev ? prev.createdAt : isoTime(r.createdAt, new Date().toISOString());
  c.updatedAt = new Date().toISOString(); c.updatedBy = by || "";
  return c;
}

function cleanLines(lines, now) {
  const cat = catalog(now), out = [];
  for (const l of Array.isArray(lines) ? lines.slice(0, 40) : []) {
    const p = cat[l && l.id]; if (!p) continue;
    const qty = Math.round(num(l.qty, 1, 99, 1));
    const price = l.price != null && l.price !== "" ? Math.round(num(l.price, 0, 100000, p.price) * 100) / 100 : p.price;
    const prevLine = out.find((x) => x.id === p.id && x.price === price);
    if (prevLine) prevLine.qty += qty; else out.push({ id: p.id, name: p.short, qty, price });
  }
  return out;
}
const linesTotal = (lines) => Math.round(lines.reduce((a, l) => a + l.qty * l.price, 0) * 100) / 100;

function cleanOrder(raw, prev, by, now) {
  const o = Object.assign({}, prev || {}), r = raw || {};
  o.id = prev ? prev.id : (r.id && /^[A-Z0-9-]{4,20}$/.test(r.id) ? r.id : id("BF"));
  if (r.lines !== undefined) o.lines = cleanLines(r.lines, now);
  o.lines = o.lines || [];
  o.discount = r.discount !== undefined ? Math.round(num(r.discount, 0, 1e6, 0) * 100) / 100 : (o.discount || 0);
  o.subtotal = linesTotal(o.lines);
  o.total = Math.max(0, Math.round((o.subtotal - o.discount) * 100) / 100);
  o.customerId = r.customerId !== undefined ? str(r.customerId, 20) : (o.customerId || "");
  o.customerName = r.customerName !== undefined ? str(r.customerName, 80) : (o.customerName || "");
  o.phone = r.phone !== undefined ? normPhone(r.phone) : (o.phone || "");
  o.channel = r.channel !== undefined ? pick(r.channel, CHANNELS, "otro") : (o.channel || "otro");
  o.branch = r.branch !== undefined ? pick(r.branch, branchIds(), "") : (o.branch || "");
  o.mode = r.mode !== undefined ? pick(r.mode, MODES, "pickup") : (o.mode || "pickup");
  o.address = r.address !== undefined ? str(r.address, 200) : (o.address || "");
  o.payment = r.payment !== undefined ? pick(r.payment, PAYMENTS, "") : (o.payment || "");
  o.paid = r.paid !== undefined ? !!r.paid : !!o.paid;
  o.gift = r.gift !== undefined ? str(r.gift, 60) : (o.gift || "");
  o.note = r.note !== undefined ? txt(r.note, 1000) : (o.note || "");
  o.attendedBy = r.attendedBy !== undefined ? str(r.attendedBy, 40) : (o.attendedBy || by || "");
  const prevStatus = prev ? prev.status : null;
  o.status = r.status !== undefined ? pick(r.status, STATUSES, "nuevo") : (o.status || "nuevo");
  o.history = Array.isArray(o.history) ? o.history : [];
  if (o.status !== prevStatus) {
    o.history.unshift({ at: new Date().toISOString(), by: by || "", status: o.status });
    if (o.status === "entregado" && !o.deliveredAt) o.deliveredAt = new Date().toISOString();
  }
  o.history = o.history.slice(0, 50);
  o.stock = o.stock || { applied: false, alloc: [], short: [] };
  o.demo = !!(prev ? prev.demo : r.demo);
  o.createdAt = prev ? prev.createdAt : isoTime(r.createdAt, new Date().toISOString());
  o.updatedAt = new Date().toISOString(); o.updatedBy = by || "";
  return o;
}

function cleanLot(raw, prev, by) {
  const l = Object.assign({}, prev || {}), r = raw || {}, cat = catalog();
  l.id = prev ? prev.id : id("L");
  l.productId = r.productId !== undefined ? (cat[r.productId] ? r.productId : "") : (l.productId || "");
  l.branch = r.branch !== undefined ? pick(r.branch, branchIds(), "") : (l.branch || "");
  l.lot = r.lot !== undefined ? str(r.lot, 40) : (l.lot || "");
  l.expiry = r.expiry !== undefined ? isoDate(r.expiry) : (l.expiry || "");
  l.qty = r.qty !== undefined ? Math.round(num(r.qty, 0, 100000, 0)) : (l.qty || 0);
  l.cost = r.cost !== undefined ? Math.round(num(r.cost, 0, 1e6, 0) * 100) / 100 : (l.cost || 0);
  l.note = r.note !== undefined ? str(r.note, 200) : (l.note || "");
  l.demo = !!(prev ? prev.demo : r.demo);
  l.receivedAt = prev ? prev.receivedAt : isoTime(r.receivedAt, new Date().toISOString());
  l.updatedAt = new Date().toISOString(); l.updatedBy = by || "";
  return l;
}

function cleanTask(raw, prev, by) {
  const t = Object.assign({}, prev || {}), r = raw || {};
  t.id = prev ? prev.id : id("T");
  t.title = r.title !== undefined ? str(r.title, 140) : (t.title || "");
  t.due = r.due !== undefined ? isoDate(r.due) : (t.due || "");
  t.customerId = r.customerId !== undefined ? str(r.customerId, 20) : (t.customerId || "");
  t.orderId = r.orderId !== undefined ? str(r.orderId, 20) : (t.orderId || "");
  t.assignee = r.assignee !== undefined ? str(r.assignee, 40) : (t.assignee || "");
  t.priority = r.priority !== undefined ? pick(r.priority, ["baja", "normal", "alta"], "normal") : (t.priority || "normal");
  t.done = r.done !== undefined ? !!r.done : !!t.done;
  if (t.done && !t.doneAt) t.doneAt = new Date().toISOString(); if (!t.done) t.doneAt = "";
  t.demo = !!(prev ? prev.demo : r.demo);
  t.createdAt = prev ? prev.createdAt : new Date().toISOString();
  t.updatedAt = new Date().toISOString(); t.updatedBy = by || "";
  return t;
}

function cleanCampaign(raw, prev, by) {
  const c = Object.assign({}, prev || {}), r = raw || {};
  c.id = prev ? prev.id : id("K");
  c.name = r.name !== undefined ? str(r.name, 80) : (c.name || "");
  const f = r.filter || c.filter || {};
  c.filter = { segment: str(f.segment, 20), branch: str(f.branch, 30), goal: str(f.goal, 20), tag: str(f.tag, 30), category: str(f.category, 30), consentOnly: f.consentOnly !== false };
  c.message = r.message !== undefined ? txt(r.message, 1000) : (c.message || "");
  c.sent = c.sent && typeof c.sent === "object" ? c.sent : {};
  if (r.markSent && typeof r.markSent === "string") c.sent[str(r.markSent, 20)] = new Date().toISOString();
  if (r.unmarkSent && typeof r.unmarkSent === "string") delete c.sent[r.unmarkSent];
  c.demo = !!(prev ? prev.demo : r.demo);
  c.createdAt = prev ? prev.createdAt : new Date().toISOString();
  c.updatedAt = new Date().toISOString(); c.updatedBy = by || "";
  return c;
}

function cleanSettings(raw, prev) {
  const s = Object.assign({}, prev || {}), r = raw || {};
  if (r.staff !== undefined) s.staff = (Array.isArray(r.staff) ? r.staff : String(r.staff).split(",")).map((x) => str(x, 40)).filter(Boolean).slice(0, 30);
  for (const [k, min, max] of [["lowStock", 0, 1000], ["expiryWarnDays", 7, 720], ["vipLtv", 0, 1e6], ["pointsPerBs", 0, 10], ["reminderLeadDays", 0, 60]]) if (r[k] !== undefined) s[k] = num(r[k], min, max, s[k]);
  if (r.usage && typeof r.usage === "object") { s.usage = Object.assign({}, s.usage); for (const [k, v] of Object.entries(r.usage)) if (/^[a-z]{3,20}$/.test(k)) s.usage[k] = num(v, 0.1, 10, 1); }
  if (r.templates && typeof r.templates === "object") { s.templates = Object.assign({}, s.templates); for (const [k, v] of Object.entries(r.templates)) if (/^[a-z]{3,20}$/.test(k)) s.templates[k] = txt(v, 600); }
  return s;
}

/* ---------- stock FEFO ----------
   Cuando un pedido pasa a preparado/enviado/entregado se descuenta de los lotes de su sucursal,
   primero el que vence antes. Si se cancela o vuelve atrás, se devuelve a los mismos lotes. */
function applyStock(order, lots) {
  order.stock = order.stock || { applied: false, alloc: [], short: [] };
  const want = FULFILLED.has(order.status);
  if (want && !order.stock.applied) {
    const alloc = [], short = [];
    for (const l of order.lines) {
      let need = l.qty;
      const pool = lots.filter((x) => x.productId === l.id && x.qty > 0 && (!order.branch || x.branch === order.branch))
        .sort((a, b) => (a.expiry || "9999") < (b.expiry || "9999") ? -1 : (a.expiry || "9999") > (b.expiry || "9999") ? 1 : (a.receivedAt < b.receivedAt ? -1 : 1));
      for (const lot of pool) { if (!need) break; const take = Math.min(need, lot.qty); lot.qty -= take; need -= take; alloc.push({ lotId: lot.id, productId: l.id, qty: take, lot: lot.lot, expiry: lot.expiry }); }
      if (need) short.push({ productId: l.id, qty: need });
    }
    order.stock = { applied: true, alloc, short, at: new Date().toISOString() };
    return true;
  }
  if (!want && order.stock.applied) {
    for (const a of order.stock.alloc || []) { const lot = lots.find((x) => x.id === a.lotId); if (lot) lot.qty += a.qty; }
    order.stock = { applied: false, alloc: [], short: [] };
    return true;
  }
  return false;
}

/* ---------- pedidos que llegan solos (sitio y LeonIA) ---------- */
function intake(db, raw, channel, now) {
  const r = raw || {};
  // precios SIEMPRE del catálogo: lo que manda el navegador no se usa
  const lines = cleanLines((Array.isArray(r.lines) ? r.lines : []).map((l) => ({ id: l && l.id, qty: l && l.qty })), now);
  const phone = normPhone(r.phone);
  const name = str(r.name, 80);
  if (!lines.length) return { error: "empty" };
  if (!name && !phone) return { error: "contact" };
  let c = phone ? db.customers.find((x) => x.phone === phone) : null;
  if (!c && name && !phone) c = null; // sin teléfono no se fusiona por nombre (evita mezclar personas)
  if (!c) {
    c = cleanCustomer({ name, phone, branch: r.branch, source: channel, consent: !!r.consent }, null, channel);
    db.customers.push(c);
  } else {
    if (!c.name && name) c.name = name;
    if (r.consent && !(c.consent && c.consent.whatsapp)) c.consent = { whatsapp: true, at: new Date().toISOString(), by: channel };
    if (!c.branch && r.branch) c.branch = pick(r.branch, branchIds(), "");
    c.updatedAt = new Date().toISOString();
  }
  const exists = r.id && db.orders.find((o) => o.id === r.id);
  if (exists) return { ok: true, id: exists.id, duplicate: true };
  const o = cleanOrder({ id: r.id, lines, customerId: c.id, customerName: c.name || name, phone: c.phone || phone, channel, branch: r.branch, mode: r.mode === "question" ? "pickup" : r.mode, address: [r.address, r.reference].filter(Boolean).join(" · "), gift: r.gift, note: r.note, status: "nuevo" }, null, channel, now);
  db.orders.push(o);
  c.timeline = c.timeline || [];
  c.timeline.unshift({ at: new Date().toISOString(), by: channel, type: "note", text: "Pedido " + o.id + " por " + (channel === "leonia" ? "LeonIA" : "el sitio web") + " · Bs " + o.total, ref: o.id });
  return { ok: true, id: o.id, customerId: c.id };
}

/* ---------- datos de ejemplo (marcados demo: true; se borran con un botón) ---------- */
function demoData(now) {
  const t0 = (now ? new Date(now) : new Date()).getTime(), day = 86400000, cat = catalog(now);
  const ids = Object.keys(cat).filter((k) => cat[k].servings);
  const rnd = (() => { let s = 42; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const pickR = (a) => a[Math.floor(rnd() * a.length)];
  const NAMES = ["Camila Rojas", "Diego Vargas", "Valeria Gutiérrez", "Andrés Mendoza", "Sofía Quiroga", "Mateo Suárez", "Daniela Flores", "Joaquín Paz", "Lucía Antelo", "Sebastián Céspedes", "Mariana Justiniano", "Gabriel Rocha", "Natalia Arce", "Rodrigo Saavedra", "Paola Villarroel", "Fernando Ribera", "Carla Montaño", "Iván Salvatierra", "Gabriela Peña", "Marco Áñez", "Alejandra Moreno", "Luis Coca", "Fabiola Terrazas", "Jorge Melgar"];
  const goals = ["masa", "grasa", "rendimiento", "salud", "principiante"];
  const brs = ["santa-cruz", "santa-cruz", "santa-cruz", "la-paz", "cochabamba", "sucre", "el-alto", "tarija"];
  const chans = ["web", "leonia", "whatsapp", "whatsapp", "tienda", "tienda", "instagram"];
  const customers = [], orders = [], lots = [], tasks = [];
  NAMES.forEach((n, i) => {
    const created = t0 - Math.floor(20 + rnd() * 300) * day;
    const c = cleanCustomer({ name: n, phone: "5917" + String(1000000 + Math.floor(rnd() * 8999999)), branch: pickR(brs), goal: pickR(goals), source: pickR(["web", "tienda", "instagram", "whatsapp", "referido", "evento"]), consent: rnd() > 0.2, tags: rnd() > 0.7 ? ["gym-partner"] : [], birthday: "19" + (80 + Math.floor(rnd() * 25)) + "-" + String(1 + Math.floor(rnd() * 12)).padStart(2, "0") + "-" + String(1 + Math.floor(rnd() * 27)).padStart(2, "0"), demo: true, createdAt: new Date(created).toISOString() }, null, "demo");
    customers.push(c);
    const n_orders = i % 6 === 0 ? 0 : 1 + Math.floor(rnd() * (i % 4 === 0 ? 6 : 3));
    let at = created + day;
    for (let k = 0; k < n_orders; k++) {
      at += Math.floor(18 + rnd() * 50) * day; if (at > t0) at = t0 - Math.floor(rnd() * 4) * day;
      const lines = [{ id: pickR(ids), qty: 1 }]; if (rnd() > 0.55) lines.push({ id: pickR(ids), qty: 1 });
      const recent = t0 - at < 3 * day;
      const status = recent ? pickR(["nuevo", "confirmado", "preparado", "enviado"]) : (rnd() > 0.06 ? "entregado" : "cancelado");
      const o = cleanOrder({ lines, customerId: c.id, customerName: c.name, phone: c.phone, channel: pickR(chans), branch: c.branch, mode: pickR(["delivery", "pickup", "pickup", "national"]), payment: pickR(["qr", "efectivo", "transferencia", "qr"]), paid: status === "entregado", status, demo: true, createdAt: new Date(at).toISOString() }, null, "demo", now);
      if (status === "entregado") o.deliveredAt = new Date(at + day).toISOString();
      o.stock = { applied: false, alloc: [], short: [], skipped: true }; // pedidos históricos: no tocan el stock de ejemplo
      orders.push(o);
    }
  });
  // stock: 2 lotes por producto en Santa Cruz y 1 en las demás sucursales principales
  for (const pid of Object.keys(cat)) {
    for (const br of ["santa-cruz", "la-paz", "cochabamba", "sucre"]) {
      const nLots = br === "santa-cruz" ? 2 : 1;
      for (let j = 0; j < nLots; j++) {
        const exp = new Date(t0 + Math.floor(25 + rnd() * 600) * day).toISOString().slice(0, 10);
        lots.push(cleanLot({ productId: pid, branch: br, lot: "L" + (24 + j) + String(Math.floor(rnd() * 9000) + 1000), expiry: cat[pid].servings ? exp : "", qty: Math.floor(rnd() * (br === "santa-cruz" ? 14 : 7)), cost: Math.round(cat[pid].price * 0.58), demo: true, receivedAt: new Date(t0 - Math.floor(rnd() * 120) * day).toISOString() }, null, "demo"));
      }
    }
  }
  const iso = (d) => new Date(t0 + d * day).toISOString().slice(0, 10);
  tasks.push(cleanTask({ title: "Llamar a proveedores: reponer Venom Inferno", due: iso(1), assignee: "Ventas", priority: "alta", demo: true }, null, "demo"));
  tasks.push(cleanTask({ title: "Armar vitrina Black Friday en Ventura Mall", due: iso(0), assignee: "Recepción", demo: true }, null, "demo"));
  tasks.push(cleanTask({ title: "Seguimiento post-venta", due: iso(-1), customerId: customers[1].id, assignee: "Ventas", demo: true }, null, "demo"));
  return { customers, orders, lots, tasks };
}

module.exports = { STATUSES, FULFILLED, CHANNELS, MODES, PAYMENTS, GOALS, CUSTOMER_SOURCES, normPhone, catalog, cleanCustomer, cleanOrder, cleanLot, cleanTask, cleanCampaign, cleanSettings, cleanLines, applyStock, intake, demoData, B };
