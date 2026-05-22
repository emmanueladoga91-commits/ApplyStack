'use strict';
// ═══════════════════════════════════════════════════════════════
//  ApplyStack Content Script
//  Runs on: LinkedIn Jobs, Indeed, Glassdoor
//  Injects floating "Save to ApplyStack" button on job pages
// ═══════════════════════════════════════════════════════════════

(function () {
  // Prevent double-injection on re-runs
  if (window.__applyStackInjected) return;
  window.__applyStackInjected = true;

  let currentJobData = null;
  let floatBtn = null;
  let detectTimer = null;
  let observerActive = false;

  // ── Entry point ──────────────────────────────────────────────
  init();

  function init() {
    // Initial check after short delay (page may still be rendering)
    setTimeout(tryDetectJob, 800);

    // MutationObserver for SPAs (LinkedIn is React, navigates without full reload)
    if (!observerActive) {
      observerActive = true;
      const observer = new MutationObserver(debounce(() => {
        tryDetectJob();
      }, 600));
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Also listen for URL changes (pushState / popState) for SPA routing
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        currentJobData = null;
        if (floatBtn) { floatBtn.remove(); floatBtn = null; }
        setTimeout(tryDetectJob, 800);
      }
    }, 500);
  }

  // ── Job detection ────────────────────────────────────────────
  function tryDetectJob() {
    const host = location.hostname;

    let job = null;

    if (host.includes('linkedin.com')) {
      job = extractLinkedIn();
    } else if (host.includes('indeed.com')) {
      job = extractIndeed();
    } else if (host.includes('glassdoor.com')) {
      job = extractGlassdoor();
    }

    if (job && job.title && job.description) {
      const sig = `${job.title}::${job.company}`;
      // Only skip re-injection if job is the same AND button is still alive in the DOM
      const btnAlive = floatBtn && document.body.contains(floatBtn);
      if (currentJobData && currentJobData._sig === sig && btnAlive) return;
      job._sig = sig;
      currentJobData = job;
      injectButton(job);
    } else {
      // Not a job detail page, or page still loading — remove button and clear state
      // Clearing currentJobData ensures we re-inject once the page finishes rendering
      if (floatBtn) { floatBtn.remove(); floatBtn = null; }
      currentJobData = null;
    }
  }

  // ── LinkedIn extractor ───────────────────────────────────────
  function extractLinkedIn() {
    try {
      // Title — multiple possible selectors across LinkedIn UI versions
      const titleEl =
        document.querySelector('.job-details-jobs-unified-top-card__job-title h1') ||
        document.querySelector('.jobs-unified-top-card__job-title h1') ||
        document.querySelector('h1.t-24.t-bold') ||
        document.querySelector('[data-test-id="job-title"]') ||
        document.querySelector('h1.topcard__title');

      // Company
      const companyEl =
        document.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
        document.querySelector('.jobs-unified-top-card__company-name a') ||
        document.querySelector('.topcard__org-name-link') ||
        document.querySelector('[data-test-id="job-poster-company"]');

      // Location
      const locationEl =
        document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
        document.querySelector('.jobs-unified-top-card__bullet') ||
        document.querySelector('.topcard__flavor--bullet');

      // Description
      const descEl =
        document.querySelector('.jobs-description-content__text') ||
        document.querySelector('.jobs-description__content') ||
        document.querySelector('#job-details') ||
        document.querySelector('.description__text');

      if (!titleEl || !descEl) return null;

      return {
        title: titleEl.innerText.trim(),
        company: companyEl ? companyEl.innerText.trim() : '',
        location: locationEl ? locationEl.innerText.trim() : '',
        description: descEl.innerText.trim(),
        source: 'LinkedIn',
        url: location.href,
      };
    } catch (e) {
      return null;
    }
  }

  // ── Indeed extractor ─────────────────────────────────────────
  function extractIndeed() {
    try {
      const titleEl =
        document.querySelector('h1.jobsearch-JobInfoHeader-title') ||
        document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
        document.querySelector('h1[class*="Title"]');

      const companyEl =
        document.querySelector('[data-testid="inlineHeader-companyName"] a') ||
        document.querySelector('[data-testid="inlineHeader-companyName"]') ||
        document.querySelector('.jobsearch-InlineCompanyRating > div:first-child') ||
        document.querySelector('.icl-u-lg-mr--sm.icl-u-xs-mr--sm');

      const locationEl =
        document.querySelector('[data-testid="job-location"]') ||
        document.querySelector('.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)');

      const descEl =
        document.querySelector('#jobDescriptionText') ||
        document.querySelector('.jobsearch-jobDescriptionText');

      if (!titleEl || !descEl) return null;

      return {
        title: titleEl.innerText.trim(),
        company: companyEl ? companyEl.innerText.trim() : '',
        location: locationEl ? locationEl.innerText.trim() : '',
        description: descEl.innerText.trim(),
        source: 'Indeed',
        url: location.href,
      };
    } catch (e) {
      return null;
    }
  }

  // ── Glassdoor extractor ──────────────────────────────────────
  function extractGlassdoor() {
    try {
      const titleEl =
        document.querySelector('[data-test="job-title"]') ||
        document.querySelector('.job-title') ||
        document.querySelector('h1[class*="title"]');

      const companyEl =
        document.querySelector('[data-test="employer-name"]') ||
        document.querySelector('.employer-name') ||
        document.querySelector('[class*="EmployerName"]');

      const locationEl =
        document.querySelector('[data-test="location"]') ||
        document.querySelector('.location');

      const descEl =
        document.querySelector('.jobDescriptionContent') ||
        document.querySelector('[class*="JobDescription"]') ||
        document.querySelector('[data-test="description"]');

      if (!titleEl || !descEl) return null;

      return {
        title: titleEl.innerText.trim(),
        company: companyEl ? companyEl.innerText.trim() : '',
        location: locationEl ? locationEl.innerText.trim() : '',
        description: descEl.innerText.trim(),
        source: 'Glassdoor',
        url: location.href,
      };
    } catch (e) {
      return null;
    }
  }

  // ── Inject floating button ───────────────────────────────────
  function injectButton(job) {
    // Remove old button
    if (floatBtn) { floatBtn.remove(); floatBtn = null; }

    floatBtn = document.createElement('button');
    floatBtn.id = 'applystack-btn';
    floatBtn.innerHTML = `
      <span class="as-logo">⚡</span>
      <span class="as-label">
        <span class="as-top">Save to ApplyStack</span>
        <span class="as-sub">${job.source} · ${truncate(job.title, 28)}</span>
      </span>
      <span class="as-arrow">›</span>
    `;

    floatBtn.addEventListener('click', () => handleSave(job));
    document.body.appendChild(floatBtn);
  }

  // ── Handle save click ────────────────────────────────────────
  function handleSave(job) {
    if (!floatBtn) return;

    // Show loading state
    floatBtn.classList.add('as-loading');
    floatBtn.innerHTML = `<span class="as-logo">⏳</span><span class="as-label"><span class="as-top">Opening ApplyStack...</span></span>`;

    // Send job to background → sidebar
    chrome.runtime.sendMessage({ type: 'JOB_DETECTED', job }, (res) => {
      const btn = floatBtn; // capture ref at callback time

      if (chrome.runtime.lastError) {
        showToast('Could not connect to ApplyStack extension.');
        injectButton(job); // re-inject fresh button
        return;
      }

      // Mark as saved (only if button still in DOM)
      if (btn && document.body.contains(btn)) {
        btn.classList.remove('as-loading');
        btn.classList.add('as-saved');
        btn.innerHTML = `<span class="as-logo">✓</span><span class="as-label"><span class="as-top">Saved!</span><span class="as-sub">Check the ApplyStack panel</span></span>`;
      }

      showToast('Job saved — see the ApplyStack side panel →');

      // Reset button after 3s — re-inject regardless so it's always available
      setTimeout(() => {
        // Only re-inject if we're still on the same job (sig unchanged)
        if (currentJobData && currentJobData._sig === job._sig) {
          injectButton(job);
        }
      }, 3000);
    });
  }

  // ── Toast notification ───────────────────────────────────────
  function showToast(msg) {
    const existing = document.getElementById('applystack-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'applystack-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  // ── Utilities ────────────────────────────────────────────────
  function truncate(str, max) {
    return str && str.length > max ? str.slice(0, max) + '…' : (str || '');
  }

  function debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }
})();
