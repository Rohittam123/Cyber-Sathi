import { printAnalysisReport } from "./report-pdf.js";

const status = document.querySelector("#account-history-status");
const historyList = document.querySelector("#analysis-history-list");
const overview = document.querySelector(".dashboard-overview");
const metricsContainer = document.querySelector("#history-metrics");
const riskDonut = document.querySelector("#risk-donut");
const riskDonutTotal = document.querySelector("#risk-donut-total");
const riskLegend = document.querySelector("#risk-legend");
const typeBreakdown = document.querySelector("#type-breakdown");
const searchInput = document.querySelector("#history-search");
const sortSelect = document.querySelector("#history-sort");
const refreshButton = document.querySelector("#refresh-account-history");
let allRecords = [];
let activeFilter = "all";
let requestNumber = 0;
let signedInUser = null;

const HISTORY_LOAD_TIMEOUT_MS = 15000;

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("history-error", isError);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatTimestamp(timestamp) {
  const date = typeof timestamp?.toDate === "function"
    ? timestamp.toDate()
    : timestamp instanceof Date
      ? timestamp
      : typeof timestamp === "string"
        ? new Date(timestamp)
      : null;
  if (!date || Number.isNaN(date.getTime())) return "Timestamp unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function dateValue(timestamp) {
  const date = typeof timestamp?.toDate === "function"
    ? timestamp.toDate()
    : new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function animateMetric(element, target) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = String(target);
    return;
  }
  const duration = 650;
  const startedAt = performance.now();
  function frame(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderMetrics(records) {
  const highRisk = records.filter((record) => record.level === "high").length;
  const fullReportCount = records.filter((record) => typeof record.messageText === "string" && record.messageText.length > 0).length;
  const mostRecent = [...records].sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt))[0];
  const recentLabel = mostRecent ? formatTimestamp(mostRecent.createdAt) : "No checks yet";
  const cards = [
    { label: "SAVED REPORTS", value: records.length, detail: "Detailed reports in this account", icon: "⌕", tone: "mint" },
    { label: "HIGH-RISK FLAGS", value: highRisk, detail: "Checks with higher-risk signals", icon: "!", tone: "coral" },
    { label: "FULL REPORTS", value: fullReportCount, detail: "Original message retained with consent", icon: "◈", tone: "blue" },
    { label: "LAST ACTIVITY", value: recentLabel, detail: "Most recent saved check", icon: "◷", tone: "gold", text: true },
  ];

  metricsContainer.innerHTML = cards.map((card, index) => `
    <article class="metric-card metric-${card.tone}" style="--card-index:${index}">
      <div class="metric-top"><span>${card.label}</span><span class="metric-icon" aria-hidden="true">${card.icon}</span></div>
      <strong class="${card.text ? "metric-date" : "metric-value"}" ${card.text ? "" : `data-count="${card.value}"`}>${card.text ? escapeHtml(card.value) : "0"}</strong>
      <p>${escapeHtml(card.detail)}</p>
    </article>`).join("");
  metricsContainer.querySelectorAll("[data-count]").forEach((element) => {
    animateMetric(element, Number(element.dataset.count));
  });
}

function renderInsights(records) {
  const counts = {
    high: records.filter((record) => record.level === "high").length,
    medium: records.filter((record) => record.level === "medium").length,
    low: records.filter((record) => record.level === "low").length,
  };
  const total = records.length;
  const highEnd = total ? (counts.high / total) * 100 : 0;
  const mediumEnd = total ? highEnd + (counts.medium / total) * 100 : 0;
  riskDonut.style.background = total
    ? `conic-gradient(var(--coral) 0 ${highEnd}%, #ffcf71 ${highEnd}% ${mediumEnd}%, var(--mint) ${mediumEnd}% 100%)`
    : "conic-gradient(#25434b 0 100%)";
  riskDonutTotal.textContent = String(total);
  riskDonut.setAttribute("aria-label", `Risk distribution: ${counts.high} high risk, ${counts.medium} caution advised, ${counts.low} lower risk out of ${total} checks`);
  riskLegend.innerHTML = [
    { key: "high", label: "High risk", value: counts.high },
    { key: "medium", label: "Caution advised", value: counts.medium },
    { key: "low", label: "Lower risk", value: counts.low },
  ].map((item) => `
    <button type="button" class="risk-legend-item" data-filter="${item.key}" aria-label="Show ${item.value} ${item.label} checks">
      <span class="legend-dot legend-${item.key}"></span><span>${item.label}</span><strong>${item.value}</strong>
    </button>`).join("");
  riskLegend.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.filter;
      activeFilter = activeFilter === key ? "all" : key;
      syncFilterButtons();
      applyHistoryControls();
      document.querySelector(".history-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const types = new Map();
  records.forEach((record) => {
    const type = record.messageType || "Suspicious message";
    types.set(type, (types.get(type) || 0) + 1);
  });
  const sortedTypes = [...types.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5);
  const maxType = Math.max(1, ...sortedTypes.map((entry) => entry[1]));
  typeBreakdown.innerHTML = sortedTypes.length
    ? sortedTypes.map(([type, count]) => `
      <button type="button" class="type-bar-row" data-type="${escapeHtml(type)}" aria-label="Filter by ${escapeHtml(type)}, ${count} checks">
        <span class="type-bar-label">${escapeHtml(type)}</span>
        <span class="type-bar-track"><span style="--bar-width:${(count / maxType) * 100}%"></span></span>
        <strong>${count}</strong>
      </button>`).join("")
    : '<p class="insight-empty">Save a check to see your message-type breakdown.</p>';
  typeBreakdown.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      searchInput.value = button.dataset.type;
      activeFilter = "all";
      syncFilterButtons();
      applyHistoryControls();
      document.querySelector(".history-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function syncFilterButtons() {
  document.querySelectorAll(".history-filter").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
  });
}

function applyHistoryControls() {
  const term = searchInput.value.trim().toLocaleLowerCase();
  const rank = { high: 0, medium: 1, low: 2 };
  const filtered = allRecords.filter((record) => {
    if (activeFilter === "high" && record.level !== "high") return false;
    if (activeFilter === "medium" && record.level !== "medium") return false;
    if (activeFilter === "low" && record.level !== "low") return false;
    if (!term) return true;
    return [record.messageType, record.summary, record.messageText, ...(Array.isArray(record.categories) ? record.categories : [])]
      .some((value) => String(value).toLocaleLowerCase().includes(term));
  });
  filtered.sort((left, right) => {
    if (sortSelect.value === "oldest") return dateValue(left.createdAt) - dateValue(right.createdAt);
    if (sortSelect.value === "risk") {
      return (rank[left.level] ?? 3) - (rank[right.level] ?? 3) || dateValue(right.createdAt) - dateValue(left.createdAt);
    }
    return dateValue(right.createdAt) - dateValue(left.createdAt);
  });
  renderHistory(filtered, allRecords.length);
}

function renderHistory(records, total = records.length) {
  if (records.length === 0) {
    historyList.innerHTML = total
      ? '<div class="history-empty"><span class="result-empty-icon" aria-hidden="true">⌕</span><h3>No matching checks</h3><p>Try another search or choose a different filter.</p></div>'
      : '<div class="history-empty"><span class="result-empty-icon" aria-hidden="true">✳</span><h3>No saved reports yet</h3><p>Analyze a message while signed in to save its report to this account. The original message is only saved when you opt in.</p><a class="text-link" href="./scam-checker.html">Open Scam Checker <span aria-hidden="true">→</span></a></div>';
    return;
  }

  const labels = { low: "Lower risk signals", medium: "Caution advised", high: "High-risk signals" };
  historyList.innerHTML = records.map((record) => {
    const categories = Array.isArray(record.categories) && record.categories.length
      ? record.categories.map(escapeHtml).join(", ")
      : "No common warning categories detected";
    const messageType = record.messageType || "Suspicious message";
    const risk = labels[record.level] || "Risk level unavailable";
    const riskClass = ["low", "medium", "high"].includes(record.level) ? record.level : "medium";
    const signals = Array.isArray(record.signals) ? record.signals : [];
    const recommendations = Array.isArray(record.recommendations)
      ? record.recommendations
      : (record.advice ? [record.advice] : []);
    const hasDetailedReport = Array.isArray(record.signals) || Array.isArray(record.recommendations);
    return `
      <article class="history-entry">
        <div class="history-entry-main">
          <div class="history-entry-title"><div><h3>${escapeHtml(messageType)}</h3><span class="history-storage">Private account report</span></div><span class="result-status risk-${riskClass}"><span class="status-dot"></span>${escapeHtml(risk)}</span></div>
          <p><strong>Warning categories:</strong> ${categories}</p>
          <time>${escapeHtml(formatTimestamp(record.createdAt))}</time>
          ${hasDetailedReport ? `
            <details class="saved-report-details">
              <summary>${record.messageText ? "View detailed report and original message" : "View detailed report"}</summary>
              <div class="saved-report-content">
                <p><strong>Assessment:</strong> ${escapeHtml(record.summary || "No assessment available.")}</p>
                ${record.messageText
                  ? `<h4>Original message checked</h4><pre>${escapeHtml(record.messageText)}</pre>`
                  : '<p class="saved-report-disclaimer">The original message was not saved to your account.</p>'}
                <h4>Detected warning signs</h4>
                ${signals.length ? `<ul>${signals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join("")}</ul>` : "<p>No common warning categories detected. This does not prove the message is safe.</p>"}
                <h4>Recommended next steps</h4>
                ${recommendations.length ? `<ul>${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>Verify unexpected requests through official channels.</p>"}
                <p class="saved-report-disclaimer">This rule-based report is an educational aid, not a security verdict. A low-risk result does not prove a message is safe.</p>
              </div>
              <button class="report-pdf history-report-pdf" type="button" data-report-id="${escapeHtml(record.id)}">Print / Save this report as PDF</button>
            </details>` : `
            <div class="legacy-report-note">This older record contains summary data only; its original message was not saved, so it cannot produce a full message-specific report.</div>`}
        </div>
      </article>`;
  }).join("");
}

document.querySelectorAll(".history-filter").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    syncFilterButtons();
    applyHistoryControls();
  });
});
historyList.addEventListener("click", (event) => {
  const button = event.target.closest(".history-report-pdf");
  if (!button) return;
  const record = allRecords.find((item) => item.id === button.dataset.reportId);
  if (!record) {
    setStatus("This report is no longer available. Refresh your account history and try again.", true);
    return;
  }
  try {
    printAnalysisReport(record);
  } catch (error) {
    setStatus(error.message, true);
  }
});
searchInput.addEventListener("input", applyHistoryControls);
sortSelect.addEventListener("change", applyHistoryControls);

async function showHistory(user) {
  const currentRequest = ++requestNumber;
  signedInUser = user;
  refreshButton.disabled = !user;
  allRecords = [];
  overview.hidden = true;
  renderMetrics(allRecords);
  renderInsights(allRecords);
  renderHistory([]);

  if (!user) {
    setStatus("Sign in to see reports saved to your account. Signed-out accounts do not display browser or other-user check history.");
    historyList.innerHTML = '<div class="history-empty"><span class="result-empty-icon" aria-hidden="true">◈</span><h3>Your account reports are private</h3><p>Sign in using the form in the footer to see reports saved to your account. No local or sample checks are shown here.</p><a class="text-link" href="#auth-email">Go to sign in <span aria-hidden="true">→</span></a></div>';
    return;
  }
  refreshButton.disabled = true;
  refreshButton.textContent = "Loading reports…";
  setStatus("Loading your private reports…");

  try {
    const { firebaseReady, getAnalysisHistory } = await import("./firebase.js");
    if (currentRequest !== requestNumber) return;
    if (!firebaseReady) {
      throw new Error("Firebase is not configured. Account reports cannot be loaded.");
    }
    let timeoutId = 0;
    const accountRecords = await Promise.race([
      getAnalysisHistory(user.uid),
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          const error = new Error("Firestore did not respond within 15 seconds.");
          error.code = "history-load-timeout";
          reject(error);
        }, HISTORY_LOAD_TIMEOUT_MS);
      }),
    ]).finally(() => window.clearTimeout(timeoutId));
    if (currentRequest !== requestNumber) return;
    allRecords = accountRecords;
    overview.hidden = false;
    renderMetrics(allRecords);
    renderInsights(allRecords);
    applyHistoryControls();
    setStatus(`Showing ${accountRecords.length} report${accountRecords.length === 1 ? "" : "s"} saved to your account.`);
  } catch (error) {
    if (currentRequest !== requestNumber) return;
    console.error("Could not load the signed-in user's analysis history.", error);
    allRecords = [];
    renderMetrics(allRecords);
    renderInsights(allRecords);
    applyHistoryControls();
    if (error.code === "history-load-timeout") {
      setStatus("Your reports are taking longer than expected to load. Check your connection and Firebase/Firestore availability, then refresh.", true);
    } else if (error.code === "permission-denied") {
      setStatus("Firestore denied access to these reports. Confirm you are signed in to the same Firebase project and publish the current Firestore rules, then refresh.", true);
    } else {
      const reason = error.code || error.message || "Unknown Firebase error";
      setStatus(`Could not load your account reports (${reason}). Check your connection and Firestore access, then refresh.`, true);
    }
    historyList.innerHTML = '<div class="history-empty"><span class="result-empty-icon" aria-hidden="true">!</span><h3>Reports could not be loaded</h3><p>Check the status above, then use “Refresh reports” to try again. Your saved reports have not been deleted.</p></div>';
  } finally {
    if (currentRequest === requestNumber) {
      refreshButton.disabled = !signedInUser;
      refreshButton.innerHTML = 'Refresh reports <span aria-hidden="true">↻</span>';
    }
  }
}

refreshButton.addEventListener("click", () => {
  if (signedInUser) void showHistory(signedInUser);
});

window.addEventListener("cybersaathi-auth-state", (event) => {
  showHistory(event.detail.user);
});

if (window.cyberSaathiAuthState) {
  showHistory(window.cyberSaathiAuthState.getUser());
} else {
  setStatus("Checking sign-in status…");
}
