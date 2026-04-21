const fetch = require("node-fetch");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const callGemini = async ({ systemInstruction, prompt, temperature = 0.2, maxOutputTokens = 800 }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const promptPreview = String(prompt || "").replace(/\s+/g, " ").slice(0, 220);
  console.info("[Gemini] Sending request", {
    model: GEMINI_MODEL,
    temperature,
    maxOutputTokens,
    promptChars: String(prompt || "").length,
    promptPreview,
    hasSystemInstruction: Boolean(systemInstruction),
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    console.error("[Gemini] API error response", {
      status: response.status,
      statusText: response.statusText,
      payload,
    });
    throw new Error(`Gemini API error: ${JSON.stringify(payload)}`);
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("[Gemini] Empty response payload", payload);
    throw new Error("Gemini returned an empty response");
  }

  console.info("[Gemini] Received response", {
    responseChars: text.length,
    responsePreview: text.replace(/\s+/g, " ").slice(0, 220),
  });

  return text;
};

module.exports = { callGemini };
