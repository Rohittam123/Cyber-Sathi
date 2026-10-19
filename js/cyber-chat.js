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

const PLATFORM_SECTIONS = [
  {
    title: "Check a suspicious message",
    detail: "The Scam Checker analyzes message text in your browser and highlights common warning signs. It is a learning aid, not a security verdict, and it cannot guarantee that a message is safe.",
    href: "./scam-checker.html",
    link: "Open Scam Checker",
  },
  {
    title: "Get a response plan",
    detail: "The Incident Response planner provides step-by-step guidance for situations such as clicking a link, sharing account details, installing remote-access software, losing money, or an account takeover.",
    href: "./incident-response.html",
    link: "Build a recovery plan",
  },
  {
    title: "Learn to spot common scams",
    detail: "The Scam Library, Safety Guide, and predefined Basic and Intermediate chat guides explain common tactics and safer actions in plain language.",
    href: "./scam-library.html",
    link: "Explore the Scam Library",
  },
  {
    title: "Practice and track your habits",
    detail: "Take the Phishing Quiz, work through the Cyber Safety Checklist, and see your quiz and checklist progress on the Awareness Score page.",
    href: "./phishing-quiz.html",
    link: "Take the Phishing Quiz",
  },
  {
    title: "Understand privacy and saved reports",
    detail: "Quiz and checklist progress stays in this browser. Scam-check reports are saved to your signed-in account; the original message is only included when you opt in before analyzing it. Do not enter passwords, OTPs, recovery codes, or payment details into CyberSaathi.",
    href: "./about.html",
    link: "Read about CyberSaathi",
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
        <div class="cyber-chat-heading"><strong>CyberSaathi Platform Guide</strong><span><i></i> Predefined help · works offline</span></div>
        <button class="cyber-chat-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="cyber-chat-disclaimer">Answers are predefined guides about CyberSaathi and its tools. Your question stays in this browser and is not sent to an AI service.</div>
      <div class="cyber-chat-messages" role="log" aria-live="polite" aria-relevant="additions text">
        <article class="cyber-chat-message assistant"><div class="cyber-chat-bubble">Welcome! Choose a Basic or Intermediate safety guide, or type any question. Typed questions receive the same detailed, predefined overview of CyberSaathi and what you can do here.</div></article>
      </div>
      <div class="cyber-chat-suggestions" aria-label="Predefined cyber-safety guides">
        <div class="cyber-chat-faq-heading"><span>QUICK GUIDES</span><span>Detailed answers · no AI setup</span></div>
        <div class="cyber-chat-faq-categories" role="group" aria-label="Guide difficulty">
          <button type="button" data-faq-category="basic" aria-pressed="true">Basic</button>
          <button type="button" data-faq-category="intermediate" aria-pressed="false">Intermediate</button>
        </div>
        <div class="cyber-chat-faq-prompts"></div>
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
  const messagesView = widget.querySelector(".cyber-chat-messages");
  const status = widget.querySelector(".cyber-chat-status");
  const suggestions = widget.querySelector(".cyber-chat-suggestions");
  const faqPrompts = widget.querySelector(".cyber-chat-faq-prompts");
  let selectedFaqCategory = "basic";
  function setOpen(isOpen) {
    panel.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.setAttribute("aria-label", isOpen ? "Close CyberSaathi platform guide" : "Open CyberSaathi platform guide");
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
    messagesView.scrollTop = messagesView.scrollHeight;
  }

  function addPlatformOverview() {
    const article = document.createElement("article");
    article.className = "cyber-chat-message assistant cyber-chat-faq-answer cyber-chat-platform-answer";
    const bubble = document.createElement("div");
    bubble.className = "cyber-chat-bubble";

    const label = document.createElement("span");
    label.className = "cyber-chat-answer-label";
    label.textContent = "ABOUT CYBERSAATHI · PREDEFINED PLATFORM OVERVIEW";

    const introduction = document.createElement("p");
    introduction.textContent = "CyberSaathi is a cyber-safety awareness and assistance platform. It helps you understand suspicious messages, learn safer online habits, and find practical next steps. This same overview is shown for every typed question; it is a predefined guide, not a personalized AI response.";

    const sectionsHeading = document.createElement("strong");
    sectionsHeading.className = "cyber-chat-steps-heading";
    sectionsHeading.textContent = "What you can do on CyberSaathi";

    const sections = document.createElement("ol");
    PLATFORM_SECTIONS.forEach((section) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = section.title;
      const detail = document.createElement("span");
      detail.textContent = section.detail;
      const link = document.createElement("a");
      link.href = section.href;
      link.textContent = section.link;
      item.append(title, detail, link);
      sections.append(item);
    });

    const emergency = document.createElement("p");
    emergency.className = "cyber-chat-takeaway";
    emergency.append("Urgent financial cyber fraud in India? Contact your bank or payment provider using its official contact details, call ");
    const helpline = document.createElement("a");
    helpline.href = "tel:1930";
    helpline.textContent = "1930";
    emergency.append(helpline, ", and report at ");
    const reportSite = document.createElement("a");
    reportSite.href = "https://cybercrime.gov.in/";
    reportSite.target = "_blank";
    reportSite.rel = "noopener noreferrer";
    reportSite.textContent = "cybercrime.gov.in";
    emergency.append(reportSite, ". CyberSaathi is an educational tool, not an emergency service or security verdict.");

    bubble.append(label, introduction, sectionsHeading, sections, emergency);
    article.append(bubble);
    messagesView.append(article);
    messagesView.scrollTop = messagesView.scrollHeight;
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
    addMessage("user", faq.question);
    addFaqAnswer(faq);
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
    if (!prompt) return;
    if (prompt.length > MAX_MESSAGE_LENGTH) {
      status.textContent = `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`;
      return;
    }

    status.textContent = "This is a predefined CyberSaathi overview. Your question was not sent to an AI service.";
    input.value = "";
    input.style.height = "auto";
    addMessage("user", prompt);
    addPlatformOverview();
    input.focus();
  });
}
