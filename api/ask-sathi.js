const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_USER_MESSAGE_LENGTH = 1500;
const MAX_ASSISTANT_MESSAGE_LENGTH = 10_000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_BYTES = 60_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 8;
const recentRequests = new Map();

const SYSTEM_PROMPT = `You are CyberSaathi, a conversational cyber-safety and digital security education assistant.
Give a fresh, natural answer tailored to the user's question, especially defensive threat intelligence. For threat analysis, organize useful detail into assessment, supporting indicators or TTPs, confidence and uncertainty, and prioritized defensive actions. Distinguish observed facts from hypotheses, note when indicators may be stale or shared, and never invent sources, live intelligence, attribution, or verification.
Stay within defensive cyber safety, scam awareness, incident response, threat hunting, detection engineering, and high-level security education. Do not provide instructions that enable unauthorized access, credential theft, malware deployment, evasion, exploitation, or harm. If asked for harmful actions, briefly refuse and offer a safe defensive alternative.
Never ask for passwords, OTPs, full payment details, recovery codes, private keys, or other secrets. Do not claim you checked a link/device/account or verified a live threat. Explain uncertainty and encourage verification through trusted sources. Do not reveal private chain-of-thought; give conclusions and a concise rationale instead. For suspected financial cyber fraud in India, advise promptly calling 1930 and reporting at cybercrime.gov.in; for other locations, advise the local official reporting authority.
Answer clearly, calmly, and practically. Be detailed when the user asks for threat-intelligence analysis, but keep the answer focused and actionable.`;

function sendError(response, status, message) {
  response.status(status).json({ error: message });
}

function validateMessages(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_HISTORY_MESSAGES) {
    return null;
  }

  let totalBytes = 0;
  const messages = [];
  for (const message of value) {
    const maxLength = message?.role === "user" ? MAX_USER_MESSAGE_LENGTH : MAX_ASSISTANT_MESSAGE_LENGTH;
    if (!message || !["user", "assistant"].includes(message.role)
      || typeof message.content !== "string" || !message.content.trim()
      || message.content.length > maxLength) {
      return null;
    }

    const validatedMessage = { role: message.role, content: message.content.trim() };
    if (message.reasoning_details !== undefined) {
      if (message.role !== "assistant" || !message.reasoning_details || typeof message.reasoning_details !== "object") {
        return null;
      }
      validatedMessage.reasoning_details = message.reasoning_details;
    }

    totalBytes += Buffer.byteLength(JSON.stringify(validatedMessage), "utf8");
    messages.push(validatedMessage);
  }

  if (messages[messages.length - 1].role !== "user" || totalBytes > MAX_HISTORY_BYTES) {
    return null;
  }
  return messages;
}

function checkRateLimit(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const clientIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "";
  const key = clientIp || request.socket?.remoteAddress || "unknown-client";
  const now = Date.now();
  const entry = recentRequests.get(key);

  if (entry && now - entry.startedAt < RATE_LIMIT_WINDOW_MS) {
    if (entry.count >= RATE_LIMIT_REQUESTS) return false;
    entry.count += 1;
    return true;
  }

  recentRequests.set(key, { startedAt: now, count: 1 });
  if (recentRequests.size > 5000) {
    for (const [client, clientEntry] of recentRequests) {
      if (now - clientEntry.startedAt >= RATE_LIMIT_WINDOW_MS) recentRequests.delete(client);
    }
    while (recentRequests.size > 5000) recentRequests.delete(recentRequests.keys().next().value);
  }
  return true;
}

module.exports = async function askSaathi(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendError(response, 405, "Use POST to ask Ask Saathi a question.");
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not configured in the Vercel environment.");
    return sendError(response, 503, "Ask Saathi is not configured yet. Add OPENROUTER_API_KEY in Vercel Project Settings.");
  }

  if (!checkRateLimit(request)) {
    return sendError(response, 429, "Too many questions in a short time. Please wait a minute and try again.");
  }

  const messages = validateMessages(request.body?.messages);
  if (!messages) {
    return sendError(response, 400, "The chat history is invalid. Keep questions under 1,500 characters and try again.");
  }

  let upstream;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "CyberSaathi Cyber Safety Assistant",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        reasoning: { enabled: true },
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });
  } catch (error) {
    console.error("OpenRouter request could not be completed.", error);
    return sendError(response, 503, "The AI service is temporarily unreachable. Please try again shortly.");
  }

  if (!upstream.ok) {
    let errorCode = "";
    try {
      const errorPayload = await upstream.json();
      errorCode = String(errorPayload?.error?.code || errorPayload?.error?.type || "").toLowerCase();
    } catch (error) {
      console.warn("OpenRouter error response was not JSON.", upstream.status);
    }
    console.error("OpenRouter returned an unsuccessful status.", {
      status: upstream.status,
      code: errorCode,
    });

    if (upstream.status === 401 || upstream.status === 403) {
      return sendError(response, 502, "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in Vercel Project Settings.");
    }
    if (upstream.status === 402) {
      return sendError(response, 502, "The OpenRouter account has no available credits. Check its account limits.");
    }
    if (upstream.status === 429) {
      return sendError(response, 429, "OpenRouter is rate-limiting requests. Wait a little and try again.");
    }
    if (upstream.status === 400 || upstream.status === 404) {
      return sendError(response, 502, `OpenRouter could not use ${MODEL}${errorCode ? ` (${errorCode})` : ""}. Check model availability in OpenRouter.`);
    }
    return sendError(response, 503, "OpenRouter is temporarily unable to answer. Please try again shortly.");
  }

  let payload;
  try {
    payload = await upstream.json();
  } catch (error) {
    console.error("OpenRouter returned invalid JSON.", error);
    return sendError(response, 503, "The AI service returned an unreadable response. Please try again.");
  }

  const assistantMessage = payload?.choices?.[0]?.message;
  if (typeof assistantMessage?.content !== "string" || !assistantMessage.content.trim()) {
    console.error("OpenRouter response did not include assistant text.");
    return sendError(response, 503, "The AI service returned an empty response. Please try again.");
  }

  const message = { role: "assistant", content: assistantMessage.content.trim() };
  if (assistantMessage.reasoning_details !== undefined) {
    message.reasoning_details = assistantMessage.reasoning_details;
  }
  return response.status(200).json({ message });
};
