'use strict';
// ═══════════════════════════════════════════════════════════════
//  ApplyStack Side Panel Script
// ═══════════════════════════════════════════════════════════════

const DEFAULT_BACKEND = 'https://tailorcv-onb9.onrender.com';

let currentJob  = null;
let authToken   = null;
let currentUser = null;
let backendUrl  = DEFAULT_BACKEND;
let savedJobs   = [];

// ── DOM refs ──────────────────────────────────────────────────
const headerChip   = document.getElementById('header-user-chip');
const authPrompt   = document.getElementById('auth-prompt');
const noJobState   = document.getElementById('no-job-state');
const jobState     = document.getElementById('job-state');
const saveSuccess  = document.getElementById('save-success');

// Job card
const jobSource    = document.getElementById('job-source');
const jobTitle     = document.getElementById('job-title');
const jobCompany   = document.getElementById('job-company');
const jobLocation  = document.getElementById('job-location');
const jobUrlLink   = document.getElementById('job-url');

// Score
const scoreLoading  = document.getElementById('score-loading');
const scoreNoResume = document.getElementById('score-no-resume');
const scoreResult   = document.getElementById('score-result');
const ringFill      = document.getElementById('ring-fill');
const scoreNum      = document.getElementById('score-num');
const scoreLabel    = document.getElementById('score-label');
const scoreSub      = document.getElementById('score-sub');
const kwPct         = document.getElementById('kw-pct');
const kwBar         = document.getElementById('kw-bar');
const skPct         = document.getElementById('sk-pct');
const skBar         = document.getElementById('sk-bar');

// Desc
const descToggle   = document.getElementById('desc-toggle');
const descChevron  = document.getElementById('desc-chevron');
const descBody     = document.getElementById('desc-body');

// Saved jobs
const savedToggle  = document.getElementById('saved-toggle');
const savedChevron = document.getElementById('saved-chevron');
const savedList    = document.getElementById('saved-list');
const savedEmpty   = document.getElementById('saved-empty');
const savedCount   = document.getElementById('saved-count');

// Buttons
const tailorBtn    = document.getElementById('tailor-btn');
const prepBtn      = document.getElementById('prep-btn');
const negotiateBtn = document.getElementById('negotiate-btn');
const openPopupBtn = document.getElementById('open-popup-btn');

// ── Init ──────────────────────────────────────────────────────
chrome.storage.local.get(
  ['applystack_token', 'applystack_user', 'applystack_backend', 'applystack_saved_jobs'],
  (data) => {
    authToken   = data.applystack_token   || null;
    currentUser = data.applystack_user    || null;
    backendUrl  = data.applystack_backend || DEFAULT_BACKEND;
    savedJobs   = data.applystack_saved_jobs || [];

    if (authToken && currentUser) {
      headerChip.textContent = currentUser.email || 'Signed in';
      authPrompt.style.display = 'none';
    } else {
      headerChip.textContent = 'Not signed in';
      authPrompt.style.display = 'block';
    }

    renderSavedJobs();
    pollForJob();
  }
);

// ── Poll for job from background ──────────────────────────────
function pollForJob() {
  chrome.runtime.sendMessage({ type: 'GET_PENDING_JOB' }, (response) => {
    if (chrome.runtime.lastError) { showNoJob(); return; }
    if (response && response.job) {
      loadJob(response.job);
    } else {
      showNoJob();
    }
  });
}

// Also listen for new jobs pushed from content script via background
chrome.storage.onChanged.addListener((changes) => {
  if (changes.pendingJob && changes.pendingJob.newValue) {
    loadJob(changes.pendingJob.newValue);
  }
  if (changes.applystack_token) {
    authToken   = changes.applystack_token.newValue || null;
    currentUser = changes.applystack_user?.newValue || null;
    if (authToken && currentUser) {
      headerChip.textContent = currentUser.email || 'Signed in';
      authPrompt.style.display = 'none';
    } else {
      headerChip.textContent = 'Not signed in';
      authPrompt.style.display = 'block';
    }
  }
  if (changes.applystack_saved_jobs) {
    savedJobs = changes.applystack_saved_jobs.newValue || [];
    renderSavedJobs();
  }
});

// ── Load job into panel ───────────────────────────────────────
function loadJob(job) {
  currentJob = job;
  noJobState.style.display = 'none';
  jobState.style.display   = 'block';

  // Populate job card
  jobSource.textContent  = job.source   || 'Job Board';
  jobTitle.textContent   = job.title    || 'Untitled Role';
  jobCompany.textContent = job.company  || '';
  jobLocation.textContent = job.location || '';
  jobUrlLink.href = job.url || '#';
  if (!job.url) jobUrlLink.style.display = 'none';
  else jobUrlLink.style.display = 'inline-flex';

  // Description
  descBody.textContent = job.description || '';

  // Auto-save to saved jobs list
  autoSaveJob(job);

  // Show success briefly
  saveSuccess.classList.add('show');
  setTimeout(() => saveSuccess.classList.remove('show'), 3000);

  // Fetch ATS score if authenticated
  if (authToken) {
    fetchAtScore(job);
  } else {
    scoreLoading.style.display = 'none';
    scoreNoResume.style.display = 'block';
  }
}

// ── ATS Score via backend ─────────────────────────────────────
async function fetchAtScore(job) {
  scoreLoading.style.display   = 'flex';
  scoreNoResume.style.display  = 'none';
  scoreResult.style.display    = 'none';

  try {
    const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Given a job description, output a JSON object with these keys:
- overall (0-100 integer): an ATS readiness score for a typical mid-level candidate
- keywords_pct (0-100 integer): keyword coverage percentage
- skills_pct (0-100 integer): skills alignment percentage
- label (string): one of "Weak Match", "Fair Match", "Good Match", "Strong Match", "Excellent Match"
- tip (string): one concise actionable tip (max 12 words) to improve this score

Respond ONLY with the JSON object, no other text.`;

    const userMsg = `Job Title: ${job.title}\nCompany: ${job.company}\n\nJob Description:\n${job.description.slice(0, 3000)}`;

    const res = await fetch(`${backendUrl}/api/claude`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: 'score',
        system: systemPrompt,
        userMsg,
        maxTokens: 300,
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired
        scoreLoading.style.display = 'none';
        scoreNoResume.style.display = 'block';
        scoreNoResume.textContent = '⚠️ Session expired. Please sign in again via the extension popup.';
        return;
      }
      throw new Error(`Server error ${res.status}`);
    }

    const json = await res.json();
    let parsed;

    try {
      // Response is the raw text from Claude
      // Backend returns { text: "..." } from /api/claude
      const rawText = json.text || '';
      // Strip markdown code blocks if present
      const cleaned = rawText.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Could not parse score response');
    }

    renderScore(parsed);

  } catch (e) {
    scoreLoading.style.display  = 'none';
    scoreNoResume.style.display = 'block';
    scoreNoResume.textContent   = '⚠️ Could not fetch ATS score. Try again later.';
  }
}

// ── Render score ──────────────────────────────────────────────
function renderScore(data) {
  scoreLoading.style.display  = 'none';
  scoreNoResume.style.display = 'none';
  scoreResult.style.display   = 'flex';

  const score = Math.min(100, Math.max(0, data.overall || 0));
  const kw    = Math.min(100, Math.max(0, data.keywords_pct || 0));
  const sk    = Math.min(100, Math.max(0, data.skills_pct || 0));

  // Animate ring
  const circumference = 201; // 2π × 32
  const offset = circumference - (score / 100) * circumference;

  // Color ring by score
  const ringColor =
    score >= 75 ? '#16a34a' :
    score >= 55 ? '#4f6ef7' :
    score >= 35 ? '#f59e0b' : '#dc2626';

  ringFill.style.stroke           = ringColor;
  ringFill.style.strokeDashoffset = `${offset}`;
  scoreNum.style.color            = ringColor;

  // Animate number
  animateNumber(scoreNum, 0, score, 1200);

  // Labels
  scoreLabel.textContent = data.label || 'Analysed';
  scoreSub.textContent   = data.tip   || '';

  // Bars (slight delay for animation)
  setTimeout(() => {
    kwPct.textContent = `${kw}%`;
    kwBar.style.width = `${kw}%`;
    skPct.textContent = `${sk}%`;
    skBar.style.width = `${sk}%`;
  }, 200);
}

// ── Auto-save job to local storage ───────────────────────────
function autoSaveJob(job) {
  // Check for duplicate (same title + company)
  const existing = savedJobs.findIndex(j => j.title === job.title && j.company === job.company);
  const entry = { ...job, savedAt: new Date().toISOString() };
  if (existing >= 0) {
    savedJobs[existing] = entry; // update existing
  } else {
    savedJobs.unshift(entry); // add to front
    if (savedJobs.length > 50) savedJobs = savedJobs.slice(0, 50); // cap at 50
  }
  chrome.storage.local.set({ applystack_saved_jobs: savedJobs });
  renderSavedJobs();
}

// ── Render saved jobs list ────────────────────────────────────
function renderSavedJobs() {
  savedCount.textContent = savedJobs.length;

  if (!savedJobs.length) {
    savedEmpty.style.display = 'block';
    // Remove all items
    Array.from(savedList.querySelectorAll('.saved-item')).forEach(el => el.remove());
    return;
  }

  savedEmpty.style.display = 'none';
  // Re-render
  Array.from(savedList.querySelectorAll('.saved-item')).forEach(el => el.remove());

  savedJobs.forEach((job, idx) => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `
      <div class="saved-item-info">
        <div class="saved-item-title">${escHtml(job.title || 'Untitled')}</div>
        <div class="saved-item-company">${escHtml(job.company || '')}</div>
        <div class="saved-item-date">${formatDate(job.savedAt)}</div>
      </div>
      <span class="saved-item-source">${escHtml(job.source || '')}</span>
      <button class="remove-saved" title="Remove">✕</button>
    `;
    // Click on item → load that job
    item.querySelector('.saved-item-info').addEventListener('click', () => {
      loadJob(job);
      // Scroll to top
      document.querySelector('.body').scrollTop = 0;
    });
    // Remove button
    item.querySelector('.remove-saved').addEventListener('click', (e) => {
      e.stopPropagation();
      savedJobs.splice(idx, 1);
      chrome.storage.local.set({ applystack_saved_jobs: savedJobs });
      renderSavedJobs();
    });
    savedList.appendChild(item);
  });
}

// ── Desc toggle ───────────────────────────────────────────────
descToggle.addEventListener('click', () => {
  const isOpen = descBody.classList.toggle('open');
  descChevron.classList.toggle('open', isOpen);
});

// ── Saved jobs toggle ─────────────────────────────────────────
savedToggle.addEventListener('click', () => {
  const isOpen = savedList.classList.toggle('open');
  savedChevron.classList.toggle('open', isOpen);
});

// ── Action buttons ────────────────────────────────────────────
tailorBtn.addEventListener('click', () => {
  if (!currentJob) return;
  const url = `${backendUrl}/app.html?job=${encodeURIComponent(currentJob.title)}&company=${encodeURIComponent(currentJob.company)}&jd=${encodeURIComponent(currentJob.description.slice(0, 2000))}`;
  chrome.tabs.create({ url });
});

prepBtn.addEventListener('click', () => {
  if (!currentJob) return;
  const url = `${backendUrl}/prep.html?company=${encodeURIComponent(currentJob.company)}&role=${encodeURIComponent(currentJob.title)}`;
  chrome.tabs.create({ url });
});

negotiateBtn.addEventListener('click', () => {
  if (!currentJob) return;
  const url = `${backendUrl}/negotiate.html?role=${encodeURIComponent(currentJob.title)}&company=${encodeURIComponent(currentJob.company)}`;
  chrome.tabs.create({ url });
});

openPopupBtn.addEventListener('click', () => {
  // Can't open popup programmatically — guide user
  openPopupBtn.textContent = 'Click the ApplyStack icon in your toolbar to sign in';
  openPopupBtn.style.background = '#475569';
  setTimeout(() => {
    openPopupBtn.textContent = 'Sign in via extension';
    openPopupBtn.style.background = '';
  }, 3000);
});

// ── Helpers ───────────────────────────────────────────────────
function showNoJob() {
  noJobState.style.display = 'block';
  jobState.style.display   = 'none';
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(from + (to - from) * easeOut(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}
