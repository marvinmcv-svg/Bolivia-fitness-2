/* Pedido: bolsa + 4 pasos → mensaje de WhatsApp a la sucursal elegida */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, esc = X.esc, money = X.money, P = X.P;
  const F = Object.assign({ step: 1, mode: "", branch: "", name: "", phone: "", consent: false, address: "", reference: "", when: "asap", time: "", note: "", topic: "", question: "" }, X.store.get("bf_funnel", {}, true));
  if (X.cart.count() && F.step === 1 && !F.mode) F.step = 1;
  const STEPS = ["Tu carrito", "Entrega", "Tus datos", "Enviar"];
  const fmsg = (t) => { $("#fmsg").textContent = t || ""; };
  const order = () => ({ lines: X.cart.lines(), mode: F.mode || "delivery", branch: F.branch, address: F.address, reference: F.reference, when: F.when === "later" && F.time ? F.time : "asap", name: F.name, gift: X.cart.getGift(), note: F.note, topic: F.topic, question: F.question });
  function preview() {
    X.store.set("bf_funnel", F, true);
    const o = order();
    $("#waPreview").textContent = (o.mode === "question" || o.lines.length) ? B.orderMessage(o) : "¡Hola Bolivia Fitness! 🦁 Quiero hacer un pedido…\n\n(Agregá productos para ver tu mensaje)";
  }
  const nav = (back, next, lbl) => '<div class="fnav">' + (back ? '<button type="button" class="btn btn--ghost" data-fstep="' + back + '">← Atrás</button>' : "<span></span>") + (next ? '<button type="button" class="btn btn--lg" data-fstep="' + next + '">' + (lbl || "Continuar") + ' <span class="arrow">→</span></button>' : "") + "</div>";
  function render() {
    preview();
    $("#steps").innerHTML = STEPS.map((s, i) => '<li class="' + (i + 1 === F.step ? "on" : i + 1 < F.step ? "done" : "") + '">' + (i + 1) + ". " + s + "</li>").join("");
    const f = $("#fform"), lines = X.cart.lines();
    if (F.step === 1) {
      const sugg = X.complements(lines.map((l) => l.id)).slice(0, 3);
      f.innerHTML = "<h2>Tu carrito</h2>" + (lines.length ? lines.map((l) => { const p = P(l.id); return '<div class="bag__row"><a href="' + X.url.product(p.id) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" width="72" height="72" alt=""></a><div><b>' + esc(p.short) + "</b><small>" + esc(p.size) + " · " + money(p.price) + (p.before ? " · antes " + money(p.before) : "") + "</small></div>" + X.qtyHTML(p, l.qty) + "</div>"; }).join("") + '<div class="bag__tot"><span>Total</span><span>' + money(X.cart.total()) + "</span></div>" : '<p class="muted">Tu carrito está vacío.</p><a class="btn" href="tienda.html">Ir a la tienda <span class="arrow">→</span></a>') +
        (sugg.length ? '<p style="margin:22px 0 4px;font-weight:600">Combinalo con</p><div class="picker">' + sugg.map((p) => '<button type="button" data-add="' + p.id + '"><img src="' + esc(p.img) + '" width="40" height="40" alt=""><span>' + esc(p.short) + "<br><b>+ " + money(p.price) + "</b></span></button>").join("") + "</div>" : "") +
        (B.campaignActive() && lines.length ? '<div class="field"><label for="f-gift">🎁 Accesorio de regalo (1 por compra)</label><select id="f-gift" data-gift-sel><option value="">El que esté disponible</option>' + B.campaign.gifts.map((g) => "<option" + (g === X.cart.getGift() ? " selected" : "") + ">" + esc(g) + "</option>").join("") + "</select></div>" : "") +
        nav(0, lines.length ? 2 : 0) + (lines.length ? "" : '<p style="margin-top:18px"><button class="link" type="button" data-mode-q>¿Solo querés hacer una consulta?</button></p>');
    } else if (F.step === 2) {
      const O = [["delivery", "Envío a domicilio", "Gratis, en tu ciudad"], ["pickup", "Retiro en tienda", "En tu sucursal"], ["national", "Envío a otra ciudad", "A cualquier lugar de Bolivia"], ["question", "Tengo una consulta", "Productos, stock, uso"]];
      f.innerHTML = "<h2>¿Cómo lo querés recibir?</h2><div class=\"otiles\">" + O.map(([v, t, s]) => '<button type="button" class="otile" aria-pressed="' + (F.mode === v) + '" data-mode="' + v + '">' + t + "<small>" + s + "</small></button>").join("") + "</div>" +
        (F.mode === "question" ? '<div class="field" style="margin-top:16px"><label for="f-topic">Tema</label><select id="f-topic" data-f="topic"><option value="">Elegí un tema</option>' + ["un producto", "stock", "precios y promos", "envíos", "otra cosa"].map((t) => "<option" + (F.topic === t ? " selected" : "") + ">" + t + "</option>").join("") + '</select></div><div class="field"><label for="f-q">Pregunta</label><textarea id="f-q" data-f="question">' + esc(F.question) + "</textarea></div>" : "") + nav(1, 3);
    } else if (F.step === 3) {
      const st = (b) => { const s = X.branchStatus(b); return s.k === "unknown" ? "" : " · " + (s.k === "closed" ? "Cerrado ahora" : "Abierto"); };
      f.innerHTML = '<h2>Tus datos</h2><div class="field"><label for="f-name">Nombre</label><input id="f-name" data-f="name" autocomplete="name" value="' + esc(F.name) + '"></div>' +
        '<div class="field"><label for="f-phone">WhatsApp (para seguimiento)</label><input id="f-phone" data-f="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej. 70012345" value="' + esc(F.phone) + '"></div>' +
        '<label class="consent"><input type="checkbox" data-consent' + (F.consent ? " checked" : "") + '><span>Quiero recibir recordatorios de recompra y promos por WhatsApp (podés darte de baja cuando quieras).</span></label>' +
        '<div class="field"><label for="f-branch">' + (F.mode === "national" ? "Ciudad de destino" : "Ciudad / sucursal") + '</label><select id="f-branch" data-f="branch"><option value="">Elegí</option>' + B.branches.map((b) => '<option value="' + b.id + '"' + (F.branch === b.id ? " selected" : "") + ">" + esc(b.name) + st(b) + "</option>").join("") + '<option value="cc"' + (F.branch === "cc" ? " selected" : "") + ">Otra ciudad · WhatsApp nacional</option></select></div>" +
        (F.mode === "delivery" || F.mode === "national" ? '<div class="row2"><div class="field"><label for="f-addr">Dirección</label><input id="f-addr" data-f="address" autocomplete="street-address" value="' + esc(F.address) + '"></div><div class="field"><label for="f-ref">Referencia</label><input id="f-ref" data-f="reference" value="' + esc(F.reference) + '"></div></div>' : "") +
        (F.mode !== "question" ? '<div class="field"><label>¿Cuándo?</label><div class="otiles"><button type="button" class="otile" aria-pressed="' + (F.when !== "later") + '" data-when="asap">Lo antes posible</button><button type="button" class="otile" aria-pressed="' + (F.when === "later") + '" data-when="later">Programar hora</button></div>' + (F.when === "later" ? '<input type="time" data-f="time" value="' + esc(F.time) + '" aria-label="Hora" style="margin-top:10px;max-width:180px">' : "") + "</div>" : "") +
        '<div class="field"><label for="f-note">Nota (opcional)</label><textarea id="f-note" data-f="note">' + esc(F.note) + "</textarea></div>" + nav(2, 4, "Revisar pedido");
    } else {
      const o = order(), b = B.branchById(F.branch);
      f.innerHTML = "<h2>Revisá y enviá</h2><p class=\"muted\">Tu mensaje va a <b style=\"color:var(--text)\">" + (b ? "Bolivia Fitness " + esc(b.name) : "Bolivia Fitness (WhatsApp nacional)") + "</b>. Ahí te confirman stock, forma de pago y envío.</p>" +
        (o.mode !== "question" ? '<div class="bag__tot"><span>Total</span><span>' + money(X.cart.total()) + "</span></div>" : "") +
        '<a class="btn btn--wa btn--lg btn--block" id="sendWa" target="_blank" rel="noopener" href="' + esc(B.waLink(b ? b.whatsapp : B.config.callCenter, B.orderMessage(o))) + '" style="margin-top:14px">Enviar pedido por WhatsApp</a>' + nav(3, 0);
    }
  }
  function valid(n) {
    if (n === 2 && !X.cart.count() && F.mode !== "question") { fmsg("Agregá al menos un producto."); return false; }
    if (n === 3 && !F.mode) { fmsg("Elegí cómo querés recibir tu pedido."); return false; }
    if (n === 3 && F.mode === "question" && !F.question.trim()) { fmsg("Escribí tu pregunta."); return false; }
    if (n === 4) {
      if (!F.name.trim()) { fmsg("Contanos tu nombre."); return false; }
      if (!F.branch) { fmsg("Elegí tu ciudad o sucursal."); return false; }
      if ((F.mode === "delivery" || F.mode === "national") && !F.address.trim()) { fmsg("Necesitamos tu dirección para el envío."); return false; }
    }
    fmsg(""); return true;
  }
  $("#fform").addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]"); if (m) { F.mode = m.dataset.mode; render(); return; }
    if (e.target.closest("[data-mode-q]")) { F.mode = "question"; F.step = 2; render(); return; }
    const s = e.target.closest("[data-fstep]"); if (s) { const n = +s.dataset.fstep; if (n < F.step || valid(n)) { F.step = n; render(); } return; }
    const w = e.target.closest("[data-when]"); if (w) { F.when = w.dataset.when; render(); return; }
    if (e.target.id === "sendWa") {
      const o = order();
      if (o.lines.length) { const h = X.store.get("leonia_orders", []), c = {}; o.lines.forEach((l) => (c[l.id] = l.qty)); h.unshift({ id: "WEB-" + Date.now().toString(36).toUpperCase().slice(-5), at: new Date().toISOString(), branch: o.branch, service: o.mode, cart: c }); X.store.set("leonia_orders", h.slice(0, 3)); }
      if (o.lines.length && o.mode !== "question") sendToCrm(o);
      fmsg("¡Listo! Se abrió WhatsApp con tu pedido. 🦁");
    }
  });
  // el pedido también queda en el CRM de la tienda (seguimiento, recordatorios de recompra)
  function sendToCrm(o) {
    const body = JSON.stringify({ name: F.name, phone: F.phone, consent: !!F.consent, branch: o.branch, mode: o.mode, address: o.address, reference: o.reference, gift: o.gift, note: o.note, lines: o.lines, website: "" });
    try { fetch("/api/crm?op=intake", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {}); } catch (e) { /* sin red: igual sale el WhatsApp */ }
  }
  $("#fform").addEventListener("change", (e) => { if (e.target.matches("[data-consent]")) { F.consent = e.target.checked; preview(); } });
  $("#fform").addEventListener("input", (e) => { const k = e.target.dataset.f; if (k) { F[k] = e.target.value; preview(); } if (e.target.matches("[data-gift-sel]")) { X.cart.setGift(e.target.value); preview(); } });
  X.cart.onChange(() => { if (F.step === 1) render(); else preview(); });
  X.hideMbarWhileVisible($(".co"), "checkout");
  render();
})();
