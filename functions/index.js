const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

const OPENROUTER_API_KEY = defineSecret("OPENROUTER_API_KEY");
const MAX_MESSAGE_LENGTH = 1500;
const MAX_HISTORY_MESSAGES = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 8;
const recentRequests = new Map();

const SYSTEM_PROMPT = `You are CyberSaathi, a conversational cyber-safety and digital security education assistant.
Give a fresh, natural answer tailored to the user's specific question; do not use a fixed canned script. Stay within defensive cyber safety, scam awareness, account/device protection, privacy, safe incident response, and high-level security education. Do not provide instructions that enable unauthorized access, credential theft, malware deployment, evasion, exploitation, or harm. If asked for harmful actions, briefly refuse and offer a safe defensive alternative.
Never ask for passwords, OTPs, full payment details, recovery codes, or other secrets. Do not claim you checked a link/device/account or verified a live threat. Explain uncertainty and encourage verification through official channels. For suspected financial cyber fraud in India, advise promptly calling 1930 and reporting at cybercrime.gov.in; for other locations, advise the local official reporting authority.
Answer clearly, calmly, and practically. Keep the answer concise but complete.`;

function validateMessages(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_HISTORY_MESSAGES) {
    throw new HttpsError("invalid-argument", "The chat history is invalid. Start a new question and try again.");
  }

  let totalLength = 0;
  const messages = value.map((message) => {
    if (!message || !["user", "assistant"].includes(message.role)
      || typeof message.content !== "string" || !message.content.trim()
      || message.content.length > MAX_MESSAGE_LENGTH) {
      throw new HttpsError("invalid-argument", "Each chat message must be plain text under 1,500 characters.");
    }
    totalLength += message.content.length;
    return { role: message.role, content: message.content.trim() };
  });

  if (messages[messages.length - 1].role !== "user" || totalLength > 8000) {
    throw new HttpsError("invalid-argument", "The chat history is too long or does not end with a question.");
  }
  return messages;
}

function checkRateLimit(request) {
  const key = request.auth?.uid || request.rawRequest.ip || "unknown-client";
  const now = Date.now();
  const entry = recentRequests.get(key);
  if (entry && now - entry.startedAt < RATE_LIMIT_WINDOW_MS) {
    if (entry.count >= RATE_LIMIT_REQUESTS) {
      throw new HttpsError("resource-exhausted", "Too many questions in a short time. Please wait a minute and try again.");
    }
    entry.count += 1;
    return;
  }
  recentRequests.set(key, { startedAt: now, count: 1 });
  if (recentRequests.size > 5000) {
    for (const [client, clientEntry] of recentRequests) {
      if (now - clientEntry.startedAt >= RATE_LIMIT_WINDOW_MS) recentRequests.delete(client);
    }
    while (recentRequests.size > 5000) recentRequests.delete(recentRequests.keys().next().value);
  }
}

exports.cyberChat = onCall({
  secrets: [OPENROUTER_API_KEY],
  timeoutSeconds: 60,
  maxInstances: 2,
}, async (request) => {
  checkRateLimit(request);
  const messages = validateMessages(request.data?.messages);

  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY.value()}`,
        "Content-Type": "application/json",
        "X-Title": "CyberSaathi Cyber Safety Assistant",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.75,
        max_tokens: 700,
      }),
    });
  } catch (error) {
    console.error("OpenRouter request could not be completed.", error);
    throw new HttpsError("unavailable", "The AI service is temporarily unreachable. Please try again shortly.");
  }

  if (!response.ok) {
    let errorCode = "";
    try {
      const errorPayload = await response.json();
      errorCode = String(errorPayload?.error?.code || errorPayload?.error?.type || "").toLowerCase();
    } catch (error) {
      console.warn("OpenRouter error response was not JSON.", response.status);
    }
    console.error("OpenRouter returned an unsuccessful status.", {
      status: response.status,
      code: errorCode,
    });

    if (response.status === 401 || response.status === 403) {
      throw new HttpsError("failed-precondition", "OpenRouter rejected the API key. Update the OPENROUTER_API_KEY Firebase secret, then redeploy the function.");
    }
    if (response.status === 402) {
      throw new HttpsError("failed-precondition", "The OpenRouter account has no available credits. Add credits or check its spending limits.");
    }
    if (response.status === 429) {
      throw new HttpsError("resource-exhausted", "OpenRouter is rate-limiting requests. Wait a little and try again.");
    }
    if (response.status === 400 || response.status === 404) {
      throw new HttpsError("failed-precondition", `OpenRouter could not use the configured DeepSeek model${errorCode ? ` (${errorCode})` : ""}. Check model availability in OpenRouter.`);
    }
    throw new HttpsError("unavailable", "OpenRouter is temporarily unable to answer. Please try again shortly.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("OpenRouter returned invalid JSON.", error);
    throw new HttpsError("unavailable", "The AI service returned an unreadable response. Please try again.");
  }

  const reply = payload?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    console.error("OpenRouter response did not include assistant text.");
    throw new HttpsError("unavailable", "The AI service returned an empty response. Please try again.");
  }

  return { reply: reply.trim() };
});
