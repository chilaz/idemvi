const IDEMVI_API_KEY = Deno.env.get("IDEMVI_API_KEY");

type Payload = Record<string, unknown>;

const actions: Record<string, (payload: Payload) => Promise<unknown>> = {
  async getDashboardSummary(payload) {
    return {
      success: true,
      action_name: "getDashboardSummary",
      message: "Dashboard summary returned successfully",
      data: { agents: 41, status: "active", payload },
    };
  },
  async trackEvent(payload) {
    return {
      success: true,
      action_name: "trackEvent",
      message: "Event tracked successfully",
      payload,
    };
  },
};

const LANDING_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Idemvi Bridge API</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #0b1020; color: #e6ebf2;
    font: 15px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  *, *::before, *::after { box-sizing: border-box; }
  main { width: min(620px, 90vw); padding: 32px; border: 1px solid #1e2a44;
    border-radius: 14px; background: #111a2e; }
  h1 { margin: 0 0 6px; font-size: 20px; letter-spacing: .01em; }
  .status { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;
    font-size: 13px; color: #7ee2a8; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #35c97a; }
  p { margin: 0 0 18px; color: #a7b3c6; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px;
    background: #0b1424; border: 1px solid #1e2a44; border-radius: 6px; padding: 2px 6px;
    overflow-wrap: anywhere; }
  ul { margin: 0; padding-left: 18px; color: #a7b3c6; }
  li { margin-bottom: 8px; }
  footer { margin-top: 22px; font-size: 12px; color: #64748b; }
</style>
</head>
<body>
<main>
  <h1>Idemvi Bridge API</h1>
  <div class="status"><span class="dot"></span> Service is running</div>
  <p>Single endpoint, POST only, authenticated with an <code>X-API-Key</code> header.</p>
  <ul>
    <li><code>POST /bridge/api/chat</code> with <code>{"action_name":"getDashboardSummary"}</code></li>
    <li><code>POST /bridge/api/chat</code> with <code>{"action_name":"trackEvent","payload":{...}}</code></li>
  </ul>
  <footer>Every other path answers JSON 404.</footer>
</main>
</body>
</html>
`;

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/" && (req.method === "GET" || req.method === "HEAD")) {
    return new Response(req.method === "HEAD" ? null : LANDING_PAGE, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (url.pathname !== "/bridge/api/chat") {
    return Response.json({ error: "Not Found", path: url.pathname }, { status: 404 });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method Not Allowed", allowed: "POST" },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const incomingKey = req.headers.get("X-API-Key");
  if (!IDEMVI_API_KEY || incomingKey !== IDEMVI_API_KEY) {
    return Response.json({ error: "Forbidden: invalid IDEMVI_API_KEY" }, { status: 403 });
  }

  let body: { action_name?: string; payload?: Payload };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action_name, payload = {} } = body;

  if (!action_name) {
    return Response.json({ error: "Missing action_name" }, { status: 400 });
  }

  const handler = actions[action_name];
  if (!handler) {
    return Response.json(
      { error: "Unknown action", action_name, available_actions: Object.keys(actions) },
      { status: 400 },
    );
  }

  const result = await handler(payload);
  return Response.json(result, { status: 200 });
});
