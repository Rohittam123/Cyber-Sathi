export async function askCyberSaathi(messages) {
  const response = await fetch("/api/ask-sathi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("Ask Saathi returned an unreadable response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Ask Saathi could not respond (${response.status}). Please try again.`);
  }
  return payload.message;
}
