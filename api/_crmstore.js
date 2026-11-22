/* CRM · almacenamiento.
   Producción: Vercel Blob privado (BLOB_READ_WRITE_TOKEN). Cada colección es un JSON versionado:
   crm/<colección>/<timestamp>-<rand>.json. Se lee siempre la versión más nueva (list → get) y al
   guardar se escribe una versión nueva y se conservan las últimas KEEP como copias de respaldo.
   Desarrollo/tests: sin token se usa una carpeta local (CRM_LOCAL_DIR o tmp). */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const KEEP = 10;
const PREFIX = "crm/";
const DEFAULTS = {
  customers: [], orders: [], tasks: [], lots: [], campaigns: [], activity: [],
  settings: {
    staff: ["Recepción", "Ventas"],
    lowStock: 5,
    expiryWarnDays: 90,
    vipLtv: 3000,
    pointsPerBs: 0.1,
    reminderLeadDays: 5,
    // servicios que se usan por día, por categoría (pre-entreno ~5 días por semana)
    usage: { creatinas: 1, proteinas: 1, preentrenos: 0.75, recuperacion: 1, ellas: 1, ganadores: 1, aminoacidos: 0.8, quemadores: 1, salud: 1 },
    templates: {
      reminder: "¡Hola {nombre}! 🦁 Por la fecha, tu {producto} debe estar por terminarse. ¿Te reservamos otro? Te lo llevamos gratis a domicilio.",
      winback: "¡Hola {nombre}! 🦁 Hace tiempo no te vemos por Bolivia Fitness. Tenemos novedades y promos para vos, ¿te cuento?",
      postsale: "¡Hola {nombre}! 🦁 ¿Cómo te va con tu {producto}? Cualquier duda de uso, escribinos.",
      birthday: "¡Feliz cumpleaños, {nombre}! 🎂🦁 Pasá por tu sucursal: tenemos un regalo para vos.",
      order: "¡Hola {nombre}! 🦁 Tu pedido {pedido} está {estado}. Total: {total}.",
    },
  },
};
const COLS = Object.keys(DEFAULTS);
const clone = (v) => JSON.parse(JSON.stringify(v));
const hasBlob = (env) => !!(env || process.env).BLOB_READ_WRITE_TOKEN;
const localDir = () => process.env.CRM_LOCAL_DIR || path.join(os.tmpdir(), "bf-crm");

let blobMod = null;
const blob = () => blobMod || (blobMod = require("@vercel/blob"));

async function versions(col) {
  const out = []; let cursor;
  do {
    const r = await blob().list({ prefix: PREFIX + col + "/", limit: 1000, cursor });
    out.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // más nueva primero
}
async function readStream(stream) {
  const chunks = []; const reader = stream.getReader();
  for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(Buffer.from(value)); }
  return Buffer.concat(chunks).toString("utf8");
}

async function load(col) {
  if (!COLS.includes(col)) throw new Error("bad_collection");
  if (!hasBlob()) {
    const f = path.join(localDir(), col + ".json");
    try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return clone(DEFAULTS[col]); }
  }
  const vs = await versions(col);
  if (!vs.length) return clone(DEFAULTS[col]);
  const r = await blob().get(vs[0].url, { access: "private" });
  if (!r || r.statusCode !== 200) return clone(DEFAULTS[col]);
  return JSON.parse(await readStream(r.stream));
}

async function save(col, data) {
  if (!COLS.includes(col)) throw new Error("bad_collection");
  const body = JSON.stringify(data);
  if (!hasBlob()) {
    fs.mkdirSync(localDir(), { recursive: true });
    const f = path.join(localDir(), col + ".json");
    fs.writeFileSync(f + ".tmp", body); fs.renameSync(f + ".tmp", f);
    return;
  }
  const name = PREFIX + col + "/" + String(Date.now()).padStart(15, "0") + "-" + crypto.randomBytes(4).toString("hex") + ".json";
  await blob().put(name, body, { access: "private", contentType: "application/json", addRandomSuffix: false });
  const vs = await versions(col);
  const old = vs.slice(KEEP).map((v) => v.url);
  if (old.length) await blob().del(old).catch(() => {});
}

/* lee → modifica → guarda. fn puede devolver un valor que se reenvía al que llama. */
async function update(col, fn) {
  const data = await load(col);
  const ret = await fn(data);
  await save(col, data);
  return ret;
}

async function loadAll(cols) {
  const out = {};
  await Promise.all((cols || COLS).map(async (c) => { out[c] = await load(c); }));
  out.settings = Object.assign(clone(DEFAULTS.settings), out.settings || {});
  out.settings.usage = Object.assign(clone(DEFAULTS.settings.usage), (out.settings && out.settings.usage) || {});
  out.settings.templates = Object.assign(clone(DEFAULTS.settings.templates), (out.settings && out.settings.templates) || {});
  return out;
}

/* prueba de ida y vuelta en healthcheck/ (no toca datos del CRM) */
async function healthcheck() {
  const t0 = Date.now();
  if (!hasBlob()) return { ms: 0, local: true };
  const name = "healthcheck/" + Date.now() + "-" + crypto.randomBytes(3).toString("hex") + ".json";
  await blob().put(name, JSON.stringify({ ok: 1 }), { access: "private", contentType: "application/json", addRandomSuffix: false });
  const l = await blob().list({ prefix: "healthcheck/" });
  const mine = l.blobs.find((b) => b.pathname === name);
  const g = await blob().get(mine.url, { access: "private" });
  const body = JSON.parse(await readStream(g.stream));
  await blob().del(l.blobs.map((b) => b.url));
  return { ms: Date.now() - t0, read: body.ok === 1, listed: l.blobs.length };
}

module.exports = { load, save, update, loadAll, healthcheck, COLS, DEFAULTS, hasBlob };
