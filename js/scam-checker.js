import { analyzeMessage } from "./scam-detector.js";
import { printAnalysisReport } from "./report-pdf.js";

const analyzerForm = document.querySelector("#analyzer-form");
const messageInput = document.querySelector("#message-input");
const characterCount = document.querySelector("#character-count");
const saveOriginalMessageInput = document.querySelector("#save-original-message");
const result = document.querySelector("#analysis-result");
let latestAnalysis = null;
let latestSaveState = null;

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
  const includeMessageText = saveOriginalMessageInput.checked;
  saveOriginalMessageInput.checked = false;
  latestAnalysis = {
    ...analyzeMessage(message),
    messageText: message,
    includeMessageText,
    checkedAt: new Date().toISOString(),
  };
  latestSaveState = { analysis: latestAnalysis, promise: null, saved: false };
  showAnalysis(latestAnalysis);
  saveAnalysisWhenSignedIn(latestSaveState);
});

window.addEventListener("cybersaathi-auth-state", (event) => {
  if (latestSaveState && event.detail.user) {
    void saveReport(latestSaveState, event.detail.user);
  } else if (latestSaveState) {
    updateSavePrompt(latestSaveState);
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
    <p class="report-caveat">This browser-based pattern check is educational, not a guarantee that a message is safe. When signed in, the report is saved to your account. The original message is only included if you opted in before analyzing it.</p>
    <div class="save-actions report-actions">
      <button class="save-analysis" type="button">${signedIn ? "Saving report…" : "Sign in to save this report"}</button>
      <button class="report-pdf" type="button">Print / Save report as PDF</button>
    </div>
    <p class="report-action-status" role="status" aria-live="polite"></p>`;
  result.dataset.level = analysis.level;
  result.querySelector(".save-analysis").addEventListener("click", saveCurrentAnalysis);
  result.querySelector(".report-pdf").addEventListener("click", printCurrentReport);
  if (!signedIn) {
    result.querySelector(".save-analysis").textContent = "Sign in to save this report";
  }
}

function updateSavePrompt(saveState) {
  if (saveState !== latestSaveState) return;
  const button = result.querySelector("button.save-analysis");
  const actionStatus = result.querySelector(".report-action-status");
  if (!button || !actionStatus || saveState.saved || saveState.promise) return;
  button.disabled = false;
  button.textContent = saveState.error ? "Retry saving report" : "Sign in to save this report";
  actionStatus.textContent = saveState.error || "Sign in to save this report to your account. This check is not saved while you are signed out.";
}

async function saveAnalysisWhenSignedIn(saveState) {
  try {
    const authState = window.cyberSaathiAuthState;
    const user = authState ? await authState.waitForUser() : null;
    if (saveState !== latestSaveState) return;
    if (!user) {
      updateSavePrompt(saveState);
      return;
    }
    await saveReport(saveState, user);
  } catch (error) {
    showSaveError(saveState, error);
  }
}

async function saveReport(saveState, user) {
  if (saveState.saved) return;
  if (saveState.promise) {
    try {
      await saveState.promise;
    } catch (error) {
      showSaveError(saveState, error);
    }
    return;
  }
  const button = saveState === latestSaveState ? result.querySelector("button.save-analysis") : null;
  const actionStatus = saveState === latestSaveState ? result.querySelector(".report-action-status") : null;
  if (button) {
    button.disabled = true;
    button.textContent = "Saving report…";
  }
  if (actionStatus) actionStatus.textContent = "Saving your report to your private account…";

  saveState.promise = (async () => {
    const { firebaseReady, saveAnalysis } = await import("./firebase.js");
    if (!firebaseReady) {
      throw new Error("Firebase is not configured. Check js/firebase-config.js before saving to an account.");
    }
    await saveAnalysis(user.uid, saveState.analysis, {
      includeMessageText: saveState.analysis.includeMessageText,
    });
    saveState.saved = true;
    if (saveState === latestSaveState && button?.isConnected && actionStatus?.isConnected) {
      button.textContent = "Report saved to your account";
      actionStatus.innerHTML = `Your report is saved${saveState.analysis.includeMessageText ? " with the original message" : " without the original message"}. <a href="./account.html">Open My Account →</a>`;
    }
  })();

  try {
    await saveState.promise;
  } catch (error) {
    showSaveError(saveState, error);
  } finally {
    saveState.promise = null;
  }
}

function showSaveError(saveState, error) {
  if (saveState !== latestSaveState) return;
  const button = result.querySelector("button.save-analysis");
  const actionStatus = result.querySelector(".report-action-status");
  if (!button || !actionStatus) return;
  button.disabled = false;
  button.textContent = "Retry saving report";
  const message = error.code === "permission-denied"
    ? "Firestore denied the save. Publish the updated firestore.rules in Firebase Console, then try again."
    : error.code === "auth/operation-not-allowed"
      ? "Email/Password sign-in is disabled in Firebase Console. Enable it under Authentication → Sign-in method."
      : `Could not save the report: ${error.message}`;
  saveState.error = message;
  actionStatus.textContent = message;
}

async function saveCurrentAnalysis() {
  if (!latestSaveState) return;
  const authState = window.cyberSaathiAuthState;
  const user = authState ? await authState.waitForUser() : null;
  if (!user) {
    showSignInPrompt("Sign in or create an account in the footer. Your current check will be saved automatically after you sign in.");
    return;
  }
  await saveReport(latestSaveState, user);
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
