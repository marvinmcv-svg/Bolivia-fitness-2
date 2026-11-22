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

## Estructura

```
index.html          estructura + SEO (Open Graph, schema.org Store)
css/styles.css      sistema de diseño base (componentes, layout, responsive)
css/retail.css      tema claro actual (tokens + estilo retail; las secciones oscuras redeclaran tokens)
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

Después de agregar la clave, redeploy.

## Cómo funciona LeonIA

- El modelo **propone** llamadas a herramientas; `api/_tools.js` valida y calcula todo precio, total,
  ahorro, horario y pedido. El modelo solo cita resultados.
- El pedido se confirma **en el servidor**: el resumen se muestra en un turno y el pedido se crea solo cuando
  el siguiente mensaje del cliente es un "sí" claro (no "sí, pero…"). Un "sí" repetido no duplica el pedido.
- Eventos NDJSON: `text`, `cart`, `options`, `readback`, `location`, `order`, `handoff`, `state`, `error`.
- Voz: Web Speech API (reconocimiento `es-BO`, lectura en voz alta, interrupción, manos libres, wake lock).

## Datos que faltan (los tiene que completar la marca)

Ver la sección "Needs owner input" del PR / reporte. Se agregan en `js/data.js`.
