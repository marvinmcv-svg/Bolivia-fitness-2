/* Bolivia Fitness · núcleo compartido por todas las páginas (sin build).
   Inyecta header/footer/bolsa/LeonIA, maneja la bolsa (la misma que edita LeonIA)
   y expone utilidades en window.BFX. Todo el contenido viene de js/data.js. */
(function () {
  "use strict";
  const B = window.BFIT;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = B.money;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE = document.body.dataset.page || "home";
  let CAT = B.catalog();
  const P = (id) => CAT[id];
  const catName = (id) => (B.categories.find((c) => c.id === id) || {}).name || "";
  const url = { product: (id) => "producto.html?id=" + encodeURIComponent(id), shop: (q) => "tienda.html" + (q ? "?" + q : "") };
  const store = {
    get(k, d, s) { try { const v = (s ? sessionStorage : localStorage).getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
  };
  const ICON = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 4h2.6l2.3 11h10.3l2-8H6.3"/><circle cx="9.5" cy="19.3" r="1.4"/><circle cx="16.5" cy="19.3" r="1.4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8.5h13l-1 11.5h-11z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    truck: '<svg class="ic-truck" viewBox="0 0 36 36" aria-hidden="true"><path d="M3 9h18v15H3zM21 14h6l5 5v5h-11z"/><circle cx="9" cy="26" r="2.6"/><circle cx="26" cy="26" r="2.6"/></svg>',
    gift: '<svg class="ic-gift" viewBox="0 0 36 36" aria-hidden="true"><g class="lid"><rect x="5" y="13" width="26" height="7" rx="1.5"/><path d="M18 13c-2-5-9-6-9-2 0 2 4 2 9 2zM18 13c2-5 9-6 9-2 0 2-4 2-9 2z"/></g><path d="M7 20v11h22V20M18 20v11"/></svg>',
    shield: '<svg class="ic-shield" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4l12 4v9c0 8-5.5 13-12 15-6.5-2-12-7-12-15V8z"/><path d="M12.5 18l4 4 7-8"/></svg>',
    store: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M5 14l2.5-8h21L31 14M5 14v17h26V14M5 14h26M14 31v-8h8v8"/></svg>',
    chat: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M6 30l2-6a12 12 0 1 1 4.5 4.3z"/><path d="M13 15c.6 3.5 3.6 6.5 7 7"/></svg>',
    spark: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  };

  /* ---------------- hora local ---------------- */
  function nowLP() {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: B.config.timezone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const h = +parts.find((p) => p.type === "hour").value % 24, m = +parts.find((p) => p.type === "minute").value;
    return { mins: h * 60 + m, label: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") };
  }
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  function branchStatus(b) {
    if (!b.open) return { k: "unknown", label: "Horario: consultá por WhatsApp" };
    const n = nowLP().mins, o = toMin(b.open), c = toMin(b.close);
    if (n >= o && n < c) return c - n <= 45 ? { k: "soon", label: "Cierra pronto · " + b.close } : { k: "open", label: "Abierto hasta las " + b.close };
    if (n < o) return { k: "closed", label: "Cerrado · abre hoy a las " + b.open };
    return { k: "closed", label: "Cerrado · abre mañana a las " + b.open };
  }

  /* ---------------- layout compartido ---------------- */
  const NAV = [["tienda.html", "Tienda", "shop"], ["tienda.html?cat=proteinas", "Proteínas", "proteinas"], ["tienda.html?cat=creatinas", "Creatinas", "creatinas"], ["tienda.html?cat=preentrenos", "Pre-entrenos", "preentrenos"], ["ofertas.html", "Ofertas", "offers"], ["sucursales.html", "Sucursales", "stores"]];
  const NAV_KEY = (() => { const c = new URLSearchParams(location.search).get("cat"); return PAGE === "shop" && c ? c : PAGE; })();
  const SOCIAL = {
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.5V7c0-.8.5-1.3 1.3-1.3H17V2.5h-2.6C11.8 2.5 10.5 4 10.5 6.6v1.9H8V12h2.5v9.5H14V12h2.7l.5-3.5z" fill="currentColor" stroke="none"/></svg>',
    tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 3c.4 2.6 2.2 4.3 5 4.5" /></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/></svg>',
  };
  function topMessages() {
    const m = [];
    if (B.campaignActive()) m.push('Black Friday: hasta ' + B.campaign.upTo + '% OFF + 1 accesorio gratis · <a href="ofertas.html">Comprar ofertas</a>');
    m.push('Envío gratis a domicilio · envíos a toda Bolivia');
    m.push('Originales con registro SENASAG · Dragon Pharma y ProSupps');
    m.push('¿Dudas? LeonIA te responde 24/7 · <a href="#" data-open-chat>Preguntar</a>');
    return m;
  }
  function injectLayout() {
    const head = document.createElement("div");
    const msgs = topMessages();
    head.innerHTML =
      '<a class="skip" href="#main">Saltar al contenido</a>' +
      '<div class="topbar"><div class="topbar__in">' +
      '<div class="topbar__social"><a href="' + B.config.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + SOCIAL.fb + '</a><a href="' + B.config.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + SOCIAL.ig + '</a><a href="' + B.config.tiktok + '" target="_blank" rel="noopener" aria-label="TikTok">' + SOCIAL.tt + "</a></div>" +
      '<div class="topbar__msg" aria-roledescription="anuncios"><button type="button" class="topbar__arw" data-tmsg="-1" aria-label="Anuncio anterior">‹</button><p id="tmsg" aria-live="polite">' + msgs[0] + '</p><button type="button" class="topbar__arw" data-tmsg="1" aria-label="Anuncio siguiente">›</button></div>' +
      '<div class="topbar__links"><a href="nosotros.html">Nosotros</a><a href="pedido.html">' + SOCIAL.user + "<span>Mi pedido</span></a></div></div></div>" +
      '<header class="gnav"><nav class="gnav__in" aria-label="Principal">' +
      '<button class="iconbtn gnav__burger" id="burger" aria-expanded="false" aria-controls="navpanel" aria-label="Menú"><span class="burger-ic" aria-hidden="true"><i></i><i></i><i></i></span></button>' +
      '<a class="gnav__logo" href="index.html" aria-label="Bolivia Fitness, inicio"><img src="assets/img/logo.png" width="44" height="44" alt=""><span>Bolivia<b>Fitness</b></span></a>' +
      '<ul class="gnav__links">' + NAV.map(([h, t, k]) => '<li><a href="' + h + '"' + (k === NAV_KEY ? ' aria-current="page"' : "") + ">" + t + "</a></li>").join("") + '<li><a href="#" class="ai" data-open-chat>LeonIA</a></li></ul>' +
      '<form class="gsearch" action="tienda.html" role="search"><label class="vh" for="gq">Buscar productos</label>' + ICON.search + '<input id="gq" name="q" type="search" placeholder="Buscar…" autocomplete="off"></form>' +
      '<div class="gnav__icons"><a class="iconbtn gnav__find" href="tienda.html#buscar" aria-label="Buscar productos">' + ICON.search + '</a><button class="cartbtn" data-open-cart aria-label="Abrir carrito">' + ICON.cart + '<span class="cartbtn__count" data-cart-count hidden>0</span></button></div></nav></header>' +
      '<div class="navpanel" id="navpanel" hidden><nav aria-label="Menú móvil">' + NAV.map(([h, t]) => '<a href="' + h + '">' + t + "</a>").join("") + '<a href="nosotros.html">Nosotros</a><a href="pedido.html">Mi pedido</a><a href="#" class="ai" data-open-chat>LeonIA</a></nav></div>';
    document.body.prepend(...head.childNodes);
    // alto real de la cinta de campaña → el hero 3D descuenta ese espacio y sus botones no quedan bajo el pliegue
    const rib = $(".topbar");
    // anuncios rotativos de la barra superior
    let ti = 0; const tm = $("#tmsg");
    const showMsg = (d) => { ti = (ti + d + msgs.length) % msgs.length; tm.classList.remove("in"); void tm.offsetWidth; tm.innerHTML = msgs[ti]; tm.classList.add("in"); };
    $$("[data-tmsg]").forEach((b) => b.addEventListener("click", () => { showMsg(+b.dataset.tmsg); clearInterval(tT); }));
    const tT = reduced ? 0 : setInterval(() => { if (!document.hidden) showMsg(1); }, 5000);
    const setRibbon = () => document.documentElement.style.setProperty("--ribbon", (rib ? rib.offsetHeight : 0) + "px");
    setRibbon(); addEventListener("resize", setRibbon, { passive: true });

    const foot = document.createElement("div");
    const cats = B.categories.filter((c) => Object.values(CAT).some((p) => p.cat === c.id));
    foot.innerHTML =
      '<section class="ftr__news"><div class="wrap"><div><h2>Sumate a la manada</h2><p>Promos, lanzamientos y sorteos antes que nadie, directo a tu WhatsApp.</p></div><a class="btn btn--wa" href="' + B.waLink(B.config.callCenter, "¡Hola Bolivia Fitness! 🦁 Quiero recibir promos y lanzamientos.") + '" target="_blank" rel="noopener">Quiero las promos</a></div></section>' +
      '<footer class="ftr" id="footer"><div class="wrap"><div class="ftr__top">' +
      '<div class="ftr__brand"><a class="gnav__logo" href="index.html"><img src="assets/img/logo.png" width="44" height="44" alt=""><span>Bolivia<b>Fitness</b></span></a><p>Representantes oficiales de Dragon Pharma y ProSupps en Bolivia. Suplementos americanos originales con registro SENASAG.</p>' +
      '<div class="ftr__social"><a href="' + B.config.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + SOCIAL.fb + '</a><a href="' + B.config.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + SOCIAL.ig + '</a><a href="' + B.config.tiktok + '" target="_blank" rel="noopener" aria-label="TikTok">' + SOCIAL.tt + "</a></div></div>" +
      "<div><h3>Tienda</h3><ul>" + cats.map((c) => '<li><a href="' + url.shop("cat=" + c.id) + '">' + esc(c.name) + "</a></li>").join("") + "</ul></div>" +
      '<div><h3>Comprar</h3><ul><li><a href="ofertas.html">Ofertas</a></li><li><a href="pedido.html">Mi pedido</a></li><li><a href="#" data-open-chat>Comprar con LeonIA</a></li><li><a href="' + B.waLink(B.config.callCenter, "¡Hola Bolivia Fitness! 🦁") + '" target="_blank" rel="noopener">WhatsApp 756 66702</a></li></ul></div>' +
      '<div><h3>Sucursales</h3><ul>' + B.branches.map((b) => '<li><a href="sucursales.html">' + esc(b.name) + "</a></li>").join("") + "</ul></div>" +
      '<div><h3>Bolivia Fitness</h3><ul><li><a href="nosotros.html">Nosotros</a></li><li><a href="nosotros.html#comunidad">Comunidad</a></li><li><a href="' + B.config.instagram + '" target="_blank" rel="noopener">Instagram</a></li><li><a href="' + B.config.facebook + '" target="_blank" rel="noopener">Facebook</a></li><li><a href="' + B.config.tiktok + '" target="_blank" rel="noopener">TikTok</a></li></ul></div></div>' +
      '<div class="ftr__bottom"><span>© ' + new Date().getFullYear() + " Bolivia Fitness · " + (B.campaignActive() ? "Precios Black Friday válidos del 16 al 30 de noviembre de 2026. " : "") + 'Stock, pago y envío se confirman por WhatsApp.</span><span>Fotos y videos: @boliviafitness</span></div></div></footer>' +
      '<div class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cartTtl" hidden><div class="scrim" data-close-cart></div><aside class="drawer__panel"><div class="drawer__head"><h2 id="cartTtl">Tu carrito</h2><button class="xbtn" data-close-cart aria-label="Cerrar carrito">✕</button></div><div class="drawer__body" id="cartBody"></div><div class="drawer__foot" id="cartFoot"></div></aside></div>' +
      '<button class="chatfab" id="chatfab" data-open-chat aria-label="Abrir LeonIA, tu coach y asistente"><img src="assets/img/logo.png" width="34" height="34" alt=""><span><b>LeonIA Coach</b><small>Armemos tu plan</small></span></button>' +
      '<div class="chat" id="chat" role="dialog" aria-modal="false" aria-labelledby="chatTtl" hidden><div class="chat__head"><div class="chat__avatar" id="chatAvatar" aria-hidden="true"><img src="assets/img/logo.png" width="52" height="52" alt=""></div><div><b id="chatTtl">LeonIA</b><small><i class="dot dot--live"></i> <span id="chatSub">Coach y recepción · 24/7</span></small></div><button class="xbtn" id="chatClose" aria-label="Cerrar asistente">✕</button></div>' +
      '<div class="chat__log" id="chatLog" aria-live="polite"></div><div class="chat__chips" id="chatChips"></div>' +
      '<form class="chat__form" id="chatForm"><label class="vh" for="chatInput">Escribí tu mensaje</label><input id="chatInput" autocomplete="off" placeholder="Escribí o tocá el micrófono…" maxlength="600">' +
      '<button type="button" class="mic" id="micBtn" aria-label="Hablar con LeonIA" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button>' +
      '<button class="send" aria-label="Enviar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></form>' +
      '<div class="voicebar" id="voicebar" hidden><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="voicebar__st" id="voiceStatus">Tocá el micrófono y hablá</span><label class="switch"><input type="checkbox" id="handsfree"><span>Manos libres</span></label></div>' +
      '<p class="chat__disc">LeonIA es una IA y puede equivocarse. Confirmá tu pedido por WhatsApp.</p></div>' +
      '<div class="mbar" id="mbar"><button class="mbar__ai" data-open-chat aria-label="Abrir LeonIA"><img src="assets/img/logo.png" width="34" height="34" alt=""></button><button class="mbar__cart" data-open-cart id="mbarCart" hidden></button><a class="mbar__cta" href="tienda.html">Comprar ahora</a></div>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>';
    document.body.append(...foot.childNodes);
  }

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(html) { const t = $("#toast"); t.innerHTML = html; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2400); }

  /* ---------------- bolsa ---------------- */
  let cart = store.get("bf_cart", {});
  for (const id of Object.keys(cart)) if (!P(id)) delete cart[id];
  const listeners = [];
  const cartLines = () => Object.keys(cart).filter((id) => P(id) && cart[id] > 0).map((id) => ({ id, qty: cart[id] }));
  const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
  const cartTotal = () => cartLines().reduce((a, l) => a + P(l.id).price * l.qty, 0);
  function setCart(next, opts) {
    cart = {};
    for (const [id, q] of Object.entries(next || {})) if (P(id) && q > 0) cart[id] = Math.min(50, Math.round(q));
    store.set("bf_cart", cart);
    renderCart(); refreshFoots(); updateMbar();
    listeners.forEach((fn) => fn(cart));
    if (opts && opts.bump) { const c = $("[data-cart-count]"); if (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); } }
  }
  function addToCart(id, qty, silent) {
    const p = P(id); if (!p) return;
    const n = Object.assign({}, cart); n[id] = (n[id] || 0) + (qty || 1);
    setCart(n, { bump: true });
    if (!silent) toast("Agregado al carrito: <b>" + esc(p.short) + "</b> · " + money(p.price));
  }
  function changeQty(id, d) { const n = Object.assign({}, cart); n[id] = (n[id] || 0) + d; if (n[id] <= 0) delete n[id]; setCart(n); }
  const getGift = () => store.get("bf_gift", "");
  const setGift = (g) => { store.set("bf_gift", g); renderCart(); listeners.forEach((fn) => fn(cart)); };
  const qtyHTML = (p, q) => '<div class="qty" aria-label="Cantidad de ' + esc(p.short) + '"><button type="button" data-q="' + p.id + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + q + '</span><button type="button" data-q="' + p.id + '" data-d="1" aria-label="Agregar uno">+</button></div>';
  const footHTML = (p) => (cart[p.id] ? qtyHTML(p, cart[p.id]) : '<button class="add add--wide" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.short) + ' al carrito">Agregar al carrito</button>');
  function refreshFoots() { $$("[data-foot]").forEach((el) => { const p = P(el.dataset.foot); if (p) el.innerHTML = footHTML(p); }); }
  function productCard(p) {
    return '<article class="pcard"><a class="pcard__img" href="' + url.product(p.id) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" width="720" height="720" alt="" loading="lazy">' + (p.off ? '<span class="pcard__badge">-' + p.off + "%</span>" : p.isNew ? '<span class="pcard__badge pcard__badge--new">Nuevo</span>' : "") + '<span class="pcard__quick">Ver producto</span></a>' +
      '<div class="pcard__body"><span class="pcard__brand">' + esc(catName(p.cat) || p.brand) + '</span><h3 class="pcard__name"><a href="' + url.product(p.id) + '">' + esc(p.short) + "</a></h3>" +
      '<p class="pcard__meta">' + esc(p.brand) + " · " + esc(p.size) + (p.flavor && p.flavor !== "Sin sabor" ? " · " + esc(p.flavor) : "") + "</p>" +
      '<div class="price"><b>' + money(p.price) + "</b>" + (p.before ? "<s>" + money(p.before) + "</s><em>" + p.off + "% OFF</em>" : "") + (p.perServing ? "<small>" + money(p.perServing) + " / servicio</small>" : "") + "</div>" +
      '<div class="pcard__foot" data-foot="' + p.id + '">' + footHTML(p) + "</div></div></article>";
  }
  function renderCart() {
    const lines = cartLines(), count = cartCount();
    $$("[data-cart-count]").forEach((el) => { el.textContent = count; el.hidden = !count; });
    const body = $("#cartBody"), foot = $("#cartFoot"); if (!body) return;
    if (!lines.length) {
      const top = Object.values(CAT).filter((p) => p.star).slice(0, 3);
      body.innerHTML = '<div class="drawer__empty"><p>Tu carrito está vacío.</p><a class="btn" href="tienda.html">Ir a la tienda <span class="arrow">→</span></a></div><div class="drawer__sugg"><h3>Los más buscados</h3>' + top.map(lineSugg).join("") + "</div>";
      foot.innerHTML = ""; return;
    }
    const sugg = complements(lines.map((l) => l.id)).slice(0, 2);
    body.innerHTML = lines.map((l) => { const p = P(l.id); return '<div class="line"><a href="' + url.product(p.id) + '"><img src="' + esc(p.img) + '" width="64" height="64" alt=""></a><div><b>' + esc(p.short) + "</b><small>" + esc(p.size) + " · " + money(p.price) + "</small></div>" + qtyHTML(p, l.qty) + "</div>"; }).join("") +
      (B.campaignActive() ? '<p class="giftline">🎁 ' + esc(B.campaign.gift) + (getGift() ? ". Elegiste: <b>" + esc(getGift()) + "</b>" : ". Elegilo al finalizar.") + "</p>" : "") +
      (sugg.length ? '<div class="drawer__sugg"><h3>Combinalo con</h3>' + sugg.map(lineSugg).join("") + "</div>" : "");
    foot.innerHTML = '<div class="tot"><span>Total</span><b>' + money(cartTotal()) + '</b></div><a class="btn btn--lg btn--block" href="pedido.html">Finalizar pedido <span class="arrow">→</span></a>';
  }
  const lineSugg = (p) => '<div class="line"><a href="' + url.product(p.id) + '"><img src="' + esc(p.img) + '" width="64" height="64" alt=""></a><div><b>' + esc(p.short) + "</b><small>" + money(p.price) + '</small></div><button class="add" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.short) + '">' + ICON.plus + "</button></div>";

  /* sugerencias deterministas por categoría (mismas reglas que el asistente) */
  const PAIR = { creatinas: ["dp-whey-phorm", "dp-glutamine"], proteinas: ["dp-creatine-30", "dp-glutamine"], preentrenos: ["dp-creatine-60", "dp-whey-phorm"], recuperacion: ["dp-creatine-30", "dp-iso-phorm"], ellas: ["dp-iso-phorm", "dp-creatine-lemon"], ganadores: ["ps-creatine-1200", "dp-glutamine"] };
  function complements(ids) {
    const have = new Set(ids), out = [];
    ids.forEach((id) => (PAIR[P(id).cat] || []).forEach((c) => { if (!have.has(c) && P(c) && !out.includes(P(c)) && !ids.some((x) => P(x).cat === P(c).cat)) out.push(P(c)); }));
    return out;
  }

  /* ---------------- eventos globales ---------------- */
  document.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"); if (q) { changeQty(q.dataset.q, +q.dataset.d); return; }
    const a = e.target.closest("[data-add]"); if (a) { e.preventDefault(); addToCart(a.dataset.add, 1); return; }
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); return; }
    if (e.target.closest("[data-close-cart]")) closeCart();
    const oc = e.target.closest("[data-open-chat]");
    if (oc) { e.preventDefault(); closeNav(); openChat(oc.dataset.ask || ""); }
  });
  let lastFocus = null;
  function openCart() { lastFocus = document.activeElement; $("#cart").hidden = false; renderCart(); updateMbar(); setTimeout(() => $("#cart .xbtn").focus(), 30); }
  function closeCart() { if ($("#cart").hidden) return; $("#cart").hidden = true; updateMbar(); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); if (!$("#chat").hidden) closeChat(); closeNav(); } });
  function closeNav() { const np = $("#navpanel"); if (!np || np.hidden) return; np.hidden = true; $("#burger").setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }

  /* ---------------- barra móvil ---------------- */
  const hideMbarFor = new Set();
  function updateMbar() {
    const mb = $("#mbar"); if (!mb) return;
    const n = cartCount(), mc = $("#mbarCart");
    mc.hidden = !n; mc.textContent = n ? "Carrito · " + n + " · " + money(cartTotal()) : "";
    const chatOpen = !$("#chat").hidden, cartOpen = !$("#cart").hidden;
    mb.classList.toggle("hide", hideMbarFor.size > 0 || chatOpen || cartOpen);
    $("#chatfab").classList.toggle("hide", hideMbarFor.has("footer") || chatOpen);
  }
  function hideMbarWhileVisible(el, key) {
    if (!el) return;
    new IntersectionObserver((ens) => { ens.forEach((en) => (en.isIntersecting ? hideMbarFor.add(key) : hideMbarFor.delete(key))); updateMbar(); }, { threshold: .05 }).observe(el);
  }

  /* ---------------- efectos ---------------- */
  function reveal() {
    if (reduced || !("IntersectionObserver" in window)) { $$(".reveal, .bento").forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .15 });
    $$(".reveal:not(.in), .bento:not(.in)").forEach((e) => io.observe(e));
  }
  function tilt(root) {
    if (reduced || matchMedia("(hover: none)").matches) return;
    $$("[data-tilt]", root).forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", ((x - .5) * 14).toFixed(2) + "deg"); el.style.setProperty("--rx", ((.5 - y) * 12).toFixed(2) + "deg");
        el.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); el.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }
  function autoplay() {
    if (reduced || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { const v = en.target; if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: .35 });
    $$("video[data-autoplay]").forEach((v) => io.observe(v));
  }
  function railButtons() {
    $$("[data-rail]").forEach((btn) => {
      const rail = document.getElementById(btn.dataset.rail); if (!rail) return;
      btn.addEventListener("click", () => rail.scrollBy({ left: +btn.dataset.dir * rail.clientWidth * .75, behavior: reduced ? "auto" : "smooth" }));
      const upd = () => { btn.disabled = +btn.dataset.dir < 0 ? rail.scrollLeft < 8 : rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8; };
      rail.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); setTimeout(upd, 300);
    });
  }
  function countdown(el) {
    if (!el || !B.campaignActive()) return;
    const end = new Date(B.campaign.to + "T23:59:59-04:00").getTime();
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
      el.innerHTML = [[d, "días"], [h, "horas"], [m, "min"], [s, "seg"]].map(([n, l]) => '<div class="cd"><b>' + String(n).padStart(2, "0") + "</b><span>" + l + "</span></div>").join("");
    };
    tick(); setInterval(tick, 1000);
  }

  /* ================== LeonIA (asistente) ================== */
  function initChat() {
    const chat = $("#chat"), log = $("#chatLog");
    let LS = store.get("leonia_state", null, true) || { cart: {}, order: {}, stage: "browsing", history: [] };
    let LOG = store.get("leonia_log", [], true);
    let busy = false;
    function mdSafe(t) {
      const h = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      let out = "", list = null;
      const close = () => { if (list) { out += "</" + list + ">"; list = null; } };
      for (const ln of h.split(/\n/)) {
        const m = ln.match(/^\s*[-•*]\s+(.*)/), n = ln.match(/^\s*\d+[.)]\s+(.*)/);
        const kind = m ? "ul" : n ? "ol" : null;
        if (kind) { if (list !== kind) { close(); out += "<" + kind + ">"; list = kind; } out += "<li>" + (m || n)[1] + "</li>"; continue; }
        close();
        if (ln.trim()) out += "<p>" + ln.replace(/^#{1,4}\s+/, "") + "</p>";
      }
      close();
      return out;
    }
    function addMsg(role, text) { const d = document.createElement("div"); d.className = "msg msg--" + (role === "user" ? "me" : "bot"); d.innerHTML = role === "user" ? esc(text) : mdSafe(text); log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
    const safeWa = (u) => typeof u === "string" && u.startsWith("https://wa.me/");
    function cartCardHTML(c) {
      const ids = Object.keys(c || {}).filter((id) => P(id));
      if (!ids.length) return '<h4>Tu carrito</h4><p style="margin:0">Vacía</p>';
      let t = 0; const li = ids.map((id) => { const s = P(id).price * c[id]; t += s; return "<li><span>" + c[id] + "× " + esc(P(id).short) + "</span><span>" + money(s) + "</span></li>"; }).join("");
      return "<h4>Tu carrito</h4><ul>" + li + '</ul><div class="ctot"><span>Total</span><span>' + money(t) + '</span></div><button class="btn btn--ghost btn--sm" data-open-cart>Ver carrito</button>';
    }
    function addCard(cls, html) { const d = document.createElement("div"); d.className = "ccard " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
    function chips(opts) { $("#chatChips").innerHTML = (opts || []).slice(0, 4).map((o) => '<button type="button">' + esc(o) + "</button>").join(""); }
    function starterChips() {
      const o = ["Armá mi plan de entrenamiento", "¿Cómo tomo la creatina?", "¿Qué sucursales están abiertas?", "¿Qué promos hay hoy?"];
      if (store.get("leonia_orders", []).length) o.unshift("🦁 Lo de siempre");
      chips(o);
    }
    $("#chatChips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) send(b.textContent); });
    log.addEventListener("click", (e) => { const b = e.target.closest(".qchips button"); if (b) send(b.textContent); const loc = e.target.closest("[data-share-loc]"); if (loc) shareLocation(loc); });
    function restoreLog() {
      log.innerHTML = "";
      if (!LOG.length) addMsg("bot", "¡Hola! Soy **LeonIA** 🦁, tu coach y recepcionista de Bolivia Fitness. Contame tu objetivo y te armo rutina, proteína y suplementos, o preguntame por sucursales, envíos y promos.");
      LOG.forEach((m) => addMsg(m.role, m.content));
      starterChips();
    }
    openChat = function (ask) { lastFocus = document.activeElement; chat.hidden = false; mountAvatar(); if (typeof ask === "string" && ask) setTimeout(() => send(ask), 60); document.body.classList.add("chat-open"); if (!log.children.length) restoreLog(); updateMbar(); setTimeout(() => $("#chatInput").focus(), 50); if (voice.ok) $("#voicebar").hidden = false; };
    closeChat = function () { chat.hidden = true; document.body.classList.remove("chat-open"); stopVoice(); updateMbar(); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); };
    $("#chatClose").addEventListener("click", closeChat);
    $("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); voice.lastWasVoice = false; const v = $("#chatInput").value.trim(); if (v) send(v); });
    function friendlyError(kind) {
      const txt = { setup: "Estoy terminando de prepararme 🛠️ Muy pronto voy a poder ayudarte a comprar.", rate: "Muchas preguntas seguidas 😅 Esperá un minuto y seguimos.", net: "Se cortó la conexión. Probá de nuevo en un ratito." }[kind] || "Algo falló de mi lado.";
      const d = addMsg("bot", txt + "\nMientras tanto podés ver la tienda o pedir directo por WhatsApp.");
      d.insertAdjacentHTML("beforeend", '<div class="qchips" style="margin-top:8px"><a class="btn btn--sm" href="tienda.html">Ver tienda</a> <a class="btn btn--wa btn--sm" href="pedido.html">Pedir por WhatsApp</a></div>');
    }
    async function send(text, opts) {
      if (busy || !text) return;
      stopSpeaking();
      busy = true; $("#chatInput").value = ""; chips([]);
      addMsg("user", text); LOG.push({ role: "user", content: text });
      const typing = addMsg("bot", ""); typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span><span class="typing__lbl"></span>';
      setVoiceState("thinking");
      const slowT = setTimeout(() => { const l = typing.querySelector(".typing__lbl"); if (l) l.textContent = "LeonIA está pensando tu respuesta…"; }, 3500);
      LS.cart = Object.assign({}, cart); LS.myOrders = store.get("leonia_orders", []);
      let botText = "", bubble = typing, cartCard = null;
      try {
        const res = await fetch("/api/leonia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: LOG.slice(-16), state: LS, channel: (opts && opts.voice) ? "voice" : "text" }) });
        if (!res.ok || !res.body) {
          typing.remove(); LOG.pop();
          friendlyError([503, 404, 501, 405].includes(res.status) ? "setup" : res.status === 429 ? "rate" : "other");
          busy = false; setVoiceState("idle"); starterChips(); persist(); return;
        }
        const rd = res.body.getReader(), dec = new TextDecoder(); let buf = "";
        for (;;) {
          const { value, done } = await rd.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          let i; while ((i = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue;
            let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
            if (ev.type === "text") { if (!botText) { clearTimeout(slowT); face("speaking"); } botText += ev.text; if (!bubble.isConnected) bubble = addMsg("bot", ""); bubble.innerHTML = mdSafe(botText); log.scrollTop = log.scrollHeight; }
            else if (ev.type === "cart") { setCart(ev.cart, { bump: true }); if (cartCard) cartCard.innerHTML = cartCardHTML(ev.cart); else { if (!botText) typing.remove(); cartCard = addCard("", cartCardHTML(ev.cart)); bubble = document.createElement("div"); } }
            else if (ev.type === "options") chips(ev.options);
            else if (ev.type === "readback") { const s = ev.summary || {}; addCard("", "<h4>Revisá tu pedido</h4><ul>" + (s.lines || []).map((l) => "<li><span>" + l.qty + "× " + esc(l.name) + "</span><span>" + money(l.subtotal) + "</span></li>").join("") + '</ul><div class="ctot"><span>Total</span><span>' + money(s.total || 0) + '</span></div><p style="margin:8px 0 0;color:var(--muted)">' + esc([s.service, s.branch, s.address, s.when, s.name, s.gift ? "🎁 " + s.gift : ""].filter(Boolean).join(" · ")) + '</p><div class="qchips" style="margin-top:10px"><button>Sí, confirmar</button><button>Cambiar algo</button></div>'); }
            else if (ev.type === "location") addCard("", '<button class="btn btn--sm" data-share-loc>📍 Compartir mi ubicación</button>');
            else if (ev.type === "order" && safeWa(ev.url)) { addCard("ccard--order", "<b>Pedido " + esc(ev.id) + " listo · " + money(ev.total) + '</b><a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + esc(ev.url) + '">Enviar pedido por WhatsApp a ' + esc(ev.branch || "Bolivia Fitness") + "</a>"); if (ev.entry) saveOrderEntry(ev.entry); }
            else if (ev.type === "handoff" && safeWa(ev.url)) addCard("", '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="' + esc(ev.url) + '">Hablar con una persona' + (ev.to ? " · " + esc(ev.to) : "") + "</a>");
            else if (ev.type === "state") LS = ev.state || LS;
            else if (ev.type === "error" && !botText) { typing.remove(); LOG.pop(); friendlyError(ev.kind === "not_configured" ? "setup" : ev.kind === "rate_limited" ? "rate" : "other"); }
          }
        }
        if (typing.isConnected && !typing.textContent.trim()) typing.remove();
        clearTimeout(slowT);
        if (botText.trim()) { LOG.push({ role: "assistant", content: botText.trim() }); speak(botText); } else setVoiceState("idle");
      } catch (err) {
        if (typing.isConnected) typing.remove();
        clearTimeout(slowT); if (!botText) { LOG.pop(); friendlyError("net"); } setVoiceState("idle");
      }
      LOG = LOG.slice(-20); persist(); busy = false;
      if (!$("#chatChips").children.length && LS.stage !== "awaiting_confirmation" && LOG.length <= 2) starterChips();
    }
    function persist() { store.set("leonia_state", LS, true); store.set("leonia_log", LOG, true); }
    function saveOrderEntry(entry) { if (!entry || !entry.cart) return; const h = store.get("leonia_orders", []).filter((x) => x.id !== entry.id); h.unshift(entry); store.set("leonia_orders", h.slice(0, 3)); }
    function shareLocation(btn) {
      if (!navigator.geolocation) { addMsg("bot", "Tu navegador no permite compartir ubicación. Escribime tu dirección y una referencia 🙏"); return; }
      btn.disabled = true; btn.textContent = "Buscando tu ubicación…";
      navigator.geolocation.getCurrentPosition((pos) => {
        LS.order = Object.assign({}, LS.order, { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        persist(); btn.textContent = "📍 Ubicación lista"; send("📍 Ubicación compartida");
      }, () => { btn.disabled = false; btn.textContent = "📍 Compartir mi ubicación"; addMsg("bot", "No pude obtener tu ubicación. Escribime tu dirección y una referencia, porfa."); }, { enableHighAccuracy: true, timeout: 12000 });
    }
    /* voz */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voice = { ok: !!SR, rec: null, listening: false, speaking: false, wake: null, voiceObj: null, lastWasVoice: false };
    /* cara 3D de LeonIA en el chat (se carga al abrirlo; sin WebGL queda el logo) */
    let avatar = null, avatarLoading = false, faceIdleT = 0;
    function mountAvatar() {
      if (avatar || avatarLoading) return; avatarLoading = true;
      import("./leon3d.js").then((m) => {
        const el = $("#chatAvatar"); avatar = m.mountLeon3D(el, { interactive: false, faceLayers: 10, zoom: 1.08 });
        if (!avatar.flat) { const img = el.querySelector("img"); if (img) img.remove(); }
      }).catch(() => { /* sin módulos: queda el logo */ });
    }
    function face(s) {
      clearTimeout(faceIdleT);
      if (avatar) avatar.setState(s);
      $("#chatAvatar").dataset.state = s;
      const sub = $("#chatSub"); if (sub) sub.textContent = { idle: "Coach y recepción · 24/7", thinking: "Pensando…", speaking: "Respondiendo…", listening: "Escuchando…" }[s] || "";
    }
    function setVoiceState(s) {
      face(s);
      const mic = $("#micBtn"); mic.classList.remove("listening", "thinking", "speaking"); if (s !== "idle") mic.classList.add(s);
      $("#voicebar").classList.toggle("live", s !== "idle");
      $("#voiceStatus").textContent = { idle: "Tocá el micrófono y hablá", listening: "Escuchando…", thinking: "Pensando…", speaking: "Hablando… tocá para interrumpir" }[s];
    }
    function pickVoice() { const vs = speechSynthesis.getVoices(); voice.voiceObj = vs.find((v) => /es-BO/i.test(v.lang)) || vs.find((v) => /es-(419|US|MX|AR)/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null; }
    function speechText(t) { return t.replace(/\*\*/g, "").replace(/https?:\/\/\S+/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/Bs\.?\s?(\d[\d.,]*)/g, "$1 bolivianos").replace(/^\s*[-•]\s*/gm, "").replace(/\s+/g, " ").trim(); }
    function speak(t) {
      if (!voice.lastWasVoice || !("speechSynthesis" in window)) { setVoiceState("idle"); return; }
      const u = new SpeechSynthesisUtterance(speechText(t)); u.lang = "es-BO"; if (voice.voiceObj) u.voice = voice.voiceObj; u.rate = 1.04;
      u.onend = () => { voice.speaking = false; setVoiceState("idle"); if ($("#handsfree").checked && !chat.hidden) listen(); };
      voice.speaking = true; setVoiceState("speaking"); speechSynthesis.speak(u);
    }
    function stopSpeaking() { if ("speechSynthesis" in window && speechSynthesis.speaking) speechSynthesis.cancel(); voice.speaking = false; }
    async function wakeLock(on) { try { if (on && "wakeLock" in navigator && !voice.wake) voice.wake = await navigator.wakeLock.request("screen"); if (!on && voice.wake) { await voice.wake.release(); voice.wake = null; } } catch (e) { /* no soportado */ } }
    function listen() {
      if (!voice.ok || busy) return;
      stopSpeaking();
      const r = new SR(); voice.rec = r; r.lang = "es-BO"; r.interimResults = true; r.maxAlternatives = 1;
      let final = "";
      r.onresult = (e) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const tr = e.results[i][0].transcript; if (e.results[i].isFinal) final += tr; else interim += tr; } $("#chatInput").value = (final + interim).trim(); };
      r.onerror = (e) => { voice.listening = false; setVoiceState("idle"); if (e.error === "not-allowed" || e.error === "service-not-allowed") addMsg("bot", "No tengo permiso para usar el micrófono. Podés escribirme igual 🙂"); };
      r.onend = () => { voice.listening = false; if (final.trim()) { voice.lastWasVoice = true; send(final.trim(), { voice: true }); } else setVoiceState("idle"); };
      voice.listening = true; setVoiceState("listening"); wakeLock(true);
      try { r.start(); } catch (e) { voice.listening = false; setVoiceState("idle"); }
    }
    function stopVoice() { stopSpeaking(); if (voice.rec && voice.listening) voice.rec.abort(); voice.listening = false; setVoiceState("idle"); wakeLock(false); }
    if (voice.ok) {
      $("#micBtn").hidden = false;
      if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
      $("#micBtn").addEventListener("click", () => { if (voice.speaking) { stopSpeaking(); setVoiceState("idle"); listen(); return; } if (voice.listening) { voice.rec.stop(); return; } listen(); });
    }
  }
  let openChat = () => {}, closeChat = () => {};

  /* ---------------- init ---------------- */
  injectLayout();
  const burger = $("#burger");
  burger.addEventListener("click", () => { const np = $("#navpanel"), open = np.hidden; np.hidden = !open; burger.setAttribute("aria-expanded", String(open)); document.body.style.overflow = open ? "hidden" : ""; });
  $("#navpanel").addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });
  initChat(); renderCart(); updateMbar();
  hideMbarWhileVisible($("#footer"), "footer");
  if (location.hash === "#leonia") openChat();

  window.BFX = { B, $, $$, esc, money, P, cat: () => CAT, catName, url, store, ICON, reduced, PAGE,
    cart: { lines: cartLines, count: cartCount, total: cartTotal, add: addToCart, set: setCart, change: changeQty, get: () => Object.assign({}, cart), onChange: (fn) => listeners.push(fn), getGift, setGift },
    productCard, qtyHTML, footHTML, complements, toast, branchStatus, nowLP, reveal, tilt, autoplay, railButtons, countdown, hideMbarWhileVisible, updateMbar, openCart, openChat: (ask) => openChat(ask) };
})();
