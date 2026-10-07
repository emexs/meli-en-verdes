# Meli en Verdes 💵

**¿Cuánto es en verdes?** Extensión de Chrome que muestra el equivalente en dólares debajo de cada precio en pesos en MercadoLibre Argentina, usando la cotización oficial del Banco Nación (BNA).

Navegás MercadoLibre como siempre y al lado de cada precio en ARS aparece una etiqueta verde con el valor en USD. Sin configuración, sin cuentas, sin tracking.

## Qué hace

- Agrega una etiqueta `USD 1,234` debajo de cada precio en pesos: listados, resultados de búsqueda, página de producto, carruseles, etc.
- Usa el dólar **tipo vendedor** del BNA, tomado de [bna.com.ar](https://www.bna.com.ar/Cotizador/MonedasHistorico).
- Cachea la cotización durante 1 hora, así no consulta al BNA en cada página.
- Funciona con contenido cargado dinámicamente (scroll infinito, filtros, cambios de variante).
- Ignora lo que no tiene sentido convertir:
  - precios que ya están publicados en `US$`
  - el valor de las cuotas
  - el precio anterior tachado ("Antes: ...")

Los montos de USD 1.000 o más se muestran sin decimales; los menores, con dos.

## Instalación

No está publicada en la Chrome Web Store, se carga manualmente:

1. Cloná o descargá este repositorio:
   ```bash
   git clone https://github.com/emexs/meli-en-verdes.git
   ```
2. Abrí `chrome://extensions` en Chrome (o cualquier navegador basado en Chromium: Edge, Brave, Arc...).
3. Activá el **Modo de desarrollador** (arriba a la derecha).
4. Hacé clic en **Cargar descomprimida** y elegí la carpeta del repositorio.
5. Entrá a [mercadolibre.com.ar](https://www.mercadolibre.com.ar) y listo.

Para actualizar: `git pull` y después el botón de recargar de la extensión en `chrome://extensions`.

## Cómo funciona

Son dos archivos, sin dependencias ni paso de build:

| Archivo | Rol |
| --- | --- |
| `background.js` | Service worker. Descarga la página de cotizaciones del BNA, extrae el valor del dólar con una regex y lo guarda en memoria por 1 hora. Responde al mensaje `GET_USD_RATE`. |
| `content.js` | Se inyecta en MercadoLibre. Pide la cotización al service worker, busca los precios (`.andes-money-amount` y `.price-tag`), lee el monto desde su `aria-label` e inserta la etiqueta. Un `MutationObserver` procesa los precios que aparecen después. |
| `manifest.json` | Manifest V3. |

El monto se lee del `aria-label` y no del texto visible porque ahí viene como número limpio, sin separadores de miles ni centavos en superíndice.

## Permisos y privacidad

La extensión no pide ningún permiso de API de Chrome (`"permissions": []`). Solo declara acceso a estos sitios:

- `*.mercadolibre.com.ar` y `*.mercadolibre.com`: para leer los precios e insertar las etiquetas.
- `www.bna.com.ar`: para obtener la cotización.

No recolecta ni envía ningún dato. El único request que hace es un `GET` a la página pública del BNA.

## Limitaciones

- La cotización sale de parsear el HTML del BNA. Si el banco cambia el formato de la página, la extensión deja de mostrar etiquetas hasta que se ajuste la regex en `background.js`.
- Los selectores dependen del HTML de MercadoLibre, que también puede cambiar.
- Solo usa el dólar oficial BNA. No hay opción para MEP, blue u otras cotizaciones.
- Está pensada para MercadoLibre Argentina. En otros países el script se carga pero la conversión no aplica.

## Depuración

La extensión escribe en consola con el prefijo `[ML-USD]`:

- En la página de MercadoLibre (F12): si recibió la cotización.
- En el service worker (`chrome://extensions` → *Service worker*): el valor obtenido del BNA o el error al parsearlo.

---

Proyecto independiente, sin relación con MercadoLibre ni con el Banco de la Nación Argentina.
