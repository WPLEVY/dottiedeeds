# Dottie Deeds — Stripe go-live runbook

Everything below is done by you (I can't reach Stripe, Supabase, or Cloudflare from
the build box). Order matters. Total time ~15 min. Do it in the Stripe **sandbox**
first; repeat in live mode only after the LLC/EIN/bank account exist.

The app is already pushed with all wiring in place. Subscription **enforcement is OFF**
(`ENFORCE_SUBSCRIPTION = false` in app.html), so nothing about the beta changes until
you deploy the pieces below and later flip that flag.

---

## 1. Supabase — add the columns (2 min)
Supabase Studio -> SQL Editor -> paste `supabase_stripe_migration.sql` -> Run.
Safe to re-run. This adds the subscription + single-session columns to `profiles`.

## 2. Cloudflare — deploy the Stripe Worker (5 min)
Deploy `stripe-worker.js` as a **new** Worker, e.g. `dottie-stripe` (do NOT merge it
into the Anthropic proxy). If the name ends up different from
`dottie-stripe.wplevy.workers.dev`, tell me and I'll update `STRIPE_WORKER` in app.html.

Set these Worker **variables/secrets** (Settings -> Variables and Secrets):

Secrets (encrypted):
- `STRIPE_SECRET_KEY`          = your sandbox sk_test_...
- `STRIPE_WEBHOOK_SECRET`      = filled in step 4
- `SUPABASE_SERVICE_ROLE_KEY`  = Supabase -> Project Settings -> API -> service_role key

Plain vars:
- `SUPABASE_URL`   = https://mmhodgxhpsractyhxazw.supabase.co
- `APP_URL`        = https://dottiedeeds.com
- `PRICE_SOLO_BASE`= price_1TsDWqE1PzY3TG9M0eDlo7H6
- `PRICE_FIRM_BASE`= price_1TsDf6E1PzY3TG9MAkm2BlrX
- `PRICE_SOLO_METERED` / `PRICE_FIRM_METERED`  = filled in step 3 (leave empty for now)
- `PRICE_SOLO_ANNUAL` / `PRICE_FIRM_ANNUAL`    = optional, later

With metered left empty, checkout still works — it just bills the flat base only.
Flat billing is fully functional the moment the Worker is up.

## 3. Stripe — create the two metered (usage) prices (4 min)
This is what makes "N included, then $X/deed" work. For EACH plan product
(Solo, Firm) add a **second price**:

Product -> Add another price -> Recurring -> **Usage-based** -> **Graduated tiering**:
- Solo "deed usage": First tier `up to 10` units = **$0.00**; next tier `∞` = **$10.00/unit**
- Firm "deed usage": First tier `up to 30` units = **$0.00**; next tier `∞` = **$8.00/unit**
Billing period: monthly. Copy each new price ID (price_...) into the Worker vars
`PRICE_SOLO_METERED` / `PRICE_FIRM_METERED`, then redeploy the Worker.

The app already reports exactly 1 usage unit per generated deed, so Stripe does the
"first N free, then per-deed" math for you.

## 4. Stripe — create the webhook (2 min)
Developers -> Webhooks -> Add endpoint:
- URL: `https://dottie-stripe.wplevy.workers.dev/webhook`
- Events: `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`
Reveal the **Signing secret** (whsec_...) and set it as the Worker secret
`STRIPE_WEBHOOK_SECRET`, then redeploy.

## 5. Stripe — turn on the Customer Portal (1 min)
Settings -> Billing -> Customer portal -> activate in test mode (allow plan
switch + cancellation). This powers the "Manage billing" button.

## 6. Smoke test
1. Sign in to the app -> **Billing** -> Choose Solo -> use test card `4242 4242 4242 4242`.
2. You should land back on `app.html?checkout=success` with an "active" status.
3. Generate a deed; confirm a usage record appears on the subscription's metered item
   in Stripe once you pass the included count.
4. Billing -> Manage billing should open the Stripe portal.

## 7. Later — flip enforcement on
When you're ready to require payment (post-beta): in app.html set
`ENFORCE_SUBSCRIPTION = true`. Approved beta users (`is_approved`) still pass, so you
can require it for new signups without cutting off existing testers. Tell me and I'll
push that one-line change.

## Notes
- **Do not switch Stripe to live mode until the LLC + EIN + business bank account exist**,
  so the account sits under Dottie Software LLC, not your SSN. Sandbox commits to nothing.
- Single active session is enforced client-side: logging in on a new device signs out the
  old one within ~45s. It fails safe (does nothing) until step 1 is run.
