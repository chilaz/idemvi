const IDEMVI_API_KEY = Deno.env.get("IDEMVI_API_KEY");

const actions = {
  async getDashboardSummary(payload) {
    return {
      success: true,
      action_name: "getDashboardSummary",
      message: "Dashboard summary returned successfully",
      data: { agents: 41, status: "active", payload }
    };
  },
  async trackEvent(payload) {
    return {
      success: true,
      action_name: "trackEvent",
      message: "Event tracked successfully",
      payload
    };
  }
};

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname !== "/bridge/api/chat") {
    return Response.json({ error: "Not Found", path: url.pathname }, { status: 404 });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method Not Allowed", allowed: "POST" },
      { status: 405, headers: { Allow: "POST" } }
    );
  }

  const incomingKey = req.headers.get("X-API-Key");
  if (!IDEMVI_API_KEY || incomingKey !== IDEMVI_API_KEY) {
    return Response.json({ error: "Forbidden: invalid IDEMVI_API_KEY" }, { status: 403 });
  }

  let body;
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
      { status: 400 }
    );
  }

  const result = await handler(payload);
  return Response.json(result, { status: 200 });
});
