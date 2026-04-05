'use strict';
// ═══════════════════════════════════════════════════════════════
//  TailorCV — Express Backend
//  Auth · Claude AI Proxy · Stripe Subscriptions · PostgreSQL
// ═══════════════════════════════════════════════════════════════
const express    = require('express');
const path       = require('path');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { Pool }   = require('pg');
const Stripe     = require('stripe');
const rateLimit  = require('express-rate-limit');
const cors       = require('cors');

// ── Load env ───────────────────────────────────────────────────
try { require('dotenv').config(); } catch(e) {}

const PORT       = process.env.PORT        || 3000;
const JWT_SECRET = process.env.JWT_SECRET  || 'CHANGE_THIS_SECRET_IN_PRODUCTION';
const CLAUDE_KEY = process.env.CLAUDE_API_KEY;
const APP_URL    = process.env.APP_URL     || `http://localhost:${PORT}`;
const stripe     = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// ── PostgreSQL pool ────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ── Create table on startup ────────────────────────────────────
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                     SERIAL PRIMARY KEY,
      email                  TEXT   UNIQUE NOT NULL,
      password_hash          TEXT   NOT NULL,
      plan                   TEXT   NOT NULL DEFAULT 'free',
      stripe_customer_id     TEXT,
      stripe_subscription_id TEXT,
      subscription_status    TEXT,
      tailoring_count        INTEGER NOT NULL DEFAULT 0,
      created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Database ready.');
})().catch(err => { console.error('DB init error:', err); process.exit(1); });

// ── JWT helpers ────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}
function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch(e) { return null; }
}

// ── Auth middleware ────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  pool.query('SELECT * FROM users WHERE id = $1', [payload.sub])
    .then(result => {
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = user;
      next();
    })
    .catch(err => {
      console.error('Auth DB error:', err);
      res.status(500).json({ error: 'Authentication error' });
    });
}

// ── Express app ────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Stripe webhook needs raw body — mount BEFORE express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json({ limit: '4mb' }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later.' } });
const aiLimiter   = rateLimit({ windowMs:  1 * 60 * 1000, max: 10, message: { error: 'Too many AI requests. Please slow down.' } });

// ══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email.toLowerCase(), hash]
    );
    const user = result.rows[0];
    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// ══════════════════════════════════════════════════════════════
//  CLAUDE AI PROXY
// ══════════════════════════════════════════════════════════════
app.post('/api/claude', requireAuth, aiLimiter, async (req, res) => {
  const { type, system, userMsg, maxTokens, model } = req.body || {};
  const user = req.user;

  // ── Gating logic ───────────────────────────────────────────
  const isPro = (user.plan === 'pro' && user.subscription_status === 'active');

  if (type === 'tailor') {
    if (!isPro && user.tailoring_count >= 1) {
      return res.status(402).json({
        error: 'upgrade_required',
        message: 'You have used your free resume tailoring. Upgrade to Pro for unlimited tailoring.',
      });
    }
  } else {
    if (!isPro) {
      return res.status(402).json({
        error: 'upgrade_required',
        message: 'This feature requires a TailorCV Pro subscription.',
      });
    }
  }

  if (!CLAUDE_KEY) {
    return res.status(503).json({ error: 'AI service not configured. Please contact support.' });
  }

  // ── Call Claude ────────────────────────────────────────────
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: maxTokens || 8000,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.json().catch(() => ({}));
      const msg = (err.error && err.error.message) ? err.error.message : `AI error ${claudeRes.status}`;
      return res.status(502).json({ error: msg });
    }

    const json = await claudeRes.json();
    const text = json.content[0].text.trim();

    // Increment tailor count after successful tailor call
    if (type === 'tailor') {
      await pool.query(
        'UPDATE users SET tailoring_count = tailoring_count + 1, updated_at = NOW() WHERE id = $1',
        [user.id]
      );
    }

    res.json({ text });
  } catch (err) {
    console.error('Claude proxy error:', err);
    res.status(502).json({ error: 'AI request failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  BILLING ROUTES (Stripe)
// ══════════════════════════════════════════════════════════════
app.post('/api/billing/create-checkout', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body || {};
    const priceId = plan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) return res.status(503).json({ error: 'Billing not configured. Please contact support.' });

    const user = req.user;
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: String(user.id) } });
      customerId = customer.id;
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1, updated_at = NOW() WHERE email = $2',
        [customerId, user.email]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/account.html?success=1`,
      cancel_url:  `${APP_URL}/account.html?canceled=1`,
      allow_promotion_codes: true,
      metadata: { userId: String(user.id) },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Could not create checkout session.' });
  }
});

app.post('/api/billing/portal', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.stripe_customer_id) return res.status(400).json({ error: 'No billing account found.' });
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${APP_URL}/account.html`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Could not open billing portal.' });
  }
});

// ── Stripe Webhook ─────────────────────────────────────────────
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          const userId = session.metadata && session.metadata.userId;
          if (userId) {
            await pool.query(
              'UPDATE users SET plan = $1, stripe_customer_id = $2, stripe_subscription_id = $3, subscription_status = $4, updated_at = NOW() WHERE id = $5',
              ['pro', session.customer, sub.id, sub.status, parseInt(userId)]
            );
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        if (sub.status === 'active') {
          await pool.query(
            'UPDATE users SET plan = $1, subscription_status = $2, updated_at = NOW() WHERE stripe_subscription_id = $3',
            ['pro', 'active', sub.id]
          );
        } else if (['past_due', 'unpaid'].includes(sub.status)) {
          await pool.query(
            'UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2',
            [sub.status, sub.id]
          );
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await pool.query(
          "UPDATE users SET plan = 'free', subscription_status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2",
          ['canceled', sub.id]
        );
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object;
        if (inv.subscription) {
          await pool.query(
            'UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2',
            ['past_due', inv.subscription]
          );
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
}

// ── SPA fallback ───────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Helpers ────────────────────────────────────────────────────
function safeUser(u) {
  return {
    id:                  u.id,
    email:               u.email,
    plan:                u.plan,
    tailoring_count:     u.tailoring_count,
    subscription_status: u.subscription_status,
  };
}

app.listen(PORT, () => console.log(`TailorCV running on port ${PORT}`));
