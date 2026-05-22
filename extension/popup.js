'use strict';
// ═══════════════════════════════════════════════════════════════
//  ApplyStack Popup Script
// ═══════════════════════════════════════════════════════════════

const DEFAULT_BACKEND = 'https://tailorcv-onb9.onrender.com';

// ── DOM refs ──────────────────────────────────────────────────
const loadingSection = document.getElementById('loading-section');
const authSection    = document.getElementById('auth-section');
const statusSection  = document.getElementById('status-section');
const loginEmail     = document.getElementById('login-email');
const loginPassword  = document.getElementById('login-password');
const loginBtn       = document.getElementById('login-btn');
const loginError     = document.getElementById('login-error');
const avatarLetter   = document.getElementById('avatar-letter');
const userEmailEl    = document.getElementById('user-email-display');
const userPlanEl     = document.getElementById('user-plan-display');
const badgePro       = document.getElementById('badge-pro');
const signOutBtn     = document.getElementById('sign-out-btn');
const pageJobCard    = document.getElementById('page-job-card');
const pjTitle        = document.getElementById('pj-title');
const pjCompany      = document.getElementById('pj-company');
const openPanelBtn   = document.getElementById('open-panel-btn');
const toggleConfig   = document.getElementById('toggle-config');
const configSection  = document.getElementById('config-section');
const backendUrlEl   = document.getElementById('backend-url');
const saveConfigBtn  = document.getElementById('save-config-btn');
const linkBuilder    = document.getElementById('link-builder');
const linkPrep       = document.getElementById('link-prep');
const linkNegotiate  = document.getElementById('link-negotiate');
const linkAccount    = document.getElementById('link-account');

// ── Init ──────────────────────────────────────────────────────
chrome.storage.local.get(['applystack_token', 'applystack_user', 'applystack_backend'], async (data) => {
  const token   = data.applystack_token;
  const user    = data.applystack_user;
  const backend = data.applystack_backend || DEFAULT_BACKEND;

  backendUrlEl.value = backend;

  // Set quick action links
  linkBuilder.href   = `${backend}/app.html`;
  linkPrep.href      = `${backend}/prep.html`;
  linkNegotiate.href = `${backend}/negotiate.html`;
  linkAccount.href   = `${backend}/account.html`;
  [linkBuilder, linkPrep, linkNegotiate, linkAccount].forEach(a => {
    a.addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: a.href }); });
  });

  hide(loadingSection);

  if (token && user) {
    showStatus(user);
    // Check if current tab has a detected job
    checkCurrentTab();
  } else {
    show(authSection);
  }
});

// ── Login ─────────────────────────────────────────────────────
loginBtn.addEventListener('click', doLogin);
loginPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

async function doLogin() {
  const email    = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in…';
  hideError();

  try {
    const backend = backendUrlEl.value.trim() || DEFAULT_BACKEND;
    const res = await fetch(`${backend}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      showError(json.error || 'Login failed. Check your credentials.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign in';
      return;
    }

    // Save token + user
    await chrome.storage.local.set({
      applystack_token:   json.token,
      applystack_user:    json.user,
      applystack_backend: backend,
    });

    hide(authSection);
    showStatus(json.user);
    checkCurrentTab();

  } catch (e) {
    showError('Could not reach ApplyStack server. Check your connection.');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign in';
  }
}

// ── Show logged-in status ─────────────────────────────────────
function showStatus(user) {
  show(statusSection);
  userEmailEl.textContent = user.email || '';
  avatarLetter.textContent = (user.email || 'A')[0].toUpperCase();

  const isPro = user.plan === 'pro';
  userPlanEl.textContent = isPro ? 'Pro plan' : 'Free plan';
  userPlanEl.className   = 'user-plan' + (isPro ? ' pro' : '');
  if (isPro) badgePro.classList.add('show');
}

// ── Check current tab for job data ────────────────────────────
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const url = tab.url || '';
    const isJobBoard =
      url.includes('linkedin.com/jobs') ||
      url.includes('indeed.com/viewjob') ||
      url.includes('indeed.com/jobs') ||
      url.includes('glassdoor.com/job-listing') ||
      url.includes('glassdoor.com/Jobs');

    if (!isJobBoard) return;

    // Ask background for any pending job detected on this tab
    chrome.runtime.sendMessage({ type: 'GET_PENDING_JOB' }, (response) => {
      if (response && response.job && response.tabId === tab.id) {
        const job = response.job;
        pjTitle.textContent   = truncate(job.title, 38);
        pjCompany.textContent = job.company || '';
        pageJobCard.classList.add('show');
        openPanelBtn.classList.add('show');
      }
    });
  } catch (e) { /* ok */ }
}

// ── Open side panel ───────────────────────────────────────────
openPanelBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.sidePanel.open({ tabId: tab.id });
    window.close();
  }
});

// ── Sign out ──────────────────────────────────────────────────
signOutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['applystack_token', 'applystack_user'], () => {
    hide(statusSection);
    badgePro.classList.remove('show');
    loginEmail.value = '';
    loginPassword.value = '';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign in';
    show(authSection);
  });
});

// ── Config toggle ─────────────────────────────────────────────
toggleConfig.addEventListener('click', () => {
  configSection.classList.toggle('show');
});

saveConfigBtn.addEventListener('click', () => {
  const url = backendUrlEl.value.trim();
  if (!url) return;
  chrome.storage.local.set({ applystack_backend: url }, () => {
    // Update quick links
    linkBuilder.href  = `${url}/app.html`;
    linkPrep.href     = `${url}/prep.html`;
    linkNegotiate.href = `${url}/negotiate.html`;
    linkAccount.href  = `${url}/account.html`;
    saveConfigBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveConfigBtn.textContent = 'Save'; }, 1500);
  });
});

// ── Helpers ───────────────────────────────────────────────────
function show(el) { el.classList.add('show'); }
function hide(el) { el.classList.remove('show'); }
function showError(msg) { loginError.textContent = msg; loginError.classList.add('show'); }
function hideError()    { loginError.classList.remove('show'); }
function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : (s || ''); }
