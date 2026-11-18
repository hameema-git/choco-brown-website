// Vercel Function: shared shop status (open/closed + unavailable menu items).
// GET  /api/status            -> public status (customers' browsers read this)
// POST /api/status            -> save status, needs header x-admin-pin = ADMIN_PIN
// Storage: Upstash Redis (add it from Vercel > Storage / Marketplace).
import { createHash, timingSafeEqual } from "node:crypto";

const KEY = "choco-brown:status";
const DEFAULT = { shopOpen: true, closedMessage: "", unavailable: [] };

const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(command) {
  const res = await fetch(redisUrl(), {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Storage error ${res.status}`);
  return (await res.json()).result;
}

function clean(input) {
  const s = input && typeof input === "object" ? input : {};
  const ids = Array.isArray(s.unavailable) ? s.unavailable : [];
  return {
    shopOpen: s.shopOpen !== false,
    closedMessage: typeof s.closedMessage === "string" ? s.closedMessage.trim().slice(0, 140) : "",
    unavailable: [...new Set(ids.filter((id) => typeof id === "string" && id.length <= 60))].slice(0, 200),
  };
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const digest = (v) => createHash("sha256").update(String(v)).digest();
const pinOk = (request) => {
  const expected = process.env.ADMIN_PIN;
  const given = request.headers.get("x-admin-pin");
  return !!expected && !!given && timingSafeEqual(digest(expected), digest(given));
};

async function load() {
  if (!redisUrl() || !redisToken()) return { ...DEFAULT };
  const raw = await redis(["GET", KEY]);
  if (!raw) return { ...DEFAULT };
  try { return clean(JSON.parse(raw)); } catch { return { ...DEFAULT }; }
}

export async function GET(request) {
  try {
    const status = await load();
    const body = { ...status, storageConnected: !!(redisUrl() && redisToken()) };
    if (request.headers.get("x-admin-pin")) {
      const ok = pinOk(request);
      if (!ok) await new Promise((r) => setTimeout(r, 500));
      body.authorized = ok;
    }
    return json(body);
  } catch {
    return json({ ...DEFAULT, storageConnected: false });
  }
}

export async function POST(request) {
  if (!process.env.ADMIN_PIN) return json({ error: "ADMIN_PIN is not set in Vercel." }, 503);
  if (!redisUrl() || !redisToken()) return json({ error: "Storage is not connected in Vercel." }, 503);
  if (!pinOk(request)) {
    await new Promise((r) => setTimeout(r, 500));
    return json({ error: "Wrong PIN." }, 401);
  }
  let payload;
  try { payload = await request.json(); } catch { return json({ error: "Bad request." }, 400); }
  const status = clean(payload);
  try {
    await redis(["SET", KEY, JSON.stringify(status)]);
  } catch {
    return json({ error: "Could not save. Try again." }, 502);
  }
  return json({ ...status, storageConnected: true });
}
