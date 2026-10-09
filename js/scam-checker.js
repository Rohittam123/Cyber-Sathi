import { analyzeMessage } from "./scam-detector.js";
import { printAnalysisReport } from "./report-pdf.js";

const analyzerForm = document.querySelector("#analyzer-form");
const messageInput = document.querySelector("#message-input");
const characterCount = document.querySelector("#character-count");
const result = document.querySelector("#analysis-result");
let latestAnalysis = null;

messageInput.addEventListener("input", () => {
  characterCount.textContent = `${messageInput.value.length} / 5000`;
});

analyzerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) {
    messageInput.setCustomValidity("Paste a message to analyze.");
    messageInput.reportValidity();
    return;
  }
  messageInput.setCustomValidity("");
  latestAnalysis = {
    ...analyzeMessage(message),
    messageText: message,
    checkedAt: new Date().toISOString(),
  };
  showAnalysis(latestAnalysis);
});

window.addEventListener("cybersaathi-auth-state", (event) => {
  const button = result.querySelector("button.save-analysis");
  if (button && latestAnalysis) {
    button.textContent = event.detail.user ? "Save detailed report to my account" : "Sign in to save this report";
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function showAnalysis(analysis) {
  const levelLabels = { low: "Lower risk signals", medium: "Caution advised", high: "High-risk signals" };
  const checkedTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(analysis.checkedAt));
  const reportSignals = analysis.signals.map((signal) => {
    const separator = signal.indexOf(":");
    return separator > 0
      ? `<li><strong>${escapeHtml(signal.slice(0, separator))}</strong>${escapeHtml(signal.slice(separator + 1))}</li>`
      : `<li>${escapeHtml(signal)}</li>`;
  }).join("");
  const signedIn = Boolean(window.cyberSaathiAuthState?.getUser());
  result.innerHTML = `
    <div class="result-status risk-${analysis.level}"><span class="status-dot"></span>${levelLabels[analysis.level]}</div>
    <p class="report-checked-time">Checked ${escapeHtml(checkedTime)}</p>
    <p class="result-summary">${escapeHtml(analysis.summary)}</p>
    <details class="checked-message-details"><summary>View the exact message checked</summary><pre>${escapeHtml(analysis.messageText)}</pre></details>
    <div class="report-detail-block"><h3>Message profile</h3><p><strong>Detected type:</strong> ${escapeHtml(analysis.messageType)}<br><strong>Warning categories:</strong> ${analysis.categories.length ? analysis.categories.map(escapeHtml).join(", ") : "No common warning categories matched"}</p></div>
    <h3>What we noticed</h3>
    <ul class="signal-list">${reportSignals}</ul>
    <div class="result-advice"><strong>Recommended next steps:</strong><ul class="report-recommendations">${analysis.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
    <p class="report-caveat">This browser-based pattern check is educational, not a guarantee that a message is safe. The original message is not stored unless you choose the account-save option below.</p>
    <div class="save-actions report-actions">
      <button class="save-analysis" type="button">${signedIn ? "Save detailed report to my account" : "Sign in to save this report"}</button>
      <button class="report-pdf" type="button">Print / Save report as PDF</button>
    </div>
    <label class="report-consent"><input class="report-consent-checkbox" type="checkbox"><span>I understand saving includes the original message text in my private account report.</span></label>
    <p class="report-action-status" role="status" aria-live="polite"></p>`;
  result.dataset.level = analysis.level;
  result.querySelector(".save-analysis").addEventListener("click", saveCurrentAnalysis);
  result.querySelector(".report-pdf").addEventListener("click", printCurrentReport);
}

async function saveCurrentAnalysis(event) {
  if (!latestAnalysis) return;
  const button = event.currentTarget;
  const consent = result.querySelector(".report-consent-checkbox");
  const actionStatus = result.querySelector(".report-action-status");
  if (!consent.checked) {
    actionStatus.textContent = "Tick the consent box to confirm that you want the original message included in your account report.";
    consent.focus();
    return;
  }
  button.disabled = true;
  button.textContent = "Saving…";

  try {
    const authState = window.cyberSaathiAuthState;
    const user = authState ? await authState.waitForUser() : null;
    if (!user) {
      button.disabled = false;
      button.textContent = "Sign in to save this report";
      showSignInPrompt("Sign in or create an account in the footer before saving this detailed report.");
      return;
    }

    const { firebaseReady, saveAnalysis } = await import("./firebase.js");
    if (!firebaseReady) {
      throw new Error("Firebase is not configured. Check js/firebase-config.js before saving to an account.");
    }
    await saveAnalysis(user.uid, latestAnalysis);
    button.textContent = "Report saved to your account";
    button.disabled = true;
    actionStatus.innerHTML = 'Your private report includes the original message. <a href="./account.html">Open My Account →</a>';
  } catch (error) {
    button.disabled = false;
    button.textContent = "Save detailed report to my account";
    const message = error.code === "permission-denied"
      ? "Firestore denied the save. Publish the updated firestore.rules in Firebase Console, then try again."
      : error.code === "auth/operation-not-allowed"
        ? "Email/Password sign-in is disabled in Firebase Console. Enable it under Authentication → Sign-in method."
        : `Could not save the report: ${error.message}`;
    showSignInPrompt(message, true);
  }
}

function printCurrentReport() {
  if (!latestAnalysis) return;
  const actionStatus = result.querySelector(".report-action-status");
  try {
    printAnalysisReport({ ...latestAnalysis, createdAt: latestAnalysis.checkedAt });
    actionStatus.textContent = "In the print dialog, choose “Save as PDF” to download this report.";
  } catch (error) {
    actionStatus.textContent = error.message;
  }
}

function showSignInPrompt(message, isError = false) {
  const status = document.querySelector("#auth-status");
  status.textContent = message;
  status.style.color = isError ? "#ff9f89" : "";
  const emailInput = document.querySelector("#auth-email");
  emailInput?.scrollIntoView({ behavior: "smooth", block: "center" });
  emailInput?.focus({ preventScroll: true });
}
