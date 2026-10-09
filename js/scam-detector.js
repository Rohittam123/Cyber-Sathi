const patterns = [
  {
    category: "Urgent pressure",
    expression: /\b(urgent|immediately|act now|final warning|within \d+ hours?|expires? today|account.{0,25}(blocked|suspended|closed))\b/i,
    explanation: "Creates time pressure so you act before checking whether the request is genuine.",
  },
  {
    category: "Sensitive information request",
    expression: /\b(otp|one[- ]time password|password|pin|cvv|card number|bank details|verify.{0,20}(account|identity)|share.{0,15}(code|otp))\b/i,
    explanation: "Mentions credentials or verification details that legitimate support should not ask you to disclose.",
  },
  {
    category: "Suspicious link",
    expression: /\bhttps?:\/\/[^\s<>"']+|www\.[^\s<>"']+/i,
    explanation: "Contains a link. Unexpected links can lead to lookalike sign-in pages or harmful downloads.",
  },
  {
    category: "Unsecured link",
    expression: /\bhttp:\/\/[^\s<>"']+/i,
    explanation: "Uses an unencrypted HTTP address. This alone does not prove fraud, but it is a reason to be cautious.",
  },
  {
    category: "Prize or unexpected reward",
    expression: /\b(you.{0,12}(won|winner)|claim.{0,20}(prize|reward|gift)|lottery|free.{0,12}(gift|cash|prize))\b/i,
    explanation: "Unexpected prizes are often used to lure people into paying a fee or sharing personal details.",
  },
  {
    category: "Payment or fee request",
    expression: /\b(pay.{0,15}(fee|now|immediately)|send.{0,15}(money|payment)|processing fee|refund.{0,20}(claim|click)|upi.{0,20}(pin|payment))\b/i,
    explanation: "Requests payment or hints at a refund. Verify any payment request directly with the organization.",
  },
  {
    category: "Impersonation or threat",
    expression: /\b(police|arrest|legal action|tax department|customs|parcel.{0,20}(held|stopped)|bank.{0,20}(alert|security)|government.{0,20}(notice|fine))\b/i,
    explanation: "Uses an authority, delivery, or bank theme that scammers may impersonate to create fear.",
  },
  {
    category: "Remote access request",
    expression: /\b(remote access|install.{0,20}(app|software)|screen sharing|anydesk|teamviewer)\b/i,
    explanation: "Asks for remote access or screen sharing, which could expose your accounts and device.",
  },
  {
    category: "Unusual contact channel",
    expression: /\b(whatsapp|telegram|personal number|call this number|contact.{0,15}(here|below))\b/i,
    explanation: "Pushes you toward a specific contact channel. Find the organization's contact details independently.",
  },
  {
    category: "QR code",
    expression: /\b(qr\s?code|scan.{0,15}(to pay|to receive|to claim|this code))\b/i,
    explanation: "Mentions a QR code. Scanning can open a link, and paying by QR may send money out rather than receive it.",
  },
];

export function analyzeMessage(message) {
  const text = message.trim();
  const matches = patterns.filter(({ expression }) => expression.test(text));
  const categories = [...new Set(matches.map(({ category }) => category))];
  const messageType = classifyMessageType(text);
  let level = "low";

  if (categories.some((category) => ["Sensitive information request", "Payment or fee request", "Remote access request"].includes(category))) {
    level = "high";
  } else if (matches.length >= 2 || categories.length > 0) {
    level = "medium";
  }

  const signals = matches.map(({ category, explanation }) => `${category}: ${explanation}`);
  if (signals.length === 0) {
    signals.push("No common red flags matched. A scam may still use wording this checker does not recognize.");
  }

  const advice = level === "high"
    ? "Do not reply, click, share information, or pay. Verify through the official app or a number you find independently."
    : level === "medium"
      ? "Pause before acting. Check the sender and any request through an official channel, not a link or number in the message."
      : "No common warning pattern was detected, but that does not establish that it is safe. Verify unexpected requests independently.";
  const recommendations = [
    "Do not use links or phone numbers included in an unexpected message. Open the official app or type a known address yourself.",
    "Never share an OTP, password, PIN, CVV, recovery code, or grant remote access to someone who contacted you unexpectedly.",
    ...(categories.includes("Payment or fee request") || categories.includes("Sensitive information request")
      ? ["If you already shared payment details or sent money, contact your bank or payment provider immediately using its official contact details."]
      : []),
    ...(categories.includes("Remote access request")
      ? ["Do not install remote-access software or share your screen with an unsolicited caller."]
      : []),
    ...(categories.length
      ? ["Preserve the original message and independently verify the request before taking any action."]
      : ["Treat this as a pattern check only. Scams may use signals this checker does not recognize; verify unexpected requests independently."]),
  ];

  return {
    level,
    messageType,
    categories,
    signals,
    advice,
    recommendations,
    summary: level === "high"
      ? "Several high-risk patterns may be present. Treat this message with caution."
      : level === "medium"
        ? "Some warning signs may be present. Verify before taking action."
        : "No strong common warning signs were detected. Stay cautious with unexpected messages.",
  };
}

function classifyMessageType(text) {
  if (/\b(qr\s?code|scan.{0,15}(to pay|to receive|to claim|this code))\b/i.test(text)) {
    return "QR-code message";
  }
  if (/\b(caller|fraudulent? call|phone call|call.{0,20}(you|me|from)|voicemail|on the phone)\b/i.test(text)) {
    return "Phone-call message";
  }
  if (/\b(sms|text message|whatsapp|telegram|message)\b/i.test(text)) {
    return "SMS or messaging-app message";
  }
  if (/\b(email|e-mail|inbox|mailbox)\b/i.test(text)) {
    return "Email message";
  }
  if (/\bhttps?:\/\/[^\s<>"']+|www\.[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/i.test(text)) {
    return "Website or link";
  }
  return "Suspicious message";
}
