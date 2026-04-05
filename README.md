# TailorCV Web App

AI-powered resume tailoring. Free to start, $9/month Pro.

## Project structure

```
tailorcv-webapp/
├── server.js          ← Express backend (auth, AI proxy, Stripe, SQLite)
├── package.json
├── .env.example       ← Copy to .env and fill in your keys
├── tailorcv.db        ← SQLite database (auto-created on first run)
└── public/
    ├── index.html     ← Landing page
    ├── auth.html      ← Login / Sign up
    ├── app.html       ← The resume builder app
    ├── account.html   ← Account & billing management
    ├── docx.iife.js   ← DOCX generation library
    └── jszip.min.js   ← ZIP library for DOCX parsing
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

| Variable | Where to get it |
|---|---|
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CLAUDE_API_KEY` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI or dashboard webhook setup |
| `STRIPE_PRICE_MONTHLY` | Create a $9/month recurring price in Stripe |
| `STRIPE_PRICE_ANNUAL` | Create a $79/year recurring price in Stripe |
| `APP_URL` | Your production domain, e.g. `https://tailorcv.com` |

### 3. Set up Stripe products

In your Stripe dashboard:
1. Create a product called **"TailorCV Pro"**
2. Add a **recurring price**: $9.00 / month → copy the `price_...` ID → `STRIPE_PRICE_MONTHLY`
3. Add a **recurring price**: $79.00 / year → copy the `price_...` ID → `STRIPE_PRICE_ANNUAL`

### 4. Set up Stripe webhook

For local development:
```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

For production: create a webhook endpoint in Stripe dashboard pointing to `https://yourdomain.com/api/stripe/webhook` with these events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 5. Run the server

```bash
# Development (auto-restart on file changes, Node 18+)
npm run dev

# Production
npm start
```

App runs at `http://localhost:3000`

---

## Deployment (Render.com — recommended free tier)

1. Push this folder to a GitHub repository
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Node version**: 18+
5. Add all environment variables from `.env` in the Render dashboard
6. Set `APP_URL` to your Render URL (e.g. `https://tailorcv.onrender.com`)

> **Persistent disk**: SQLite writes to `tailorcv.db`. On Render free tier, the disk resets on redeploy. For production, add a Render persistent disk or migrate to PostgreSQL using the `pg` package.

---

## Business model

| Plan | Price | Features |
|---|---|---|
| Free | $0 | 1 resume tailoring + 1 download |
| Pro | $9/mo or $79/yr | Unlimited tailoring, ATS score, cover letter, skills gap, interview prep |

Free users get just enough to see the value, then upgrade.

---

## Tech stack

- **Frontend**: Vanilla HTML/CSS/JS (no build step needed)
- **Backend**: Node.js + Express
- **Database**: SQLite via better-sqlite3
- **Auth**: JWT (30-day tokens)
- **Payments**: Stripe subscriptions
- **AI**: Anthropic Claude API (claude-sonnet-4-6 + claude-haiku-4-5-20251001)
- **DOCX generation**: docx.js (client-side)
