/* Inicio: carrusel, beneficios, más vendidos (pestañas), Black Friday, categorías, stacks, comunidad */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, esc = X.esc, money = X.money, P = X.P;
  const CAT = X.cat();

  /* ---------- Carrusel principal ---------- */
  (function carousel() {
    const track = $("#hcarTrack"), bars = $("#hcarBars"), root = $("#hero");
    const bf = B.campaignActive(), cp = (id) => P(id);
    const img = (src, w, h, eager) => '<img src="' + src + '" width="' + w + '" height="' + h + '" alt="" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">';
    // abanico de 3 tarjetas reales del catálogo (fotos de la marca, 4:5); cada una lleva a su producto
    const fan = (ids, eager) => '<div class="hs__fan">' + ids.map((id, i) => { const p = cp(id);
      return '<a class="hs__fcard hs__fcard--' + i + '" href="' + X.url.product(id) + '" aria-label="' + esc(p.short + " · " + money(p.price)) + '">' + img("assets/hero/bf/" + id + ".webp", 864, 1080, eager && i === 1) +
        '<span class="hs__fprice"><b>' + money(p.price) + "</b>" + (p.before ? "<s>" + money(p.before) + "</s>" : p.isNew ? "<i>Nuevo</i>" : "") + "</span></a>"; }).join("") + "</div>";
    const all = Object.values(CAT), inCat = (c) => all.filter((p) => p.cat === c);
    const minOf = (c) => Math.min(...inCat(c).map((p) => p.price));
    const launches = all.filter((p) => p.isNew);
    const SL = [
      bf && { id: "bf", theme: "bf", eyebrow: "Black Friday · 16 al 30 de noviembre", title: "Hasta <b>" + B.campaign.upTo + "% OFF</b>",
        text: "En " + all.filter((p) => p.before).length + " productos americanos originales, y 1 accesorio gratis por cualquier compra.", extra: '<div class="hs__cd" data-cd></div>',
        ctas: '<a class="btn btn--gold btn--lg" href="ofertas.html">Comprar ofertas <span class="arrow">→</span></a><a class="btn btn--ghost btn--lg" href="tienda.html">Ver la tienda</a>',
        media: fan(["dp-iso-phorm-cookies", "dp-creatine-200", "dp-venom-inferno-mangonada"], true) },
      launches.length && { id: "new", theme: "gold", eyebrow: "Nuevo · edición Derek Lunsford", title: "Recién <b>llegados</b>",
        text: "Venom y Venom Essential Sour Gummy, e Iso Phorm Cinnamon Roll, a precio de lanzamiento desde " + money(Math.min(...launches.map((p) => p.price))) + ".",
        ctas: '<a class="btn btn--lg" href="' + X.url.shop("q=nuevo") + '">Ver lanzamientos <span class="arrow">→</span></a><button class="btn btn--ghost btn--lg" data-add="dp-venom-dl">Agregar Venom DL</button>',
        media: fan(["dp-venom-essential-dl", "dp-venom-dl", "dp-iso-phorm-cinnamon"]) },
      { id: "pre", theme: "fire", eyebrow: inCat("preentrenos").length + " pre-entrenos · Dragon Pharma y ProSupps", title: "Pre-entrenos desde <b>" + money(minOf("preentrenos")) + "</b>",
        text: "La familia Venom completa, Mr. Veinz para un pump extremo y Hyde Xtreme. ¿No sabés cuál? LeonIA te ayuda a elegir.",
        ctas: '<a class="btn btn--lg" href="' + X.url.shop("cat=preentrenos") + '">Ver pre-entrenos <span class="arrow">→</span></a><button class="btn btn--ghost btn--lg" data-open-chat data-ask="¿Qué pre-entreno me conviene?">Elegir con LeonIA</button>',
        media: fan(["dp-mr-veinz", "dp-venom", "ps-hyde-xtreme"]) },
      { id: "coach", theme: "coach", eyebrow: "LeonIA Coach · gratis", title: "Tu coach con <b>IA</b>",
        text: "Contale tu objetivo y te arma rutina, proteína diaria y suplementos para tu presupuesto. Por texto o por voz, 24/7.",
        ctas: '<button class="btn btn--lg" data-open-chat data-ask="Armá mi plan de entrenamiento">Armar mi plan <span class="arrow">→</span></button><button class="btn btn--ghost btn--lg" data-open-chat data-ask="¿Qué sucursales están abiertas ahora?">Preguntar a LeonIA</button>',
        media: '<div class="hs__leon" id="hcarLeon" data-state="idle">' + img("assets/brand/logo-1024.webp", 512, 512) + "</div>" },
      { id: "prot", theme: "red", eyebrow: inCat("proteinas").length + " proteínas · whey y aislada", title: "Proteína desde <b>" + money(minOf("proteinas")) + "</b>",
        text: "Whey Phorm, Iso Phorm y Whey ProSupps: 24–25 g de proteína por servicio, en 2 y 5 libras y sabores que dan ganas.",
        ctas: '<a class="btn btn--lg" href="' + X.url.shop("cat=proteinas") + '">Ver proteínas <span class="arrow">→</span></a><button class="btn btn--ghost btn--lg" data-open-chat data-ask="¿Cuánta proteína necesito y cuál me conviene?">¿Cuál me conviene?</button>',
        media: fan(["ps-whey-5lb", "dp-whey-phorm-cappuccino", "dp-iso-phorm-blueberry"]) },
      { id: "stores", theme: "dark", eyebrow: "Santa Cruz · 4 tiendas", title: "Vení a <b>conocernos</b>",
        text: "Ventura Mall, Cine Center, Shopping Fidalga y Ñuflo de Chávez #424. También en La Paz, El Alto, Cochabamba, Sucre, Oruro y Tarija, con envío gratis a domicilio.",
        ctas: '<a class="btn btn--lg" href="sucursales.html">Ver sucursales <span class="arrow">→</span></a><a class="btn btn--ghost btn--lg" href="tienda.html">Comprar online</a>',
        media: '<div class="hs__stores">' + ["sc-ventura-mall", "sc-shopping-fidalga", "sc-cine-center"].map((s, i) => '<span class="hs__store hs__store--' + i + '">' + img("assets/stores/" + s + ".webp", 900, 1600) + "</span>").join("") + "</div>" },
    ].filter(Boolean);
    const n = SL.length;
    track.innerHTML = SL.map((sl, i) => '<article class="hs hs--' + sl.theme + '" data-id="' + sl.id + '" role="group" aria-roledescription="diapositiva" aria-label="' + (i + 1) + " de " + n + '">' +
      '<div class="hs__in"><div class="hs__copy"><p class="eyebrow">' + sl.eyebrow + '</p><h2 class="hs__title">' + sl.title + '</h2><p class="hs__text">' + sl.text + "</p>" + (sl.extra || "") + '<div class="hs__ctas">' + sl.ctas + "</div></div>" +
      '<div class="hs__media">' + sl.media + "</div></div></article>").join("");
    bars.innerHTML = SL.map((sl, i) => '<button role="tab" class="hcar__bar" aria-label="Ir a la diapositiva ' + (i + 1) + '"><i></i></button>').join("");
    const slides = [...track.children], barEls = [...bars.children];
    const cd = track.querySelector("[data-cd]"); if (cd) X.countdown(cd);

    const DUR = 7000, reducedMotion = X.reduced;
    let idx = 0, paused = reducedMotion, hover = false, inView = true, elapsed = 0, last = performance.now();
    root.style.setProperty("--hcar-dur", DUR + "ms");
    function setActive(i) {
      idx = (i + n) % n; elapsed = 0;
      slides.forEach((s, k) => { const on = k === idx; s.classList.toggle("is-active", on); s.inert = !on; s.setAttribute("aria-hidden", String(!on));
        const v = s.querySelector("video"); if (v) { if (on) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); } });
      barEls.forEach((b, k) => { b.setAttribute("aria-selected", String(k === idx)); b.classList.toggle("done", k < idx); b.style.setProperty("--p", k < idx ? 1 : 0); });
      document.dispatchEvent(new CustomEvent("hcar:slide", { detail: { id: SL[idx].id } }));
    }
    function go(i, smooth) {
      const k = (i + n) % n;
      track.scrollTo({ left: k * track.clientWidth, behavior: smooth === false || reducedMotion ? "auto" : "smooth" });
      setActive(k);
    }
    // el desplazamiento táctil (scroll-snap) también cambia la diapositiva
    let st = 0;
    track.addEventListener("scroll", () => { cancelAnimationFrame(st); st = requestAnimationFrame(() => { const k = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); if (k !== idx) setActive(k); }); }, { passive: true });
    addEventListener("resize", () => track.scrollTo({ left: idx * track.clientWidth, behavior: "auto" }), { passive: true });
    $("#hcarPrev").addEventListener("click", () => go(idx - 1));
    $("#hcarNext").addEventListener("click", () => go(idx + 1));
    bars.addEventListener("click", (e) => { const b = e.target.closest(".hcar__bar"); if (b) go(barEls.indexOf(b)); });
    const play = $("#hcarPlay");
    function setPaused(p) { paused = p; root.classList.toggle("is-paused", p); play.setAttribute("aria-label", p ? "Reproducir carrusel" : "Pausar carrusel"); }
    play.addEventListener("click", () => setPaused(!paused));
    root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hover = true; });
    root.addEventListener("pointerleave", () => { hover = false; });
    root.addEventListener("focusin", () => { hover = true; }); root.addEventListener("focusout", () => { hover = false; });
    root.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); } });
    new IntersectionObserver((en) => { inView = en[0].isIntersecting; }, { threshold: 0.35 }).observe(root);
    // reloj del autoplay: avanza solo si está a la vista, sin hover/foco, pestaña visible y sin pausa
    (function tick(now) {
      const dt = now - last; last = now;
      if (!paused && !hover && inView && !document.hidden && !document.body.classList.contains("chat-open") && !document.documentElement.classList.contains("is-loading")) {
        elapsed += dt; barEls[idx].style.setProperty("--p", Math.min(1, elapsed / DUR));
        if (elapsed >= DUR) go(idx + 1);
      }
      requestAnimationFrame(tick);
    })(performance.now());
    setPaused(paused);
    setActive(0);
  })();

  // Categorías
  const IMG = { creatinas: "dp-creatine-200", proteinas: "dp-whey-phorm-cappuccino", preentrenos: "dp-venom-inferno", recuperacion: "dp-hydra", ellas: "dp-fema-trope", ganadores: "ps-incredibulk",
    aminoacidos: "dp-l-citrulline", quemadores: "dp-black-viper", salud: "dp-multi-rx", accesorios: "bf-shaker" };
  $("#cats").innerHTML = B.categories.filter((c) => Object.values(CAT).some((p) => p.cat === c.id)).map((c) => {
    const n = Object.values(CAT).filter((p) => p.cat === c.id).length, from = Math.min(...Object.values(CAT).filter((p) => p.cat === c.id).map((p) => p.price));
    return '<a class="cat" href="' + X.url.shop("cat=" + c.id) + '"><img src="' + esc(P(IMG[c.id]).img) + '" width="720" height="720" alt="" loading="lazy"><span><span>' + esc(c.name) + "<small>" + n + (n === 1 ? " producto" : " productos") + " · desde " + money(from) + '</small></span><span class="arrow">→</span></span></a>';
  }).join("");

  // Black Friday
  if (B.campaignActive()) {
    $("#blackfriday").hidden = false;
    $("#bfRail").innerHTML = Object.values(CAT).filter((p) => p.before).sort((a, b) => b.off - a.off).map(X.productCard).join("");
    X.countdown($("#countdown"));
  }

  // Beneficios (franja de confianza)
  const I = X.ICON, bf = B.campaignActive();
  const TRUST = [
    [I.shield, "100% originales", "Registro SENASAG", "nosotros.html"],
    [I.truck, "Envío gratis", "A domicilio · toda Bolivia", "pedido.html"],
    [bf ? I.gift : I.spark, bf ? "1 accesorio gratis" : "Promos todo el año", bf ? "Por cualquier compra" : "Seguí la tienda", bf ? "ofertas.html" : "tienda.html"],
    [I.store, "7 ciudades", "Retirá en tu sucursal", "sucursales.html"],
  ];
  $("#trust").innerHTML = TRUST.map(([ic, t, d, h]) => '<a class="trust__it" href="' + h + '">' + ic + "<span><b>" + t + "</b><small>" + d + "</small></span></a>").join("");

  // Más vendidos con pestañas (como una tienda deportiva clásica)
  const all = Object.values(CAT);
  const TABS = [
    ["top", "Destacados", (p) => true],
    ["proteinas", "Proteínas", (p) => p.cat === "proteinas"],
    ["creatinas", "Creatinas", (p) => p.cat === "creatinas"],
    ["preentrenos", "Pre-entrenos", (p) => p.cat === "preentrenos"],
  ].filter((t) => all.some(t[2]));
  const tabs = $("#topTabs"), grid = $("#topGrid");
  tabs.innerHTML = TABS.map(([k, t], i) => '<button type="button" role="tab" data-tab="' + k + '" aria-selected="' + (i === 0) + '">' + t + "</button>").join("");
  function showTab(k) {
    const t = TABS.find((x) => x[0] === k) || TABS[0];
    grid.innerHTML = all.filter(t[2]).sort((a, b) => (b.star - a.star) || (b.off - a.off)).slice(0, 8).map(X.productCard).join("");
    tabs.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === t[0])));
  }
  tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) showTab(b.dataset.tab); });
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const bs = [...tabs.children], i = bs.indexOf(document.activeElement); if (i < 0) return;
    const n = bs[(i + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length]; n.focus(); showTab(n.dataset.tab);
  });
  showTab("top");

  // Stacks (precio = suma exacta de los productos, sin descuentos inventados)
  const STACKS = [
    ["Fuerza", "Para entrenar pesado todos los días.", ["dp-creatine-200", "dp-venom-inferno"]],
    ["Volumen", "Proteína, creatina y recuperación.", ["dp-whey-phorm", "dp-creatine-60", "dp-glutamine"]],
    ["Para ellas", "La línea Hardcore Ladies, con proteína aislada y creatina con sabor.", ["dp-fema-trope", "dp-iso-phorm", "dp-creatine-lemon"]],
  ];
  $("#stacks").innerHTML = STACKS.map(([t, d, ids], i) => {
    const ps = ids.map(P), tot = ps.reduce((a, p) => a + p.price, 0), save = ps.reduce((a, p) => a + (p.save || 0), 0);
    return '<article class="stack reveal"><div class="stack__imgs">' + ps.map((p) => '<img src="' + esc(p.img) + '" width="92" height="92" alt="" loading="lazy">').join("") + "</div><h3>" + esc(t) + '</h3><p class="muted" style="margin:0">' + esc(d) + "</p><ul>" + ps.map((p) => '<li><a href="' + X.url.product(p.id) + '" style="text-decoration:none">' + esc(p.short) + "</a><span>" + money(p.price) + "</span></li>").join("") + "</ul>" +
      '<div class="stack__tot"><div><b>' + money(tot) + "</b>" + (save ? '<div class="stack__note gold">Ahorrás ' + money(save) + " vs. precio antes</div>" : "") + '</div><button class="btn" data-stack="' + i + '">Agregar todo</button></div><p class="stack__note">Precio = suma de los productos.' + (bf ? " Incluye 1 accesorio gratis por compra." : "") + "</p></article>";
  }).join("");
  $("#stacks").addEventListener("click", (e) => {
    const b = e.target.closest("[data-stack]"); if (!b) return;
    STACKS[+b.dataset.stack][2].forEach((id) => X.cart.add(id, 1, true));
    X.toast("Stack <b>" + esc(STACKS[+b.dataset.stack][0]) + "</b> agregado al carrito"); X.openCart();
  });

  // Comunidad (solo 5 reels; el resto vive en Nosotros)
  $("#reelRail").innerHTML = B.reels.slice(0, 5).map((r) => '<a class="reel" href="' + esc(r.url) + '" target="_blank" rel="noopener"><video muted playsinline loop preload="none" poster="' + esc(r.src) + '.webp" data-autoplay><source src="' + esc(r.src) + '.mp4" type="video/mp4"></video><span>' + esc(r.caption) + "</span></a>").join("");

  X.hideMbarWhileVisible($("#hero"), "hero");
  X.railButtons(); X.autoplay(); X.reveal();
})();
