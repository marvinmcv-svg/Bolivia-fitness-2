/* LeonIA · endpoint /api/leonia
   POST { messages, state, channel: "text"|"voice" } → NDJSON (una línea por evento).
   Proveedor: LEONIA_PROVIDER fuerza uno; si no, NVIDIA si hay NVIDIA_API_KEY, si no Anthropic si hay ANTHROPIC_API_KEY. */
"use strict";
const { runTool, anthropicTools, openaiTools, createSession, isYes } = require("./_tools");
const { SYSTEM, liveContext } = require("./_prompt");
const { egg } = require("./_persona");
const B = require("../js/data.js");

const MAX_ROUNDS = 6;
const TERMINAL = new Set(["show_options", "request_location", "handoff_to_human"]);
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 15;
}
function pickProvider(env) {
  const forced = (env.LEONIA_PROVIDER || "").toLowerCase();
  if (forced === "nvidia") return env.NVIDIA_API_KEY ? "nvidia" : null;
  if (forced === "anthropic") return env.ANTHROPIC_API_KEY ? "anthropic" : null;
  if (env.NVIDIA_API_KEY) return "nvidia";
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}
function cleanMessages(raw) {
  const out = (Array.isArray(raw) ? raw : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-16).map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  while (out.length && out[0].role !== "user") out.shift();
  // fusiona turnos consecutivos del mismo rol
  const merged = [];
  for (const m of out) { const last = merged[merged.length - 1]; if (last && last.role === m.role) last.content += "\n" + m.content; else merged.push(Object.assign({}, m)); }
  return merged;
}
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  let data = ""; for await (const c of req) { data += c; if (data.length > 200000) break; }
  try { return JSON.parse(data || "{}"); } catch (e) { return {}; }
}
function json(res, code, obj) { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); }

/* Texto: separa párrafos entre rondas de herramientas solo si la frase anterior terminó. */
function textWriter(send) {
  let all = "", roundStarted = false;
  return {
    newRound() { roundStarted = false; },
    write(t) {
      if (!t) return;
      if (!roundStarted) { roundStarted = true; if (all && /[.!?…)\]”"🦁💪🔥🙂😄]\s*$/u.test(all) && !/^\s/.test(t)) t = "\n\n" + t; }
      all += t; send({ type: "text", text: t });
    },
    get text() { return all; },
  };
}
/* Quita bloques <think>…</think> que algunos modelos NIM escriben en el contenido. */
function thinkFilter(write) {
  let inThink = false, buf = "";
  return (chunk) => {
    buf += chunk; let out = "";
    for (;;) {
      if (inThink) { const e = buf.indexOf("</think>"); if (e < 0) { buf = buf.slice(-8); return write(out); } buf = buf.slice(e + 8); inThink = false; }
      const s = buf.indexOf("<think>"); if (s < 0) { const keep = buf.lastIndexOf("<"); if (keep >= 0 && buf.length - keep < 8) { out += buf.slice(0, keep); buf = buf.slice(keep); } else { out += buf; buf = ""; } return write(out); }
      out += buf.slice(0, s); buf = buf.slice(s + 7); inThink = true;
    }
  };
}

async function runAnthropic({ ctx, history, channel, send, tool, tw, env }) {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = channel === "voice" ? (env.LEONIA_VOICE_MODEL || "claude-haiku-5-5") : (env.LEONIA_MODEL || "claude-sonnet-5-5");
  // Fallback del servidor ante rechazos (solo Sonnet 5.5). LEONIA_FALLBACKS=off lo desactiva.
  let useFallback = model === "claude-sonnet-5-5" && env.LEONIA_FALLBACKS !== "off";
  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  let retries = 0;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const params = {
      model, max_tokens: 16000,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }, { type: "text", text: liveContext(ctx, channel) }],
      tools: anthropicTools(), messages, output_config: { effort: "low" },
    };
    tw.newRound();
    let msg;
    try {
      const stream = useFallback
        ? client.beta.messages.stream(Object.assign({}, params, { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }))
        : client.messages.stream(params);
      stream.on("text", (d) => tw.write(d));
      msg = await stream.finalMessage();
      retries = 0;
    } catch (err) {
      if (useFallback && err instanceof Anthropic.BadRequestError) { useFallback = false; round--; continue; }
      if (err instanceof Anthropic.APIError || retries++ >= 2) throw err;
      round--; continue; // entrada de herramienta ilegible o conexión cortada: reintenta el turno
    }
    if (msg.stop_reason === "refusal") { if (!tw.text) tw.write("Con eso no puedo ayudarte 🙏 ¿Te muestro creatinas, proteínas o pre-entrenos?"); break; }
    const uses = msg.content.filter((b) => b.type === "tool_use");
    if (!uses.length || msg.stop_reason === "max_tokens") break;
    messages.push({ role: "assistant", content: msg.content });
    const results = uses.map((u) => ({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(tool(u.name, u.input)) }));
    messages.push({ role: "user", content: results });
  }
}

async function runNvidia({ ctx, history, channel, send, tool, tw, env }) {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: env.NVIDIA_API_KEY, baseURL: "https://integrate.api.nvidia.com/v1" });
  const model = env.LEONIA_NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";
  const messages = [{ role: "system", content: SYSTEM + "\n\n" + liveContext(ctx, channel) }].concat(history);
  for (let round = 0; round < MAX_ROUNDS; round++) {
    tw.newRound();
    // Nemotron razona en reasoning_content (no se muestra). Con razonamiento sigue las reglas mucho mejor
    // (sin esto agregaba a la bolsa sin permiso y filtraba notas internas), así que va activado por defecto.
    // LEONIA_THINKING=off lo desactiva.
    const think = env.LEONIA_THINKING !== "off";
    const stream = await client.chat.completions.create({ model, messages, tools: openaiTools(), tool_choice: "auto", stream: true,
      temperature: think ? 0.6 : 0.4, top_p: 0.95, max_tokens: think ? 6000 : 900, chat_template_kwargs: { enable_thinking: think } });
    const calls = []; let text = "";
    const write = thinkFilter((t) => { text += t; tw.write(t); });
    for await (const chunk of stream) {
      const d = chunk.choices && chunk.choices[0] && chunk.choices[0].delta; if (!d) continue;
      if (d.content) write(d.content);
      for (const tc of d.tool_calls || []) {
        const i = tc.index || 0; calls[i] = calls[i] || { id: "", name: "", args: "" };
        if (tc.id) calls[i].id = tc.id;
        if (tc.function && tc.function.name) calls[i].name += tc.function.name;
        if (tc.function && tc.function.arguments) calls[i].args += tc.function.arguments;
      }
    }
    const real = calls.filter(Boolean).map((c, i) => Object.assign(c, { id: c.id || "call_" + round + "_" + i }));
    if (!real.length) break;
    const terminal = real.every((c) => TERMINAL.has(c.name));
    messages.push({ role: "assistant", content: text || null, tool_calls: real.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args || "{}" } })) });
    for (const c of real) {
      let args; try { args = JSON.parse(c.args || "{}"); } catch (e) { args = null; }
      const result = args ? tool(c.name, args) : { error: "Argumentos JSON inválidos." };
      messages.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(result) });
    }
    // Botones/ubicación/derivación cierran el turno: otra ronda solo repetiría el mensaje.
    if (terminal && text.trim()) break;
  }
}

/* Si el modelo terminó sin botones, se ofrecen los que corresponden a la etapa (nunca los de bienvenida a mitad de charla). */
function fallbackOptions(ctx) {
  const st = ctx.state, o = st.order, hasCart = Object.keys(st.cart).length > 0, used = ctx.used;
  if (st.stage === "awaiting_confirmation" || ctx.autoPlaced || st.stage === "placed") return null;
  if (used.has("coach_plan") && !used.has("cart_add")) return ["Agregar el stack a la bolsa", "Ver la rutina completa", "Cómo tomar cada uno"];
  if (hasCart && !o.service) return ["Delivery a domicilio", "Retiro en sucursal", "Envío a otra ciudad"];
  if (hasCart && o.service && !o.branch && o.service !== "national") return B.branches.slice(0, 4).map((b) => b.name);
  if (used.has("supplement_guide")) return ["Agregar a la bolsa", "Armá mi plan", "¿Qué más me conviene?"];
  if (used.has("get_branches") || used.has("get_services")) return ["Ver promos", "Armá mi plan", "Hablar con una persona"];
  if (st.profile && st.profile.goal && !used.has("coach_plan")) return null; // está juntando datos para el plan: que responda libre
  return null;
}

async function handler(req, res, opts) {
  const env = (opts && opts.env) || process.env;
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return json(res, 405, { error: "method_not_allowed" }); }
  const provider = (opts && opts.provider) || pickProvider(env);
  if (!provider) return json(res, 503, { error: "not_configured" });
  const ip = String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "?").split(",")[0].trim();
  if (rateLimited(ip)) return json(res, 429, { error: "rate_limited" });

  const body = await readBody(req);
  const history = cleanMessages(body.messages);
  if (!history.length || history[history.length - 1].role !== "user") return json(res, 400, { error: "bad_request" });
  const channel = body.channel === "voice" ? "voice" : "text";
  const ctx = createSession(body.state, (opts && opts.now) || new Date());
  ctx.lang = body.lang === "en" ? "en" : "es";

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");
  let sentOptions = false;
  const send = (ev) => { if (ev.type === "options") sentOptions = true; try { res.write(JSON.stringify(ev) + "\n"); } catch (e) { /* cliente cerró */ } };
  const flush = () => { while (ctx.events.length) send(ctx.events.shift()); };

  /* Guardia 1: la confirmación la aplica el servidor, no el modelo. */
  const lastUser = history[history.length - 1].content;
  const tokenAtStart = ctx.state.stage === "awaiting_confirmation" ? ctx.state.token : null;
  const saidYes = !!tokenAtStart && isYes(lastUser);
  if (saidYes) { const r = runTool(ctx, "place_order", { token: tokenAtStart }); if (r.ok) ctx.autoPlaced = { id: r.id }; flush(); }
  const tool = (name, args) => {
    if (name === "place_order") {
      if (!(saidYes && tokenAtStart && args && args.token === tokenAtStart)) return { error: "Bloqueado: el pedido se envía solo cuando el cliente responde 'sí' a un resumen mostrado antes. Mostrá el resumen con prepare_order y esperá su respuesta." };
    }
    ctx.used.add(name);
    const r = runTool(ctx, name, args); flush(); return r;
  };
  ctx.used = new Set();
  const tw = textWriter(send);
  const hint = egg(lastUser);
  if (hint) ctx.eggHint = hint;

  try {
    const run = provider === "nvidia" ? runNvidia : runAnthropic;
    await ((opts && opts.run) || run)({ ctx, history: hint ? history.slice(0, -1).concat([{ role: "user", content: lastUser + "\n\n(Sugerencia de marca para responder: " + hint + ")" }]) : history, channel, send, tool, tw, env });
    if (!tw.text.trim() && ctx.autoPlaced) tw.write("¡Pedido listo! Tocá el botón verde para enviarlo por WhatsApp 🦁");
  } catch (err) {
    console.log(JSON.stringify({ evt: "leonia_error", provider, status: err && err.status, msg: String(err && err.message).slice(0, 200) }));
    if (ctx.autoPlaced && !tw.text) tw.write("¡Pedido listo! Tocá el botón verde para enviarlo por WhatsApp 🦁");
    else send({ type: "error", kind: err && err.status === 429 ? "rate_limited" : "upstream" });
  }
  flush();
  // pedido confirmado en este turno → queda registrado en el CRM (máx. 2,5 s; si falla, el cliente igual tiene su WhatsApp)
  if (ctx.state.placed && (ctx.autoPlaced || ctx.used.has("place_order")) && !(opts && opts.noCrm)) {
    try { await Promise.race([require("./crm").recordFromLeonia(ctx.state, ctx.now), new Promise((r) => setTimeout(r, 2500))]); }
    catch (e) { console.log(JSON.stringify({ evt: "crm_leonia_error", msg: String(e && e.message).slice(0, 200) })); }
  }
  if (!sentOptions && tw.text.trim()) { const o = fallbackOptions(ctx); if (o) send({ type: "options", options: o }); }
  send({ type: "state", state: ctx.state });
  res.end();
}

module.exports = handler;
module.exports.default = handler;
module.exports._internals = { cleanMessages, pickProvider, textWriter, thinkFilter };
