/* Bolivia Fitness · traducción al inglés del sitio (selector ES/EN).
   El sitio se escribe en español; en inglés se traducen en vivo los textos visibles, aria-label,
   title, alt y placeholder con el diccionario de js/i18n-en.js (frases exactas + reglas con números).
   Un MutationObserver traduce también lo que se dibuja después (tarjetas, carrito, checkout).
   Volver a español restaura el texto original exacto. Lo marcado con [data-noi18n] y lo que
   escribe la persona o LeonIA en el chat no se toca. */
(function () {
  "use strict";
  const P = window.BFPrefs, D = window.BFI18N || { dict: {}, rules: [] };
  if (!P) return;
  const ATTRS = ["placeholder", "aria-label", "title", "alt"];
  const SKIP = "script,style,noscript,textarea,[data-noi18n],.msg,.ccard,#waPreview,.wabubble";
  const origText = new WeakMap(), origAttr = new WeakMap();
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const cache = new Map();

  function tr(raw) {
    const k = norm(raw); if (!k) return null;
    if (cache.has(k)) return cache.get(k);
    let out = Object.prototype.hasOwnProperty.call(D.dict, k) ? D.dict[k] : null;
    if (out == null) for (const [re, fn] of D.rules) { const m = k.match(re); if (m) { out = typeof fn === "function" ? fn(m, tr) : k.replace(re, fn); break; } }
    cache.set(k, out);
    return out;
  }
  const keepSpaces = (src, t) => (/^\s/.test(src) ? " " : "") + t + (/\s$/.test(src) ? " " : "");
  const skip = (el) => !el || (el.closest && el.closest(SKIP));

  function doText(node, en) {
    if (skip(node.parentElement)) return;
    if (en) {
      const src = origText.has(node) ? origText.get(node) : node.nodeValue;
      const t = tr(src); if (t == null) return;
      if (!origText.has(node)) origText.set(node, src);
      const v = keepSpaces(src, t); if (node.nodeValue !== v) node.nodeValue = v;
    } else if (origText.has(node)) { node.nodeValue = origText.get(node); origText.delete(node); }
  }
  function doAttrs(el, en) {
    if (skip(el) && !el.matches("[data-lang-toggle]")) return;
    let saved = origAttr.get(el);
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      if (el.matches("[data-lang-toggle]")) continue;
      if (en) {
        const src = saved && saved[a] != null ? saved[a] : el.getAttribute(a);
        const t = tr(src); if (t == null) continue;
        if (!saved) { saved = {}; origAttr.set(el, saved); }
        if (saved[a] == null) saved[a] = src;
        if (el.getAttribute(a) !== t) el.setAttribute(a, t);
      } else if (saved && saved[a] != null) { el.setAttribute(a, saved[a]); delete saved[a]; }
    }
  }
  function walk(root, en) {
    if (root.nodeType === 3) { doText(root, en); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    doAttrs(root, en);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeType === 1 && n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n, en); else doAttrs(n, en); }
  }
  let titleOrig = null, busy = false;
  function apply() {
    const en = P.lang === "en";
    busy = true;
    walk(document.body, en);
    if (en) { if (titleOrig == null) titleOrig = document.title; const t = tr(titleOrig); if (t) document.title = t; }
    else if (titleOrig != null) { document.title = titleOrig; titleOrig = null; }
    mo.takeRecords(); // descarta los cambios que hicimos nosotros
    busy = false;
    document.documentElement.classList.remove("i18n-pending");
  }
  const mo = new MutationObserver((muts) => {
    if (busy || P.lang !== "en") return;
    busy = true;
    for (const m of muts) {
      if (m.type === "characterData") { const n = m.target; origText.delete(n); doText(n, true); }
      else if (m.type === "attributes") { const s = origAttr.get(m.target); if (s) delete s[m.attributeName]; doAttrs(m.target, true); }
      else m.addedNodes.forEach((n) => walk(n, true));
    }
    mo.takeRecords();
    busy = false;
  });
  function start() {
    apply();
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  P.onChange((kind) => { if (kind === "lang") apply(); });
  window.BFT = { t: (s) => (P.lang === "en" ? tr(s) || s : s), tr };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
