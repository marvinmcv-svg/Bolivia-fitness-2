/* Bolivia Fitness · CRM (sin build). Datos en /api/crm (Vercel Blob privado).
   Módulos: Inicio · Pedidos (tablero) · Clientes (perfil 360°) · Recompras · Inventario (lotes FEFO)
   · Campañas WhatsApp · Tareas · Reportes · Ajustes. Español/inglés y modo noche con js/prefs.js. */
(function () {
  "use strict";
  const P = window.BFPrefs || { lang: "es", theme: "light", onChange() {}, toggleLang() {}, toggleTheme() {} };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAY = 86400000;

  /* ------------------------------------------------------------------ idioma */
  const EN = {
    "Inicio": "Home", "Pedidos": "Orders", "Clientes": "Customers", "Recompras": "Restock", "Inventario": "Inventory", "Campañas": "Campaigns", "Tareas": "Tasks", "Reportes": "Reports", "Ajustes": "Settings",
    "Buscar clientes, teléfonos o pedidos…": "Search customers, phones or orders…", "Salir": "Log out", "Ir a la tienda": "Go to store", "Menú": "Menu",
    "Entrar": "Sign in", "Contraseña": "Password", "Tu nombre": "Your name", "Contraseña incorrecta.": "Wrong password.", "Demasiados intentos. Esperá unos minutos.": "Too many attempts. Wait a few minutes.",
    "El CRM todavía no está configurado (faltan CRM_PASSWORD y CRM_SECRET).": "The CRM isn't configured yet (CRM_PASSWORD and CRM_SECRET are missing).",
    "Panel de clientes": "Customer hub", "Todo lo de tus clientes, pedidos y stock, en un solo lugar.": "Everything about your customers, orders and stock, in one place.",
    "Pedidos del sitio y de LeonIA entran solos": "Website and LeonIA orders arrive automatically", "Recordatorios de recompra por WhatsApp": "Restock reminders on WhatsApp",
    "Stock por lote y vencimiento (FEFO)": "Stock by lot and expiry (FEFO)", "Segmentos, niveles y campañas": "Segments, tiers and campaigns",
    "Hola": "Hi", "Nuevo pedido": "New order", "Nuevo cliente": "New customer", "Ventas hoy": "Sales today", "Ventas del mes": "Sales this month", "vs. mes anterior": "vs. last month",
    "Pedidos abiertos": "Open orders", "Ticket promedio (30 d)": "Avg. order (30 d)", "Clientes nuevos (mes)": "New customers (month)", "Tasa de recompra": "Repeat rate",
    "clientes con 2+ compras": "customers with 2+ orders", "por confirmar": "to confirm", "Ventas · últimos 30 días": "Sales · last 30 days", "Para hoy": "For today",
    "Todo al día. 🦁": "All caught up. 🦁", "pedidos nuevos por confirmar": "new orders to confirm", "recompras vencidas": "overdue restocks", "tareas vencidas o para hoy": "tasks overdue or due today",
    "lotes vencen pronto": "lots expiring soon", "productos con stock bajo": "products low on stock", "cumpleaños esta semana": "birthdays this week",
    "Pedidos recientes": "Recent orders", "Top productos (30 d)": "Top products (30 d)", "Ventas por canal (30 d)": "Sales by channel (30 d)", "Ver todos": "See all",
    "Empezá a usar tu CRM": "Start using your CRM", "Todavía no hay datos. Los pedidos del sitio y de LeonIA van a aparecer acá solos. Para explorar todas las funciones, cargá datos de ejemplo (se borran con un clic).": "No data yet. Website and LeonIA orders will show up here automatically. To explore every feature, load sample data (removable in one click).",
    "Cargar datos de ejemplo": "Load sample data", "Borrar datos de ejemplo": "Remove sample data", "Datos de ejemplo cargados": "Sample data loaded", "Datos de ejemplo borrados": "Sample data removed",
    // estados y opciones
    "nuevo": "new", "confirmado": "confirmed", "preparado": "packed", "enviado": "shipped", "entregado": "delivered", "cancelado": "cancelled",
    "Nuevo": "New", "Confirmado": "Confirmed", "Preparado": "Packed", "Enviado": "Shipped", "Entregado": "Delivered", "Cancelado": "Cancelled",
    "web": "Website", "leonia": "LeonIA", "whatsapp": "WhatsApp", "tienda": "In store", "instagram": "Instagram", "telefono": "Phone", "otro": "Other", "referido": "Referral", "evento": "Event", "demo": "Demo",
    "delivery": "Delivery", "pickup": "Pickup", "national": "Nationwide", "qr": "QR", "efectivo": "Cash", "transferencia": "Transfer", "tarjeta": "Card",
    "masa": "Build muscle", "grasa": "Lose fat", "rendimiento": "Performance", "salud": "Health", "principiante": "Beginner",
    "prospecto": "Prospect", "vip": "VIP", "activo": "Active", "riesgo": "At risk", "perdido": "Lost", "nuevo_seg": "New",
    "oro": "Gold", "plata": "Silver", "bronce": "Bronze", "baja": "low", "normal": "normal", "alta": "high",
    // pedidos
    "Tablero": "Board", "Lista": "List", "Todos los canales": "All channels", "Todas las sucursales": "All stores", "Todo el tiempo": "All time", "Últimos 7 días": "Last 7 days", "Últimos 30 días": "Last 30 days", "Últimos 90 días": "Last 90 days",
    "Buscar pedido o cliente…": "Search order or customer…", "Pedido": "Order", "Cliente": "Customer", "Canal": "Channel", "Sucursal": "Store", "Estado": "Status", "Total": "Total", "Fecha": "Date", "Pago": "Payment",
    "pagado": "paid", "pendiente": "pending", "Sin pedidos con estos filtros.": "No orders match these filters.", "Arrastrá las tarjetas para cambiar el estado.": "Drag cards to change status.",
    "Editar pedido": "Edit order", "Productos": "Products", "Agregar producto": "Add product", "Producto": "Product", "Cant.": "Qty", "Precio": "Price", "Quitar": "Remove",
    "Descuento (Bs)": "Discount (Bs)", "Subtotal": "Subtotal", "Entrega": "Fulfillment", "Dirección": "Address", "Forma de pago": "Payment method", "Pagado": "Paid", "Regalo": "Gift", "Nota": "Note",
    "Atendido por": "Handled by", "Guardar": "Save", "Cancelar": "Cancel", "Eliminar": "Delete", "Cerrar": "Close", "Cliente existente": "Existing customer", "o cliente nuevo": "or new customer",
    "Elegí un cliente": "Choose a customer", "Nombre": "Name", "Teléfono / WhatsApp": "Phone / WhatsApp", "Avisar por WhatsApp": "Notify on WhatsApp", "Historial": "History",
    "Lotes usados (FEFO)": "Lots used (FEFO)", "Sin stock registrado para": "No recorded stock for", "Pedido guardado": "Order saved", "Agregá al menos un producto.": "Add at least one product.",
    "¿Eliminar este pedido? Si ya descontó stock, se devuelve a los lotes.": "Delete this order? If stock was deducted, it goes back to the lots.", "Pedido eliminado": "Order deleted",
    "Sin pago": "No payment", "Elegí": "Choose", "Ninguna": "None",
    // clientes
    "Todos los segmentos": "All segments", "Todos los objetivos": "All goals", "Etiqueta": "Tag", "Buscar nombre, teléfono, email…": "Search name, phone, email…", "Importar CSV": "Import CSV", "Exportar CSV": "Export CSV",
    "Segmento": "Segment", "Nivel": "Tier", "Compras": "Orders", "Valor (LTV)": "Value (LTV)", "Última compra": "Last purchase", "Acepta WhatsApp": "WhatsApp opt-in", "sí": "yes", "no": "no",
    "Sin clientes con estos filtros.": "No customers match these filters.", "Editar cliente": "Edit customer", "Email": "Email", "Objetivo": "Goal", "Origen": "Source", "Cumpleaños": "Birthday",
    "Etiquetas (separadas por coma)": "Tags (comma-separated)", "Notas": "Notes", "Acepta recordatorios y promos por WhatsApp": "Opted in to reminders and deals on WhatsApp",
    "Ya existe un cliente con ese teléfono.": "A customer with that phone already exists.", "Cliente guardado": "Customer saved", "Cliente eliminado": "Customer deleted",
    "¿Eliminar este cliente y sus datos personales? Sus pedidos quedan anonimizados para la contabilidad.": "Delete this customer and their personal data? Their orders stay, anonymized, for accounting.",
    "Puntos": "Points", "Ticket prom.": "Avg. order", "Cliente desde": "Customer since", "Mensaje rápido": "Quick message", "Recordar recompra": "Restock reminder", "Volver a comprar": "Win back",
    "Post-venta": "Post-sale", "Saludo de cumpleaños": "Birthday greeting", "Actividad": "Activity", "Agregar nota": "Add note", "Escribí una nota, llamada o visita…": "Write a note, call or visit…",
    "Nota agregada": "Note added", "Sin actividad todavía.": "No activity yet.", "Sin pedidos todavía.": "No orders yet.", "Recompras de este cliente": "This customer's restocks",
    "Ajuste de puntos": "Points adjustment", "llamada": "call", "visita": "visit", "nota": "note", "recordatorio": "reminder", "Importados": "Imported", "nuevos": "new", "actualizados": "updated", "omitidos": "skipped",
    "Elegí un archivo CSV con columnas nombre, telefono, email, ciudad, cumpleanos, etiquetas.": "Choose a CSV file with columns name, phone, email, city, birthday, tags.", "Archivo CSV": "CSV file", "Importar": "Import",
    // recompras
    "Clientes que deberían estar terminando su suplemento, calculado con los servicios del envase y el uso diario por categoría.": "Customers who should be running out of their supplement, based on servings per tub and daily usage by category.",
    "Vencidas": "Overdue", "Esta semana": "This week", "Próximas": "Upcoming", "Contactadas": "Contacted", "Compró": "Bought", "Se termina": "Runs out", "hace": "ago", "en": "in", "días": "days", "hoy": "today",
    "Enviar WhatsApp": "Send WhatsApp", "Marcar contactado": "Mark contacted", "Crear pedido": "Create order", "Nada pendiente en esta lista.": "Nothing pending in this list.",
    "Recuperar clientes": "Win back customers", "Clientes en riesgo o perdidos que aceptan WhatsApp.": "At-risk or lost customers who opted in to WhatsApp.", "Recordatorio registrado": "Reminder logged",
    "sin permiso de WhatsApp": "no WhatsApp opt-in", "Sin teléfono": "No phone",
    // inventario
    "Resumen": "Summary", "Lotes": "Lots", "Vencimientos": "Expiry", "Recibir lote": "Receive lot", "Unidades": "Units", "Valor al costo": "Value at cost", "Valor de venta": "Retail value", "Por vencer": "Expiring", "Vencidos": "Expired",
    "Categoría": "Category", "Stock total": "Total stock", "Por sucursal": "By store", "Próx. vencimiento": "Next expiry", "Sin stock": "Out of stock", "Bajo": "Low", "OK": "OK",
    "Lote": "Lot", "Vence": "Expires", "Cantidad": "Quantity", "Costo unit.": "Unit cost", "Valor": "Value", "Editar lote": "Edit lot", "Lote guardado": "Lot saved", "Lote eliminado": "Lot deleted", "¿Eliminar este lote?": "Delete this lot?",
    "Número de lote": "Lot number", "Fecha de vencimiento": "Expiry date", "vencido": "expired", "Sin lotes con estos filtros.": "No lots match these filters.", "Todas las categorías": "All categories", "Elegí un producto": "Choose a product",
    "Se descuenta solo cuando un pedido pasa a Preparado, primero del lote que vence antes (FEFO).": "Stock is deducted when an order moves to Packed, first from the lot that expires soonest (FEFO).",
    // campañas
    "Mensajes de WhatsApp a un segmento, con cola de envío uno por uno (respeta el permiso de cada cliente).": "WhatsApp messages to a segment, with a one-by-one send queue (respects each customer's opt-in).",
    "Nueva campaña": "New campaign", "Destinatarios": "Recipients", "Enviados": "Sent", "Abrir": "Open", "Editar campaña": "Edit campaign", "Nombre de la campaña": "Campaign name", "Compró la categoría": "Bought category",
    "Solo clientes que aceptan WhatsApp": "Only opted-in customers", "Mensaje": "Message", "Variables": "Variables", "Vista previa": "Preview", "Campaña guardada": "Campaign saved", "Todavía no hay campañas.": "No campaigns yet.",
    "Marcar enviado": "Mark sent", "Enviado ✓": "Sent ✓", "¿Eliminar esta campaña?": "Delete this campaign?", "Campaña eliminada": "Campaign deleted", "Cualquiera": "Any",
    // tareas
    "Nueva tarea": "New task", "Para hoy y vencidas": "Today & overdue", "Hechas": "Done", "Título": "Title", "Vence el": "Due", "Responsable": "Assignee", "Prioridad": "Priority", "Tarea guardada": "Task saved", "Sin tareas.": "No tasks.", "Editar tarea": "Edit task", "¿Eliminar esta tarea?": "Delete this task?", "Tarea eliminada": "Task deleted",
    // reportes
    "Período": "Period", "Ingresos": "Revenue", "Clientes únicos": "Unique customers", "Recompra recuperada": "Restock recapture", "de las recompras vencidas volvieron a comprar": "of due restocks bought again",
    "Ingresos por día": "Revenue per day", "Ingresos por semana": "Revenue per week", "Por canal": "By channel", "Por sucursal_r": "By store", "Por categoría": "By category", "Productos más vendidos": "Best-selling products", "Unid.": "Units", "Ver tabla": "View table",
    "Exportar pedidos (CSV)": "Export orders (CSV)", "7 días": "7 days", "30 días": "30 days", "90 días": "90 days", "12 meses": "12 months", "Sin ventas en este período.": "No sales in this period.",
    "Nuevos vs. recurrentes": "New vs. returning", "nuevos_c": "new", "recurrentes": "returning",
    // ajustes
    "Equipo (separado por coma)": "Team (comma-separated)", "Umbral de stock bajo": "Low-stock threshold", "Avisar vencimientos con (días)": "Warn about expiry (days ahead)", "VIP desde (Bs de LTV)": "VIP from (Bs LTV)",
    "Puntos por cada Bs": "Points per Bs", "Recordar recompra con (días de anticipación)": "Restock reminder lead time (days)", "Uso diario por categoría (servicios por día)": "Daily usage by category (servings per day)",
    "Plantillas de WhatsApp": "WhatsApp templates", "Ajustes guardados": "Settings saved", "Datos": "Data", "Descargar copia (JSON)": "Download backup (JSON)", "Registro de actividad": "Activity log",
    "Almacenamiento": "Storage", "Vercel Blob privado, con 10 versiones de respaldo por colección.": "Private Vercel Blob, with 10 backup versions per collection.", "Local (desarrollo).": "Local (development).",
    "recordatorio de recompra": "restock reminder", "volver a comprar": "win-back", "post-venta": "post-sale", "cumpleaños": "birthday", "estado del pedido": "order status",
    "creó": "created", "actualizó": "updated", "eliminó": "deleted", "importó": "imported", "pedido web": "website order", "cargó ejemplo": "loaded samples", "borró ejemplo": "removed samples",
    "Algo falló. Probá de nuevo.": "Something failed. Try again.", "Sin conexión con el servidor.": "Can't reach the server.", "Modo noche": "Night mode", "Modo claro": "Light mode", "Cambiar a inglés": "Switch to English", "Cambiar a español": "Switch to Spanish",
    "Ver perfil": "View profile", "Ticket promedio": "Avg. order", "Sin datos": "No data", "Hoy": "Today", "Ayer": "Yesterday", "Mañana": "Tomorrow", "unidades": "units", "Atrasadas": "Overdue",
  };
  // etiquetas en español de los códigos internos (en inglés salen de EN)
  const ES = { web: "Sitio web", leonia: "LeonIA", whatsapp: "WhatsApp", tienda: "Tienda", instagram: "Instagram", telefono: "Teléfono", otro: "Otro", referido: "Referido", evento: "Evento", demo: "Ejemplo",
    delivery: "Delivery", pickup: "Retiro en tienda", national: "Envío nacional", qr: "QR", efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta",
    masa: "Ganar masa", grasa: "Bajar grasa", rendimiento: "Rendimiento", salud: "Salud", principiante: "Principiante",
    prospecto: "Prospecto", vip: "VIP", activo: "Activo", riesgo: "En riesgo", perdido: "Perdido", nuevo_seg: "Nuevo", oro: "Oro", plata: "Plata", bronce: "Bronce",
    nuevos_c: "nuevos", "Por sucursal_r": "Por sucursal" };
  const t = (s) => (P.lang === "en" ? (EN[s] != null ? EN[s] : s) : (ES[s] != null ? ES[s] : s));
  const LOC = () => (P.lang === "en" ? "en-US" : "es-BO");
  const money = (n) => "Bs " + Number(n || 0).toLocaleString(LOC(), { maximumFractionDigits: 2 });
  const fdate = (iso, o) => (iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString(LOC(), o || { day: "2-digit", month: "short", year: "numeric" }) : "—");
  const ftime = (iso) => (iso ? new Date(iso).toLocaleString(LOC(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const relDays = (n) => (n === 0 ? t("hoy") : n < 0 ? (P.lang === "en" ? -n + " " + t("días") + " " + t("hace") : t("hace") + " " + -n + " " + t("días")) : t("en") + " " + n + " " + t("días"));
  const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const firstName = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const prettyPhone = (p) => (p && p.startsWith("591") && p.length === 11 ? "+591 " + p.slice(3, 6) + " " + p.slice(6) : p ? "+" + p : "");
  const wa = (phone, text) => "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);

  const I = {
    home: '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>', orders: '<path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h4"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20c-.5-2.6-2-4.4-4-5.1"/>',
    repeat: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>', box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>', send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    check: '<path d="M4 4h16v16H4z"/><path d="M8 12l3 3 5-6"/>', chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>', plus: '<path d="M12 5v14M5 12h14"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', out: '<path d="M10 4H4v16h6M14 8l4 4-4 4M18 12H9"/>',
    wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.3 2 2.2 4 4.5 4.6"/>', note: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', gift: '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7c-2-4-6-4-6-1.5S10 7 12 7zM12 7c2-4 6-4 6-1.5S14 7 12 7z"/>',
    store: '<path d="M4 10l1.5-5h13L20 10M4 10v10h16V10M4 10h16M9 20v-5h6v5"/>', cake: '<path d="M4 20h16v-7H4zM4 15c2 1.5 4-1 6 0s4 1.5 6 0 4-1.5 4 0M12 13V8M12 5v.5"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  const ic = (k) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + I[k] + "</svg>";

  const STATUSES = ["nuevo", "confirmado", "preparado", "enviado", "entregado", "cancelado"];
  const OPEN = new Set(["nuevo", "confirmado", "preparado", "enviado"]);
  const STB = { nuevo: "b-info", confirmado: "b-warn", preparado: "b-warn", enviado: "b-info", entregado: "b-ok", cancelado: "b-muted" };
  const SEGB = { vip: "b-ok", activo: "b-info", nuevo: "b-info", riesgo: "b-warn", perdido: "b-crit", prospecto: "b-muted" };
  const CHANNELS = ["web", "leonia", "whatsapp", "tienda", "instagram", "telefono", "otro"];
  const SOURCES = ["web", "leonia", "whatsapp", "tienda", "instagram", "referido", "evento", "otro"];
  const GOALS = ["masa", "grasa", "rendimiento", "salud", "principiante"];
  const SEGS = ["vip", "activo", "nuevo", "riesgo", "perdido", "prospecto"];
  const segLabel = (s) => (s === "nuevo" ? t("nuevo_seg") : t(s));
  const stLabel = (s) => t(s.charAt(0).toUpperCase() + s.slice(1));
  const badge = (cls, txt) => '<span class="badge ' + cls + '">' + esc(txt) + "</span>";

  /* ------------------------------------------------------------------ estado + API */
  const S = { db: null, user: "", D: null, route: ["inicio"], f: {} };
  async function api(op, body) {
    let r;
    try {
      r = await fetch("/api/crm?op=" + op, { method: body ? "POST" : "GET", credentials: "same-origin", headers: body ? { "Content-Type": "application/json", "X-CRM": "1" } : {}, body: body ? JSON.stringify(body) : undefined });
    } catch (e) { toast(t("Sin conexión con el servidor.")); throw e; }
    let j = {}; try { j = await r.json(); } catch (e) { /* vacío */ }
    if (r.status === 401 && op !== "login") { renderLogin(); const e = new Error("unauthorized"); e.status = 401; throw e; }
    if (!r.ok) { const e = new Error(j.error || "error"); e.status = r.status; e.data = j; throw e; }
    return j;
  }
  let toastT;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 2600); }
  const fail = (e) => { if (e && e.status !== 401) toast(t("Algo falló. Probá de nuevo.")); };

  /* ------------------------------------------------------------------ datos derivados */
  function derive() {
    const db = S.db, st = db.settings, D = {};
    const now = Date.now(), t0 = startOfDay(now);
    D.cat = Object.fromEntries(db.catalog.map((p) => [p.id, p]));
    D.cust = Object.fromEntries(db.customers.map((c) => [c.id, c]));
    D.branch = (id) => (db.branches.find((b) => b.id === id) || {}).name || "—";
    D.catName = (id) => { const c = db.categories.find((x) => x.id === id); return c ? (window.BFT ? c.name : c.name) : id; };
    const live = db.orders.filter((o) => o.status !== "cancelado");
    D.live = live;
    D.byCust = {}; for (const o of db.orders) (D.byCust[o.customerId] = D.byCust[o.customerId] || []).push(o);
    for (const k in D.byCust) D.byCust[k].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    // estadísticas por cliente
    D.stats = {};
    for (const c of db.customers) {
      const os = (D.byCust[c.id] || []).filter((o) => o.status !== "cancelado");
      const ltv = os.reduce((a, o) => a + o.total, 0), n = os.length;
      const last = n ? Date.parse(os[0].createdAt) : 0, first = n ? Date.parse(os[n - 1].createdAt) : 0;
      const rec = n ? Math.floor((now - last) / DAY) : null;
      const delivered = os.filter((o) => o.status === "entregado").reduce((a, o) => a + o.total, 0);
      const points = Math.max(0, Math.floor(delivered * (st.pointsPerBs || 0)) + (c.pointsAdj || 0));
      const tier = ltv >= 4000 ? "oro" : ltv >= 1500 ? "plata" : "bronce";
      let seg = "prospecto";
      if (n) seg = (ltv >= st.vipLtv || n >= 4) && rec <= 90 ? "vip" : n === 1 && rec <= 45 ? "nuevo" : rec <= 60 ? "activo" : rec <= 120 ? "riesgo" : "perdido";
      D.stats[c.id] = { n, ltv, last, first, rec, aov: n ? ltv / n : 0, points, tier, seg };
    }
    // recompras: por cliente y línea de producto, la compra más reciente → fecha estimada de fin
    D.reminders = [];
    for (const c of db.customers) {
      const os = (D.byCust[c.id] || []).filter((o) => o.status !== "cancelado" && o.status !== "nuevo");
      const seen = new Set();
      for (const o of os) for (const l of o.lines) {
        const p = D.cat[l.id]; if (!p || !p.servings) continue;
        const key = p.line || p.id; if (seen.has(key)) continue; seen.add(key);
        const use = (st.usage && st.usage[p.cat]) || 1;
        const days = Math.round((p.servings * l.qty) / use);
        const bought = Date.parse(o.createdAt), due = bought + days * DAY;
        const ref = c.id + ":" + key + ":" + o.id;
        const contacted = (c.timeline || []).find((x) => x.type === "reminder" && x.ref === ref);
        const delta = Math.round((startOfDay(due) - t0) / DAY);
        if (delta < -60) continue; // muy viejo: pasa a "recuperar clientes"
        D.reminders.push({ c, p, o, qty: l.qty, bought, due, delta, ref, contacted: contacted ? contacted.at : "" });
      }
    }
    D.reminders.sort((a, b) => a.due - b.due);
    const lead = st.reminderLeadDays || 0;
    D.remDue = D.reminders.filter((r) => !r.contacted && r.delta <= lead);
    // stock
    D.stock = {};
    for (const p of db.catalog) D.stock[p.id] = { total: 0, by: {}, next: "" };
    const warn = st.expiryWarnDays || 90, today = todayISO();
    const limit = new Date(now + warn * DAY).toISOString().slice(0, 10);
    D.expiring = []; D.expired = [];
    for (const l of db.lots) {
      const s = D.stock[l.productId]; if (!s) continue;
      if (l.qty > 0) {
        s.total += l.qty; s.by[l.branch] = (s.by[l.branch] || 0) + l.qty;
        if (l.expiry && (!s.next || l.expiry < s.next)) s.next = l.expiry;
        if (l.expiry && l.expiry < today) D.expired.push(l); else if (l.expiry && l.expiry <= limit) D.expiring.push(l);
      }
    }
    D.tracked = new Set(db.lots.map((l) => l.productId));
    D.low = db.catalog.filter((p) => D.tracked.has(p.id) && D.stock[p.id].total <= st.lowStock);
    // tareas
    D.tasksDue = db.tasks.filter((x) => !x.done && x.due && x.due <= today);
    // cumpleaños en los próximos 7 días
    D.bdays = db.customers.filter((c) => {
      if (!c.birthday) return false;
      const [, m, d] = c.birthday.split("-").map(Number), y = new Date().getFullYear();
      let next = new Date(y, m - 1, d).getTime(); if (next < t0) next = new Date(y + 1, m - 1, d).getTime();
      return next - t0 <= 7 * DAY;
    });
    D.newOrders = db.orders.filter((o) => o.status === "nuevo");
    S.D = D;
  }

  /* ------------------------------------------------------------------ login */
  function renderLogin(msg) {
    document.title = "CRM · Bolivia Fitness";
    let name = ""; try { name = localStorage.getItem("bf_crm_name") || ""; } catch (e) { /* noop */ }
    $("#app").innerHTML =
      '<main class="login"><section class="login__brand"><a class="logo" href="index.html"><img src="assets/img/logo.png" width="40" height="40" alt=""><span>Bolivia<b>Fitness</b></span></a>' +
      "<div><h1>CRM <b>" + esc(t("Panel de clientes")) + "</b></h1><p>" + esc(t("Todo lo de tus clientes, pedidos y stock, en un solo lugar.")) + "</p><ul>" +
      ["Pedidos del sitio y de LeonIA entran solos", "Recordatorios de recompra por WhatsApp", "Stock por lote y vencimiento (FEFO)", "Segmentos, niveles y campañas"].map((x) => "<li>" + esc(t(x)) + "</li>").join("") + "</ul></div><span></span></section>" +
      '<section class="login__form"><form class="login__card" id="loginF"><div class="row"><h2>' + esc(t("Entrar")) + '</h2><span class="spacer"></span>' + prefBtns() + "</div>" +
      '<label class="f">' + esc(t("Tu nombre")) + '<input type="text" name="name" autocomplete="name" value="' + esc(name) + '" required maxlength="40"></label>' +
      '<label class="f">' + esc(t("Contraseña")) + '<input type="password" name="password" autocomplete="current-password" required></label>' +
      '<p class="err" id="loginErr">' + esc(msg || "") + '</p><button class="btn btn--red" type="submit">' + esc(t("Entrar")) + "</button></form></section></main>";
    $("#loginF").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), nm = String(fd.get("name") || "").trim();
      try { localStorage.setItem("bf_crm_name", nm); } catch (err) { /* noop */ }
      try { await api("login", { password: fd.get("password"), name: nm }); await boot(); }
      catch (err) { $("#loginErr").textContent = err.status === 401 ? t("Contraseña incorrecta.") : err.status === 429 ? t("Demasiados intentos. Esperá unos minutos.") : err.status === 503 ? t("El CRM todavía no está configurado (faltan CRM_PASSWORD y CRM_SECRET).") : t("Algo falló. Probá de nuevo."); }
    });
    const inp = $(name ? "#loginF [name=password]" : "#loginF [name=name]"); if (inp) inp.focus();
  }
  const prefBtns = () =>
    '<button type="button" class="prefbtn" data-lang-btn aria-label="' + esc(P.lang === "en" ? t("Cambiar a español") : t("Cambiar a inglés")) + '">' + (P.lang === "en" ? "ES" : "EN") + "</button>" +
    '<button type="button" class="prefbtn" data-theme-btn aria-label="' + esc(P.theme === "dark" ? t("Modo claro") : t("Modo noche")) + '" aria-pressed="' + (P.theme === "dark") + '"><svg class="i i-moon" viewBox="0 0 24 24" aria-hidden="true">' + I.moon + '</svg><svg class="i i-sun" viewBox="0 0 24 24" aria-hidden="true">' + I.sun + "</svg></button>";

  /* ------------------------------------------------------------------ shell */
  const NAV = [["inicio", "Inicio", "home"], ["pedidos", "Pedidos", "orders"], ["clientes", "Clientes", "users"], ["recompras", "Recompras", "repeat"], ["inventario", "Inventario", "box"], ["campanas", "Campañas", "send"], ["tareas", "Tareas", "check"], ["reportes", "Reportes", "chart"], ["ajustes", "Ajustes", "gear"]];
  function renderShell() {
    const D = S.D, cnt = { pedidos: D.newOrders.length, recompras: D.remDue.length, tareas: D.tasksDue.length, inventario: D.low.length + D.expiring.length + D.expired.length };
    $("#app").innerHTML =
      '<div class="shell" id="shell"><aside class="side" aria-label="' + esc(t("Menú")) + '"><a class="logo" href="#/inicio"><img src="assets/img/logo.png" width="40" height="40" alt=""><span>Bolivia<b>Fitness</b></span></a>' +
      '<nav class="nav">' + NAV.map(([k, l, i]) => '<a href="#/' + k + '" data-nav="' + k + '">' + ic(i) + "<span>" + esc(t(l)) + "</span>" + (cnt[k] ? '<span class="cnt">' + cnt[k] + "</span>" : "") + "</a>").join("") + "</nav>" +
      '<div class="side__foot"><a href="index.html">' + esc(t("Ir a la tienda")) + " ↗</a></div></aside>" +
      '<div class="main"><header class="top"><button class="iconbtn burger" id="burger" aria-label="' + esc(t("Menú")) + '" aria-expanded="false">' + ic("menu") + "</button>" +
      '<div class="top__search">' + ic("search") + '<label class="vh" for="gsearch">' + esc(t("Buscar clientes, teléfonos o pedidos…")) + '</label><input type="search" id="gsearch" autocomplete="off" placeholder="' + esc(t("Buscar clientes, teléfonos o pedidos…")) + '"><div class="sresults" id="sresults" hidden></div></div>' +
      '<span class="spacer"></span>' + prefBtns() + '<div class="user"><span>' + esc(t("Hola")) + ", <b>" + esc(S.user) + '</b></span></div><button class="iconbtn" id="logout" aria-label="' + esc(t("Salir")) + '" title="' + esc(t("Salir")) + '">' + ic("out") + "</button></header>" +
      '<main class="view" id="view" tabindex="-1"></main></div></div>';
    $("#burger").addEventListener("click", () => { const sh = $("#shell"), o = !sh.classList.contains("nav-open"); sh.classList.toggle("nav-open", o); $("#burger").setAttribute("aria-expanded", String(o)); });
    $("#shell").addEventListener("click", (e) => { if (e.target.closest(".nav a") || e.target === $("#shell")) $("#shell").classList.remove("nav-open"); });
    $("#logout").addEventListener("click", async () => { try { await api("logout", {}); } catch (e) { /* noop */ } renderLogin(); });
    wireSearch();
  }
  function wireSearch() {
    const inp = $("#gsearch"), box = $("#sresults");
    inp.addEventListener("input", () => {
      const q = norm(inp.value); if (q.length < 2) { box.hidden = true; return; }
      const D = S.D, cs = S.db.customers.filter((c) => norm(c.name + " " + c.phone + " " + c.email).includes(q)).slice(0, 6);
      const os = S.db.orders.filter((o) => norm(o.id + " " + o.customerName).includes(q)).slice(0, 5);
      box.innerHTML = cs.map((c) => '<a href="#/cliente/' + c.id + '"><span>' + esc(c.name || prettyPhone(c.phone)) + '</span><small class="muted">' + esc(prettyPhone(c.phone)) + " · " + esc(segLabel(D.stats[c.id].seg)) + "</small></a>").join("") +
        os.map((o) => '<a href="#/pedido/' + o.id + '"><span>' + esc(o.id) + " · " + esc(o.customerName) + '</span><small class="muted">' + money(o.total) + " · " + esc(stLabel(o.status)) + "</small></a>").join("") || '<a href="#/clientes"><span class="muted">—</span></a>';
      box.hidden = false;
    });
    inp.addEventListener("keydown", (e) => { if (e.key === "Escape") { box.hidden = true; inp.blur(); } if (e.key === "ArrowDown") { const a = $("a", box); if (a) { e.preventDefault(); a.focus(); } } });
    box.addEventListener("click", () => { box.hidden = true; inp.value = ""; });
    document.addEventListener("click", (e) => { if (!e.target.closest(".top__search")) box.hidden = true; });
  }
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ------------------------------------------------------------------ router */
  function route() {
    const parts = (location.hash.replace(/^#\/?/, "") || "inicio").split("/");
    S.route = parts;
    if (!S.db) return;
    const v = parts[0];
    $$(".nav a").forEach((a) => (a.dataset.nav === (v === "cliente" ? "clientes" : v === "pedido" ? "pedidos" : v === "campana" ? "campanas" : v) ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    const R = { inicio: vHome, pedidos: vOrders, pedido: vOrders, clientes: vCustomers, cliente: vCustomer, recompras: vRestock, inventario: vInventory, campanas: vCampaigns, campana: vCampaign, tareas: vTasks, reportes: vReports, ajustes: vSettings };
    (R[v] || vHome)();
    if (v === "pedido" && parts[1]) openOrder(parts[1]);
    const vw = $("#view"); if (vw && document.activeElement === document.body) vw.focus({ preventScroll: true });
  }
  function refresh() { derive(); const y = scrollY; renderShell(); route(); scrollTo(0, y); }

  /* ------------------------------------------------------------------ gráficos (1 serie, hover con tooltip) */
  function barChart(points, fmt) {
    if (!points.length) return '<p class="muted">' + esc(t("Sin datos")) + "</p>";
    const W = 720, H = 220, padL = 52, padB = 26, n = points.length, max = Math.max(1, ...points.map((p) => p.v));
    const step = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max / step) * step;
    const bw = (W - padL) / n, inner = Math.max(2, bw - 2), y = (v) => (H - padB) - (v / top) * (H - padB - 8);
    let g = "";
    for (let k = 0; k <= 4; k++) { const v = (top / 4) * k, yy = y(v); g += '<line class="grid" x1="' + padL + '" x2="' + W + '" y1="' + yy + '" y2="' + yy + '"/><text x="' + (padL - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(fmt(v, true)) + "</text>"; }
    let bars = "";
    points.forEach((p, i) => {
      const x = padL + i * bw + 1, yy = y(p.v), h = (H - padB) - yy, r = Math.min(4, h / 2, inner / 2);
      if (h > 0.5) bars += '<path class="bar" d="M' + x + "," + (H - padB) + "V" + (yy + r) + "Q" + x + "," + yy + " " + (x + r) + "," + yy + "H" + (x + inner - r) + "Q" + (x + inner) + "," + yy + " " + (x + inner) + "," + (yy + r) + "V" + (H - padB) + 'Z"/>';
      if (n <= 14 || i % Math.ceil(n / 10) === 0) bars += '<text x="' + (x + inner / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(p.l) + "</text>";
    });
    const data = esc(JSON.stringify(points.map((p) => [p.full || p.l, fmt(p.v)])));
    return '<div class="chart" data-points="' + data + '" data-n="' + n + '" data-padl="' + padL + '" data-w="' + W + '"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(points.map((p) => (p.full || p.l) + ": " + fmt(p.v)).join(", ")) + '">' + g + bars + '</svg><div class="tip" hidden></div></div>';
  }
  function wireCharts(root) {
    $$(".chart", root).forEach((ch) => {
      const pts = JSON.parse(ch.dataset.points), n = +ch.dataset.n, padL = +ch.dataset.padl, W = +ch.dataset.w, tip = $(".tip", ch), svg = $("svg", ch);
      const show = (cx) => {
        const r = svg.getBoundingClientRect(), x = ((cx - r.left) / r.width) * W;
        const i = Math.floor(((x - padL) / (W - padL)) * n); if (i < 0 || i >= n) { tip.hidden = true; return; }
        tip.innerHTML = esc(pts[i][0]) + " · <b>" + esc(pts[i][1]) + "</b>"; tip.hidden = false;
        tip.style.left = ((padL + (i + 0.5) * ((W - padL) / n)) / W) * r.width + "px"; tip.style.top = "20px";
      };
      svg.addEventListener("pointermove", (e) => show(e.clientX));
      svg.addEventListener("pointerleave", () => (tip.hidden = true));
    });
  }
  const hbars = (rows, fmt) => {
    if (!rows.length) return '<p class="muted">' + esc(t("Sin datos")) + "</p>";
    const max = Math.max(1, ...rows.map((r) => r.v));
    return '<div class="hbars">' + rows.map((r) => '<div class="hbar"><span title="' + esc(r.l) + '">' + esc(r.l) + '</span><span class="hbar__t"><i style="width:' + ((r.v / max) * 100).toFixed(1) + '%"></i></span><b>' + esc(fmt(r.v)) + "</b></div>").join("") + "</div>";
  };
  function sumBy(orders, key) { const m = {}; for (const o of orders) { const k = key(o); m[k] = (m[k] || 0) + o.total; } return Object.entries(m).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v); }
  function dailySeries(orders, days) {
    const t0 = startOfDay(Date.now()), out = [], weekly = days > 120, buckets = weekly ? Math.ceil(days / 7) : days, span = weekly ? 7 : 1;
    for (let i = buckets - 1; i >= 0; i--) {
      const from = t0 - (i * span + span - 1) * DAY, to = t0 - i * span * DAY + DAY;
      const v = orders.filter((o) => { const x = Date.parse(o.createdAt); return x >= from && x < to; }).reduce((a, o) => a + o.total, 0);
      const d = new Date(from);
      out.push({ l: weekly ? d.toLocaleDateString(LOC(), { day: "2-digit", month: "short" }) : String(d.getDate()), full: d.toLocaleDateString(LOC(), { weekday: weekly ? undefined : "short", day: "2-digit", month: "short" }), v });
    }
    return out;
  }
  const short = (v, axis) => (axis && v >= 1000 ? (v / 1000).toLocaleString(LOC(), { maximumFractionDigits: 1 }) + "k" : money(v));

  /* ------------------------------------------------------------------ vistas */
  const view = (html) => { const v = $("#view"); v.innerHTML = html; wireCharts(v); return v; };
  const head = (title, sub, actions) => '<div class="vhead"><div><h1>' + esc(title) + "</h1>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + '</div><div class="row">' + (actions || "") + "</div></div>";
  const newBtns = () => '<button class="btn btn--ghost" data-new-customer>' + ic("plus") + esc(t("Nuevo cliente")) + '</button><button class="btn btn--red" data-new-order>' + ic("plus") + esc(t("Nuevo pedido")) + "</button>";

  // ---------- inicio
  function vHome() {
    const db = S.db, D = S.D, now = Date.now(), t0 = startOfDay(now);
    const empty = !db.customers.length && !db.orders.length;
    const d = new Date(), mStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime(), pmStart = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    const pmSame = new Date(d.getFullYear(), d.getMonth() - 1, d.getDate() + 1).getTime();
    const sum = (a, b) => D.live.filter((o) => { const x = Date.parse(o.createdAt); return x >= a && x < b; }).reduce((s, o) => s + o.total, 0);
    const salesToday = sum(t0, t0 + DAY), salesMonth = sum(mStart, now + DAY), salesPrev = sum(pmStart, Math.min(pmSame, mStart));
    const delta = salesPrev ? Math.round(((salesMonth - salesPrev) / salesPrev) * 100) : null;
    const last30 = D.live.filter((o) => now - Date.parse(o.createdAt) < 30 * DAY);
    const aov = last30.length ? last30.reduce((s, o) => s + o.total, 0) / last30.length : 0;
    const open = db.orders.filter((o) => OPEN.has(o.status)).length;
    const newC = db.customers.filter((c) => Date.parse(c.createdAt) >= mStart).length;
    const buyers = Object.values(D.stats).filter((s) => s.n >= 1).length, rep = Object.values(D.stats).filter((s) => s.n >= 2).length;
    const kpi = (l, v, s) => '<div class="kpi"><span>' + esc(t(l)) + "</span><b>" + v + "</b>" + (s ? "<small>" + s + "</small>" : "") + "</div>";
    const todo = [
      [D.newOrders.length, "pedidos nuevos por confirmar", "#/pedidos", "orders"], [D.remDue.length, "recompras vencidas", "#/recompras", "repeat"],
      [D.tasksDue.length, "tareas vencidas o para hoy", "#/tareas", "check"], [D.expiring.length + D.expired.length, "lotes vencen pronto", "#/inventario/vencimientos", "alert"],
      [D.low.length, "productos con stock bajo", "#/inventario", "box"], [D.bdays.length, "cumpleaños esta semana", "#/clientes?bday=1", "cake"],
    ].filter((x) => x[0]);
    const topP = {}; for (const o of last30) for (const l of o.lines) topP[l.id] = (topP[l.id] || 0) + l.qty * l.price;
    view(head(t("Hola") + ", " + S.user, new Date().toLocaleDateString(LOC(), { weekday: "long", day: "numeric", month: "long" }), newBtns()) +
      (empty ? '<section class="card"><div class="empty"><b>' + esc(t("Empezá a usar tu CRM")) + "</b><p>" + esc(t("Todavía no hay datos. Los pedidos del sitio y de LeonIA van a aparecer acá solos. Para explorar todas las funciones, cargá datos de ejemplo (se borran con un clic).")) + '</p><button class="btn btn--red" data-demo="load">' + esc(t("Cargar datos de ejemplo")) + "</button></div></section>" : "") +
      '<section class="kpis" aria-label="KPI">' +
      kpi("Ventas hoy", money(salesToday)) +
      kpi("Ventas del mes", money(salesMonth), delta == null ? "" : '<span class="delta ' + (delta >= 0 ? "up" : "down") + '">' + (delta >= 0 ? "▲ " : "▼ ") + Math.abs(delta) + "%</span> " + esc(t("vs. mes anterior"))) +
      kpi("Pedidos abiertos", open, D.newOrders.length + " " + esc(t("por confirmar"))) + kpi("Ticket promedio (30 d)", money(aov)) +
      kpi("Clientes nuevos (mes)", newC) + kpi("Tasa de recompra", (buyers ? Math.round((rep / buyers) * 100) : 0) + "%", esc(t("clientes con 2+ compras"))) + "</section>" +
      '<div class="cols2"><section class="card"><h2>' + esc(t("Ventas · últimos 30 días")) + "</h2>" + barChart(dailySeries(D.live, 30), short) + "</section>" +
      '<section class="card"><h2>' + esc(t("Para hoy")) + '</h2><div class="list">' + (todo.length ? todo.map(([n, l, h, i]) => '<a class="li" href="' + h + '">' + ic(i) + "<div><b>" + n + " " + esc(t(l)) + "</b></div><span>→</span></a>").join("") : '<p class="muted">' + esc(t("Todo al día. 🦁")) + "</p>") + "</div></section></div>" +
      '<div class="cols3"><section class="card"><h2>' + esc(t("Pedidos recientes")) + ' <a class="small" href="#/pedidos">' + esc(t("Ver todos")) + '</a></h2><div class="list">' +
      (db.orders.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6).map((o) => '<a class="li" href="#/pedido/' + o.id + '"><div><b>' + esc(o.customerName || "—") + "</b><small>" + esc(o.id) + " · " + esc(t(o.channel)) + " · " + ftime(o.createdAt) + "</small></div>" + badge(STB[o.status], stLabel(o.status)) + "</a>").join("") || '<p class="muted">' + esc(t("Sin pedidos todavía.")) + "</p>") + "</div></section>" +
      '<section class="card"><h2>' + esc(t("Top productos (30 d)")) + "</h2>" + hbars(Object.entries(topP).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, v]) => ({ l: (D.cat[id] || {}).short || id, v })), money) + "</section>" +
      '<section class="card"><h2>' + esc(t("Ventas por canal (30 d)")) + "</h2>" + hbars(sumBy(last30, (o) => t(o.channel)), money) + "</section></div>");
  }

  // ---------- pedidos
  function vOrders() {
    const db = S.db, D = S.D, f = (S.f.orders = S.f.orders || { mode: "board", q: "", ch: "", br: "", per: "30" });
    const per = +f.per || 0, now = Date.now();
    const list = db.orders.filter((o) => (!f.ch || o.channel === f.ch) && (!f.br || o.branch === f.br) && (!per || now - Date.parse(o.createdAt) < per * DAY) && (!f.q || norm(o.id + " " + o.customerName + " " + o.phone).includes(norm(f.q))))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const opt = (v, l, cur) => '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(l) + "</option>";
    const filters = '<div class="filters"><label class="vh" for="oq">' + esc(t("Buscar pedido o cliente…")) + '</label><input type="search" id="oq" placeholder="' + esc(t("Buscar pedido o cliente…")) + '" value="' + esc(f.q) + '">' +
      '<select id="och" aria-label="' + esc(t("Canal")) + '">' + opt("", t("Todos los canales"), f.ch) + CHANNELS.map((c) => opt(c, t(c), f.ch)).join("") + "</select>" +
      '<select id="obr" aria-label="' + esc(t("Sucursal")) + '">' + opt("", t("Todas las sucursales"), f.br) + db.branches.map((b) => opt(b.id, b.name, f.br)).join("") + "</select>" +
      '<select id="oper" aria-label="' + esc(t("Período")) + '">' + [["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["90", "Últimos 90 días"], ["0", "Todo el tiempo"]].map(([v, l]) => opt(v, t(l), f.per)).join("") + "</select>" +
      '<div class="seg" role="group">' + [["board", "Tablero"], ["list", "Lista"]].map(([v, l]) => '<button type="button" data-omode="' + v + '" aria-pressed="' + (f.mode === v) + '">' + esc(t(l)) + "</button>").join("") + "</div></div>";
    let body;
    if (f.mode === "board") {
      body = '<p class="small muted">' + esc(t("Arrastrá las tarjetas para cambiar el estado.")) + '</p><div class="board">' + STATUSES.map((s) => {
        const os = list.filter((o) => o.status === s);
        return '<section class="col st-' + s + '" data-col="' + s + '"><h3>' + esc(stLabel(s)) + " <span>" + os.length + " · " + money(os.reduce((a, o) => a + o.total, 0)) + '</span></h3><div class="col__body">' +
          os.slice(0, 60).map((o) => '<button type="button" class="ocard" draggable="true" data-order="' + o.id + '"><header><span>' + esc(o.id) + "</span><span>" + esc(t(o.channel)) + "</span></header><b>" + esc(o.customerName || "—") + '</b><small class="muted">' + esc(o.lines.map((l) => l.qty + "× " + l.name).join(", ")) + '</small><div class="row"><span class="tot">' + money(o.total) + '</span><span class="spacer"></span>' + (o.paid ? badge("b-ok", t("pagado")) : "") + "</div></button>").join("") + "</div></section>";
      }).join("") + "</div>";
    } else {
      body = list.length ? '<div class="tablewrap"><table><thead><tr><th>' + [t("Pedido"), t("Fecha"), t("Cliente"), t("Canal"), t("Sucursal"), t("Estado"), t("Pago")].map(esc).join("</th><th>") + '</th><th class="r">' + esc(t("Total")) + "</th></tr></thead><tbody>" +
        list.slice(0, 400).map((o) => '<tr><td><a href="#/pedido/' + o.id + '">' + esc(o.id) + "</a></td><td>" + ftime(o.createdAt) + "</td><td>" + (o.customerId ? '<a href="#/cliente/' + o.customerId + '">' + esc(o.customerName) + "</a>" : esc(o.customerName)) + "</td><td>" + esc(t(o.channel)) + "</td><td>" + esc(D.branch(o.branch)) + "</td><td>" + badge(STB[o.status], stLabel(o.status)) + "</td><td>" + (o.paid ? badge("b-ok", t("pagado")) : badge("b-muted", t("pendiente"))) + '</td><td class="r num">' + money(o.total) + "</td></tr>").join("") + "</tbody></table></div>"
        : '<div class="card empty"><b>' + esc(t("Sin pedidos con estos filtros.")) + "</b></div>";
    }
    const v = view(head(t("Pedidos"), "", newBtns()) + filters + body);
    $("#oq", v).addEventListener("input", (e) => { f.q = e.target.value; const pos = e.target.selectionStart; vOrders(); const n = $("#oq"); n.focus(); n.setSelectionRange(pos, pos); });
    for (const [id, k] of [["#och", "ch"], ["#obr", "br"], ["#oper", "per"]]) $(id, v).addEventListener("change", (e) => { f[k] = e.target.value; vOrders(); });
    $$("[data-omode]", v).forEach((b) => b.addEventListener("click", () => { f.mode = b.dataset.omode; vOrders(); }));
    // arrastrar y soltar
    $$(".ocard", v).forEach((c) => { c.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", c.dataset.order); e.dataTransfer.effectAllowed = "move"; }); });
    $$(".col", v).forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drop"); });
      col.addEventListener("dragleave", () => col.classList.remove("drop"));
      col.addEventListener("drop", async (e) => { e.preventDefault(); col.classList.remove("drop"); const id = e.dataTransfer.getData("text/plain"); const o = db.orders.find((x) => x.id === id); if (!o || o.status === col.dataset.col) return; await saveOrder({ id, status: col.dataset.col }, true); });
    });
  }

  async function saveOrder(item, quiet) {
    try {
      const r = await api("upsert", { col: "orders", item });
      upsertLocal("orders", r.item); if (r.lots) S.db.lots = r.lots; if (r.customers) S.db.customers = r.customers;
      if (!quiet) toast(t("Pedido guardado")); else toast(r.item.id + " → " + stLabel(r.item.status));
      if (r.item.stock && r.item.stock.short && r.item.stock.short.length) toast(t("Sin stock registrado para") + " " + r.item.stock.short.map((s) => (S.D.cat[s.productId] || {}).short || s.productId).join(", "));
      refresh(); return r.item;
    } catch (e) { if (e.data && e.data.error === "empty_order") toast(t("Agregá al menos un producto.")); else fail(e); return null; }
  }
  function upsertLocal(col, item) { const l = S.db[col], i = l.findIndex((x) => x.id === item.id); if (i >= 0) l[i] = item; else l.push(item); }

  function openOrder(id, preset) {
    const db = S.db, D = S.D, o = id ? db.orders.find((x) => x.id === id) : null;
    if (id && !o) return;
    const base = o ? JSON.parse(JSON.stringify(o)) : Object.assign({ lines: [], channel: "tienda", mode: "pickup", status: "nuevo", branch: "", payment: "", paid: false, discount: 0, customerId: "", attendedBy: S.user }, preset || {});
    const cats = db.categories;
    const prodOpts = (sel) => '<option value="">' + esc(t("Elegí un producto")) + "</option>" + cats.map((c) => '<optgroup label="' + esc(c.name) + '">' + db.catalog.filter((p) => p.cat === c.id).map((p) => '<option value="' + p.id + '"' + (p.id === sel ? " selected" : "") + ">" + esc(p.short + " · " + p.size) + " — " + money(p.price) + "</option>").join("") + "</optgroup>").join("");
    const custOpts = '<option value="">' + esc(t("Elegí un cliente")) + "</option>" + db.customers.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => '<option value="' + c.id + '"' + (c.id === base.customerId ? " selected" : "") + ">" + esc(c.name + (c.phone ? " · " + prettyPhone(c.phone) : "")) + "</option>").join("");
    const sel = (name, list, cur, lbl) => '<select name="' + name + '">' + list.map((v) => '<option value="' + v + '"' + (v === cur ? " selected" : "") + ">" + esc(lbl ? lbl(v) : t(v)) + "</option>").join("") + "</select>";
    const lineRow = (l) => '<div class="line"><select name="lp" aria-label="' + esc(t("Producto")) + '">' + prodOpts(l.id) + '</select><input type="number" name="lq" min="1" max="99" value="' + (l.qty || 1) + '" aria-label="' + esc(t("Cant.")) + '"><input type="number" name="lpr" min="0" step="0.5" value="' + (l.price != null ? l.price : "") + '" aria-label="' + esc(t("Precio")) + '"><span class="lt"></span><button type="button" class="iconbtn" data-rmline aria-label="' + esc(t("Quitar")) + '">' + ic("x") + "</button></div>";
    const c = base.customerId ? D.cust[base.customerId] : null;
    const html =
      '<div class="grid2"><label class="f">' + esc(t("Cliente existente")) + '<select name="customerId">' + custOpts + "</select></label>" +
      '<div class="grid2"><label class="f">' + esc(t("o cliente nuevo")) + '<input type="text" name="customerName" placeholder="' + esc(t("Nombre")) + '" value="' + esc(base.customerId ? "" : base.customerName || "") + '"></label><label class="f">' + esc(t("Teléfono / WhatsApp")) + '<input type="tel" name="phone" value="' + esc(base.customerId ? "" : base.phone || "") + '"></label></div></div>' +
      '<div><div class="row" style="margin-bottom:8px"><b>' + esc(t("Productos")) + '</b><span class="spacer"></span><button type="button" class="btn btn--ghost btn--sm" data-addline>' + ic("plus") + esc(t("Agregar producto")) + '</button></div><div class="lines" id="lines">' + (base.lines.length ? base.lines : [{}]).map(lineRow).join("") + "</div></div>" +
      '<div class="grid3"><label class="f">' + esc(t("Descuento (Bs)")) + '<input type="number" name="discount" min="0" step="0.5" value="' + (base.discount || 0) + '"></label><label class="f">' + esc(t("Subtotal")) + '<input type="text" id="osub" readonly></label><label class="f">' + esc(t("Total")) + '<input type="text" id="otot" readonly></label></div>' +
      '<div class="grid3"><label class="f">' + esc(t("Canal")) + sel("channel", CHANNELS, base.channel) + '</label><label class="f">' + esc(t("Sucursal")) + '<select name="branch"><option value="">—</option>' + db.branches.map((b) => '<option value="' + b.id + '"' + (b.id === base.branch ? " selected" : "") + ">" + esc(b.name) + "</option>").join("") + '</select></label><label class="f">' + esc(t("Entrega")) + sel("mode", ["pickup", "delivery", "national"], base.mode) + "</label></div>" +
      '<label class="f">' + esc(t("Dirección")) + '<input type="text" name="address" value="' + esc(base.address || "") + '"></label>' +
      '<div class="grid3"><label class="f">' + esc(t("Forma de pago")) + sel("payment", ["", "qr", "efectivo", "transferencia", "tarjeta"], base.payment, (v) => (v ? t(v) : t("Sin pago"))) + '</label><label class="f">' + esc(t("Regalo")) + '<input type="text" name="gift" value="' + esc(base.gift || "") + '"></label><label class="f">' + esc(t("Atendido por")) + '<input type="text" name="attendedBy" list="stafflist" value="' + esc(base.attendedBy || "") + '"></label></div>' +
      '<datalist id="stafflist">' + (db.settings.staff || []).map((s) => '<option value="' + esc(s) + '">').join("") + "</datalist>" +
      '<label class="chk"><input type="checkbox" name="paid"' + (base.paid ? " checked" : "") + "> " + esc(t("Pagado")) + "</label>" +
      '<label class="f">' + esc(t("Nota")) + '<textarea name="note">' + esc(base.note || "") + "</textarea></label>" +
      '<div><b>' + esc(t("Estado")) + '</b><div class="steps" style="margin-top:8px" role="group">' + STATUSES.map((s) => '<button type="button" data-st="' + s + '" aria-pressed="' + (s === base.status) + '">' + esc(stLabel(s)) + "</button>").join("") + "</div></div>" +
      (o && o.stock && o.stock.applied ? '<div class="alloc"><b>' + esc(t("Lotes usados (FEFO)")) + ":</b> " + esc((o.stock.alloc || []).map((a) => a.qty + "× " + ((D.cat[a.productId] || {}).short || a.productId) + " · " + (a.lot || "—") + (a.expiry ? " (" + fdate(a.expiry) + ")" : "")).join(" · ") || "—") + ((o.stock.short || []).length ? ' · <span class="red">' + esc(t("Sin stock registrado para")) + " " + esc(o.stock.short.map((s) => (D.cat[s.productId] || {}).short).join(", ")) + "</span>" : "") + "</div>" : "") +
      (o ? '<details><summary>' + esc(t("Historial")) + '</summary><ul class="tl">' + (o.history || []).map((h) => '<li><span class="dot">' + ic("orders") + "</span><div>" + esc(stLabel(h.status)) + "<small>" + ftime(h.at) + (h.by ? " · " + esc(h.by) : "") + "</small></div></li>").join("") + "</ul></details>" : "");
    const foot = (o ? '<button type="button" class="btn btn--danger" data-del>' + esc(t("Eliminar")) + "</button>" : "") + '<span class="spacer"></span>' +
      (o && (o.phone || (c && c.phone)) ? '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + esc(wa(o.phone || c.phone, fill(db.settings.templates.order, { c: c || { name: o.customerName }, o }))) + '">' + ic("wa") + esc(t("Avisar por WhatsApp")) + "</a>" : "") +
      '<button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button type="submit" class="btn btn--red">' + esc(t("Guardar")) + "</button>";
    const m = modal((o ? t("Editar pedido") + " · " + o.id : t("Nuevo pedido")), html, foot, true);
    let status = base.status;
    const recalc = () => {
      let sub = 0;
      $$(".line", m).forEach((row) => {
        const pid = $("[name=lp]", row).value, p = D.cat[pid], q = +$("[name=lq]", row).value || 0, pr = $("[name=lpr]", row);
        if (p && pr.value === "") pr.value = p.price;
        const lt = q * (+pr.value || 0); sub += lt; $(".lt", row).textContent = money(lt);
      });
      $("#osub", m).value = money(sub); $("#otot", m).value = money(Math.max(0, sub - (+$("[name=discount]", m).value || 0)));
    };
    m.addEventListener("input", recalc); m.addEventListener("change", (e) => { if (e.target.name === "lp") { const p = D.cat[e.target.value]; const pr = $("[name=lpr]", e.target.closest(".line")); if (p) pr.value = p.price; } recalc(); });
    m.addEventListener("click", async (e) => {
      if (e.target.closest("[data-addline]")) { $("#lines", m).insertAdjacentHTML("beforeend", lineRow({})); return; }
      if (e.target.closest("[data-rmline]")) { const ls = $$(".line", m); if (ls.length > 1) e.target.closest(".line").remove(); recalc(); return; }
      const sb = e.target.closest("[data-st]"); if (sb) { status = sb.dataset.st; $$("[data-st]", m).forEach((b) => b.setAttribute("aria-pressed", String(b === sb))); return; }
      if (e.target.closest("[data-del]") && confirm(t("¿Eliminar este pedido? Si ya descontó stock, se devuelve a los lotes."))) {
        try { await api("remove", { col: "orders", id: o.id }); S.db.orders = S.db.orders.filter((x) => x.id !== o.id); const d = await api("data"); S.db.lots = d.lots; closeModal(); toast(t("Pedido eliminado")); location.hash = "#/pedidos"; refresh(); } catch (err) { fail(err); }
      }
    });
    recalc();
    m.onsubmit = async () => {
      const fd = new FormData($("form", m));
      const lines = $$(".line", m).map((row) => ({ id: $("[name=lp]", row).value, qty: +$("[name=lq]", row).value || 1, price: $("[name=lpr]", row).value })).filter((l) => l.id);
      const cid = fd.get("customerId");
      const item = { id: o ? o.id : undefined, lines, discount: fd.get("discount"), channel: fd.get("channel"), branch: fd.get("branch"), mode: fd.get("mode"), address: fd.get("address"), payment: fd.get("payment"), gift: fd.get("gift"), attendedBy: fd.get("attendedBy"), paid: fd.get("paid") === "on", note: fd.get("note"), status };
      if (cid) { const cc = D.cust[cid]; Object.assign(item, { customerId: cid, customerName: cc.name, phone: cc.phone }); }
      else Object.assign(item, { customerId: "", customerName: fd.get("customerName"), phone: fd.get("phone") });
      const saved = await saveOrder(item);
      if (saved) { closeModal(); if (S.route[0] === "pedido") location.hash = "#/pedidos"; }
    };
  }

  // ---------- clientes
  function vCustomers() {
    const db = S.db, D = S.D, f = (S.f.cust = S.f.cust || { q: "", seg: "", br: "", goal: "", tag: "", sort: "last" });
    const bday = /bday=1/.test(location.hash);
    let list = db.customers.filter((c) => (!f.seg || D.stats[c.id].seg === f.seg) && (!f.br || c.branch === f.br) && (!f.goal || c.goal === f.goal) && (!f.tag || (c.tags || []).includes(f.tag)) && (!f.q || norm(c.name + " " + c.phone + " " + c.email + " " + (c.tags || []).join(" ")).includes(norm(f.q))) && (!bday || D.bdays.includes(c)));
    const sorters = { last: (a, b) => D.stats[b.id].last - D.stats[a.id].last, ltv: (a, b) => D.stats[b.id].ltv - D.stats[a.id].ltv, name: (a, b) => a.name.localeCompare(b.name), new: (a, b) => (a.createdAt < b.createdAt ? 1 : -1) };
    list = list.sort(sorters[f.sort] || sorters.last);
    const tags = [...new Set(db.customers.flatMap((c) => c.tags || []))].sort();
    const opt = (v, l, cur) => '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(l) + "</option>";
    const segCount = (s) => db.customers.filter((c) => D.stats[c.id].seg === s).length;
    const v = view(head(t("Clientes"), db.customers.length + " · " + SEGS.map((s) => segLabel(s) + " " + segCount(s)).join(" · "),
      '<button class="btn btn--ghost" data-import>' + esc(t("Importar CSV")) + '</button><button class="btn btn--ghost" data-export-c>' + esc(t("Exportar CSV")) + "</button>" + '<button class="btn btn--red" data-new-customer>' + ic("plus") + esc(t("Nuevo cliente")) + "</button>") +
      '<div class="filters"><label class="vh" for="cq">' + esc(t("Buscar nombre, teléfono, email…")) + '</label><input type="search" id="cq" placeholder="' + esc(t("Buscar nombre, teléfono, email…")) + '" value="' + esc(f.q) + '">' +
      '<select data-cf="seg" aria-label="' + esc(t("Segmento")) + '">' + opt("", t("Todos los segmentos"), f.seg) + SEGS.map((s) => opt(s, segLabel(s), f.seg)).join("") + "</select>" +
      '<select data-cf="br" aria-label="' + esc(t("Sucursal")) + '">' + opt("", t("Todas las sucursales"), f.br) + db.branches.map((b) => opt(b.id, b.name, f.br)).join("") + "</select>" +
      '<select data-cf="goal" aria-label="' + esc(t("Objetivo")) + '">' + opt("", t("Todos los objetivos"), f.goal) + GOALS.map((g) => opt(g, t(g), f.goal)).join("") + "</select>" +
      (tags.length ? '<select data-cf="tag" aria-label="' + esc(t("Etiqueta")) + '">' + opt("", t("Etiqueta"), f.tag) + tags.map((x) => opt(x, x, f.tag)).join("") + "</select>" : "") +
      '<select data-cf="sort" aria-label="Sort">' + [["last", t("Última compra")], ["ltv", t("Valor (LTV)")], ["new", t("Cliente desde")], ["name", t("Nombre")]].map(([a, b]) => opt(a, b, f.sort)).join("") + "</select></div>" +
      (list.length ? '<div class="tablewrap"><table><thead><tr><th>' + esc(t("Cliente")) + "</th><th>" + esc(t("Segmento")) + "</th><th>" + esc(t("Nivel")) + '</th><th class="r">' + esc(t("Compras")) + '</th><th class="r">' + esc(t("Valor (LTV)")) + "</th><th>" + esc(t("Última compra")) + "</th><th>" + esc(t("Sucursal")) + "</th><th>WhatsApp</th></tr></thead><tbody>" +
        list.slice(0, 500).map((c) => { const s = D.stats[c.id]; return '<tr><td><a href="#/cliente/' + c.id + '">' + esc(c.name || "—") + '</a><br><small class="muted">' + esc(prettyPhone(c.phone)) + "</small></td><td>" + badge(SEGB[s.seg], segLabel(s.seg)) + '</td><td><span class="tier tier--' + s.tier + '">' + esc(t(s.tier)) + '</span></td><td class="r num">' + s.n + '</td><td class="r num">' + money(s.ltv) + "</td><td>" + (s.last ? fdate(new Date(s.last).toISOString()) : "—") + "</td><td>" + esc(D.branch(c.branch)) + "</td><td>" + (c.consent && c.consent.whatsapp ? badge("b-ok", t("sí")) : badge("b-muted", t("no"))) + "</td></tr>"; }).join("") + "</tbody></table></div>"
        : '<div class="card empty"><b>' + esc(t("Sin clientes con estos filtros.")) + "</b></div>"));
    $("#cq", v).addEventListener("input", (e) => { f.q = e.target.value; const pos = e.target.selectionStart; vCustomers(); const n = $("#cq"); n.focus(); n.setSelectionRange(pos, pos); });
    $$("[data-cf]", v).forEach((s) => s.addEventListener("change", () => { f[s.dataset.cf] = s.value; vCustomers(); }));
  }

  function vCustomer() {
    const db = S.db, D = S.D, c = D.cust[S.route[1]];
    if (!c) { location.hash = "#/clientes"; return; }
    const s = D.stats[c.id], os = D.byCust[c.id] || [], rem = D.reminders.filter((r) => r.c === c);
    const T = db.settings.templates, lastP = os[0] && os[0].lines[0] ? D.cat[os[0].lines[0].id] : null;
    const quick = c.phone ? [["reminder", "Recordar recompra"], ["winback", "Volver a comprar"], ["postsale", "Post-venta"], ["birthday", "Saludo de cumpleaños"]].map(([k, l]) => '<a class="btn btn--ghost btn--sm" target="_blank" rel="noopener" data-quick="' + k + '" href="' + esc(wa(c.phone, fill(T[k], { c, p: lastP }))) + '">' + esc(t(l)) + "</a>").join("") : '<span class="muted small">' + esc(t("Sin teléfono")) + "</span>";
    const tlIcon = { note: "note", call: "phone", whatsapp: "wa", visit: "store", reminder: "repeat", winback: "repeat" };
    const v = view('<div class="row"><a href="#/clientes" class="small">← ' + esc(t("Clientes")) + "</a></div>" +
      '<div class="profile"><section class="card pcardx"><div class="pid"><span class="av av--lg">' + esc(initials(c.name)) + "</span><div><h1>" + esc(c.name || "—") + '</h1><div class="row" style="margin-top:6px">' + badge(SEGB[s.seg], segLabel(s.seg)) + '<span class="tier tier--' + s.tier + '">' + esc(t(s.tier)) + "</span></div></div></div>" +
      '<div class="minis"><div class="mini"><span>' + esc(t("Compras")) + "</span><b>" + s.n + '</b></div><div class="mini"><span>LTV</span><b>' + money(s.ltv) + '</b></div><div class="mini"><span>' + esc(t("Puntos")) + "</span><b>" + s.points + "</b></div></div>" +
      '<dl class="facts"><dt>WhatsApp</dt><dd>' + (c.phone ? '<a href="' + esc(wa(c.phone, "")) + '" target="_blank" rel="noopener">' + esc(prettyPhone(c.phone)) + "</a> " + (c.consent && c.consent.whatsapp ? badge("b-ok", t("sí")) : badge("b-muted", t("sin permiso de WhatsApp"))) : "—") + "</dd>" +
      "<dt>" + esc(t("Email")) + "</dt><dd>" + esc(c.email || "—") + "</dd><dt>" + esc(t("Sucursal")) + "</dt><dd>" + esc(D.branch(c.branch)) + "</dd><dt>" + esc(t("Objetivo")) + "</dt><dd>" + esc(c.goal ? t(c.goal) : "—") + "</dd>" +
      "<dt>" + esc(t("Origen")) + "</dt><dd>" + esc(t(c.source || "otro")) + "</dd><dt>" + esc(t("Cumpleaños")) + "</dt><dd>" + (c.birthday ? fdate(c.birthday, { day: "numeric", month: "long" }) : "—") + "</dd>" +
      "<dt>" + esc(t("Ticket prom.")) + "</dt><dd>" + money(s.aov) + "</dd><dt>" + esc(t("Cliente desde")) + "</dt><dd>" + fdate(c.createdAt) + "</dd>" +
      (c.tags && c.tags.length ? "<dt>" + esc(t("Etiqueta")) + "</dt><dd>" + c.tags.map((x) => '<span class="tag">' + esc(x) + "</span>").join("") + "</dd>" : "") + "</dl>" +
      (c.notes ? '<p class="small" style="white-space:pre-wrap;margin:0">' + esc(c.notes) + "</p>" : "") +
      "<div><b class='small'>" + esc(t("Mensaje rápido")) + '</b><div class="row" style="margin-top:8px">' + quick + "</div></div>" +
      '<div class="row"><button class="btn btn--ghost" data-edit-c>' + esc(t("Editar cliente")) + '</button><button class="btn btn--red" data-new-order-for="' + c.id + '">' + ic("plus") + esc(t("Nuevo pedido")) + "</button></div></section>" +
      '<div class="stack">' + (rem.length ? '<section class="card"><h2>' + esc(t("Recompras de este cliente")) + '</h2><div class="list">' + rem.map(remRow).join("") + "</div></section>" : "") +
      '<section class="card"><h2>' + esc(t("Pedidos")) + "</h2>" + (os.length ? '<div class="tablewrap"><table><thead><tr><th>' + esc(t("Pedido")) + "</th><th>" + esc(t("Fecha")) + "</th><th>" + esc(t("Productos")) + "</th><th>" + esc(t("Estado")) + '</th><th class="r">' + esc(t("Total")) + "</th></tr></thead><tbody>" +
        os.map((o) => '<tr><td><a href="#/pedido/' + o.id + '">' + esc(o.id) + "</a></td><td>" + fdate(o.createdAt) + "</td><td>" + esc(o.lines.map((l) => l.qty + "× " + l.name).join(", ")) + "</td><td>" + badge(STB[o.status], stLabel(o.status)) + '</td><td class="r num">' + money(o.total) + "</td></tr>").join("") + "</tbody></table></div>" : '<p class="muted">' + esc(t("Sin pedidos todavía.")) + "</p>") + "</section>" +
      '<section class="card"><h2>' + esc(t("Actividad")) + '</h2><form class="row" id="noteF" style="margin-bottom:10px"><select name="type" aria-label="type" style="width:auto">' + [["note", "nota"], ["call", "llamada"], ["whatsapp", "whatsapp"], ["visit", "visita"]].map(([k, l]) => '<option value="' + k + '">' + esc(t(l)) + "</option>").join("") +
      '</select><label class="vh" for="noteT">' + esc(t("Agregar nota")) + '</label><input type="text" id="noteT" name="text" placeholder="' + esc(t("Escribí una nota, llamada o visita…")) + '" style="flex:1;min-width:200px" required maxlength="600"><button class="btn" type="submit">' + esc(t("Agregar nota")) + "</button></form>" +
      ((c.timeline || []).length ? '<ul class="tl">' + c.timeline.slice(0, 60).map((x) => '<li><span class="dot">' + ic(tlIcon[x.type] || "note") + "</span><div>" + esc(x.text) + "<small>" + ftime(x.at) + (x.by ? " · " + esc(x.by) : "") + "</small></div></li>").join("") + "</ul>" : '<p class="muted">' + esc(t("Sin actividad todavía.")) + "</p>") + "</section></div></div>");
    $("#noteF", v).addEventListener("submit", async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      try { const r = await api("upsert", { col: "customers", item: { id: c.id, addNote: { type: fd.get("type"), text: fd.get("text") } } }); upsertLocal("customers", r.item); toast(t("Nota agregada")); refresh(); } catch (err) { fail(err); }
    });
    $("[data-edit-c]", v).addEventListener("click", () => openCustomer(c.id));
    $$("[data-quick]", v).forEach((a) => a.addEventListener("click", () => logContact(c, a.dataset.quick === "reminder" ? "reminder" : a.dataset.quick === "winback" ? "winback" : "whatsapp", t(a.textContent), "")));
    wireRem(v);
  }

  function openCustomer(id) {
    const db = S.db, c = id ? S.D.cust[id] : null, b = c || { consent: { whatsapp: true } };
    const sel = (name, list, cur, lbl) => '<select name="' + name + '"><option value="">—</option>' + list.map((v) => '<option value="' + v + '"' + (v === cur ? " selected" : "") + ">" + esc(lbl ? lbl(v) : t(v)) + "</option>").join("") + "</select>";
    const html = '<div class="grid2"><label class="f">' + esc(t("Nombre")) + '<input type="text" name="name" required maxlength="80" value="' + esc(b.name || "") + '"></label><label class="f">' + esc(t("Teléfono / WhatsApp")) + '<input type="tel" name="phone" value="' + esc(b.phone ? "+" + b.phone : "") + '"></label></div>' +
      '<div class="grid2"><label class="f">' + esc(t("Email")) + '<input type="email" name="email" value="' + esc(b.email || "") + '"></label><label class="f">' + esc(t("Cumpleaños")) + '<input type="date" name="birthday" value="' + esc(b.birthday || "") + '"></label></div>' +
      '<div class="grid3"><label class="f">' + esc(t("Sucursal")) + sel("branch", db.branches.map((x) => x.id), b.branch, (v) => S.D.branch(v)) + '</label><label class="f">' + esc(t("Objetivo")) + sel("goal", GOALS, b.goal) + '</label><label class="f">' + esc(t("Origen")) + sel("source", SOURCES, b.source) + "</label></div>" +
      '<label class="f">' + esc(t("Etiquetas (separadas por coma)")) + '<input type="text" name="tags" value="' + esc((b.tags || []).join(", ")) + '"></label>' +
      '<label class="f">' + esc(t("Notas")) + '<textarea name="notes">' + esc(b.notes || "") + "</textarea></label>" +
      '<div class="grid2"><label class="chk"><input type="checkbox" name="consent"' + (b.consent && b.consent.whatsapp ? " checked" : "") + "> " + esc(t("Acepta recordatorios y promos por WhatsApp")) + '</label><label class="f">' + esc(t("Ajuste de puntos")) + '<input type="number" name="pointsAdj" value="' + (b.pointsAdj || 0) + '"></label></div>';
    const foot = (c ? '<button type="button" class="btn btn--danger" data-del>' + esc(t("Eliminar")) + "</button>" : "") + '<span class="spacer"></span><button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button type="submit" class="btn btn--red">' + esc(t("Guardar")) + "</button>";
    const m = modal(c ? t("Editar cliente") : t("Nuevo cliente"), html, foot);
    m.addEventListener("click", async (e) => {
      if (e.target.closest("[data-del]") && confirm(t("¿Eliminar este cliente y sus datos personales? Sus pedidos quedan anonimizados para la contabilidad."))) {
        try { await api("remove", { col: "customers", id: c.id }); const d = await api("data"); Object.assign(S.db, d); closeModal(); toast(t("Cliente eliminado")); location.hash = "#/clientes"; refresh(); } catch (err) { fail(err); }
      }
    });
    m.onsubmit = async () => {
      const fd = new FormData($("form", m)), item = { id: c ? c.id : undefined };
      for (const k of ["name", "phone", "email", "birthday", "branch", "goal", "source", "tags", "notes", "pointsAdj"]) item[k] = fd.get(k) || "";
      item.consent = fd.get("consent") === "on";
      try { const r = await api("upsert", { col: "customers", item }); upsertLocal("customers", r.item); closeModal(); toast(t("Cliente guardado")); if (!c) location.hash = "#/cliente/" + r.item.id; refresh(); }
      catch (err) { if (err.data && err.data.error === "duplicate_phone") { toast(t("Ya existe un cliente con ese teléfono.")); } else fail(err); }
    };
  }

  function fill(tpl, ctx) {
    const c = ctx.c || {}, o = ctx.o, p = ctx.p;
    return String(tpl || "").replace(/\{nombre\}/g, firstName(c.name) || "").replace(/\{producto\}/g, p ? p.short : o && o.lines[0] ? o.lines[0].name : "suplemento")
      .replace(/\{pedido\}/g, o ? o.id : "").replace(/\{estado\}/g, o ? o.status : "").replace(/\{total\}/g, o ? "Bs " + o.total : "");
  }
  async function logContact(c, type, text, ref) {
    try { const r = await api("upsert", { col: "customers", item: { id: c.id, addNote: { type, text, ref } } }); upsertLocal("customers", r.item); refresh(); } catch (e) { fail(e); }
  }

  // ---------- recompras
  function remRow(r) {
    const can = r.c.phone && r.c.consent && r.c.consent.whatsapp;
    const cls = r.delta < 0 ? "b-crit" : r.delta <= 7 ? "b-warn" : "b-info";
    const msg = fill(S.db.settings.templates.reminder, { c: r.c, p: r.p });
    return '<div class="li"><span class="av">' + esc(initials(r.c.name)) + '</span><div><b><a href="#/cliente/' + r.c.id + '">' + esc(r.c.name || prettyPhone(r.c.phone)) + "</a> · " + esc(r.p.short) + "</b><small>" + esc(t("Compró")) + " " + fdate(new Date(r.bought).toISOString()) + " (" + r.qty + "×) · " + esc(t("Se termina")) + " " + fdate(new Date(r.due).toISOString()) + "</small></div>" +
      (r.contacted ? badge("b-ok", t("Contactadas") + " " + fdate(r.contacted)) : badge(cls, relDays(r.delta))) +
      '<div class="row">' + (can ? '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" data-remwa="' + esc(r.ref) + '" href="' + esc(wa(r.c.phone, msg)) + '">' + ic("wa") + esc(t("Enviar WhatsApp")) + "</a>" : '<span class="small muted">' + esc(r.c.phone ? t("sin permiso de WhatsApp") : t("Sin teléfono")) + "</span>") +
      (r.contacted ? "" : '<button class="btn btn--ghost btn--sm" data-remdone="' + esc(r.ref) + '">' + esc(t("Marcar contactado")) + "</button>") +
      '<button class="btn btn--ghost btn--sm" data-remorder="' + esc(r.ref) + '">' + esc(t("Crear pedido")) + "</button></div></div>";
  }
  function wireRem(v) {
    const find = (ref) => S.D.reminders.find((r) => r.ref === ref);
    $$("[data-remwa],[data-remdone]", v).forEach((b) => b.addEventListener("click", () => { const r = find(b.dataset.remwa || b.dataset.remdone); if (r && !r.contacted) { logContact(r.c, "reminder", t("recordatorio de recompra") + ": " + r.p.short, r.ref); toast(t("Recordatorio registrado")); } }));
    $$("[data-remorder]", v).forEach((b) => b.addEventListener("click", () => { const r = find(b.dataset.remorder); if (r) openOrder(null, { customerId: r.c.id, customerName: r.c.name, phone: r.c.phone, branch: r.c.branch, channel: "whatsapp", lines: [{ id: r.p.id, qty: r.qty, price: r.p.price }] }); }));
  }
  function vRestock() {
    const D = S.D, f = (S.f.rem = S.f.rem || { tab: "due" }), lead = S.db.settings.reminderLeadDays || 0;
    const tabs = { due: D.reminders.filter((r) => !r.contacted && r.delta < 0), week: D.reminders.filter((r) => !r.contacted && r.delta >= 0 && r.delta <= Math.max(7, lead)), next: D.reminders.filter((r) => !r.contacted && r.delta > Math.max(7, lead)), done: D.reminders.filter((r) => r.contacted) };
    const lost = S.db.customers.filter((c) => ["riesgo", "perdido"].includes(D.stats[c.id].seg) && c.phone && c.consent && c.consent.whatsapp);
    const v = view(head(t("Recompras"), t("Clientes que deberían estar terminando su suplemento, calculado con los servicios del envase y el uso diario por categoría.")) +
      '<div class="seg" role="group">' + [["due", "Vencidas"], ["week", "Esta semana"], ["next", "Próximas"], ["done", "Contactadas"]].map(([k, l]) => '<button type="button" data-rtab="' + k + '" aria-pressed="' + (f.tab === k) + '">' + esc(t(l)) + " (" + tabs[k].length + ")</button>").join("") + "</div>" +
      '<section class="card"><div class="list">' + (tabs[f.tab].slice(0, 200).map(remRow).join("") || '<p class="muted">' + esc(t("Nada pendiente en esta lista.")) + "</p>") + "</div></section>" +
      '<section class="card"><h2>' + esc(t("Recuperar clientes")) + " <small>" + esc(t("Clientes en riesgo o perdidos que aceptan WhatsApp.")) + '</small></h2><div class="list">' +
      (lost.slice(0, 60).map((c) => { const s = D.stats[c.id]; return '<div class="li"><span class="av">' + esc(initials(c.name)) + '</span><div><b><a href="#/cliente/' + c.id + '">' + esc(c.name) + "</a></b><small>" + esc(t("Última compra")) + " " + fdate(new Date(s.last).toISOString()) + " · " + money(s.ltv) + "</small></div>" + badge(SEGB[s.seg], segLabel(s.seg)) + '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" data-winback="' + c.id + '" href="' + esc(wa(c.phone, fill(S.db.settings.templates.winback, { c }))) + '">' + ic("wa") + esc(t("Enviar WhatsApp")) + "</a></div>"; }).join("") || '<p class="muted">' + esc(t("Nada pendiente en esta lista.")) + "</p>") + "</div></section>");
    $$("[data-rtab]", v).forEach((b) => b.addEventListener("click", () => { f.tab = b.dataset.rtab; vRestock(); }));
    $$("[data-winback]", v).forEach((a) => a.addEventListener("click", () => { const c = S.D.cust[a.dataset.winback]; logContact(c, "winback", t("volver a comprar"), ""); }));
    wireRem(v);
  }

  // ---------- inventario
  function vInventory() {
    const db = S.db, D = S.D, f = (S.f.inv = S.f.inv || { tab: S.route[1] === "vencimientos" ? "exp" : "sum", q: "", cat: "", br: "" });
    if (S.route[1] === "vencimientos") f.tab = "exp";
    const today = todayISO();
    const units = db.lots.reduce((a, l) => a + l.qty, 0), cost = db.lots.reduce((a, l) => a + l.qty * (l.cost || 0), 0), retail = db.lots.reduce((a, l) => a + l.qty * ((D.cat[l.productId] || {}).price || 0), 0);
    const kpi = (l, v) => '<div class="kpi"><span>' + esc(t(l)) + "</span><b>" + v + "</b></div>";
    const opt = (v, l, cur) => '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(l) + "</option>";
    const filt = '<div class="filters"><input type="search" id="iq" aria-label="' + esc(t("Producto")) + '" placeholder="' + esc(t("Producto")) + '…" value="' + esc(f.q) + '"><select data-if="cat" aria-label="' + esc(t("Categoría")) + '">' + opt("", t("Todas las categorías"), f.cat) + db.categories.map((c) => opt(c.id, c.name, f.cat)).join("") + "</select>" +
      '<select data-if="br" aria-label="' + esc(t("Sucursal")) + '">' + opt("", t("Todas las sucursales"), f.br) + db.branches.map((b) => opt(b.id, b.name, f.br)).join("") + "</select></div>";
    const pMatch = (p) => p && (!f.cat || p.cat === f.cat) && (!f.q || norm(p.short + " " + p.name).includes(norm(f.q)));
    let body;
    if (f.tab === "sum") {
      const rows = db.catalog.filter(pMatch).map((p) => ({ p, s: D.stock[p.id] })).sort((a, b) => a.s.total - b.s.total);
      body = '<div class="tablewrap"><table><thead><tr><th>' + esc(t("Producto")) + "</th><th>" + esc(t("Categoría")) + '</th><th class="r">' + esc(t("Stock total")) + "</th><th>" + esc(t("Por sucursal")) + "</th><th>" + esc(t("Próx. vencimiento")) + "</th><th>" + esc(t("Estado")) + "</th></tr></thead><tbody>" +
        rows.map(({ p, s }) => { const tot = f.br ? s.by[f.br] || 0 : s.total; const tracked = D.tracked.has(p.id); return "<tr><td>" + esc(p.short) + '<br><small class="muted">' + esc(p.size) + "</small></td><td>" + esc(D.catName(p.cat)) + '</td><td class="r num">' + tot + "</td><td>" + Object.entries(s.by).map(([b, q]) => '<span class="tag">' + esc(D.branch(b)) + " " + q + "</span>").join("") + "</td><td>" + (s.next ? fdate(s.next) : "—") + "</td><td>" + (!tracked ? '<span class="muted">—</span>' : tot === 0 ? badge("b-crit", t("Sin stock")) : tot <= db.settings.lowStock ? badge("b-warn", t("Bajo")) : badge("b-ok", t("OK"))) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    } else {
      const warn = new Date(Date.now() + (db.settings.expiryWarnDays || 90) * DAY).toISOString().slice(0, 10);
      const lots = db.lots.filter((l) => pMatch(D.cat[l.productId]) && (!f.br || l.branch === f.br) && (f.tab !== "exp" || (l.qty > 0 && l.expiry && l.expiry <= warn))).sort((a, b) => ((a.expiry || "9") < (b.expiry || "9") ? -1 : 1));
      body = lots.length ? '<div class="tablewrap"><table><thead><tr><th>' + esc(t("Producto")) + "</th><th>" + esc(t("Sucursal")) + "</th><th>" + esc(t("Lote")) + "</th><th>" + esc(t("Vence")) + '</th><th class="r">' + esc(t("Cantidad")) + '</th><th class="r">' + esc(t("Costo unit.")) + '</th><th class="r">' + esc(t("Valor")) + "</th><th></th></tr></thead><tbody>" +
        lots.slice(0, 600).map((l) => { const p = D.cat[l.productId] || {}; const ex = l.expiry && l.expiry < today ? badge("b-crit", t("vencido")) : l.expiry && l.expiry <= warn ? badge("b-warn", fdate(l.expiry)) : esc(l.expiry ? fdate(l.expiry) : "—"); return "<tr><td>" + esc(p.short || l.productId) + "</td><td>" + esc(D.branch(l.branch)) + "</td><td>" + esc(l.lot || "—") + "</td><td>" + ex + '</td><td class="r num">' + l.qty + '</td><td class="r num">' + money(l.cost) + '</td><td class="r num">' + money(l.qty * (l.cost || 0)) + '</td><td class="r"><button class="btn btn--ghost btn--sm" data-lot="' + l.id + '">' + esc(t("Editar lote")) + "</button></td></tr>"; }).join("") + "</tbody></table></div>"
        : '<div class="card empty"><b>' + esc(t("Sin lotes con estos filtros.")) + "</b></div>";
    }
    const v = view(head(t("Inventario"), t("Se descuenta solo cuando un pedido pasa a Preparado, primero del lote que vence antes (FEFO)."), '<button class="btn btn--red" data-new-lot>' + ic("plus") + esc(t("Recibir lote")) + "</button>") +
      '<section class="kpis">' + kpi("Unidades", units.toLocaleString(LOC())) + kpi("Valor al costo", money(cost)) + kpi("Valor de venta", money(retail)) + kpi("Por vencer", D.expiring.length) + kpi("Vencidos", D.expired.length) + "</section>" +
      '<div class="row"><div class="seg" role="group">' + [["sum", "Resumen"], ["lots", "Lotes"], ["exp", "Vencimientos"]].map(([k, l]) => '<button type="button" data-itab="' + k + '" aria-pressed="' + (f.tab === k) + '">' + esc(t(l)) + "</button>").join("") + "</div></div>" + filt + body);
    $$("[data-itab]", v).forEach((b) => b.addEventListener("click", () => { f.tab = b.dataset.itab; if (S.route[1]) location.hash = "#/inventario"; else vInventory(); }));
    $$("[data-if]", v).forEach((s) => s.addEventListener("change", () => { f[s.dataset.if] = s.value; vInventory(); }));
    $("#iq", v).addEventListener("input", (e) => { f.q = e.target.value; const pos = e.target.selectionStart; vInventory(); const n = $("#iq"); n.focus(); n.setSelectionRange(pos, pos); });
    $$("[data-lot]", v).forEach((b) => b.addEventListener("click", () => openLot(b.dataset.lot)));
  }
  function openLot(id) {
    const db = S.db, l = id ? db.lots.find((x) => x.id === id) : null, b = l || { branch: "santa-cruz", qty: 1 };
    const html = '<label class="f">' + esc(t("Producto")) + '<select name="productId" required><option value="">' + esc(t("Elegí un producto")) + "</option>" + db.categories.map((c) => '<optgroup label="' + esc(c.name) + '">' + db.catalog.filter((p) => p.cat === c.id).map((p) => '<option value="' + p.id + '"' + (p.id === b.productId ? " selected" : "") + ">" + esc(p.short + " · " + p.size) + "</option>").join("") + "</optgroup>").join("") + "</select></label>" +
      '<div class="grid2"><label class="f">' + esc(t("Sucursal")) + '<select name="branch">' + db.branches.map((x) => '<option value="' + x.id + '"' + (x.id === b.branch ? " selected" : "") + ">" + esc(x.name) + "</option>").join("") + '</select></label><label class="f">' + esc(t("Número de lote")) + '<input type="text" name="lot" value="' + esc(b.lot || "") + '"></label></div>' +
      '<div class="grid3"><label class="f">' + esc(t("Fecha de vencimiento")) + '<input type="date" name="expiry" value="' + esc(b.expiry || "") + '"></label><label class="f">' + esc(t("Cantidad")) + '<input type="number" name="qty" min="0" required value="' + (b.qty || 0) + '"></label><label class="f">' + esc(t("Costo unit.")) + '<input type="number" name="cost" min="0" step="0.5" value="' + (b.cost || 0) + '"></label></div>';
    const m = modal(l ? t("Editar lote") : t("Recibir lote"), html, (l ? '<button type="button" class="btn btn--danger" data-del>' + esc(t("Eliminar")) + "</button>" : "") + '<span class="spacer"></span><button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button type="submit" class="btn btn--red">' + esc(t("Guardar")) + "</button>");
    m.addEventListener("click", async (e) => { if (e.target.closest("[data-del]") && confirm(t("¿Eliminar este lote?"))) { try { await api("remove", { col: "lots", id: l.id }); S.db.lots = S.db.lots.filter((x) => x.id !== l.id); closeModal(); toast(t("Lote eliminado")); refresh(); } catch (err) { fail(err); } } });
    m.onsubmit = async () => { const fd = new FormData($("form", m)), item = { id: l ? l.id : undefined }; for (const k of ["productId", "branch", "lot", "expiry", "qty", "cost"]) item[k] = fd.get(k); try { const r = await api("upsert", { col: "lots", item }); upsertLocal("lots", r.item); closeModal(); toast(t("Lote guardado")); refresh(); } catch (err) { fail(err); } };
  }

  // ---------- campañas
  function audience(k) {
    const D = S.D, f = k.filter || {};
    return S.db.customers.filter((c) => c.phone && (!f.consentOnly || (c.consent && c.consent.whatsapp)) && (!f.segment || D.stats[c.id].seg === f.segment) && (!f.branch || c.branch === f.branch) && (!f.goal || c.goal === f.goal) && (!f.tag || (c.tags || []).includes(f.tag)) &&
      (!f.category || (D.byCust[c.id] || []).some((o) => o.status !== "cancelado" && o.lines.some((l) => (D.cat[l.id] || {}).cat === f.category))));
  }
  function vCampaigns() {
    const ks = S.db.campaigns.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const v = view(head(t("Campañas"), t("Mensajes de WhatsApp a un segmento, con cola de envío uno por uno (respeta el permiso de cada cliente)."), '<button class="btn btn--red" data-new-campaign>' + ic("plus") + esc(t("Nueva campaña")) + "</button>") +
      (ks.length ? '<div class="cols3">' + ks.map((k) => { const aud = audience(k), sent = aud.filter((c) => k.sent[c.id]).length; return '<section class="card"><h2>' + esc(k.name || "—") + "</h2><p class=\"small muted\" style=\"margin-top:-6px\">" + esc(k.message.slice(0, 120)) + '</p><div class="minis" style="grid-template-columns:1fr 1fr"><div class="mini"><span>' + esc(t("Destinatarios")) + "</span><b>" + aud.length + '</b></div><div class="mini"><span>' + esc(t("Enviados")) + "</span><b>" + sent + '</b></div></div><div class="hbar__t" style="margin:12px 0"><i style="width:' + (aud.length ? (sent / aud.length) * 100 : 0) + '%"></i></div><a class="btn btn--ghost" href="#/campana/' + k.id + '">' + esc(t("Abrir")) + "</a></section>"; }).join("") + "</div>"
        : '<div class="card empty"><b>' + esc(t("Todavía no hay campañas.")) + '</b><button class="btn btn--red" data-new-campaign>' + esc(t("Nueva campaña")) + "</button></div>"));
    return v;
  }
  function vCampaign() {
    const k = S.db.campaigns.find((x) => x.id === S.route[1]); if (!k) { location.hash = "#/campanas"; return; }
    const aud = audience(k), sent = aud.filter((c) => k.sent[c.id]).length;
    const v = view('<div class="row"><a href="#/campanas" class="small">← ' + esc(t("Campañas")) + "</a></div>" + head(k.name, aud.length + " " + t("Destinatarios").toLowerCase() + " · " + sent + " " + t("Enviados").toLowerCase(), '<button class="btn btn--ghost" data-edit-k="' + k.id + '">' + esc(t("Editar campaña")) + "</button>") +
      '<section class="card"><h2>' + esc(t("Mensaje")) + '</h2><p style="white-space:pre-wrap;margin:0">' + esc(k.message) + "</p></section>" +
      '<div class="tablewrap"><table><thead><tr><th>' + esc(t("Cliente")) + "</th><th>" + esc(t("Segmento")) + "</th><th>WhatsApp</th><th></th></tr></thead><tbody>" +
      aud.map((c) => '<tr><td><a href="#/cliente/' + c.id + '">' + esc(c.name) + "</a></td><td>" + badge(SEGB[S.D.stats[c.id].seg], segLabel(S.D.stats[c.id].seg)) + "</td><td>" + esc(prettyPhone(c.phone)) + '</td><td class="r">' + (k.sent[c.id] ? badge("b-ok", t("Enviado ✓")) : '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" data-ksend="' + c.id + '" href="' + esc(wa(c.phone, fill(k.message, { c, p: lastProduct(c) }))) + '">' + ic("wa") + esc(t("Enviar WhatsApp")) + "</a>") + "</td></tr>").join("") + "</tbody></table></div>");
    $$("[data-ksend]", v).forEach((a) => a.addEventListener("click", async () => { try { const r = await api("upsert", { col: "campaigns", item: { id: k.id, markSent: a.dataset.ksend } }); upsertLocal("campaigns", r.item); refresh(); } catch (e) { fail(e); } }));
    $("[data-edit-k]", v).addEventListener("click", () => openCampaign(k.id));
  }
  const lastProduct = (c) => { const o = (S.D.byCust[c.id] || []).find((x) => x.status !== "cancelado"); return o && o.lines[0] ? S.D.cat[o.lines[0].id] : null; };
  function openCampaign(id) {
    const db = S.db, k = id ? db.campaigns.find((x) => x.id === id) : null, b = k || { filter: { consentOnly: true }, message: db.settings.templates.winback };
    const f = b.filter || {}, opt = (v, l, cur) => '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(l) + "</option>";
    const tags = [...new Set(db.customers.flatMap((c) => c.tags || []))];
    const html = '<label class="f">' + esc(t("Nombre de la campaña")) + '<input type="text" name="name" required maxlength="80" value="' + esc(b.name || "") + '"></label>' +
      '<div class="grid3"><label class="f">' + esc(t("Segmento")) + '<select name="segment">' + opt("", t("Cualquiera"), f.segment) + SEGS.map((s) => opt(s, segLabel(s), f.segment)).join("") + '</select></label><label class="f">' + esc(t("Sucursal")) + '<select name="branch">' + opt("", t("Cualquiera"), f.branch) + db.branches.map((x) => opt(x.id, x.name, f.branch)).join("") + '</select></label><label class="f">' + esc(t("Objetivo")) + '<select name="goal">' + opt("", t("Cualquiera"), f.goal) + GOALS.map((g) => opt(g, t(g), f.goal)).join("") + "</select></label></div>" +
      '<div class="grid2"><label class="f">' + esc(t("Compró la categoría")) + '<select name="category">' + opt("", t("Cualquiera"), f.category) + db.categories.map((c) => opt(c.id, c.name, f.category)).join("") + '</select></label><label class="f">' + esc(t("Etiqueta")) + '<select name="tag">' + opt("", t("Cualquiera"), f.tag) + tags.map((x) => opt(x, x, f.tag)).join("") + "</select></label></div>" +
      '<label class="chk"><input type="checkbox" name="consentOnly"' + (f.consentOnly !== false ? " checked" : "") + "> " + esc(t("Solo clientes que aceptan WhatsApp")) + "</label>" +
      '<label class="f">' + esc(t("Mensaje")) + '<textarea name="message" required maxlength="1000">' + esc(b.message || "") + '</textarea></label><p class="small muted">' + esc(t("Variables")) + ": {nombre} {producto}</p>" +
      '<p class="small"><b>' + esc(t("Destinatarios")) + ': <span id="kcount">0</span></b></p><div class="card" style="background:var(--panel-2)"><b class="small">' + esc(t("Vista previa")) + '</b><p id="kprev" class="small" style="white-space:pre-wrap;margin:6px 0 0"></p></div>';
    const m = modal(k ? t("Editar campaña") : t("Nueva campaña"), html, (k ? '<button type="button" class="btn btn--danger" data-del>' + esc(t("Eliminar")) + "</button>" : "") + '<span class="spacer"></span><button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button type="submit" class="btn btn--red">' + esc(t("Guardar")) + "</button>");
    const read = () => { const fd = new FormData($("form", m)); return { id: k ? k.id : undefined, name: fd.get("name"), message: fd.get("message"), filter: { segment: fd.get("segment"), branch: fd.get("branch"), goal: fd.get("goal"), category: fd.get("category"), tag: fd.get("tag"), consentOnly: fd.get("consentOnly") === "on" } }; };
    const upd = () => { const it = read(), aud = audience(it); $("#kcount", m).textContent = aud.length; $("#kprev", m).textContent = fill(it.message, { c: aud[0] || { name: "Camila" }, p: aud[0] ? lastProduct(aud[0]) : null }); };
    m.addEventListener("input", upd); m.addEventListener("change", upd); upd();
    m.addEventListener("click", async (e) => { if (e.target.closest("[data-del]") && confirm(t("¿Eliminar esta campaña?"))) { try { await api("remove", { col: "campaigns", id: k.id }); S.db.campaigns = S.db.campaigns.filter((x) => x.id !== k.id); closeModal(); toast(t("Campaña eliminada")); location.hash = "#/campanas"; refresh(); } catch (err) { fail(err); } } });
    m.onsubmit = async () => { try { const r = await api("upsert", { col: "campaigns", item: read() }); upsertLocal("campaigns", r.item); closeModal(); toast(t("Campaña guardada")); location.hash = "#/campana/" + r.item.id; refresh(); } catch (err) { fail(err); } };
  }

  // ---------- tareas
  function vTasks() {
    const db = S.db, today = todayISO(), D = S.D;
    const open = db.tasks.filter((x) => !x.done), groups = [["Para hoy y vencidas", open.filter((x) => x.due && x.due <= today)], ["Próximas", open.filter((x) => !x.due || x.due > today)], ["Hechas", db.tasks.filter((x) => x.done).slice(-30).reverse()]];
    const row = (x) => '<div class="li"><label class="chk"><input type="checkbox" data-tdone="' + x.id + '"' + (x.done ? " checked" : "") + '><span class="vh">' + esc(x.title) + "</span></label><div><b" + (x.done ? ' style="text-decoration:line-through;color:var(--muted)"' : "") + ">" + esc(x.title) + "</b><small>" + (x.due ? (x.due < today && !x.done ? '<span class="red">' + fdate(x.due) + "</span>" : fdate(x.due)) : "—") + (x.assignee ? " · " + esc(x.assignee) : "") + (x.customerId && D.cust[x.customerId] ? ' · <a href="#/cliente/' + x.customerId + '">' + esc(D.cust[x.customerId].name) + "</a>" : "") + "</small></div>" + (x.priority === "alta" ? badge("b-crit", t("alta")) : "") + '<button class="btn btn--ghost btn--sm" data-tedit="' + x.id + '">' + esc(t("Editar tarea")) + "</button></div>";
    const v = view(head(t("Tareas"), "", '<button class="btn btn--red" data-new-task>' + ic("plus") + esc(t("Nueva tarea")) + "</button>") +
      groups.map(([l, xs]) => '<section class="card"><h2>' + esc(t(l)) + " <small>" + xs.length + '</small></h2><div class="list">' + (xs.map(row).join("") || '<p class="muted">' + esc(t("Sin tareas.")) + "</p>") + "</div></section>").join(""));
    $$("[data-tdone]", v).forEach((c) => c.addEventListener("change", async () => { try { const r = await api("upsert", { col: "tasks", item: { id: c.dataset.tdone, done: c.checked } }); upsertLocal("tasks", r.item); refresh(); } catch (e) { fail(e); } }));
    $$("[data-tedit]", v).forEach((b) => b.addEventListener("click", () => openTask(b.dataset.tedit)));
  }
  function openTask(id, preset) {
    const db = S.db, x = id ? db.tasks.find((k) => k.id === id) : null, b = x || Object.assign({ due: todayISO(), priority: "normal", assignee: S.user }, preset || {});
    const html = '<label class="f">' + esc(t("Título")) + '<input type="text" name="title" required maxlength="140" value="' + esc(b.title || "") + '"></label>' +
      '<div class="grid3"><label class="f">' + esc(t("Vence el")) + '<input type="date" name="due" value="' + esc(b.due || "") + '"></label><label class="f">' + esc(t("Responsable")) + '<input type="text" name="assignee" list="stafflist2" value="' + esc(b.assignee || "") + '"></label><label class="f">' + esc(t("Prioridad")) + '<select name="priority">' + ["baja", "normal", "alta"].map((p) => '<option value="' + p + '"' + (p === b.priority ? " selected" : "") + ">" + esc(t(p)) + "</option>").join("") + "</select></label></div>" +
      '<datalist id="stafflist2">' + (db.settings.staff || []).map((s) => '<option value="' + esc(s) + '">').join("") + "</datalist>" +
      '<label class="f">' + esc(t("Cliente")) + '<select name="customerId"><option value="">—</option>' + db.customers.slice().sort((a, c) => a.name.localeCompare(c.name)).map((c) => '<option value="' + c.id + '"' + (c.id === b.customerId ? " selected" : "") + ">" + esc(c.name) + "</option>").join("") + "</select></label>";
    const m = modal(x ? t("Editar tarea") : t("Nueva tarea"), html, (x ? '<button type="button" class="btn btn--danger" data-del>' + esc(t("Eliminar")) + "</button>" : "") + '<span class="spacer"></span><button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button type="submit" class="btn btn--red">' + esc(t("Guardar")) + "</button>");
    m.addEventListener("click", async (e) => { if (e.target.closest("[data-del]") && confirm(t("¿Eliminar esta tarea?"))) { try { await api("remove", { col: "tasks", id: x.id }); S.db.tasks = S.db.tasks.filter((k) => k.id !== x.id); closeModal(); toast(t("Tarea eliminada")); refresh(); } catch (err) { fail(err); } } });
    m.onsubmit = async () => { const fd = new FormData($("form", m)), item = { id: x ? x.id : undefined }; for (const k of ["title", "due", "assignee", "priority", "customerId"]) item[k] = fd.get(k); try { const r = await api("upsert", { col: "tasks", item }); upsertLocal("tasks", r.item); closeModal(); toast(t("Tarea guardada")); refresh(); } catch (err) { fail(err); } };
  }

  // ---------- reportes
  function vReports() {
    const db = S.db, D = S.D, f = (S.f.rep = S.f.rep || { per: 30 }), now = Date.now(), per = f.per;
    const os = D.live.filter((o) => now - Date.parse(o.createdAt) < per * DAY);
    const rev = os.reduce((a, o) => a + o.total, 0), uniq = new Set(os.map((o) => o.customerId).filter(Boolean));
    // nuevos vs recurrentes en el período
    let newC = 0, retC = 0; for (const id of uniq) { const first = (D.byCust[id] || []).filter((o) => o.status !== "cancelado").slice(-1)[0]; if (first && now - Date.parse(first.createdAt) < per * DAY) newC++; else retC++; }
    // recompra recuperada: recompras que vencieron en el período y el cliente volvió a comprar después
    const dueIn = D.reminders.filter((r) => r.due <= now && now - r.due < per * DAY);
    const back = dueIn.filter((r) => (D.byCust[r.c.id] || []).some((o) => o.status !== "cancelado" && Date.parse(o.createdAt) > r.bought && o.id !== r.o.id));
    const byCat = {}, byProd = {};
    for (const o of os) for (const l of o.lines) { const p = D.cat[l.id] || {}; byCat[p.cat] = (byCat[p.cat] || 0) + l.qty * l.price; const bp = (byProd[l.id] = byProd[l.id] || { q: 0, v: 0 }); bp.q += l.qty; bp.v += l.qty * l.price; }
    const series = dailySeries(D.live, per);
    const kpi = (l, v, s) => '<div class="kpi"><span>' + esc(t(l)) + "</span><b>" + v + "</b>" + (s ? "<small>" + esc(s) + "</small>" : "") + "</div>";
    const v = view(head(t("Reportes"), "", '<div class="seg" role="group">' + [[7, "7 días"], [30, "30 días"], [90, "90 días"], [365, "12 meses"]].map(([d, l]) => '<button type="button" data-per="' + d + '" aria-pressed="' + (per === d) + '">' + esc(t(l)) + "</button>").join("") + '</div><button class="btn btn--ghost" data-export-o>' + esc(t("Exportar pedidos (CSV)")) + "</button>") +
      '<section class="kpis">' + kpi("Ingresos", money(rev)) + kpi("Pedidos", os.length) + kpi("Ticket promedio", money(os.length ? rev / os.length : 0)) + kpi("Clientes únicos", uniq.size, newC + " " + t("nuevos_c") + " · " + retC + " " + t("recurrentes")) +
      kpi("Recompra recuperada", (dueIn.length ? Math.round((back.length / dueIn.length) * 100) : 0) + "%", t("de las recompras vencidas volvieron a comprar")) + "</section>" +
      '<section class="card"><h2>' + esc(t(per > 120 ? "Ingresos por semana" : "Ingresos por día")) + "</h2>" + (rev ? barChart(series, short) + "<details><summary>" + esc(t("Ver tabla")) + '</summary><div class="tablewrap"><table><tbody>' + series.map((p) => "<tr><td>" + esc(p.full) + '</td><td class="r num">' + money(p.v) + "</td></tr>").join("") + "</tbody></table></div></details>" : '<p class="muted">' + esc(t("Sin ventas en este período.")) + "</p>") + "</section>" +
      '<div class="cols3"><section class="card"><h2>' + esc(t("Por canal")) + "</h2>" + hbars(sumBy(os, (o) => t(o.channel)), money) + '</section><section class="card"><h2>' + esc(t("Por sucursal_r")) + "</h2>" + hbars(sumBy(os, (o) => D.branch(o.branch)), money) + '</section><section class="card"><h2>' + esc(t("Por categoría")) + "</h2>" + hbars(Object.entries(byCat).map(([k, x]) => ({ l: D.catName(k), v: x })).sort((a, b) => b.v - a.v), money) + "</section></div>" +
      '<section class="card"><h2>' + esc(t("Productos más vendidos")) + '</h2><div class="tablewrap"><table><thead><tr><th>' + esc(t("Producto")) + '</th><th class="r">' + esc(t("Unid.")) + '</th><th class="r">' + esc(t("Ingresos")) + "</th></tr></thead><tbody>" +
      Object.entries(byProd).sort((a, b) => b[1].v - a[1].v).slice(0, 15).map(([id, x]) => "<tr><td>" + esc((D.cat[id] || {}).short || id) + '</td><td class="r num">' + x.q + '</td><td class="r num">' + money(x.v) + "</td></tr>").join("") + "</tbody></table></div></section>");
    $$("[data-per]", v).forEach((b) => b.addEventListener("click", () => { f.per = +b.dataset.per; vReports(); }));
  }

  // ---------- ajustes
  function vSettings() {
    const db = S.db, s = db.settings, hasDemo = ["customers", "orders", "lots", "tasks"].some((c) => db[c].some((x) => x.demo));
    const num = (k, l, step) => '<label class="f">' + esc(t(l)) + '<input type="number" name="' + k + '" step="' + (step || 1) + '" value="' + esc(s[k]) + '"></label>';
    const tplL = { reminder: "recordatorio de recompra", winback: "volver a comprar", postsale: "post-venta", birthday: "cumpleaños", order: "estado del pedido" };
    const actL = { create: "creó", update: "actualizó", delete: "eliminó", import: "importó", intake: "pedido web", demo_load: "cargó ejemplo", demo_clear: "borró ejemplo" };
    const v = view(head(t("Ajustes"), "") +
      '<form class="stack" id="setF"><section class="card"><h2>' + esc(t("Ajustes")) + '</h2><div class="stack"><label class="f">' + esc(t("Equipo (separado por coma)")) + '<input type="text" name="staff" value="' + esc((s.staff || []).join(", ")) + '"></label>' +
      '<div class="grid3">' + num("lowStock", "Umbral de stock bajo") + num("expiryWarnDays", "Avisar vencimientos con (días)") + num("reminderLeadDays", "Recordar recompra con (días de anticipación)") + num("vipLtv", "VIP desde (Bs de LTV)") + num("pointsPerBs", "Puntos por cada Bs", 0.01) + "</div></div></section>" +
      '<section class="card"><h2>' + esc(t("Uso diario por categoría (servicios por día)")) + '</h2><div class="grid3">' + Object.keys(s.usage).map((k) => '<label class="f">' + esc(S.D.catName(k)) + '<input type="number" step="0.05" min="0.1" name="u_' + k + '" value="' + esc(s.usage[k]) + '"></label>').join("") + "</div></section>" +
      '<section class="card"><h2>' + esc(t("Plantillas de WhatsApp")) + ' <small>{nombre} {producto} {pedido} {estado} {total}</small></h2><div class="stack">' + Object.keys(s.templates).map((k) => '<label class="f">' + esc(t(tplL[k] || k)) + '<textarea name="t_' + k + '">' + esc(s.templates[k]) + "</textarea></label>").join("") + '</div></section><div class="row"><button class="btn btn--red" type="submit">' + esc(t("Guardar")) + "</button></div></form>" +
      '<section class="card"><h2>' + esc(t("Datos")) + '</h2><p class="small muted">' + esc(t("Almacenamiento")) + ": " + esc(db.storage === "blob" ? t("Vercel Blob privado, con 10 versiones de respaldo por colección.") : t("Local (desarrollo).")) + '</p><div class="row">' +
      '<button class="btn btn--ghost" data-backup>' + esc(t("Descargar copia (JSON)")) + '</button><button class="btn btn--ghost" data-import>' + esc(t("Importar CSV")) + "</button>" +
      (hasDemo ? '<button class="btn btn--danger" data-demo="clear">' + esc(t("Borrar datos de ejemplo")) + "</button>" : '<button class="btn btn--ghost" data-demo="load">' + esc(t("Cargar datos de ejemplo")) + "</button>") + "</div></section>" +
      '<section class="card"><h2>' + esc(t("Registro de actividad")) + '</h2><div class="tablewrap"><table><tbody>' + db.activity.slice(0, 60).map((a) => "<tr><td>" + ftime(a.at) + "</td><td>" + esc(a.by) + "</td><td>" + esc(t(actL[a.action] || a.action)) + "</td><td>" + esc(a.col) + "</td><td>" + esc(a.label || a.id || "") + "</td></tr>").join("") + "</tbody></table></div></section>");
    $("#setF", v).addEventListener("submit", async (e) => {
      e.preventDefault(); const fd = new FormData(e.target), out = { usage: {}, templates: {} };
      for (const [k, val] of fd.entries()) { if (k.startsWith("u_")) out.usage[k.slice(2)] = val; else if (k.startsWith("t_")) out.templates[k.slice(2)] = val; else out[k] = val; }
      try { const r = await api("settings", { settings: out }); S.db.settings = r.settings; toast(t("Ajustes guardados")); refresh(); } catch (err) { fail(err); }
    });
    $("[data-backup]", v).addEventListener("click", () => download("bolivia-fitness-crm-" + todayISO() + ".json", JSON.stringify({ customers: db.customers, orders: db.orders, lots: db.lots, tasks: db.tasks, campaigns: db.campaigns, settings: db.settings }, null, 1), "application/json"));
  }

  /* ------------------------------------------------------------------ CSV */
  function toCSV(rows) { return rows.map((r) => r.map((v) => { const s = String(v == null ? "" : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(",")).join("\n"); }
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: type || "text/csv" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function parseCSV(text) {
    const rows = []; let row = [], cur = "", q = false;
    const sep = (text.split("\n")[0].match(/;/g) || []).length > (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === sep) { row.push(cur); cur = ""; } else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (ch !== "\r") cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows.filter((r) => r.some((c) => c.trim()));
  }
  function openImport() {
    const m = modal(t("Importar CSV"), '<p class="small muted">' + esc(t("Elegí un archivo CSV con columnas nombre, telefono, email, ciudad, cumpleanos, etiquetas.")) + '</p><label class="f">' + esc(t("Archivo CSV")) + '<input type="file" name="file" accept=".csv,text/csv" required></label><p id="impMsg" class="small"></p>',
      '<span class="spacer"></span><button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button type="submit" class="btn btn--red">' + esc(t("Importar")) + "</button>");
    m.onsubmit = async () => {
      const file = $("[name=file]", m).files[0]; if (!file) return;
      const rows = parseCSV((await file.text()).replace(/^﻿/, "")); if (rows.length < 2) return;
      const H = rows[0].map((h) => norm(h).replace(/[^a-z]/g, ""));
      const col = (...names) => H.findIndex((h) => names.includes(h));
      const ix = { name: col("nombre", "name", "cliente"), phone: col("telefono", "phone", "celular", "whatsapp", "movil"), email: col("email", "correo"), city: col("ciudad", "city", "sucursal", "branch"), birthday: col("cumpleanos", "birthday", "nacimiento", "fechadenacimiento"), tags: col("etiquetas", "tags"), notes: col("notas", "notes") };
      const br = (v) => { const n = norm(v); const b = S.db.branches.find((x) => norm(x.name) === n || x.id === n); return b ? b.id : ""; };
      const customers = rows.slice(1).map((r) => ({ name: r[ix.name] || "", phone: r[ix.phone] || "", email: ix.email >= 0 ? r[ix.email] : undefined, branch: ix.city >= 0 ? br(r[ix.city]) : undefined, birthday: ix.birthday >= 0 ? r[ix.birthday] : undefined, tags: ix.tags >= 0 ? r[ix.tags] : undefined, notes: ix.notes >= 0 ? r[ix.notes] : undefined }));
      try { const r = await api("import", { customers }); const d = await api("data"); Object.assign(S.db, d); closeModal(); toast(t("Importados") + ": " + r.added + " " + t("nuevos") + ", " + r.merged + " " + t("actualizados") + ", " + r.skipped + " " + t("omitidos")); refresh(); } catch (e) { fail(e); }
    };
  }

  /* ------------------------------------------------------------------ modal */
  let lastFocus = null;
  function modal(title, body, foot, wide) {
    closeModal(); lastFocus = document.activeElement;
    const w = document.createElement("div");
    w.className = "modal"; w.id = "modal"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "mTitle");
    w.innerHTML = '<div class="modal__scrim" data-close></div><form class="modal__box' + (wide ? " modal__box--wide" : "") + '" novalidate><div class="modal__head"><h2 id="mTitle">' + esc(title) + '</h2><button type="button" class="iconbtn" data-close aria-label="' + esc(t("Cerrar")) + '">' + ic("x") + '</button></div><div class="modal__body">' + body + '</div><div class="modal__foot">' + foot + "</div></form>";
    document.body.appendChild(w);
    w.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
    $("form", w).addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; } if (w.onsubmit) w.onsubmit(); });
    const first = $(".modal__body input:not([type=hidden]), .modal__body select, .modal__body textarea", w); if (first) first.focus();
    return w;
  }
  function closeModal() { const m = $("#modal"); if (m) { m.remove(); if (S.route[0] === "pedido") { history.replaceState(null, "", "#/pedidos"); S.route = ["pedidos"]; } if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); } }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#modal")) closeModal();
    if (e.key === "Tab" && $("#modal")) { const f = $$("#modal button, #modal a[href], #modal input, #modal select, #modal textarea").filter((x) => !x.disabled && x.offsetParent); if (!f.length) return; if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });

  /* ------------------------------------------------------------------ acciones globales */
  document.addEventListener("click", async (e) => {
    const b = (s) => e.target.closest(s);
    if (b("[data-lang-btn]")) { P.toggleLang(); return; }
    if (b("[data-theme-btn]")) { P.toggleTheme(); return; }
    if (b("[data-new-order]")) { openOrder(null); return; }
    const nof = b("[data-new-order-for]"); if (nof) { const c = S.D.cust[nof.dataset.newOrderFor]; openOrder(null, { customerId: c.id, customerName: c.name, phone: c.phone, branch: c.branch }); return; }
    if (b("[data-new-customer]")) { openCustomer(null); return; }
    if (b("[data-new-lot]")) { openLot(null); return; }
    if (b("[data-new-task]")) { openTask(null); return; }
    if (b("[data-new-campaign]")) { openCampaign(null); return; }
    if (b("[data-import]")) { openImport(); return; }
    const oc = b("[data-order]"); if (oc) { openOrder(oc.dataset.order); return; }
    if (b("[data-export-c]")) { const D = S.D; download("clientes-" + todayISO() + ".csv", toCSV([["id", "nombre", "telefono", "email", "sucursal", "objetivo", "segmento", "nivel", "compras", "ltv", "ultima_compra", "acepta_whatsapp", "etiquetas", "cumpleanos"]].concat(S.db.customers.map((c) => { const s = D.stats[c.id]; return [c.id, c.name, c.phone, c.email, D.branch(c.branch), c.goal, s.seg, s.tier, s.n, s.ltv, s.last ? new Date(s.last).toISOString().slice(0, 10) : "", c.consent && c.consent.whatsapp ? "si" : "no", (c.tags || []).join("|"), c.birthday]; })))); return; }
    if (b("[data-export-o]")) { const D = S.D; download("pedidos-" + todayISO() + ".csv", toCSV([["id", "fecha", "cliente", "telefono", "canal", "sucursal", "entrega", "estado", "pago", "pagado", "productos", "subtotal", "descuento", "total"]].concat(S.db.orders.map((o) => [o.id, o.createdAt, o.customerName, o.phone, o.channel, D.branch(o.branch), o.mode, o.status, o.payment, o.paid ? "si" : "no", o.lines.map((l) => l.qty + "x " + l.name).join(" | "), o.subtotal, o.discount, o.total])))); return; }
    const dm = b("[data-demo]"); if (dm) {
      dm.disabled = true;
      try { await api("demo", { action: dm.dataset.demo }); const d = await api("data"); S.db = d; toast(t(dm.dataset.demo === "load" ? "Datos de ejemplo cargados" : "Datos de ejemplo borrados")); refresh(); } catch (err) { fail(err); dm.disabled = false; }
    }
  });
  P.onChange((kind) => { if (S.db) refresh(); else if ($(".login")) renderLogin(); document.documentElement.lang = P.lang === "en" ? "en" : "es-BO"; });

  /* ------------------------------------------------------------------ arranque */
  async function boot() {
    try { const d = await api("data"); S.db = d; S.user = d.user; derive(); renderShell(); route(); }
    catch (e) { if (e.status !== 401) renderLogin(e.status === 503 ? t("El CRM todavía no está configurado (faltan CRM_PASSWORD y CRM_SECRET).") : t("Sin conexión con el servidor.")); }
  }
  addEventListener("hashchange", () => { closeModal(); route(); });
  boot();
})();
