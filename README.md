# Plano Digital — sitio web

Sitio estático (HTML, CSS y JS sin dependencias). No necesita compilarse.

## Archivos
- `index.html`: la página completa
- `styles.css`: estilos (primero celular, luego escritorio; animaciones en CSS)
- `main.js`: menú móvil y formulario a WhatsApp con validación
- `aviso-de-privacidad.html`: aviso de privacidad (revísalo antes de publicar)
- `favicon.svg`: ícono del sitio
- `robots.txt`: permite que Google indexe el sitio
- `terminos.html`: términos y condiciones del servicio
- `politica-de-cookies.html`: política de cookies
- `vercel.json`: activa direcciones limpias (`/aviso-de-privacidad`, `/terminos`, `/politica-de-cookies`)

## Cookies y Vercel Web Analytics
- El banner de cookies aparece en la primera visita y guarda la elección 12 meses en la cookie `pd_consent`.
- Ningún script de análisis o marketing carga antes del consentimiento. Están en el HTML como `<script type="text/plain" data-consent="analisis">` y `main.js` los activa solo si la persona acepta esa categoría.
- Para usar Vercel Web Analytics: en Vercel abre tu proyecto › Analytics › Enable. No hace falta tocar el código.
- Si agregas otra herramienta (por ejemplo Google Analytics o un píxel de anuncios), ponla con `type="text/plain"` y `data-consent="analisis"` o `"marketing"`, y añádela a la tabla de `politica-de-cookies.html`.

## Probarlo en tu computadora
Abre `index.html` en tu navegador.

## Subirlo a GitHub y Vercel
1. Crea un repositorio nuevo en GitHub (por ejemplo `plano-digital`).
2. Sube estos archivos a la raíz del repositorio (botón **Add file → Upload files**).
3. Entra a vercel.com, elige **Add New → Project** e importa el repositorio.
4. Framework Preset: **Other**. No cambies nada más y da clic en **Deploy**.
5. Para usar tu dominio: en Vercel ve a **Settings → Domains** y agrégalo.

## Antes de publicar
- Llena todos los datos marcados entre corchetes (resaltados en dorado) en las páginas legales y en el pie.
- Revisa los textos legales con un abogado antes de publicar.
- Cuando tengas dominio, agrega `<link rel="canonical">` y un `sitemap.xml` con tu URL.
