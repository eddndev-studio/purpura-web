# purpura-web

Sitio público de **Purpura** (organizador de eventos): política de privacidad y punto de solicitud de
eliminación de cuenta, requerido por Google Play.

🌐 **En vivo:** https://purpura.eddn.dev/ · también `/privacy`

## Qué es

Un Cloudflare Worker sin estado ni dependencias que sirve una sola página HTML (la política de
privacidad, con la sección de **eliminación de cuenta**). El dominio `purpura.eddn.dev` se configura
como *Custom Domain* del Worker, así que Cloudflare provee DNS y certificado automáticamente.

- `src/index.js` — el Worker (la página vive inline en la constante `PAGE`).
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
