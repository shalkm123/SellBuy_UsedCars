const fetch = require("node-fetch");

const chatbot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  const systemContext = `
You are CarBot, a helpful assistant for SellBuy Used Cars — an online used car marketplace in India.
You help users with:
- Finding the right used car based on their budget, fuel type, brand preference
- Explaining car specifications (engine, mileage, torque, transmission types)
- EMI calculations and loan advice
- Tips for buying or selling used cars
- Understanding car conditions, km driven, and what to check before buying
- Payment and ownership transfer process in India

Keep responses concise, friendly, and relevant to used cars in India.
Use Indian currency (₹) and Indian context (RTO, RC book, insurance, etc.).
If a question is unrelated to cars or the platform, politely redirect the conversation back to cars.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemContext }],
          },
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).json({ message: "AI service error", error: data });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(500).json({ message: "No response from AI" });
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { chatbot };