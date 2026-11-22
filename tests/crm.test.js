/* CRM: lógica pura + endpoint (almacenamiento local en una carpeta temporal). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

process.env.CRM_LOCAL_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "bf-crm-test-"));
delete process.env.BLOB_READ_WRITE_TOKEN;
const L = require("../api/_crmlogic");
const handler = require("../api/crm");
const store = require("../api/_crmstore");

const ENV = { CRM_PASSWORD: "secret-pass", CRM_SECRET: "x".repeat(32) };
function call(method, url, body, headers) {
  return new Promise((resolve) => {
    const req = { method, url, headers: Object.assign({ "x-forwarded-for": "1.2.3." + Math.floor(Math.random() * 250) }, headers || {}), body };
    const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(s) { resolve({ status: this.statusCode, headers: this.headers, json: s ? JSON.parse(s) : null }); } };
    handler(req, res, { env: ENV });
  });
}
async function login() {
  const r = await call("POST", "/api/crm?op=login", { password: "secret-pass", name: "QA" });
  assert.equal(r.status, 200);
  return r.headers["set-cookie"].split(";")[0];
}

test("teléfonos bolivianos se normalizan a 591 + 8 dígitos", () => {
  assert.equal(L.normPhone("700 12 345"), "59170012345");
  assert.equal(L.normPhone("+591 70012345"), "59170012345");
  assert.equal(L.normPhone("0059170012345"), "59170012345");
  assert.equal(L.normPhone("123"), "");
});

test("intake: los precios salen del catálogo, nunca del navegador", () => {
  const db = { customers: [], orders: [] };
  const r = L.intake(db, { name: "Ana", phone: "70012345", lines: [{ id: "dp-creatine-200", qty: 2, price: 1 }, { id: "no-existe", qty: 1 }] }, "web");
  assert.ok(r.ok);
  const o = db.orders[0], p = L.catalog()["dp-creatine-200"];
  assert.equal(o.lines.length, 1);
  assert.equal(o.lines[0].price, p.price);
  assert.equal(o.total, p.price * 2);
  assert.equal(o.status, "nuevo");
  assert.equal(db.customers[0].phone, "59170012345");
});

test("intake: mismo teléfono = mismo cliente; mismo id de pedido no se duplica", () => {
  const db = { customers: [], orders: [] };
  L.intake(db, { name: "Ana", phone: "70012345", lines: [{ id: "dp-creatine-30", qty: 1 }] }, "web");
  L.intake(db, { name: "Ana R.", phone: "+591 700 12345", consent: true, lines: [{ id: "dp-creatine-30", qty: 1 }] }, "web");
  assert.equal(db.customers.length, 1);
  assert.equal(db.customers[0].consent.whatsapp, true);
  const a = L.intake(db, { id: "BF-ABCDE", name: "Ana", phone: "70012345", lines: [{ id: "dp-creatine-30", qty: 1 }] }, "leonia");
  const b = L.intake(db, { id: "BF-ABCDE", name: "Ana", phone: "70012345", lines: [{ id: "dp-creatine-30", qty: 1 }] }, "leonia");
  assert.ok(a.ok && b.duplicate);
  assert.equal(db.orders.length, 3);
});

test("stock FEFO: descuenta primero el lote que vence antes y lo devuelve al cancelar", () => {
  const lots = [
    L.cleanLot({ productId: "dp-creatine-200", branch: "santa-cruz", lot: "B", expiry: "2027-08-01", qty: 5 }),
    L.cleanLot({ productId: "dp-creatine-200", branch: "santa-cruz", lot: "A", expiry: "2027-02-01", qty: 2 }),
    L.cleanLot({ productId: "dp-creatine-200", branch: "la-paz", lot: "C", expiry: "2026-12-01", qty: 9 }),
  ];
  const o = L.cleanOrder({ lines: [{ id: "dp-creatine-200", qty: 3 }], branch: "santa-cruz", status: "nuevo" });
  assert.equal(L.applyStock(o, lots), false); // "nuevo" no toca stock
  o.status = "preparado";
  assert.equal(L.applyStock(o, lots), true);
  assert.deepEqual(lots.map((l) => l.qty), [4, 0, 9]); // A (vence antes) se vacía, luego B; La Paz intacta
  assert.deepEqual(o.stock.alloc.map((a) => [a.lot, a.qty]), [["A", 2], ["B", 1]]);
  o.status = "entregado"; assert.equal(L.applyStock(o, lots), false); // no descuenta dos veces
  o.status = "cancelado"; assert.equal(L.applyStock(o, lots), true);
  assert.deepEqual(lots.map((l) => l.qty), [5, 2, 9]);
});

test("stock: si falta, lo informa en short", () => {
  const lots = [L.cleanLot({ productId: "dp-venom", branch: "sucre", qty: 1 })];
  const o = L.cleanOrder({ lines: [{ id: "dp-venom", qty: 3 }], branch: "sucre", status: "enviado" });
  L.applyStock(o, lots);
  assert.deepEqual(o.stock.short, [{ productId: "dp-venom", qty: 2 }]);
});

test("limpieza: rechaza valores fuera de lista y recorta textos", () => {
  const c = L.cleanCustomer({ name: "x".repeat(500), goal: "hackear", branch: "marte", email: "no-es-email", tags: "VIP, gym ,," });
  assert.equal(c.name.length, 80); assert.equal(c.goal, ""); assert.equal(c.branch, ""); assert.equal(c.email, "");
  assert.deepEqual(c.tags, ["vip", "gym"]);
  const o = L.cleanOrder({ status: "robado", channel: "x", lines: [{ id: "dp-venom", qty: 1000 }] });
  assert.equal(o.status, "nuevo"); assert.equal(o.channel, "otro"); assert.equal(o.lines[0].qty, 99);
});

test("endpoint: sin sesión no hay datos; contraseña incorrecta = 401", async () => {
  assert.equal((await call("GET", "/api/crm?op=data")).status, 401);
  assert.equal((await call("POST", "/api/crm?op=login", { password: "nope" })).status, 401);
  const forged = "bf_crm=" + Buffer.from(JSON.stringify({ u: "x", exp: Date.now() + 1e9 })).toString("base64url") + ".firmafalsa";
  assert.equal((await call("GET", "/api/crm?op=data", null, { cookie: forged })).status, 401);
});

test("endpoint: escritura exige X-CRM (CSRF) y la cookie es HttpOnly + SameSite", async () => {
  const r = await call("POST", "/api/crm?op=login", { password: "secret-pass", name: "QA" });
  assert.match(r.headers["set-cookie"], /HttpOnly/); assert.match(r.headers["set-cookie"], /SameSite=Strict/);
  const cookie = r.headers["set-cookie"].split(";")[0];
  const no = await call("POST", "/api/crm?op=upsert", { col: "tasks", item: { title: "x" } }, { cookie });
  assert.equal(no.status, 403);
  const ok = await call("POST", "/api/crm?op=upsert", { col: "tasks", item: { title: "Llamar" } }, { cookie, "x-crm": "1" });
  assert.equal(ok.status, 200); assert.equal(ok.json.item.title, "Llamar");
});

test("endpoint: intake público + pedido pasa a preparado y descuenta lote", async () => {
  const cookie = await login(), H = { cookie, "x-crm": "1" };
  const lot = await call("POST", "/api/crm?op=upsert", { col: "lots", item: { productId: "dp-glutamine", branch: "cochabamba", lot: "G1", expiry: "2027-01-01", qty: 4 } }, H);
  assert.equal(lot.status, 200);
  const intake = await call("POST", "/api/crm?op=intake", { name: "Leo", phone: "71234567", branch: "cochabamba", mode: "pickup", lines: [{ id: "dp-glutamine", qty: 1 }] });
  assert.equal(intake.status, 200);
  const bot = await call("POST", "/api/crm?op=intake", { website: "spam", name: "x", lines: [{ id: "dp-glutamine", qty: 1 }] });
  assert.equal(bot.status, 200);
  const up = await call("POST", "/api/crm?op=upsert", { col: "orders", item: { id: intake.json.id, status: "preparado" } }, H);
  assert.equal(up.status, 200);
  assert.equal(up.json.lots.find((l) => l.lot === "G1").qty, 3);
  const data = await call("GET", "/api/crm?op=data", null, { cookie });
  assert.equal(data.json.orders.filter((o) => o.customerName === "x").length, 0); // la trampa no creó nada
  assert.ok(data.json.activity.length >= 2);
});

test("endpoint: borrar cliente anonimiza sus pedidos", async () => {
  const cookie = await login(), H = { cookie, "x-crm": "1" };
  const c = await call("POST", "/api/crm?op=upsert", { col: "customers", item: { name: "Borrar Me", phone: "77777777" } }, H);
  const dup = await call("POST", "/api/crm?op=upsert", { col: "customers", item: { name: "Otro", phone: "+591 7777 7777" } }, H);
  assert.equal(dup.status, 409);
  await call("POST", "/api/crm?op=upsert", { col: "orders", item: { customerId: c.json.item.id, customerName: "Borrar Me", phone: "77777777", lines: [{ id: "dp-venom", qty: 1 }] } }, H);
  assert.equal((await call("POST", "/api/crm?op=remove", { col: "customers", id: c.json.item.id }, H)).status, 200);
  const orders = await store.load("orders");
  assert.ok(!orders.some((o) => o.customerName === "Borrar Me" || o.phone === "59177777777"));
});

test("datos de ejemplo: se cargan y se borran sin tocar los reales", async () => {
  const cookie = await login(), H = { cookie, "x-crm": "1" };
  const before = (await store.load("customers")).length;
  await call("POST", "/api/crm?op=demo", { action: "load" }, H);
  assert.ok((await store.load("customers")).length > before + 10);
  await call("POST", "/api/crm?op=demo", { action: "clear" }, H);
  assert.equal((await store.load("customers")).length, before);
});
