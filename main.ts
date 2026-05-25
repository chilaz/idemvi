{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red23\green30\blue45;\red238\green242\blue247;\red255\green255\blue255;
\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c11765\c16078\c23137;\cssrgb\c94510\c96078\c97647;\cssrgb\c100000\c100000\c100000;
\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs18 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 const IDEMVI_API_KEY = Deno.env.get("IDEMVI_API_KEY");\
\
const actions = \{\
  async getDashboardSummary(payload) \{\
    return \{\
      success: true,\
      action_name: "getDashboardSummary",\
      message: "Dashboard summary returned successfully",\
      data: \{ agents: 41, status: "active", payload \}\
    \};\
  \},\
  async trackEvent(payload) \{\
    return \{\
      success: true,\
      action_name: "trackEvent",\
      message: "Event tracked successfully",\
      payload\
    \};\
  \}\
\};\
\
Deno.serve(async (req) => \{\
  const url = new URL(req.url);\
\
  if (url.pathname !== "/bridge/api/chat") \{\
    return Response.json(\{ error: "Not Found", path: url.pathname \}, \{ status: 404 \});\
  \}\
\
  if (req.method !== "POST") \{\
    return Response.json(\
      \{ error: "Method Not Allowed", allowed: "POST" \},\
      \{ status: 405, headers: \{ Allow: "POST" \} \}\
    );\
  \}\
\
  const incomingKey = req.headers.get("X-API-Key");\
  if (!IDEMVI_API_KEY || incomingKey !== IDEMVI_API_KEY) \{\
    return Response.json(\{ error: "Forbidden: invalid IDEMVI_API_KEY" \}, \{ status: 403 \});\
  \}\
\
  let body;\
  try \{\
    body = await req.json();\
  \} catch \{\
    return Response.json(\{ error: "Invalid JSON body" \}, \{ status: 400 \});\
  \}\
\
  const \{ action_name, payload = \{\} \} = body;\
\
  if (!action_name) \{\
    return Response.json(\{ error: "Missing action_name" \}, \{ status: 400 \});\
  \}\
\
  const handler = actions[action_name];\
  if (!handler) \{\
    return Response.json(\
      \{ error: "Unknown action", action_name, available_actions: Object.keys(actions) \},\
      \{ status: 400 \}\
    );\
  \}\
\
  const result = await handler(payload);\
  return Response.json(result, \{ status: 200 \});\
\});\
\pard\pardeftab720\partightenfactor0

\f1\fs28 \cf0 \cb4 \strokec5 \
}