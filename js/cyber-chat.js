import { app, firebaseReady } from "./firebase.js";

const FUNCTIONS_SDK = "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";
const MAX_MESSAGE_LENGTH = 1500;
const MAX_HISTORY_MESSAGES = 10;

export function initCyberChatWidget() {
  if (document.querySelector(".cyber-chat")) return;

  const widget = document.createElement("div");
  widget.className = "cyber-chat";
  widget.innerHTML = `
    <section class="cyber-chat-panel" id="cyber-chat-panel" role="dialog" aria-label="CyberSaathi AI chat" aria-modal="false" aria-hidden="true">
      <header class="cyber-chat-header">
        <div class="cyber-chat-avatar" aria-hidden="true">C</div>
        <div class="cyber-chat-heading"><strong>CyberSaathi AI</strong><span><i></i> Cyber safety assistant</span></div>
        <button class="cyber-chat-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="cyber-chat-disclaimer">Questions go to DeepSeek via OpenRouter and are not saved by this site. AI can be wrong. Never share passwords, OTPs, or payment details.</div>
      <div class="cyber-chat-messages" role="log" aria-live="polite" aria-relevant="additions text">
        <article class="cyber-chat-message assistant"><div class="cyber-chat-bubble">Hi! I can help explain scams, online safety, account protection, and what to do after a suspicious incident. What would you like to know?</div></article>
      </div>
      <div class="cyber-chat-suggestions" aria-label="Suggested questions">
        <button type="button">How do I spot a phishing link?</button>
        <button type="button">What should I do after sharing an OTP?</button>
      </div>
      <form class="cyber-chat-form">
        <label class="sr-only" for="cyber-chat-input">Ask a cyber safety question</label>
        <textarea id="cyber-chat-input" maxlength="${MAX_MESSAGE_LENGTH}" rows="1" placeholder="Ask a cyber safety question…" required></textarea>
        <button class="cyber-chat-send" type="submit" aria-label="Send message"><span aria-hidden="true">↑</span></button>
      </form>
      <p class="cyber-chat-status" role="status"></p>
    </section>
    <button class="cyber-chat-launcher" type="button" aria-expanded="false" aria-controls="cyber-chat-panel" aria-label="Open CyberSaathi AI chat">
      <span class="cyber-chat-launch-icon" aria-hidden="true">✦</span><span class="cyber-chat-launch-label">Ask AI</span>
    </button>`;
  document.body.append(widget);

  const panel = widget.querySelector(".cyber-chat-panel");
  const launcher = widget.querySelector(".cyber-chat-launcher");
  const closeButton = widget.querySelector(".cyber-chat-close");
  const form = widget.querySelector(".cyber-chat-form");
  const input = widget.querySelector("#cyber-chat-input");
  const messagesView = widget.querySelector(".cyber-chat-messages");
  const status = widget.querySelector(".cyber-chat-status");
  const suggestions = widget.querySelector(".cyber-chat-suggestions");
  let conversation = [];
  let isSending = false;
  let sendToChat = null;

  function setOpen(isOpen) {
    panel.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.setAttribute("aria-label", isOpen ? "Close CyberSaathi AI chat" : "Open CyberSaathi AI chat");
    if (isOpen) input.focus();
  }

  function addMessage(role, text, pending = false) {
    const article = document.createElement("article");
    article.className = `cyber-chat-message ${role}${pending ? " is-pending" : ""}`;
    const bubble = document.createElement("div");
    bubble.className = "cyber-chat-bubble";
    bubble.textContent = text;
    article.append(bubble);
    messagesView.append(article);
    messagesView.scrollTop = messagesView.scrollHeight;
    return article;
  }

  function getRecentHistory() {
    const selected = [];
    let totalLength = 0;
    for (const message of conversation.slice(-MAX_HISTORY_MESSAGES).reverse()) {
      if (totalLength + message.content.length > 8000) break;
      selected.push(message);
      totalLength += message.content.length;
    }
    return selected.reverse();
  }

  function errorMessage(error) {
    if (error?.message?.startsWith("Firebase is not configured")) return error.message;
    const code = String(error?.code || "").split("/").pop();
    if (code === "resource-exhausted") return "That’s a lot of questions in a short time. Please wait a minute and try again.";
    if (code === "failed-precondition") return error.message || "The AI service is not configured correctly.";
    if (code === "unavailable" || code === "deadline-exceeded") return "The AI service is temporarily unavailable. Check your connection and Firebase function logs, then try again.";
    if (code === "not-found") return "The cyberChat Firebase function was not found. Deploy it with `firebase deploy --only functions` and confirm the site and function use the same Firebase project.";
    if (code === "unauthenticated") return "Firebase could not verify this request. Refresh the page and check the Firebase project configuration.";
    if (code === "permission-denied") return "Firebase denied this request. Check the function's access settings and Firebase App Check configuration.";
    if (code === "invalid-argument") return error.message || "The chat request was invalid. Shorten your message and try again.";
    if (code === "internal") return "The Firebase function encountered an internal error. Check its Firebase logs for the underlying cause.";
    if (code) return `The chat request failed (${code}). Check the Firebase function logs for details.`;
    return "I couldn't get a response just now. Please check your connection and try again.";
  }

  launcher.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
      launcher.focus();
    }
  });
  suggestions.addEventListener("click", (event) => {
    const suggestion = event.target.closest("button");
    if (!suggestion || isSending) return;
    input.value = suggestion.textContent;
    suggestions.hidden = true;
    input.focus();
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 104)}px`;
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = input.value.trim();
    if (!prompt || isSending) return;
    if (prompt.length > MAX_MESSAGE_LENGTH) {
      status.textContent = `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`;
      return;
    }

    status.textContent = "";
    suggestions.hidden = true;
    input.value = "";
    input.style.height = "auto";
    addMessage("user", prompt);
    conversation.push({ role: "user", content: prompt });
    const pending = addMessage("assistant", "Thinking…", true);
    isSending = true;
    form.querySelector("button[type='submit']").disabled = true;

    try {
      if (!firebaseReady) {
        throw new Error("Firebase is not configured. Add your Firebase web app settings before using the AI chat.");
      }
      if (!sendToChat) {
        const { getFunctions, httpsCallable } = await import(FUNCTIONS_SDK);
        sendToChat = httpsCallable(getFunctions(app, "us-central1"), "cyberChat");
      }
      const result = await sendToChat({ messages: getRecentHistory() });
      const reply = result.data?.reply;
      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("The assistant returned an empty response. Please try again.");
      }
      conversation.push({ role: "assistant", content: reply });
      pending.querySelector(".cyber-chat-bubble").textContent = reply;
      pending.classList.remove("is-pending");
    } catch (error) {
      pending.remove();
      console.error("CyberSaathi AI chat request failed.", error);
      addMessage("assistant", errorMessage(error));
    } finally {
      isSending = false;
      form.querySelector("button[type='submit']").disabled = false;
      input.focus();
    }
  });
}
