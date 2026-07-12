/**
 * Dottie Deeds — Stripe Worker
 * Deploy as its OWN Cloudflare Worker (e.g. dottie-stripe.wplevy.workers.dev).
 * Keeps the Stripe secret key isolated from the Anthropic proxy.
 *
 * Routes (POST):
 *   /create-checkout  { _dd_auth, plan: "solo"|"firm", annual?:bool }  -> { url }
 *   /portal           { _dd_auth }                                     -> { url }
 *   /report-usage     { _dd_auth, quantity }                          -> { ok }
 *   /webhook          (Stripe signed)                                  -> 200
 *
 * Required secrets/vars (wrangler secret put / dashboard):
 *   STRIPE_SECRET_KEY            sk_test_...  (secret)
 *   STRIPE_WEBHOOK_SECRET        whsec_...    (secret, after creating the webhook)
 *   SUPABASE_URL                 https://mmhodgxhpsractyhxazw.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    service_role JWT (secret)
 *   APP_URL                      https://dottiedeeds.com
 *   PRICE_SOLO_BASE              price_1TsDWqE1PzY3TG9M0eDlo7H6
 *   PRICE_FIRM_BASE              price_1TsDf6E1PzY3TG9MAkm2BlrX
 *   PRICE_SOLO_METERED           (optional, fill after creating the metered price)
 *   PRICE_FIRM_METERED           (optional)
 *   PRICE_SOLO_ANNUAL            (optional)
 *   PRICE_FIRM_ANNUAL            (optional)
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

// ---- Stripe REST helper (form-encoded, Bearer auth) ----
function formEncode(obj, prefix = "") {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") parts.push(formEncode(v, key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.join("&");
}
async function stripe(env, path, method = "POST", body = null) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? formEncode(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path}: ${data.error?.message || res.status}`);
  return data;
}

// ---- Supabase helpers ----
async function verifyUser(env, token) {
  if (!token) return null;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json(); // { id, email, ... }
}
async function sbGetProfile(env, userId) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : null;
}
async function sbUpdateProfile(env, userId, patch) {
  await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
}
async function sbFindByCustomer(env, customerId) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id`,
    { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
  );
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0].id : null;
}

// ---- ensure a Stripe customer exists for this user ----
async function ensureCustomer(env, user, profile) {
  if (profile?.stripe_customer_id) return profile.stripe_customer_id;
  const cust = await stripe(env, "customers", "POST", {
    email: user.email,
    metadata: { user_id: user.id },
  });
  await sbUpdateProfile(env, user.id, { stripe_customer_id: cust.id });
  return cust.id;
}

// ---- map subscription -> profile patch ----
function planFromItems(env, items) {
  let plan = null, meteredItemId = null;
  for (const it of items) {
    const pid = it.price?.id;
    if (pid === env.PRICE_SOLO_BASE || pid === env.PRICE_SOLO_ANNUAL) plan = "solo";
    if (pid === env.PRICE_FIRM_BASE || pid === env.PRICE_FIRM_ANNUAL) plan = "firm";
    const metered = it.price?.recurring?.usage_type === "metered";
    if (metered) meteredItemId = it.id;
  }
  return { plan, meteredItemId };
}
async function syncSubscription(env, sub) {
  const userId = sub.metadata?.user_id || (await sbFindByCustomer(env, sub.customer));
  if (!userId) return;
  const { plan, meteredItemId } = planFromItems(env, sub.items?.data || []);
  await sbUpdateProfile(env, userId, {
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    stripe_metered_item_id: meteredItemId,
    plan,
    subscription_status: sub.status, // active, trialing, past_due, canceled, ...
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
  });
}

// ---- Stripe webhook signature verification (Web Crypto) ----
async function verifySig(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  // constant-time-ish compare
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    try {
      // ---------- WEBHOOK ----------
      if (path === "/webhook" && request.method === "POST") {
        const raw = await request.text();
        const ok = await verifySig(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET);
        if (!ok) return new Response("bad signature", { status: 400 });
        const event = JSON.parse(raw);
        switch (event.type) {
          case "checkout.session.completed": {
            const s = event.data.object;
            if (s.subscription && s.client_reference_id) {
              // stamp user_id onto the subscription metadata for future events
              await stripe(env, `subscriptions/${s.subscription}`, "POST", {
                metadata: { user_id: s.client_reference_id },
              });
              const sub = await stripe(env, `subscriptions/${s.subscription}`, "GET");
              await syncSubscription(env, sub);
            }
            break;
          }
          case "customer.subscription.created":
          case "customer.subscription.updated":
            await syncSubscription(env, event.data.object);
            break;
          case "customer.subscription.deleted": {
            const sub = event.data.object;
            const userId = sub.metadata?.user_id || (await sbFindByCustomer(env, sub.customer));
            if (userId) await sbUpdateProfile(env, userId, { subscription_status: "canceled", plan: null, stripe_metered_item_id: null });
            break;
          }
        }
        return new Response("ok", { status: 200 });
      }

      // ---------- everything else needs a signed-in user ----------
      const bodyText = await request.text();
      const body = bodyText ? JSON.parse(bodyText) : {};
      const user = await verifyUser(env, body._dd_auth);
      if (!user) return json({ error: "unauthorized" }, 401);
      const profile = await sbGetProfile(env, user.id);

      // ---------- CREATE CHECKOUT ----------
      if (path === "/create-checkout") {
        const plan = body.plan === "firm" ? "firm" : "solo";
        const annual = !!body.annual;
        const baseKey = plan === "firm"
          ? (annual ? "PRICE_FIRM_ANNUAL" : "PRICE_FIRM_BASE")
          : (annual ? "PRICE_SOLO_ANNUAL" : "PRICE_SOLO_BASE");
        const basePrice = env[baseKey];
        if (!basePrice) return json({ error: `price not configured: ${baseKey}` }, 400);
        const meteredPrice = plan === "firm" ? env.PRICE_FIRM_METERED : env.PRICE_SOLO_METERED;

        const customer = await ensureCustomer(env, user, profile);
        const line_items = { 0: { price: basePrice, quantity: 1 } };
        if (meteredPrice) line_items[1] = { price: meteredPrice }; // metered: no quantity

        const session = await stripe(env, "checkout/sessions", "POST", {
          mode: "subscription",
          customer,
          client_reference_id: user.id,
          line_items,
          subscription_data: { metadata: { user_id: user.id } },
          allow_promotion_codes: true,
          success_url: `${env.APP_URL}/app.html?checkout=success`,
          cancel_url: `${env.APP_URL}/app.html?checkout=cancel`,
        });
        return json({ url: session.url });
      }

      // ---------- BILLING PORTAL ----------
      if (path === "/portal") {
        const customer = profile?.stripe_customer_id || (await ensureCustomer(env, user, profile));
        const ps = await stripe(env, "billing_portal/sessions", "POST", {
          customer,
          return_url: `${env.APP_URL}/app.html`,
        });
        return json({ url: ps.url });
      }

      // ---------- REPORT USAGE (1 unit per deed) ----------
      if (path === "/report-usage") {
        const itemId = profile?.stripe_metered_item_id;
        if (!itemId) return json({ ok: false, reason: "no metered item" }); // not fatal
        const qty = Math.max(1, parseInt(body.quantity || 1, 10));
        await stripe(env, `subscription_items/${itemId}/usage_records`, "POST", {
          quantity: qty,
          timestamp: Math.floor(Date.now() / 1000),
          action: "increment",
        });
        return json({ ok: true });
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  },
};
