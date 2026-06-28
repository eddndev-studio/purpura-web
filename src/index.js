// Worker estatico: sirve la pagina publica de Purpura. Dos cosas viven aqui:
//   - "/" y "/privacy": politica de privacidad + punto de solicitud de eliminacion de cuenta
//     (la URL que se declara en Google Play Console).
//   - "/verify": landing de verificacion de correo (Fase 2). El correo que envia el backend
//     enlaza a /verify?token=XXX; la pagina muestra un boton y al pulsarlo el Worker hace un
//     POST server-to-server a la API (api.purpura.eddn.dev) /auth/verify-email/confirm. El POST
//     desde el servidor evita CORS y, al exigir el clic, evita que un escaner de enlaces de
//     correo consuma el token de un solo uso con un simple GET.
// Cualquier otra ruta redirige a "/". Sin estado ni dependencias: solo HTML.

const LAST_UPDATED = "27 de junio de 2026";
const API_BASE = "https://api.purpura.eddn.dev";

const STYLES = `<style>
  :root {
    --bg: #faf7fe;
    --surface: #ffffff;
    --ink: #1d1a26;
    --muted: #5e5872;
    --brand: #5d007f;
    --brand-bright: #7c4dff;
    --line: #e9e1f5;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #131019;
      --surface: #1c1726;
      --ink: #ece8f5;
      --muted: #a59fb8;
      --brand: #c68bff;
      --brand-bright: #c68bff;
      --line: #2c2440;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font: 16px/1.65 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 760px; margin: 0 auto; padding: 32px 22px 72px; }
  header { padding: 28px 0 8px; }
  .brand {
    display: inline-flex; align-items: center; gap: 12px;
    font-weight: 700; font-size: 20px; letter-spacing: .2px; color: var(--brand);
  }
  .dot {
    width: 30px; height: 30px; border-radius: 999px;
    background: linear-gradient(135deg, var(--brand), var(--brand-bright));
    display: inline-block;
  }
  h1 { font-size: 30px; line-height: 1.2; margin: 18px 0 6px; letter-spacing: -.4px; }
  .updated { color: var(--muted); font-size: 14px; margin: 0 0 26px; }
  h2 {
    font-size: 19px; margin: 34px 0 10px; padding-top: 18px;
    border-top: 1px solid var(--line);
  }
  p { margin: 12px 0; }
  ul { margin: 12px 0; padding-left: 22px; }
  li { margin: 8px 0; }
  strong { color: var(--ink); }
  a { color: var(--brand-bright); }
  code {
    background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
    padding: 1px 6px; font-size: 14px;
  }
  .callout {
    background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--brand-bright);
    border-radius: 12px; padding: 16px 18px; margin: 16px 0;
  }
  footer { margin-top: 44px; color: var(--muted); font-size: 13px; }
  /* Verificacion de correo (/verify). */
  .card {
    background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
    padding: 36px 28px; margin-top: 26px; text-align: center;
  }
  .card h1 { margin: 14px 0 8px; }
  .card p { color: var(--muted); max-width: 46ch; margin-left: auto; margin-right: auto; }
  .badge {
    width: 66px; height: 66px; border-radius: 999px;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .badge svg { width: 32px; height: 32px; }
  .badge.ok { background: rgba(124, 77, 255, .14); color: var(--brand-bright); }
  .badge.warn { background: rgba(214, 158, 0, .18); color: #b07c00; }
  .badge.err { background: rgba(214, 60, 60, .14); color: #d23c3c; }
  .btn {
    display: inline-block; margin-top: 20px; padding: 13px 28px;
    border: none; border-radius: 999px; cursor: pointer;
    background: linear-gradient(135deg, var(--brand), var(--brand-bright));
    color: #fff; font: inherit; font-weight: 700;
  }
  .btn:hover { filter: brightness(1.06); }
  .muted-small { color: var(--muted); font-size: 14px; margin-top: 16px; }
</style>`;

const PAGE = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="all">
<title>Politica de Privacidad - Purpura</title>
<meta name="description" content="Politica de privacidad de Purpura, organizador de eventos. Incluye como eliminar tu cuenta y todos tus datos.">
${STYLES}
</head>
<body>
<div class="wrap">
  <header>
    <span class="brand"><span class="dot"></span>Purpura</span>
  </header>

  <h1>Politica de Privacidad</h1>
  <p class="updated">Ultima actualizacion: ${LAST_UPDATED}</p>

  <p>Purpura ("la app") es un organizador de eventos desarrollado por eddndev. Esta politica explica
  que datos maneja la app y como.</p>

  <h2>Datos que recopilamos</h2>
  <ul>
    <li><strong>Cuenta e identidad.</strong> Para usar la app inicias sesion con tu cuenta de Google
    o con un correo y contrasena. Guardamos tu identificador de usuario y correo para asociarte tus
    eventos.</li>
    <li><strong>Tus eventos.</strong> La descripcion, tipo, estatus, fecha/hora, recordatorio,
    contacto y ubicacion que tu capturas en cada evento se sincronizan con tu cuenta a traves de
    nuestro servidor (api.purpura.eddn.dev) para que esten disponibles en tus dispositivos.</li>
    <li><strong>Contactos (opcional).</strong> Si eliges adjuntar un contacto a un evento, la app lee
    el nombre y el telefono del contacto que selecciones. Ese nombre y telefono se guardan como parte
    del evento y, por tanto, se transmiten a nuestro servidor y se incluyen en los archivos de
    respaldo que generes en Google Drive. El acceso a contactos ocurre solo cuando tu abres el
    selector; la app no lee toda tu agenda ni la sube en bloque.</li>
    <li><strong>Ubicacion (opcional).</strong> Si eliges una ubicacion para un evento, se guardan las
    coordenadas y una etiqueta del lugar. La app NO accede a la ubicacion en tiempo real del
    dispositivo (no solicita el permiso de ubicacion precisa); usas un mapa y una busqueda de lugares
    para elegir el punto.</li>
  </ul>

  <h2>Permisos que usa la app</h2>
  <ul>
    <li><strong>Notificaciones</strong>: para mostrar los recordatorios de tus eventos.</li>
    <li><strong>Alarmas exactas</strong>: para que el recordatorio llegue puntual incluso en ahorro
    de energia.</li>
    <li><strong>Lectura de contactos</strong>: solo al adjuntar un contacto a un evento, como se
    describe arriba.</li>
    <li><strong>Internet</strong>: para sincronizar tus eventos y, si lo usas, el respaldo en Drive.</li>
  </ul>

  <h2>Respaldo en Google Drive (opcional)</h2>
  <p>Si usas el respaldo en Drive, la app emplea el alcance restringido <code>drive.file</code>: solo
  puede ver y gestionar los archivos de respaldo que ella misma crea. No accede al resto de tu Drive.</p>

  <h2>Como se usan y comparten los datos</h2>
  <p>Usamos tus datos unicamente para ofrecer la funcion de organizar y sincronizar tus eventos. No
  vendemos tus datos ni los usamos para publicidad. Los datos se transmiten cifrados (HTTPS).</p>

  <h2>Conservacion y eliminacion de la cuenta</h2>
  <p>Tus eventos se conservan mientras tengas la cuenta. Al cerrar sesion se borran los datos locales
  del dispositivo.</p>
  <div class="callout">
    <p style="margin-top:0"><strong>Como eliminar tu cuenta y todos tus datos.</strong> Puedes
    eliminar de forma permanente tu cuenta y todos los datos asociados (cuenta, eventos y su
    contenido) de nuestro servidor de dos maneras:</p>
    <ul>
      <li><strong>Desde la app</strong> (inmediato): abre <strong>Cuenta &gt; Eliminar cuenta</strong>
      y confirma. La accion borra tu cuenta y todos tus eventos del servidor al instante y cierra la
      sesion en el dispositivo. No se puede deshacer.</li>
      <li><strong>Sin la app</strong> (por correo): envia una solicitud desde el correo de tu cuenta a
      <a href="mailto:eddndev@gmail.com?subject=Eliminar%20mi%20cuenta%20Purpura">eddndev@gmail.com</a>
      con el asunto "Eliminar mi cuenta Purpura". Atenderemos la solicitud y eliminaremos los datos en
      un plazo maximo de 30 dias.</li>
    </ul>
    <p style="margin-bottom:0">Esta pagina es el punto publico de solicitud de eliminacion de cuenta
    (URL requerida por Google Play).</p>
  </div>

  <h2>Contacto</h2>
  <p>Dudas sobre privacidad: <a href="mailto:eddndev@gmail.com">eddndev@gmail.com</a></p>

  <footer>&copy; 2026 Purpura - eddndev</footer>
</div>
</body>
</html>`;

const ICON_MAIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"></path></svg>`;
const ICON_WARN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v6"></path><circle cx="12" cy="16.6" r="1.1" fill="currentColor" stroke="none"></circle></svg>`;

// Cada estado de /verify: que badge, icono, titulo, mensaje y si ofrece un boton (que reenvia
// el token por POST). prompt/error ofrecen boton (confirmar/reintentar); el resto son terminales.
const VERIFY_STATES = {
  prompt: {
    title: "Verifica tu correo", badge: "ok", icon: ICON_MAIL, heading: "Verifica tu correo",
    body: "Confirma que este correo es tuyo para terminar de configurar tu cuenta de Purpura.",
    button: "Confirmar mi correo",
  },
  success: {
    title: "Correo verificado", badge: "ok", icon: ICON_CHECK, heading: "Correo verificado",
    body: "Listo. Tu correo quedo verificado. Ya puedes cerrar esta ventana y volver a la app.",
  },
  expired: {
    title: "El enlace expiro", badge: "warn", icon: ICON_WARN, heading: "El enlace expiro",
    body: "Este enlace de verificacion ya no es valido. Abre Purpura y pide un nuevo correo de verificacion.",
  },
  invalid: {
    title: "Enlace no valido", badge: "err", icon: ICON_WARN, heading: "Enlace no valido",
    body: "Este enlace ya se uso o no es correcto. Si tu correo aun no esta verificado, pide uno nuevo desde la app.",
  },
  error: {
    title: "Algo salio mal", badge: "err", icon: ICON_WARN, heading: "Algo salio mal",
    body: "No pudimos verificar tu correo en este momento. Intentalo de nuevo en unos minutos.",
    button: "Reintentar",
  },
  missing: {
    title: "Enlace incompleto", badge: "warn", icon: ICON_WARN, heading: "Enlace incompleto",
    body: "Falta el token de verificacion. Abre el enlace directamente desde el correo que te enviamos.",
  },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function verifyPage(stateKey, token) {
  const s = VERIFY_STATES[stateKey] || VERIFY_STATES.error;
  const action = s.button
    ? `
    <form method="post" action="/verify">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <button class="btn" type="submit">${s.button}</button>
    </form>`
    : `
    <p class="muted-small">Puedes cerrar esta ventana.</p>`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${s.title} - Purpura</title>
${STYLES}
</head>
<body>
<div class="wrap">
  <header>
    <span class="brand"><span class="dot"></span>Purpura</span>
  </header>
  <div class="card">
    <span class="badge ${s.badge}">${s.icon}</span>
    <h1>${s.heading}</h1>
    <p>${s.body}</p>${action}
  </div>
  <footer>&copy; 2026 Purpura - eddndev</footer>
</div>
</body>
</html>`;
}

function htmlResponse(html, maxAge) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
}

// Las paginas de /verify dependen del token y de la respuesta de la API: nunca se cachean.
function verifyResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

// POST /verify: el token llega en el cuerpo del formulario. El Worker confirma contra la API
// (server-to-server, sin CORS) y traduce el codigo HTTP a un estado de pagina.
async function confirmVerification(request) {
  let token = "";
  try {
    const form = await request.formData();
    token = (form.get("token") || "").toString();
  } catch (_) {
    // cuerpo ilegible -> se trata como token ausente
  }
  if (!token) {
    return verifyResponse(verifyPage("missing", ""));
  }

  let status = 0;
  try {
    const resp = await fetch(`${API_BASE}/api/v1/auth/verify-email/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    status = resp.status;
  } catch (_) {
    return verifyResponse(verifyPage("error", token));
  }

  let state;
  if (status === 204) state = "success";
  else if (status === 410) state = "expired";
  else if (status === 400) state = "invalid";
  else state = "error";
  return verifyResponse(verifyPage(state, token));
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/" || pathname === "/privacy" || pathname === "/privacidad") {
      return htmlResponse(PAGE, 3600);
    }

    if (pathname === "/verify") {
      if (request.method === "POST") {
        return confirmVerification(request);
      }
      // GET: muestra el boton de confirmacion (o el aviso si falta el token).
      const token = url.searchParams.get("token") || "";
      return verifyResponse(verifyPage(token ? "prompt" : "missing", token));
    }

    // Cualquier otra ruta lleva a la politica.
    return Response.redirect(url.origin + "/", 302);
  },
};
