const fetch = require("node-fetch");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const callGemini = async ({ systemInstruction, prompt, temperature = 0.2, maxOutputTokens = 800 }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini API error: ${JSON.stringify(payload)}`);
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
};

module.exports = { callGemini };
