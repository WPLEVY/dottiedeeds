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
 *   PRICE_SOLO_METERED           (meter-backed usage price; fill after creating)
 *   PRICE_FIRM_METERED           (meter-backed usage price; fill after creating)
 *   METER_EVENT_NAME             (optional, defaults to "deed_recorded" — must match the meter)
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
  const soloIds = [env.PRICE_SOLO_BASE, env.PRICE_SOLO_ANNUAL, env.PRICE_SOLO_METERED].filter(Boolean);
  const firmIds = [env.PRICE_FIRM_BASE, env.PRICE_FIRM_ANNUAL, env.PRICE_FIRM_METERED].filter(Boolean);
  for (const it of items) {
    const pid = typeof it.price === "string" ? it.price : (it.price?.id || it.plan?.id);
    if (pid && soloIds.includes(pid)) plan = "solo";
    if (pid && firmIds.includes(pid)) plan = "firm";
    const metered = it.price?.recurring?.usage_type === "metered" || it.plan?.usage_type === "metered";
    if (metered) meteredItemId = it.id;
  }
  return { plan, meteredItemId };
}
async function syncSubscription(env, sub) {
  const userId = sub.metadata?.user_id || (await sbFindByCustomer(env, sub.customer));
  if (!userId) return;
  const items = sub.items?.data || [];
  const { plan: itemPlan, meteredItemId } = planFromItems(env, items);
  const plan = sub.metadata?.plan || itemPlan;
  const periodEnd = sub.current_period_end || items[0]?.current_period_end || null;
  await sbUpdateProfile(env, userId, {
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    stripe_metered_item_id: meteredItemId,
    plan,
    subscription_status: sub.status, // active, trialing, past_due, canceled, ...
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
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
      // ---------- CONFIG CHECK (diagnostic; safe to remove later) ----------
      if (path === "/config-check" && request.method === "GET") {
        return json({
          APP_URL: env.APP_URL || null,
          computed_success_url: `${env.APP_URL}/app.html?checkout=success`,
          SUPABASE_URL: env.SUPABASE_URL || null,
          PRICE_SOLO_BASE: env.PRICE_SOLO_BASE || null,
          PRICE_FIRM_BASE: env.PRICE_FIRM_BASE || null,
          PRICE_SOLO_METERED: env.PRICE_SOLO_METERED || null,
          PRICE_FIRM_METERED: env.PRICE_FIRM_METERED || null,
          METER_EVENT_NAME: env.METER_EVENT_NAME || "deed_recorded (default)",
          has_STRIPE_SECRET_KEY: !!env.STRIPE_SECRET_KEY,
          stripe_key_prefix: env.STRIPE_SECRET_KEY ? env.STRIPE_SECRET_KEY.slice(0, 8) : null,
          has_STRIPE_WEBHOOK_SECRET: !!env.STRIPE_WEBHOOK_SECRET,
          has_SUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
        });
      }

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
          subscription_data: { metadata: { user_id: user.id, plan } },
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

      // ---------- CHANGE PLAN (swap base + metered prices on existing sub) ----------
      if (path === "/change-plan") {
        const target = body.plan === "firm" ? "firm" : "solo";
        const subId = profile?.stripe_subscription_id;
        if (!subId) return json({ error: "no active subscription to change" }, 400);
        const newBase = target === "firm" ? env.PRICE_FIRM_BASE : env.PRICE_SOLO_BASE;
        const newMetered = target === "firm" ? env.PRICE_FIRM_METERED : env.PRICE_SOLO_METERED;
        if (!newBase) return json({ error: "target base price not configured" }, 400);
        const sub = await stripe(env, `subscriptions/${subId}`, "GET");
        const items = sub.items?.data || [];
        const updates = {};
        let i = 0;
        for (const it of items) {
          const metered = it.price?.recurring?.usage_type === "metered" || it.plan?.usage_type === "metered";
          if (metered && !newMetered) continue; // leave metered item alone if not configured
          updates[i++] = { id: it.id, price: metered ? newMetered : newBase };
        }
        await stripe(env, `subscriptions/${subId}`, "POST", {
          items: updates,
          proration_behavior: "create_prorations",
          metadata: { user_id: user.id, plan: target },
        });
        const updated = await stripe(env, `subscriptions/${subId}`, "GET");
        await syncSubscription(env, updated);
        return json({ ok: true, plan: target });
      }

      // ---------- REPORT USAGE (Billing Meter event: 1 per deed) ----------
      // Uses the current meter_events API (the legacy usage_records API was
      // removed in Stripe 2025-03-31.basil). Keyed by customer, so the metered
      // price on that customer's subscription (Solo or Firm tiers) does the math.
      if (path === "/report-usage") {
        const customer = profile?.stripe_customer_id;
        if (!customer) return json({ ok: false, reason: "no customer" }); // not fatal
        const qty = Math.max(1, parseInt(body.quantity || 1, 10));
        const eventName = env.METER_EVENT_NAME || "deed_recorded";
        await stripe(env, "billing/meter_events", "POST", {
          event_name: eventName,
          identifier: `${user.id}-${Date.now()}`,
          timestamp: Math.floor(Date.now() / 1000),
          payload: { stripe_customer_id: customer, value: String(qty) },
        });
        return json({ ok: true });
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  },
};
