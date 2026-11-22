/* Bolivia Fitness · preferencias de tema (claro/oscuro) e idioma (es/en).
   Se carga en <head> ANTES del CSS para que la página pinte directo con el tema correcto.
   Por defecto sigue al sistema (prefers-color-scheme) y al idioma del navegador;
   lo que elige la persona queda guardado en este dispositivo. */
(function () {
  "use strict";
  var KT = "bf_theme", KL = "bf_lang", root = document.documentElement;
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } }
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  var theme = read(KT) || (mq && mq.matches ? "dark" : "light");
  var lang = read(KL) || (/^es\b/i.test(navigator.language || "es") ? "es" : (/^en\b/i.test(navigator.language || "") ? "en" : "es"));
  var subs = [];
  function apply() {
    root.setAttribute("data-theme", theme);
    root.setAttribute("lang", lang === "en" ? "en" : "es-BO");
    root.style.colorScheme = theme;
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", theme === "dark" ? "#0b0b0b" : "#000000");
  }
  apply();
  // en inglés, ocultar un instante hasta que js/i18n.js traduzca (sin parpadeo de español)
  if (lang === "en") { root.classList.add("i18n-pending"); setTimeout(function () { root.classList.remove("i18n-pending"); }, 1500); }
  // si la persona no eligió tema, acompaña los cambios del sistema
  if (mq && !read(KT)) (mq.addEventListener ? mq.addEventListener("change", function (e) { if (read(KT)) return; theme = e.matches ? "dark" : "light"; apply(); emit("theme"); }) : null);
  function emit(kind) { subs.forEach(function (fn) { try { fn(kind, { theme: theme, lang: lang }); } catch (e) { /* noop */ } }); }
  window.BFPrefs = {
    get theme() { return theme; },
    get lang() { return lang; },
    setTheme: function (t) { theme = t === "dark" ? "dark" : "light"; write(KT, theme); apply(); emit("theme"); },
    toggleTheme: function () { this.setTheme(theme === "dark" ? "light" : "dark"); },
    setLang: function (l) { lang = l === "en" ? "en" : "es"; write(KL, lang); apply(); emit("lang"); },
    toggleLang: function () { this.setLang(lang === "en" ? "es" : "en"); },
    onChange: function (fn) { subs.push(fn); },
  };
})();
