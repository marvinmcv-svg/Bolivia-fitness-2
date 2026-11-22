/* Página de producto: detalle completo, presentaciones, combinalo, recomendados y vistos recientemente */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, $$ = X.$$, esc = X.esc, money = X.money, P = X.P, I = X.ICON;
  const CAT = X.cat(), ALL = Object.values(CAT);
  const id = new URLSearchParams(location.search).get("id");
  const p = P(id);
  if (!p) {
    $("#pdp").innerHTML = '<div class="empty" style="grid-column:1/-1"><p>No encontramos ese producto.</p><a class="btn" href="tienda.html">Ir a la tienda</a></div>';
    ["#combo", "#related"].forEach((s) => $(s).closest("section").hidden = true); return;
  }
  const raw = B.products.find((x) => x.id === p.id);
  const bf = B.campaignActive();
  document.title = p.short + " · " + p.brand + " · Bolivia Fitness";
  const md = document.querySelector('meta[name="description"]'); if (md) md.content = p.desc + " " + p.size + ". " + money(p.price) + " en la tienda online de Bolivia Fitness.";
  const ld = document.createElement("script"); ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name + " " + p.size, brand: { "@type": "Brand", name: p.brand }, image: location.origin + "/" + p.img, description: p.desc, offers: { "@type": "Offer", priceCurrency: "BOB", price: p.price, url: location.href, seller: { "@type": "Organization", name: "Bolivia Fitness" } } });
  document.head.appendChild(ld);

  $("#crumbs").innerHTML = '<a href="index.html">Inicio</a><span>/</span><a href="tienda.html">Tienda</a><span>/</span><a href="' + X.url.shop("cat=" + p.cat) + '">' + esc(X.catName(p.cat)) + "</a><span>/</span>" + esc(p.short);

  // presentaciones: misma línea; en creatinas, todas las de la misma marca
  const sibs = ALL.filter((x) => x.line === p.line || (p.cat === "creatinas" && x.cat === "creatinas" && x.brand === p.brand));
  // galería: foto del producto + pieza original de la campaña si existe
  const POST = { "dp-creatine-lemon": "assets/img/bf-lemon.webp", "dp-whey-phorm": "assets/img/bf-whey.webp", "dp-creatine-200": "assets/img/bf-modo-on.webp" };
  const gallery = [p.img].concat(POST[p.id] ? [POST[p.id]] : []).concat(p.cat === "creatinas" ? ["assets/img/bf-creatinas.webp"] : []);
  const servings = p.servings ? p.servings + " servicios" : "—";

  $("#pdp").innerHTML =
    '<div class="pdp__media"><div class="pdp__img" id="zoom"><img id="mainImg" src="' + esc(gallery[0]) + '" width="720" height="720" alt="' + esc(p.short + " " + p.size) + '"></div>' +
    (gallery.length > 1 ? '<div class="pdp__thumbs">' + gallery.map((g, i) => '<button type="button" data-img="' + esc(g) + '" aria-pressed="' + (i === 0) + '" aria-label="Ver imagen ' + (i + 1) + '"><img src="' + esc(g) + '" width="74" height="74" alt=""></button>').join("") + "</div>" : "") + "</div>" +
    '<div class="pdp__info"><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag">' + esc(p.brand) + "</span>" + (p.off ? '<span class="tag tag--gold">Black Friday -' + p.off + "%</span>" : "") + (p.star ? '<span class="tag">Destacado</span>' : "") + "</div>" +
    "<h1>" + esc(p.name) + '<span class="muted" style="display:block;font-size:.5em;letter-spacing:-.02em;margin-top:8px">' + esc(p.size) + (p.flavor ? " · " + esc(p.flavor) : "") + "</span></h1>" +
    '<div class="pdp__price"><b>' + money(p.price) + "</b>" + (p.before ? "<s>" + money(p.before) + '</s><span class="pdp__save">Ahorrás ' + money(p.save) + "</span>" : "") + "</div>" +
    (p.perServing ? '<p class="muted" style="margin:-10px 0 0">' + money(p.perServing) + " por servicio · " + esc(servings) + "</p>" : "") +
    '<p class="pdp__desc">' + esc(p.desc) + "</p>" +
    (sibs.length > 1 ? '<div><p style="margin:0 0 10px;font-weight:600">Presentación <span class="muted">· ¿cuál es la ideal para vos?</span></p><div class="otiles">' + sibs.map((s) => '<a class="otile" href="' + X.url.product(s.id) + '"' + (s.id === p.id ? ' aria-current="true"' : "") + ">" + esc(s.size) + "<small>" + esc(s.flavor || "") + " · " + money(s.price) + (s.perServing ? " · " + money(s.perServing) + "/serv." : "") + "</small></a>").join("") + "</div></div>" : "") +
    '<div class="buybox"><div class="buybox__row"><div class="qty" aria-label="Cantidad"><button type="button" id="qMinus" aria-label="Menos">−</button><span id="qVal">1</span><button type="button" id="qPlus" aria-label="Más">+</button></div><button class="btn btn--lg" id="addBtn">Agregar al carrito</button></div>' +
    '<button class="btn btn--light btn--lg btn--block" id="buyNow">Comprar ahora <span class="arrow">→</span></button>' +
    (bf ? '<p class="muted" style="margin:0;font-size:13px">🎁 ' + esc(B.campaign.gift) + ". Precio Black Friday hasta el 30 de noviembre.</p>" : "") + "</div>" +
    '<div class="perks"><div class="perk">' + I.truck + "Envío gratis a domicilio</div><div class=\"perk\">" + I.shield + "Original · registro SENASAG</div><div class=\"perk\">" + I.store + "Retiro en 7 ciudades</div></div>" +
    '<div class="acc">' +
    '<details open><summary>Detalles del producto</summary><div class="acc__body"><table class="spec"><tr><td>Marca</td><td>' + esc(p.brand) + "</td></tr><tr><td>Producto</td><td>" + esc(p.name) + "</td></tr><tr><td>Presentación</td><td>" + esc(p.size) + "</td></tr><tr><td>Servicios</td><td>" + esc(servings) + "</td></tr><tr><td>Sabor</td><td>" + esc(p.flavor || "—") + "</td></tr><tr><td>Categoría</td><td>" + esc(X.catName(p.cat)) + "</td></tr><tr><td>Precio por servicio</td><td>" + (p.perServing ? money(p.perServing) : "—") + "</td></tr>" + (p.before ? "<tr><td>Precio antes</td><td>" + money(p.before) + "</td></tr>" : "") + "</table></div></details>" +
    "<details><summary>Envíos y retiro</summary><div class=\"acc__body\">" + esc(B.delivery) + " También podés retirar en cualquiera de nuestras sucursales. Al finalizar armamos tu pedido y lo enviás por WhatsApp; la tienda te confirma stock, forma de pago y envío.</div></details>" +
    '<details><summary>Autenticidad</summary><div class="acc__body">Bolivia Fitness es representante oficial de Dragon Pharma y ProSupps en Bolivia. Productos originales con registro SENASAG y sello de autenticidad.</div></details>' +
    '<details><summary>Alérgenos y salud</summary><div class="acc__body">No tenemos información de alérgenos publicada para este producto: consultá en la sucursal antes de comprar. Si estás embarazada, tomás medicación o tenés alguna condición de salud, consultá con un profesional antes de usar suplementos.</div></details>' +
    '<details><summary>¿Tenés dudas?</summary><div class="acc__body">Preguntale a LeonIA o escribinos al WhatsApp 756 66702. <a class="link" href="' + esc(raw.src) + '" target="_blank" rel="noopener">Ver la publicación original ↗</a><div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn--sm" data-open-chat>Preguntar a LeonIA</button><a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="' + esc(B.waLink(B.config.callCenter, "¡Hola Bolivia Fitness! 🦁 Tengo una consulta sobre " + p.short + " (" + p.size + ").")) + '">WhatsApp</a></div></div></details>' +
    "</div></div>";

  // galería + zoom
  $$(".pdp__thumbs button").forEach((b) => b.addEventListener("click", () => { $("#mainImg").src = b.dataset.img; $$(".pdp__thumbs button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
  const z = $("#zoom");
  if (!matchMedia("(hover: none)").matches) {
    z.addEventListener("pointermove", (e) => { const r = z.getBoundingClientRect(); z.style.setProperty("--zx", ((e.clientX - r.left) / r.width * 100) + "%"); z.style.setProperty("--zy", ((e.clientY - r.top) / r.height * 100) + "%"); });
    z.addEventListener("click", () => z.classList.toggle("zoom")); z.addEventListener("pointerleave", () => z.classList.remove("zoom"));
  }
  // cantidad y compra
  let qty = 1;
  const setQ = (n) => { qty = Math.max(1, Math.min(50, n)); $("#qVal").textContent = qty; };
  $("#qMinus").addEventListener("click", () => setQ(qty - 1)); $("#qPlus").addEventListener("click", () => setQ(qty + 1));
  $("#addBtn").addEventListener("click", () => { X.cart.add(p.id, qty); X.openCart(); });
  $("#buyNow").addEventListener("click", () => { X.cart.add(p.id, qty, true); location.href = "pedido.html"; });
  $("#stickybuy").innerHTML = '<div class="price"><b>' + money(p.price) + "</b>" + (p.before ? "<s>" + money(p.before) + "</s>" : "") + '</div><button class="btn" data-add="' + p.id + '">Agregar al carrito</button>';
  document.body.classList.add("has-stickybuy");

  // Combinalo (precio = suma exacta)
  const combo = [p].concat(X.complements([p.id]).slice(0, 2));
  if (combo.length > 1) {
    $("#combo").innerHTML = '<div class="combo"><div class="combo__items">' + combo.map((c, i) => (i ? '<span class="combo__plus">+</span>' : "") + '<div class="combo__item"><a href="' + X.url.product(c.id) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(c.img) + '" width="170" height="170" alt="" loading="lazy"></a><label><input type="checkbox" checked data-combo="' + c.id + '"' + (i === 0 ? " disabled" : "") + "><span>" + (i === 0 ? "Este producto: " : "") + esc(c.short) + "<br><b>" + money(c.price) + "</b></span></label></div>").join("") + "</div>" +
      '<div class="combo__sum"><span class="muted">Total seleccionado</span><b id="comboTot"></b><span class="muted" id="comboSave" style="font-size:13px"></span><button class="btn btn--lg" id="comboAdd">Agregar seleccionados</button><span class="muted" style="font-size:12px">Precio = suma de los productos.</span></div></div>';
    const sel = () => $$("[data-combo]").filter((c) => c.checked).map((c) => P(c.dataset.combo));
    const upd = () => { const s = sel(); $("#comboTot").textContent = money(s.reduce((a, c) => a + c.price, 0)); const sv = s.reduce((a, c) => a + (c.save || 0), 0); $("#comboSave").textContent = sv ? "Ahorrás " + money(sv) + " vs. precio antes" : ""; $("#comboAdd").textContent = s.length > 1 ? "Agregar los " + s.length : "Agregar al carrito"; };
    $("#combo").addEventListener("change", upd); upd();
    $("#comboAdd").addEventListener("click", () => { sel().forEach((c) => X.cart.add(c.id, 1, true)); X.toast("<b>" + sel().length + " productos</b> agregados al carrito"); X.openCart(); });
  } else $("#combo").closest("section").hidden = true;

  // Recomendados: misma categoría, luego mayores descuentos
  const rel = ALL.filter((x) => x.id !== p.id && x.cat === p.cat && !sibs.includes(x)).concat(ALL.filter((x) => x.id !== p.id && x.cat !== p.cat).sort((a, b) => b.off - a.off)).slice(0, 8);
  $("#related").innerHTML = rel.map(X.productCard).join("");

  // Vistos recientemente
  const seen = X.store.get("bf_seen", []).filter((s) => s !== p.id && P(s));
  if (seen.length) { $("#recentSec").hidden = false; $("#recent").innerHTML = seen.slice(0, 8).map((s) => X.productCard(P(s))).join(""); }
  X.store.set("bf_seen", [p.id].concat(seen).slice(0, 10));
})();
