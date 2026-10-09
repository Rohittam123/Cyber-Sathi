const planHost = document.querySelector("#incident-plan");
const optionButtons = document.querySelectorAll(".incident-option");

const commonSteps = [
  {
    title: "Stop contact and do not send anything else",
    detail: "Do not reply, pay a fee, share another code, or install another app—even if the person claims they can fix the problem.",
  },
  {
    title: "Keep useful evidence",
    detail: "Save the message, sender details, website address, and relevant transaction reference. Do not forward suspicious links or post private information publicly.",
  },
];

const plans = {
  message: {
    urgency: "You have not acted yet. The safest move is to stop contact and verify independently.",
    steps: [
      commonSteps[0],
      {
        title: "Verify using a channel you find yourself",
        detail: "Open the organization’s official app or type its known website address. Contact support using details listed there—not the message, caller, or search ad.",
      },
      {
        title: "Block and report the sender",
        detail: "Use the messaging or email service’s built-in report and block options. If it claims to be from a real organization, notify that organization through its official channel.",
      },
    ],
  },
  clicked: {
    urgency: "Clicking alone does not prove your device or account was compromised. Take these steps based on what you did next.",
    steps: [
      {
        title: "Close the page and do not download or approve anything",
        detail: "Do not enter more information, accept browser notifications, install a profile, or run a downloaded file. If a file downloaded, do not open it.",
      },
      {
        title: "If you entered a password, change it from a trusted device",
        detail: "Go to the real service by typing its address yourself. Change that password and any reused passwords, then sign out other sessions and enable two-step verification.",
      },
      {
        title: "If you entered payment or identity details, contact the provider",
        detail: "Call your bank/card/payment provider using its official app or card number. Ask what protective steps are appropriate for the information exposed.",
      },
      {
        title: "If you opened a file, scan the device",
        detail: "Use the device’s built-in or trusted security software and install updates. If the device behaves unusually, get help from a trusted technician before using it for sensitive accounts.",
      },
    ],
  },
  credentials: {
    urgency: "Treat a shared OTP, password, or PIN as exposed. If a payment may be involved, contact your bank immediately.",
    steps: [
      {
        title: "Contact your bank or payment provider if money or a payment code is involved",
        detail: "Use the official app or the number printed on your card. Ask them to secure affected payment methods or accounts. Never share another OTP or PIN with someone who calls you.",
      },
      {
        title: "Change the exposed password from a trusted device",
        detail: "Use the service’s official app/site, choose a new unique password, and change it anywhere else you reused it.",
      },
      {
        title: "End sessions and check recovery settings",
        detail: "Sign out other devices, review recovery email/phone and multi-factor settings, and remove devices or app access you do not recognize.",
      },
      {
        title: "Watch for activity you did not initiate",
        detail: "Review recent sign-ins and transactions. Report unauthorized activity through the service or provider’s official support channel.",
      },
    ],
  },
  payment: {
    urgency: "Act now: quickly notifying your bank or payment provider is important. A report does not guarantee that a transfer can be reversed.",
    steps: [
      {
        title: "Call your bank or payment provider immediately",
        detail: "Use the official app or number printed on your card. Report the transaction as unauthorized or scam-related and ask them to secure the account/payment method.",
      },
      {
        title: "In India, call 1930 promptly",
        detail: "Then submit a report at cybercrime.gov.in. Keep the bank complaint/reference number and cybercrime acknowledgement for follow-up.",
        link: { label: "Open cybercrime.gov.in", href: "https://cybercrime.gov.in/" },
      },
      {
        title: "Save transaction and conversation evidence",
        detail: "Keep the transaction reference, amount, time, recipient details shown by your provider, and original messages/call details. Share them only with your bank and official investigators.",
      },
      {
        title: "Ignore recovery-fee promises",
        detail: "Do not pay anyone who promises guaranteed recovery or asks for your OTP, PIN, password, or remote access. Verify every follow-up through official channels.",
      },
    ],
  },
  remote: {
    urgency: "If someone is actively viewing or controlling your screen, disconnect the device from Wi‑Fi/mobile data and end the remote session first.",
    steps: [
      {
        title: "Stop the remote session",
        detail: "Disconnect from the internet if the screen is actively controlled. Do not use the affected device to sign in to banking or change passwords while access may remain.",
      },
      {
        title: "Contact your bank from a different, trusted device",
        detail: "Tell them a stranger may have seen or controlled your screen. Ask them to secure accounts or payments that may have been visible.",
      },
      {
        title: "Remove the app and its access",
        detail: "When safe, uninstall the remote-access app and revoke accessibility, screen-sharing, device-admin, or profile permissions you do not recognize. If unsure, ask a trusted technician.",
      },
      {
        title: "Secure accounts from a clean device",
        detail: "Change exposed passwords, sign out other sessions, review recovery details, and enable two-step verification. Use a trusted device that the other person could not access.",
      },
    ],
  },
  account: {
    urgency: "Secure the account through its official recovery route. Start with your email account if it can reset other accounts.",
    steps: [
      {
        title: "Use the service’s official account recovery page",
        detail: "Type the service address yourself or use its official app. Do not use recovery links sent by the person contacting you.",
      },
      {
        title: "Secure the email and phone number used for recovery",
        detail: "Change their passwords from a trusted device, check forwarding rules and recovery details, and contact your mobile provider if your phone service suddenly stopped.",
      },
      {
        title: "Revoke unknown sessions and connected apps",
        detail: "After regaining access, sign out all other devices, remove unfamiliar app access, review recent activity, and enable two-step verification.",
      },
      {
        title: "Warn contacts if the account sent messages",
        detail: "Use another trusted channel to tell contacts not to open links or send money from recent messages that may have come from your account.",
      },
    ],
  },
};

function createStep(step, index) {
  const article = document.createElement("article");
  article.className = "incident-action";

  const label = document.createElement("label");
  label.className = "incident-action-check";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("aria-label", `Mark step ${index + 1} complete: ${step.title}`);
  const checkmark = document.createElement("span");
  checkmark.setAttribute("aria-hidden", "true");
  label.append(checkbox, checkmark);

  const content = document.createElement("div");
  content.className = "incident-action-content";
  const title = document.createElement("h3");
  title.textContent = step.title;
  const detail = document.createElement("p");
  detail.textContent = step.detail;
  content.append(title, detail);
  if (step.link) {
    const link = document.createElement("a");
    link.href = step.link.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${step.link.label} ↗`;
    content.append(link);
  }
  article.append(label, content);
  checkbox.addEventListener("change", () => {
    article.classList.toggle("is-complete", checkbox.checked);
    updateProgress();
  });
  return article;
}

function updateProgress() {
  const checks = [...planHost.querySelectorAll(".incident-action input[type='checkbox']")];
  const completed = checks.filter((checkbox) => checkbox.checked).length;
  const count = planHost.querySelector(".incident-progress-count");
  const bar = planHost.querySelector(".incident-progress-bar span");
  if (count) count.textContent = `${completed} of ${checks.length} steps done`;
  if (bar) {
    bar.style.width = `${checks.length ? completed / checks.length * 100 : 0}%`;
    bar.parentElement.setAttribute("aria-valuenow", String(completed));
  }
}

function renderPlan(situation) {
  const plan = plans[situation];
  if (!plan) return;

  planHost.replaceChildren();
  const header = document.createElement("div");
  header.className = "incident-plan-heading";
  const label = document.createElement("span");
  label.className = "incident-step-label";
  label.textContent = "YOUR NEXT STEPS";
  const title = document.createElement("h2");
  title.id = "incident-plan-title";
  title.textContent = "A plan for right now";
  const urgency = document.createElement("p");
  urgency.className = "incident-plan-urgency";
  urgency.textContent = plan.urgency;
  header.append(label, title, urgency);

  const progress = document.createElement("div");
  progress.className = "incident-progress";
  const count = document.createElement("span");
  count.className = "incident-progress-count";
  count.textContent = `0 of ${plan.steps.length} steps done`;
  const track = document.createElement("div");
  track.className = "incident-progress-bar";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-label", "Recovery plan progress");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", String(plan.steps.length));
  track.setAttribute("aria-valuenow", "0");
  const fill = document.createElement("span");
  track.append(fill);
  progress.append(count, track);

  const list = document.createElement("div");
  list.className = "incident-actions";
  plan.steps.forEach((step, index) => list.append(createStep(step, index)));

  const controls = document.createElement("div");
  controls.className = "incident-plan-controls";
  const printButton = document.createElement("button");
  printButton.type = "button";
  printButton.className = "incident-print";
  printButton.textContent = "Print / save plan";
  printButton.addEventListener("click", () => window.print());
  const privacyNote = document.createElement("span");
  privacyNote.textContent = "Progress is not saved.";
  controls.append(printButton, privacyNote);
  planHost.append(header, progress, list, controls);
  updateProgress();
}

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    optionButtons.forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
    renderPlan(button.dataset.situation);
  });
});
