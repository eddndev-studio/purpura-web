# purpura-web

Sitio público de **Purpura** (organizador de eventos): política de privacidad + punto de solicitud de
eliminación de cuenta (requerido por Google Play) y la landing de **verificación de correo**.

🌐 **En vivo:** https://purpura.eddn.dev/ · también `/privacy` · `/verify`

## Qué es

Un Cloudflare Worker sin estado ni dependencias que sirve HTML. El dominio `purpura.eddn.dev` se
configura como *Custom Domain* del Worker, así que Cloudflare provee DNS y certificado automáticamente.

- `/` y `/privacy` — política de privacidad, con la sección de **eliminación de cuenta**.
- `/verify?token=…` — landing de verificación de correo (Fase 2). Muestra un botón "Confirmar mi
  correo"; al pulsarlo el Worker hace un `POST` **server-to-server** a
  `api.purpura.eddn.dev/api/v1/auth/verify-email/confirm` (sin CORS) y traduce la respuesta a una
  página de éxito / enlace expirado (`410`) / enlace no válido (`400`) / error. Exigir el clic evita
  que un escáner de enlaces de correo consuma el token de un solo uso con un simple `GET`.

Archivos:

- `src/index.js` — el Worker (las páginas viven inline; `PAGE` = privacidad, `verifyPage()` = verify).
- `wrangler.jsonc` — config: nombre, `compatibility_date` y la ruta de Custom Domain.

## Desarrollo y despliegue

Requiere [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (instalado global o `npx`).

```bash
wrangler dev      # previsualización local en http://localhost:8787
wrangler deploy   # publica a Cloudflare + purpura.eddn.dev
```

Para editar el texto de la política, cambia la constante `PAGE` en `src/index.js` y vuelve a
`wrangler deploy`. La fuente del contenido equivale a `docs/playstore/privacy-policy.md` del repo
[`purpura-app`](https://github.com/eddndev-studio/purpura-app).
