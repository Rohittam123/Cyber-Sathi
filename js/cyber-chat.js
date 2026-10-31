const MAX_MESSAGE_LENGTH = 1500;

const FAQS = [
  {
    id: "spot-phishing",
    category: "basic",
    question: "How can I spot a phishing message or link?",
    introduction: "Phishing messages impersonate a trusted person or organization to make you click, pay, or reveal information. One clue alone does not prove a message is fake, so check the request using a separate, trusted channel.",
    steps: [
      { title: "Notice pressure and unexpected requests", detail: "Threats, prizes, account warnings, secrecy, or short deadlines are common ways to stop you thinking clearly." },
      { title: "Check the sender and destination carefully", detail: "Look for misspellings and lookalike domains. On a phone, press and hold a link to preview it; do not open it to check. Sender names and caller ID can be spoofed." },
      { title: "Do not share secrets or pay through the message", detail: "Never share an OTP, PIN, password, recovery code, or card security code with someone who contacted you unexpectedly." },
      { title: "Verify independently", detail: "Open the official app or type the organization's known web address yourself. Contact it using a number from your card or official website, not the message." },
    ],
    takeaway: "HTTPS only encrypts a connection; it does not prove that a website is genuine. If you already clicked, close the page, do not enter details, and use the recovery guide if you shared information.",
  },
  {
    id: "shared-otp",
    category: "basic",
    question: "What should I do if I shared an OTP?",
    introduction: "Act promptly, but do not panic. An OTP may authorize a sign-in, password reset, payment, or SIM-related action. Use a different trusted device or official contact route if you can.",
    steps: [
      { title: "Stop responding to the caller or message", detail: "Do not share another code, approve another request, install an app, or follow instructions to keep the incident secret." },
      { title: "Contact the affected provider directly", detail: "Use its official app, website, or the number printed on your card. Ask it to secure the account and block or dispute any unauthorized transaction." },
      { title: "Secure the account from a trusted device", detail: "Change its password to a new, unique one, sign out other sessions if that option is available, and enable multi-factor authentication. Secure your email too if it could reset this account." },
      { title: "Report financial loss immediately in India", detail: "Call the national cyber financial fraud helpline 1930 and report at cybercrime.gov.in. Follow your bank's instructions and keep the complaint reference." },
      { title: "Keep evidence and watch for follow-up scams", detail: "Save messages, numbers, transaction IDs, and times. Do not pay anyone who promises to recover money for an advance fee." },
    ],
    takeaway: "Never send another OTP to someone claiming to help recover the account. Real support should not ask you to read out an OTP or PIN.",
  },
  {
    id: "strong-password",
    category: "basic",
    question: "How do I make my accounts harder to hack?",
    introduction: "The biggest practical improvements are unique passwords, multi-factor authentication, and protecting the email account used for password resets.",
    steps: [
      { title: "Use a different password for every account", detail: "A long passphrase made from unrelated words can be easier to remember. A reputable password manager can create and store unique passwords." },
      { title: "Turn on multi-factor authentication", detail: "Prefer a passkey or authenticator app when offered. Save recovery codes somewhere private and offline; never send them to a person who contacts you." },
      { title: "Protect your email account first", detail: "Use a unique password and MFA there, because email often controls password resets for other accounts." },
      { title: "Review recovery details and active sessions", detail: "Remove old phone numbers, devices, and apps you no longer use. Turn on sign-in alerts where available." },
      { title: "Keep devices and apps updated", detail: "Install updates from the device's official settings or app store, and use a screen lock." },
    ],
    takeaway: "A company will not need your password, OTP, or recovery code to help you. Do not share them, even with someone who knows personal details about you.",
  },
  {
    id: "verify-bank",
    category: "basic",
    question: "How do I check if a bank or government call is real?",
    introduction: "A caller's display name or knowledge of your details is not proof of identity. Treat unexpected requests for money, codes, remote access, or secrecy as a reason to stop and verify.",
    steps: [
      { title: "End the unexpected call or chat", detail: "Do not use a callback number, link, or app that the caller gives you, and do not press a keypad option to connect to a supposed official." },
      { title: "Find the official contact yourself", detail: "Use the number on your bank card, the official app, or a website address you already know. For government services, find the contact on the official government website." },
      { title: "Ask whether the request is genuine", detail: "Describe the request without sharing an OTP, PIN, password, full card details, or remote access." },
      { title: "Take action through the official service", detail: "If there is a real account issue, sign in by opening the official app yourself or visit an authorized branch or office." },
    ],
    takeaway: "Do not install screen-sharing or remote-access apps at an unsolicited caller's request. Never approve a payment or enter a UPI PIN to receive money.",
  },
  {
    id: "lost-money",
    category: "basic",
    question: "I sent money to a scammer. What should I do first?",
    introduction: "Contact your bank or payment provider immediately using its official app, website, or card number. Fast reporting gives the provider a chance to act; it cannot guarantee that money will be recovered.",
    steps: [
      { title: "Call your bank or payment provider now", detail: "Report the unauthorized or deceptive transfer, ask whether it can be stopped or disputed, and secure affected accounts, cards, and UPI access." },
      { title: "Call India's cyber financial fraud helpline", detail: "Dial 1930 as soon as possible, then submit the complaint at cybercrime.gov.in and follow any instructions you receive." },
      { title: "Keep evidence together", detail: "Record transaction IDs or UTRs, amount, date and time, recipient details, messages, phone numbers, and your bank's complaint reference. Do not edit the originals." },
      { title: "Secure accounts from a trusted device", detail: "Change exposed passwords, sign out other sessions, and tell the provider if you shared an OTP, PIN, or installed remote-access software." },
      { title: "Ignore paid recovery promises", detail: "Be cautious of anyone demanding an advance fee, cryptocurrency, or another OTP to retrieve your funds." },
    ],
    takeaway: "Use only contact details you find independently. CyberSaathi cannot freeze a transfer, contact a bank for you, or guarantee recovery.",
  },
  {
    id: "account-takeover",
    category: "intermediate",
    question: "What should I do if an account was taken over?",
    introduction: "Work from a device you believe is safe. If you suspect your phone or computer is being controlled, use another trusted device to contact providers and change credentials.",
    steps: [
      { title: "Secure the email account linked to it", detail: "Change its password to a unique one, use the provider's official account-recovery page, end unfamiliar sessions, and check recovery addresses and forwarding rules." },
      { title: "Recover and secure the affected account", detail: "Use only the service's official recovery process. Change reused passwords, revoke unknown devices, sessions, connected apps, and app passwords, then enable MFA or a passkey." },
      { title: "Check phone-number access", detail: "If your SIM stopped working unexpectedly or you suspect a SIM swap, contact your mobile carrier through an official route and ask it to secure the number." },
      { title: "Protect contacts and linked payment services", detail: "Warn contacts through another channel not to trust unusual requests from the compromised account. Contact your bank if financial accounts or payment details may be exposed." },
      { title: "Preserve evidence and report", detail: "Save security alerts, messages, times, and complaint references. Report financial fraud in India at 1930 and cybercrime.gov.in." },
    ],
    takeaway: "Do not share recovery codes with anyone offering help. If you cannot regain access, contact the service using its official support or account-recovery page.",
  },
  {
    id: "remote-access",
    category: "intermediate",
    question: "I installed a remote-access app for a caller. What now?",
    introduction: "Treat this as urgent if you opened banking, email, or payment apps while the other person could view or control your screen. Do not use the potentially exposed device to contact your bank.",
    steps: [
      { title: "End the remote session and disconnect the device", detail: "Hang up, stop screen sharing, disable the remote session, and disconnect the device from Wi-Fi and mobile data. Do not follow more caller instructions." },
      { title: "Contact your bank from another trusted phone", detail: "Tell it what happened, ask it to block or secure affected accounts and payment methods, and report any transactions you do not recognize." },
      { title: "Secure accounts from a clean device", detail: "Change passwords for accounts used during the session, starting with your email and financial accounts. Revoke unfamiliar sessions and enable MFA." },
      { title: "Remove the app and check the device", detail: "After disconnecting, remove the remote-access app and review device administrator, accessibility, and screen-recording permissions for anything unfamiliar. If control persists, stop using the device and get help from the manufacturer or a trusted technician." },
      { title: "Report and preserve evidence", detail: "Save the caller's number, app name, messages, and transaction references. In India, report financial cyber fraud by calling 1930 and using cybercrime.gov.in." },
    ],
    takeaway: "Never read an OTP aloud, enter a UPI PIN, or approve a payment while a stranger can view or control your device.",
  },
  {
    id: "upi-qr",
    category: "intermediate",
    question: "Can scanning a QR code or entering my UPI PIN receive money?",
    introduction: "A UPI PIN authorizes a debit from your account; it is not needed just to receive money. A QR code may open a payment flow or website, so check what you are approving before proceeding.",
    steps: [
      { title: "Read the payment screen before approving", detail: "Check whether it says you are paying or collecting, and verify the amount and recipient name. Cancel if anything is unexpected." },
      { title: "Never enter your UPI PIN to receive a payment", detail: "Do not approve a collect request, payment mandate, or PIN prompt unless you intended to send that amount to that recipient." },
      { title: "Verify the request outside the chat", detail: "For a sale or refund, check the transaction in your official bank or UPI app. Do not trust screenshots or a caller's claim that payment is pending." },
      { title: "If you approved a suspicious debit", detail: "Contact your bank or UPI provider through its official channel immediately. In India, call 1930 and report at cybercrime.gov.in." },
    ],
    takeaway: "Receiving money does not require scanning a stranger's QR code, sharing an OTP, or telling someone your UPI PIN.",
  },
  {
    id: "public-wifi",
    category: "intermediate",
    question: "Is it safe to use banking apps on public Wi-Fi?",
    introduction: "Modern banking apps generally encrypt connections, but public networks can still expose you to fake hotspots, captive-portal tricks, shoulder-surfing, and malicious links. Mobile data is a simpler choice for sensitive tasks.",
    steps: [
      { title: "Prefer your mobile data for banking", detail: "Avoid financial transactions on public Wi-Fi when practical, especially on an unknown or shared device." },
      { title: "Do not trust a network by its name", detail: "Attackers can create hotspots with familiar names. Confirm the network with the venue, and avoid entering passwords into unexpected sign-in pages." },
      { title: "Open the official app yourself", detail: "Do not follow banking links from messages or pop-ups. Keep your device updated and use a screen lock." },
      { title: "Use a reputable VPN only as one layer", detail: "A VPN can encrypt traffic between your device and the VPN provider, but it does not make phishing links safe or protect a compromised device." },
      { title: "Disconnect and forget shared networks", detail: "Turn off auto-join for networks you do not trust, and sign out of accounts on shared devices." },
    ],
    takeaway: "HTTPS is important but does not prove a site is genuine. Verify the address and the request independently.",
  },
  {
    id: "ransomware",
    category: "intermediate",
    question: "What should I do if my computer shows a ransomware message?",
    introduction: "Prioritize containing the incident and getting trusted help. Do not pay or contact a number in the ransom note before speaking with your organization's IT team or a trusted incident-response professional.",
    steps: [
      { title: "Disconnect the affected device from networks", detail: "Turn off Wi-Fi and unplug network cables to help limit spread. Do not connect backup drives or other devices to it." },
      { title: "Contact your organization's IT or security team", detail: "For a work or school device, report it immediately and follow their instructions. For a personal device, use another trusted device to seek reputable technical support." },
      { title: "Preserve details without spreading the infection", detail: "Record the message, time, affected device, and any suspicious files or emails. Avoid forwarding suspicious files or plugging in backups." },
      { title: "Secure other accounts from a clean device", detail: "If credentials may have been exposed, change them from a separate trusted device and enable MFA. Contact your bank if payment information may be at risk." },
      { title: "Use clean backups only after the device is safe", detail: "Do not restore backups until a trusted technician or security team confirms the device is cleaned and the backup is safe to use." },
    ],
    takeaway: "A payment does not guarantee that files will be restored. If personal or financial data is involved, report the incident to the appropriate authority; in India use cybercrime.gov.in.",
  },
];

export function initCyberChatWidget() {
  if (document.querySelector(".cyber-chat")) return;

  const widget = document.createElement("div");
  widget.className = "cyber-chat";
  widget.innerHTML = `
    <section class="cyber-chat-panel" id="cyber-chat-panel" role="dialog" aria-label="CyberSaathi AI chat" aria-modal="false" aria-hidden="true">
      <header class="cyber-chat-header">
        <div class="cyber-chat-avatar" aria-hidden="true">C</div>
        <div class="cyber-chat-heading"><strong>Ask Saathi</strong><span><i></i> AI threat intelligence · defensive guidance</span></div>
        <button class="cyber-chat-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="cyber-chat-disclaimer">Ask for defensive threat analysis, indicators, or mitigations. Typed questions are sent securely to the Ask Saathi service; don’t include secrets or confidential data.</div>
      <div class="cyber-chat-messages" role="log" aria-live="polite" aria-relevant="additions text">
        <article class="cyber-chat-message assistant"><div class="cyber-chat-bubble">Hi, I’m Ask Saathi. Ask me to explain a suspicious indicator, summarize a threat technique, or suggest defensive detections and response steps. I’ll explain uncertainty and won’t claim live verification. Avoid sharing secrets or sensitive internal data.</div></article>
        <div class="cyber-chat-suggestions" aria-label="Predefined cyber-safety guides">
          <div class="cyber-chat-faq-heading"><span>QUICK GUIDES</span><span>Detailed answers · no AI setup</span></div>
          <div class="cyber-chat-faq-categories" role="group" aria-label="Guide difficulty">
            <button type="button" data-faq-category="basic" aria-pressed="true">Basic</button>
            <button type="button" data-faq-category="intermediate" aria-pressed="false">Intermediate</button>
          </div>
          <div class="cyber-chat-faq-prompts"></div>
        </div>
      </div>
      <form class="cyber-chat-form">
        <label class="sr-only" for="cyber-chat-input">Ask a question about CyberSaathi</label>
        <textarea id="cyber-chat-input" maxlength="${MAX_MESSAGE_LENGTH}" rows="1" placeholder="Ask about CyberSaathi or its tools…" required></textarea>
        <button class="cyber-chat-send" type="submit" aria-label="Send message"><span aria-hidden="true">↑</span></button>
      </form>
      <p class="cyber-chat-status" role="status"></p>
    </section>
    <button class="cyber-chat-launcher" type="button" aria-expanded="false" aria-controls="cyber-chat-panel" aria-label="Open CyberSaathi cyber safety help">
      <span class="cyber-chat-launch-icon" aria-hidden="true">✦</span><span class="cyber-chat-launch-label">Ask Saathi</span>
    </button>`;
  document.body.append(widget);

  const panel = widget.querySelector(".cyber-chat-panel");
  const launcher = widget.querySelector(".cyber-chat-launcher");
  const closeButton = widget.querySelector(".cyber-chat-close");
  const form = widget.querySelector(".cyber-chat-form");
  const input = widget.querySelector("#cyber-chat-input");
  const sendButton = widget.querySelector(".cyber-chat-send");
  const messagesView = widget.querySelector(".cyber-chat-messages");
  const status = widget.querySelector(".cyber-chat-status");
  const suggestions = widget.querySelector(".cyber-chat-suggestions");
  const faqPrompts = widget.querySelector(".cyber-chat-faq-prompts");
  let selectedFaqCategory = "basic";
  let conversation = [];
  let isSending = false;
  function setOpen(isOpen) {
    panel.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.setAttribute("aria-label", isOpen ? "Close Ask Saathi" : "Open Ask Saathi");
    if (isOpen) input.focus();
  }

  function addMessage(role, text) {
    const article = document.createElement("article");
    article.className = `cyber-chat-message ${role}`;
    const bubble = document.createElement("div");
    bubble.className = "cyber-chat-bubble";
    bubble.textContent = text;
    article.append(bubble);
    messagesView.append(article);
    messagesView.scrollTop = messagesView.scrollHeight;
    return article;
  }

  function showSuggestionsAfterAnswer(article) {
    messagesView.append(suggestions);
    const messageTop = article.getBoundingClientRect().top - messagesView.getBoundingClientRect().top + messagesView.scrollTop;
    messagesView.scrollTop = messageTop;
  }

  function renderFaqPrompts() {
    faqPrompts.replaceChildren();
    FAQS.filter((faq) => faq.category === selectedFaqCategory).forEach((faq) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.faqId = faq.id;
      button.textContent = faq.question;
      faqPrompts.append(button);
    });
  }

  function addFaqAnswer(faq) {
    const article = document.createElement("article");
    article.className = "cyber-chat-message assistant cyber-chat-faq-answer";
    const bubble = document.createElement("div");
    bubble.className = "cyber-chat-bubble";

    const label = document.createElement("span");
    label.className = "cyber-chat-answer-label";
    label.textContent = `${faq.category === "basic" ? "BASIC GUIDE" : "INTERMEDIATE GUIDE"} · PREDEFINED ANSWER`;

    const introduction = document.createElement("p");
    introduction.textContent = faq.introduction;

    const stepsHeading = document.createElement("strong");
    stepsHeading.className = "cyber-chat-steps-heading";
    stepsHeading.textContent = "What to do";

    const steps = document.createElement("ol");
    faq.steps.forEach((step) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = step.title;
      const detail = document.createElement("span");
      detail.textContent = step.detail;
      item.append(title, detail);
      steps.append(item);
    });

    const takeaway = document.createElement("p");
    takeaway.className = "cyber-chat-takeaway";
    takeaway.textContent = faq.takeaway;

    bubble.append(label, introduction, stepsHeading, steps, takeaway);
    article.append(bubble);
    messagesView.append(article);
    showSuggestionsAfterAnswer(article);
  }

  renderFaqPrompts();
  launcher.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
      launcher.focus();
    }
  });
  suggestions.addEventListener("click", (event) => {
    if (isSending) return;
    const categoryButton = event.target.closest("[data-faq-category]");
    if (categoryButton) {
      selectedFaqCategory = categoryButton.dataset.faqCategory;
      suggestions.querySelectorAll("[data-faq-category]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button === categoryButton));
      });
      renderFaqPrompts();
      return;
    }
    const suggestion = event.target.closest("button");
    if (!suggestion || !suggestion.dataset.faqId) return;
    const faq = FAQS.find((item) => item.id === suggestion.dataset.faqId);
    if (!faq) return;
    status.textContent = "Predefined safety guide shown. Your question was not sent to an AI service.";
    suggestions.remove();
    addMessage("user", faq.question);
    addFaqAnswer(faq);
    conversation = [
      ...conversation,
      { role: "user", content: faq.question },
      {
        role: "assistant",
        content: `${faq.introduction}\n\n${faq.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.detail}`).join("\n")}\n\n${faq.takeaway}`,
      },
    ].slice(-8);
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
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = input.value.trim();
    if (!prompt || isSending) return;
    if (prompt.length > MAX_MESSAGE_LENGTH) {
      status.textContent = `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`;
      return;
    }

    status.textContent = "Asking Ask Saathi…";
    input.value = "";
    input.style.height = "auto";
    suggestions.remove();
    addMessage("user", prompt);
    const pending = addMessage("assistant", "Reviewing your question…");
    pending.classList.add("is-pending");
    isSending = true;
    input.disabled = true;
    sendButton.disabled = true;
    void (async () => {
      try {
        const { askCyberSaathi } = await import("./ask-sathi.js");
        const requestMessages = [
          ...conversation.slice(-8),
          { role: "user", content: prompt },
        ];
        const assistantMessage = await askCyberSaathi(requestMessages);
        if (!assistantMessage || assistantMessage.role !== "assistant"
          || typeof assistantMessage.content !== "string" || !assistantMessage.content.trim()) {
          throw new Error("Ask Saathi returned an invalid response. Please try again.");
        }
        conversation = [...requestMessages, assistantMessage];
        pending.remove();
        const answer = addMessage("assistant", assistantMessage.content.trim());
        answer.classList.add("cyber-chat-ai-answer");
        showSuggestionsAfterAnswer(answer);
        status.textContent = "AI-generated defensive guidance. Verify important findings with trusted sources.";
      } catch (error) {
        pending.remove();
        const failure = addMessage("assistant", error.message || "Ask Saathi could not answer right now. Please try again.");
        failure.classList.add("cyber-chat-error");
        showSuggestionsAfterAnswer(failure);
        status.textContent = "Ask Saathi could not complete that request.";
      } finally {
        isSending = false;
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
      }
    })();
  });
}
