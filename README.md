# Bolivia Fitness · tienda online + LeonIA

Tienda online de **Bolivia Fitness** (representantes oficiales de Dragon Pharma y ProSupps en Bolivia) con
**LeonIA** 🦁, una asistente de compras con IA que arma el carrito en vivo, por texto o por voz, y deja el
pedido listo para enviar por WhatsApp.

- Diseño: tema claro de "retail deportivo" tomado como referencia del sitio de Dragon Pharma (marca que
  representamos): barra superior negra con anuncios rotativos, header blanco con navegación en mayúsculas,
  buscador y carrito cuadrado negro, banners a todo el ancho, "Más vendidos" con pestañas, tarjetas con precio
  rojo + tachado + "% OFF" y botón "Agregar al carrito", footer negro. Kanit, esquinas rectas, rojo #D70000
  (`css/retail.css`, se carga después de `css/styles.css`). Marca, fotos, precios y textos son 100% de @boliviafitness.
- Todo dato (precio, producto, sucursal, horario, promo) sale de publicaciones de @boliviafitness y lleva la
  URL del post en un comentario en `js/data.js`.
- Fotos y videos: descargados de los posts y reels de la marca y procesados a WebP / MP4 en `assets/`.
- **Español / inglés y modo noche** en todo el sitio (botones `EN`/`ES` y 🌙 del header). `js/prefs.js` aplica la
  elección antes de pintar (por defecto sigue al sistema); `js/i18n.js` traduce en vivo con el diccionario de
  `js/i18n-en.js` y vuelve al español exacto. En inglés, LeonIA también responde en inglés.
- **CRM** en `/crm` (ver abajo). Contraste WCAG AA verificado con axe-core en claro/oscuro y ES/EN.

## Estructura

```
index.html          estructura + SEO (Open Graph, schema.org Store)
crm.html            CRM del equipo (no indexado)
css/styles.css      sistema de diseño base (componentes, layout, responsive)
css/retail.css      tema actual (tokens claro + modo noche; las secciones oscuras redeclaran tokens)
css/crm.css         estilos del CRM (mismos tokens, claro y oscuro)
js/prefs.js         tema e idioma guardados (se carga en <head>)
js/i18n.js          motor de traducción ES→EN · js/i18n-en.js diccionario
js/crm.js           app del CRM (sin build)
api/crm.js          endpoint del CRM (sesión, CRUD, intake público, datos de ejemplo)
api/_crmlogic.js    reglas puras: validación, precios del catálogo, stock FEFO, intake
api/_crmstore.js    Vercel Blob privado versionado (o carpeta local sin token)
js/data.js          TODO el contenido + catalog() — lo comparten el sitio y las herramientas de LeonIA
js/app.js           tienda, bolsa, checkout por WhatsApp, sucursales en vivo, UI de LeonIA + voz
api/leonia.js       endpoint del asistente: bucle de herramientas, responde NDJSON en streaming
api/_tools.js       herramientas deterministas (catálogo, bolsa, promos, pedido, derivación) + esquemas
api/_prompt.js      system prompt (cacheable) + contexto en vivo
api/_persona.js     frases propias y easter eggs
tests/tools.test.js pruebas de las herramientas (node:test)
assets/             img, product, video, hero, brand
```

`js/data.js` es la única fuente de verdad: el sitio y el asistente usan el mismo `catalog()`, así nunca
se contradicen en un precio. Los precios Black Friday vuelven solos al precio "antes" cuando termina la
campaña (`campaign.to`).

## Deploy

Vercel (proyecto `bolivia-fitness-2`) está conectado a este repo: cada push a la rama de producción
(`claude/beautiful-ramanujan-quzhz4`) publica en https://bolivia-fitness-2.vercel.app; otras ramas generan previews.
El sitio original sigue aparte en el proyecto `bolivia-fitness` (repo `Bolivia-fitness`).

## Correr localmente

```bash
npm install
npm test
npx vercel dev
```

Sin clave de IA el sitio funciona completo y el chat muestra "estoy terminando de prepararme".

## Variables de entorno (Vercel → Project → Settings → Environment Variables)

| Variable | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | Clave de Claude |
| `LEONIA_MODEL` / `LEONIA_VOICE_MODEL` | Opcional. Modelos de Claude (por defecto `claude-sonnet-5-5` / `claude-haiku-5-5`) |
| `LEONIA_FALLBACKS` | Opcional. `off` desactiva el fallback del servidor ante rechazos (activo por defecto en Sonnet 5.5) |
| `NVIDIA_API_KEY` | Clave de NVIDIA NIM (alternativa) |
| `LEONIA_NVIDIA_MODEL` | Opcional. Modelo NIM (debe soportar tool calling) |
| `LEONIA_PROVIDER` | Opcional. Fuerza `anthropic` o `nvidia` |
| `CRM_PASSWORD` | Contraseña del CRM (`/crm`) |
| `CRM_SECRET` | Firma de las sesiones del CRM (texto largo al azar) |
| `BLOB_READ_WRITE_TOKEN` | Lo crea Vercel al conectar el Blob store privado `bolivia-fitness-crm` |

Después de agregar la clave, redeploy.

## CRM (`/crm`)

Pensado para una cadena de suplementos que vende por tienda, web y WhatsApp:

- **Inicio**: ventas de hoy y del mes (vs. mes anterior), pedidos abiertos, ticket promedio, clientes nuevos,
  tasa de recompra, gráfico de 30 días y la lista "Para hoy" (pedidos por confirmar, recompras vencidas, tareas,
  lotes por vencer, stock bajo, cumpleaños).
- **Pedidos**: tablero por estado (nuevo → confirmado → preparado → enviado → entregado / cancelado) con arrastrar y
  soltar, lista con filtros, alta manual, pago, regalo, historial y aviso de estado por WhatsApp. Los pedidos del
  checkout del sitio y los que confirma LeonIA **entran solos** (precios recalculados en el servidor).
- **Clientes 360°**: segmentos automáticos (VIP, activo, nuevo, en riesgo, perdido, prospecto), niveles
  Bronce/Plata/Oro, puntos, LTV, pedidos, línea de tiempo (notas, llamadas, visitas, WhatsApp), mensajes rápidos,
  permiso de WhatsApp registrado con fecha, importación/exportación CSV y borrado con anonimización de pedidos.
- **Recompras**: calcula cuándo se termina cada suplemento (servicios del envase × cantidad ÷ uso diario de la
  categoría) y arma el WhatsApp de recordatorio; además, lista de clientes para recuperar.
- **Inventario**: lotes con vencimiento por sucursal; al pasar un pedido a *Preparado* se descuenta solo, primero
  el lote que vence antes (FEFO), y se devuelve si se cancela. Alertas de stock bajo, por vencer y vencidos;
  valor al costo y de venta.
- **Campañas**: segmento + sucursal + objetivo + categoría comprada + etiqueta → cola de envío por WhatsApp
  (solo a quien dio permiso) con seguimiento de enviados.
- **Tareas**, **Reportes** (ingresos por día/semana, canal, sucursal, categoría, top productos, nuevos vs.
  recurrentes, % de recompra recuperada, CSV) y **Ajustes** (equipo, umbrales, uso diario, plantillas, copia JSON,
  registro de actividad, datos de ejemplo que se borran con un clic).

Seguridad: cookie de sesión firmada HttpOnly + SameSite=Strict (12 h), encabezado `X-CRM` obligatorio en toda
escritura, límite de intentos de login, intake público con límite por IP y trampa para bots, datos en un Blob
**privado** con 10 versiones de respaldo por colección.

## Cómo funciona LeonIA

- El modelo **propone** llamadas a herramientas; `api/_tools.js` valida y calcula todo precio, total,
  ahorro, horario y pedido. El modelo solo cita resultados.
- El pedido se confirma **en el servidor**: el resumen se muestra en un turno y el pedido se crea solo cuando
  el siguiente mensaje del cliente es un "sí" claro (no "sí, pero…"). Un "sí" repetido no duplica el pedido.
- Eventos NDJSON: `text`, `cart`, `options`, `readback`, `location`, `order`, `handoff`, `state`, `error`.
- Voz: Web Speech API (reconocimiento `es-BO`, lectura en voz alta, interrupción, manos libres, wake lock).

## Datos que faltan (los tiene que completar la marca)

Ver la sección "Needs owner input" del PR / reporte. Se agregan en `js/data.js`.
