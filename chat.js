// netlify/functions/chat.js
// Secure proxy to the Anthropic API.
// The API key lives ONLY in Netlify's environment variables — never in this repo.

const MODEL = "claude-sonnet-4-5";  // if you ever get a model error, change to "claude-sonnet-4-6"
const MAX_TOKENS = 1500;

exports.handler = async (event) => {
  // 1) Only accept POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // 2) Light origin guard — only serve requests coming from our own site.
  //    Netlify sets process.env.URL to the live site address.
  const site = process.env.URL || "";
  const origin = event.headers.origin || event.headers.referer || "";
  if (site && origin && !origin.startsWith(site)) {
    return { statusCode: 403, body: "Forbidden" };
  }

  // 3) Parse + validate input
  let system, messages;
  try {
    ({ system, messages } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }
  if (typeof system !== "string" || !Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return { statusCode: 400, body: "Invalid request" };
  }
  // Keep the last 20 turns; cap each message length to keep costs predictable
  const safeMessages = messages.slice(-20).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 6000),
  }));

  // 4) Call Anthropic with the key from the environment
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: system.slice(0, 12000),
        messages: safeMessages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Log details server-side only; never leak provider errors to the client
      console.error("Anthropic API error:", res.status);
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: [{ type: "text", text: "The assistant is unavailable right now. Please try again in a moment." }] }),
      };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: [{ type: "text", text: "Something went wrong reaching the assistant. Please try again." }] }),
    };
  }
};
