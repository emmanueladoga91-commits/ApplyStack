'use strict';
// ═══════════════════════════════════════════════════════════════
//  ApplyStack Extension — Background Service Worker
// ═══════════════════════════════════════════════════════════════

// ── Open side panel when extension icon is clicked ─────────────
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// ── Enable side panel on supported job board tabs ──────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  const isJobBoard = isJobBoardUrl(tab.url);
  try {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidebar.html',
      enabled: true,
    });
    // Update badge to signal active job board
    if (isJobBoard) {
      chrome.action.setBadgeText({ text: '✦', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#4f6ef7', tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  } catch (e) {
    // Side panel API might not be available on all Chrome versions
  }
});

// ── Message bus between content script & sidebar ───────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'JOB_DETECTED') {
    // Store the job data so sidebar can retrieve it
    chrome.storage.local.set({ pendingJob: msg.job, jobTabId: sender.tab?.id });
    // Open side panel on the active tab
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {});
    }
    sendResponse({ ok: true });
  }

  if (msg.type === 'GET_PENDING_JOB') {
    chrome.storage.local.get(['pendingJob', 'jobTabId'], (data) => {
      sendResponse({ job: data.pendingJob || null, tabId: data.jobTabId || null });
    });
    return true; // async response
  }

  if (msg.type === 'CLEAR_PENDING_JOB') {
    chrome.storage.local.remove(['pendingJob', 'jobTabId']);
    sendResponse({ ok: true });
  }

  if (msg.type === 'OPEN_APP') {
    chrome.storage.local.get(['applystack_backend'], async (data) => {
      const base = data.applystack_backend || 'https://tailorcv-onb9.onrender.com';
      const url = `${base}/app.html?job=${encodeURIComponent(msg.jobTitle || '')}&company=${encodeURIComponent(msg.company || '')}`;
      chrome.tabs.create({ url });
      sendResponse({ ok: true });
    });
    return true;
  }

  return false;
});

// ── Helpers ────────────────────────────────────────────────────
function isJobBoardUrl(url) {
  return (
    url.includes('linkedin.com/jobs') ||
    url.includes('indeed.com/viewjob') ||
    url.includes('indeed.com/jobs') ||
    url.includes('glassdoor.com/job-listing') ||
    url.includes('glassdoor.com/Jobs')
  );
}
