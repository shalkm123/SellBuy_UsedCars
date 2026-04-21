const db = require("../config/db");
const { callGemini } = require("../services/gemini");

const CITY_LIST = ["DELHI", "MUMBAI", "BANGALORE", "BENGALURU", "CHENNAI", "HYDERABAD", "PUNE", "KOLKATA", "AHMEDABAD", "GURGAON", "GURUGRAM", "NOIDA", "JAIPUR", "CHANDIGARH"];
const FUEL_LIST = ["PETROL", "DIESEL", "CNG", "EV", "HYBRID"];
const TRANSMISSION_LIST = ["MANUAL", "AUTOMATIC", "CVT"];
const BODY_TYPE_HINTS = ["SEDAN", "SUV", "HATCHBACK", "MUV", "MPV", "LUXURY", "COMPACT", "CROSSOVER"];
const MAX_RECOMMENDATIONS = 5;
let chatPersistenceReadyCache = null;

const parseJsonFromText = (text) => {
  const trimmed = String(text || "").trim().replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Failed to parse Gemini JSON response");
  }
};

const normalizeText = (value) => String(value || "").trim().toUpperCase();

const parseMoneyToRupees = (input) => {
  const text = String(input || "").toLowerCase();
  const match = text.match(/(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand|rs|inr)?/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = String(match[2] || "").toLowerCase();
  if (!Number.isFinite(amount)) return null;
  if (unit === "cr" || unit === "crore") return Math.round(amount * 10000000);
  if (unit === "k" || unit === "thousand") return Math.round(amount * 1000);
  if (unit === "l" || unit === "lakh" || unit === "lakhs") return Math.round(amount * 100000);
  return Math.round(amount);
};

const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));

const cleanJsonObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
};

const chatPersistenceReady = async () => {
  if (chatPersistenceReadyCache !== null) return chatPersistenceReadyCache;
  try {
    const [sessions] = await db.query("SHOW TABLES LIKE 'chat_sessions'");
    const [messages] = await db.query("SHOW TABLES LIKE 'chat_messages'");
    chatPersistenceReadyCache = Boolean(sessions.length > 0 && messages.length > 0);
  } catch {
    chatPersistenceReadyCache = false;
  }
  return chatPersistenceReadyCache;
};

const getChatSession = async (sessionId, userId) => {
  if (!sessionId) return null;
  if (!(await chatPersistenceReady())) return null;
  const [rows] = await db.query("SELECT id, user_id, title, created_at, updated_at, last_message_at FROM chat_sessions WHERE id = ? AND user_id = ? LIMIT 1", [sessionId, userId]);
  return rows[0] || null;
};

const createChatSession = async (userId, title = "CarBot Session") => {
  if (!(await chatPersistenceReady())) return null;
  const [result] = await db.query("INSERT INTO chat_sessions (user_id, title, last_message_at) VALUES (?, ?, CURRENT_TIMESTAMP)", [userId, String(title || "CarBot Session").slice(0, 160)]);
  const [rows] = await db.query("SELECT id, user_id, title, created_at, updated_at, last_message_at FROM chat_sessions WHERE id = ? LIMIT 1", [result.insertId]);
  return rows[0];
};

const updateChatSession = async (sessionId, fields = {}) => {
  if (!(await chatPersistenceReady())) return;
  const updates = [];
  const params = [];
  if (fields.title) {
    updates.push("title = ?");
    params.push(String(fields.title).slice(0, 160));
  }
  if (fields.last_message_at) {
    updates.push("last_message_at = ?");
    params.push(fields.last_message_at);
  }
  if (updates.length === 0) return;
  params.push(sessionId);
  await db.query(`UPDATE chat_sessions SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
};

const saveChatMessage = async (sessionId, role, content, metadata = {}) => {
  if (!(await chatPersistenceReady())) return;
  await db.query(
    `INSERT INTO chat_messages (session_id, role, content, parsed_filters_json, recommendations_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      sessionId,
      String(role || "USER").toUpperCase(),
      String(content || "").trim(),
      metadata.parsed_filters ? JSON.stringify(metadata.parsed_filters) : null,
      metadata.recommendations ? JSON.stringify(metadata.recommendations) : null,
    ]
  );
};

const logChatbot = (message, details = {}) => {
  console.info(`[Chatbot] ${message}`, details);
};

const buildIntentPrompt = (message, history = []) => `
You are an intent parser for a used car marketplace chatbot.
Return STRICT JSON only with this schema:
{
  "summary": string,
  "follow_up_question": string | null,
  "missing_fields": string[],
  "filters": {
    "search": string | null,
    "brand": string | null,
    "model_name": string | null,
    "city": string | null,
    "fuel_type": string | null,
    "transmission": string | null,
    "body_type": string | null,
    "budget_min": number | null,
    "budget_max": number | null,
    "year_min": number | null,
    "year_max": number | null
  }
}

Guidelines:
- Budget should be converted to rupees.
- If user asks for "under" budget, set budget_max.
- If user asks for "above" or "at least", set budget_min.
- Prefer concise follow-up questions when budget or city is missing for search requests.
- body_type can be sedan, suv, hatchback, mpv, muv, luxury, crossover, compact.
- Use city names common in India.
- Keep missing_fields focused on the most important missing filters.

Conversation history:
${JSON.stringify(history.slice(-6), null, 2)}

User message:
${message}
`;

const fallbackIntent = (message) => {
  const upper = normalizeText(message);
  const lower = String(message || "").toLowerCase();
  const budgetMax = (() => {
    const match = lower.match(/under\s+₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand)?/i)
      || lower.match(/below\s+₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand)?/i)
      || lower.match(/budget\s+₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand)?/i);
    return match ? parseMoneyToRupees(`${match[1]} ${match[2] || ""}`) : null;
  })();
  const budgetMin = (() => {
    const match = lower.match(/above\s+₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand)?/i)
      || lower.match(/at least\s+₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand)?/i)
      || lower.match(/over\s+₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakhs?|l|k|thousand)?/i);
    return match ? parseMoneyToRupees(`${match[1]} ${match[2] || ""}`) : null;
  })();

  const city = CITY_LIST.find((item) => upper.includes(item));
  const fuel_type = FUEL_LIST.find((item) => upper.includes(item));
  const transmission = TRANSMISSION_LIST.find((item) => upper.includes(item));
  const body_type = BODY_TYPE_HINTS.find((item) => upper.includes(item));

  return {
    summary: message,
    follow_up_question: !budgetMax && !budgetMin && !city ? "What budget and city should I search in?" : null,
    missing_fields: [!budgetMax && !budgetMin ? "budget" : null, !city ? "city" : null].filter(Boolean),
    filters: {
      search: message,
      brand: null,
      model_name: null,
      city: city === "BENGALURU" ? "Bangalore" : city,
      fuel_type: fuel_type || null,
      transmission: transmission || null,
      body_type: body_type || null,
      budget_min: budgetMin,
      budget_max: budgetMax,
      year_min: null,
      year_max: null,
    },
  };
};

const extractIntent = async (message, history = []) => {
  try {
    logChatbot("Extracting intent with Gemini", {
      messagePreview: String(message || "").slice(0, 180),
      historyLength: Array.isArray(history) ? history.length : 0,
    });
    const response = await callGemini({
      systemInstruction: "You are a JSON-only intent parser for a used car marketplace assistant.",
      prompt: buildIntentPrompt(message, history),
      temperature: 0.1,
      maxOutputTokens: 500,
    });
    const parsed = parseJsonFromText(response);
    logChatbot("Intent extracted", {
      summary: String(parsed.summary || message).slice(0, 180),
      followUpQuestion: parsed.follow_up_question ? String(parsed.follow_up_question).slice(0, 180) : null,
      missingFields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
      filters: parsed.filters || {},
    });
    return {
      summary: String(parsed.summary || message).slice(0, 280),
      follow_up_question: parsed.follow_up_question ? String(parsed.follow_up_question).slice(0, 240) : null,
      missing_fields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields.map((item) => String(item)).slice(0, 6) : [],
      filters: {
        search: parsed.filters?.search ? String(parsed.filters.search).slice(0, 120) : message,
        brand: parsed.filters?.brand ? String(parsed.filters.brand).slice(0, 80) : null,
        model_name: parsed.filters?.model_name ? String(parsed.filters.model_name).slice(0, 80) : null,
        city: parsed.filters?.city ? String(parsed.filters.city).slice(0, 80) : null,
        fuel_type: parsed.filters?.fuel_type ? normalizeText(parsed.filters.fuel_type) : null,
        transmission: parsed.filters?.transmission ? normalizeText(parsed.filters.transmission) : null,
        body_type: parsed.filters?.body_type ? normalizeText(parsed.filters.body_type) : null,
        budget_min: Number.isFinite(Number(parsed.filters?.budget_min)) ? Number(parsed.filters.budget_min) : null,
        budget_max: Number.isFinite(Number(parsed.filters?.budget_max)) ? Number(parsed.filters.budget_max) : null,
        year_min: Number.isFinite(Number(parsed.filters?.year_min)) ? Number(parsed.filters.year_min) : null,
        year_max: Number.isFinite(Number(parsed.filters?.year_max)) ? Number(parsed.filters.year_max) : null,
      },
    };
  } catch (error) {
    logChatbot("Gemini intent extraction failed; using fallback parser", {
      messagePreview: String(message || "").slice(0, 180),
      error: error.message,
    });
    return { ...fallbackIntent(message), source: "fallback" };
  }
};

const getBodySearchTerm = (bodyType) => {
  const normalized = normalizeText(bodyType);
  if (!normalized) return null;
  if (normalized === "SUV") return "SUV";
  if (normalized === "SEDAN") return "sedan";
  if (normalized === "HATCHBACK") return "hatchback";
  if (normalized === "MPV" || normalized === "MUV") return "mpv";
  if (normalized === "LUXURY") return "luxury";
  if (normalized === "CROSSOVER") return "crossover";
  if (normalized === "COMPACT") return "compact";
  return normalized.toLowerCase();
};

const searchCars = async (filters = {}) => {
  const conditions = ["c.deleted_at IS NULL", "c.status = 'ACTIVE'"];
  const params = [];

  if (filters.brand) {
    conditions.push("c.brand = ?");
    params.push(filters.brand);
  }
  if (filters.model_name) {
    conditions.push("c.model_name = ?");
    params.push(filters.model_name);
  }
  if (filters.city) {
    conditions.push("c.location_city = ?");
    params.push(filters.city);
  }
  if (filters.fuel_type) {
    conditions.push("c.fuel_type = ?");
    params.push(normalizeText(filters.fuel_type));
  }
  if (filters.transmission) {
    conditions.push("c.transmission = ?");
    params.push(normalizeText(filters.transmission));
  }
  if (filters.budget_min != null) {
    conditions.push("c.price >= ?");
    params.push(Number(filters.budget_min));
  }
  if (filters.budget_max != null) {
    conditions.push("c.price <= ?");
    params.push(Number(filters.budget_max));
  }
  if (filters.year_min != null) {
    conditions.push("c.manufacturing_year >= ?");
    params.push(Number(filters.year_min));
  }
  if (filters.year_max != null) {
    conditions.push("c.manufacturing_year <= ?");
    params.push(Number(filters.year_max));
  }

  const searchTerms = [filters.search, getBodySearchTerm(filters.body_type)].filter(Boolean);
  if (searchTerms.length > 0) {
    const searchParts = searchTerms.map(() => "(c.title LIKE ? OR c.brand LIKE ? OR c.model_name LIKE ? OR c.description LIKE ?)");
    conditions.push(`(${searchParts.join(" OR ")})`);
    searchTerms.forEach((term) => {
      const like = `%${term}%`;
      params.push(like, like, like, like);
    });
  }

  const [rows] = await db.query(
    `SELECT c.id, c.title, c.brand, c.model_name, c.price, c.manufacturing_year, c.kilometers_driven,
      c.fuel_type, c.transmission, c.ownership, c.location_city, c.location_state, c.trust_score, c.trust_band,
      COALESCE(sv.verification_status, 'PENDING') AS seller_verification_status,
      (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url
     FROM cars c
     LEFT JOIN seller_verification sv ON sv.user_id = c.seller_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY c.trust_score DESC, c.created_at DESC
     LIMIT ${MAX_RECOMMENDATIONS}`,
    params
  );

  return rows.map((row) => ({
    ...row,
    city: row.location_city,
    year: row.manufacturing_year,
    km: row.kilometers_driven,
  }));
};

const scoreRecommendation = (car, intent) => {
  let score = 0;
  const reasons = [];
  const price = Number(car.price || 0);

  if (intent.filters.budget_max != null && price <= Number(intent.filters.budget_max)) {
    score += 30;
    reasons.push("fits your budget");
  }
  if (intent.filters.budget_min != null && price >= Number(intent.filters.budget_min)) {
    score += 8;
  }
  if (intent.filters.city && String(car.city || "").toLowerCase() === String(intent.filters.city).toLowerCase()) {
    score += 18;
    reasons.push(`available in ${car.city}`);
  }
  if (intent.filters.brand && String(car.brand || "").toLowerCase() === String(intent.filters.brand).toLowerCase()) {
    score += 16;
    reasons.push(`matches ${car.brand}`);
  }
  if (intent.filters.fuel_type && normalizeText(car.fuel_type) === normalizeText(intent.filters.fuel_type)) {
    score += 8;
  }
  if (intent.filters.transmission && normalizeText(car.transmission) === normalizeText(intent.filters.transmission)) {
    score += 8;
  }
  if (intent.filters.year_min && Number(car.year || 0) >= Number(intent.filters.year_min)) {
    score += 6;
  }
  if (intent.filters.year_max && Number(car.year || 0) <= Number(intent.filters.year_max)) {
    score += 6;
  }
  if (Number(car.trust_score || 0) >= 70) {
    score += 10;
    reasons.push(`trust score ${car.trust_score}/100`);
  }
  if (String(car.seller_verification_status || "").toUpperCase() === "APPROVED") {
    score += 6;
    reasons.push("verified seller");
  }
  if (Number(car.km || 0) > 0) {
    score += Math.max(0, 10 - Math.round(Number(car.km) / 50000));
  }

  return {
    ...car,
    match_score: score,
    match_reason: reasons.length > 0 ? reasons.slice(0, 3).join(", ") : "good overall match",
  };
};

const composeReply = async ({ intent, recommendations }) => {
  const prompt = `
Write a concise assistant reply for a used car marketplace chatbot.
Return STRICT JSON only with this schema:
{
  "reply": string,
  "follow_up_question": string | null,
  "summary": string
}

Context:
- Parsed intent summary: ${intent.summary}
- Missing fields: ${JSON.stringify(intent.missing_fields)}
- Follow up question: ${JSON.stringify(intent.follow_up_question)}
- Recommendations: ${JSON.stringify(recommendations, null, 2)}

Rules:
- If follow-up question exists, ask it clearly and briefly.
- If recommendations exist, mention up to 3 cars and why they fit.
- Use Indian currency and marketplace tone.
- Keep the reply under 120 words.
`;

  try {
    logChatbot("Composing reply with Gemini", {
      recommendationCount: recommendations.length,
      topTitles: recommendations.slice(0, 3).map((car) => car.title),
    });
    const response = await callGemini({
      systemInstruction: "You are a JSON-only response generator for a used car marketplace chatbot.",
      prompt,
      temperature: 0.4,
      maxOutputTokens: 350,
    });
    const parsed = parseJsonFromText(response);
    logChatbot("Gemini reply parsed", {
      replyPreview: String(parsed.reply || "").slice(0, 180),
      summaryPreview: String(parsed.summary || intent.summary || "").slice(0, 180),
    });
    return {
      source: "gemini",
      reply: String(parsed.reply || "").trim(),
      follow_up_question: parsed.follow_up_question ? String(parsed.follow_up_question).trim() : intent.follow_up_question,
      summary: String(parsed.summary || intent.summary || "").trim(),
    };
  } catch (error) {
    logChatbot("Gemini reply generation failed", {
      recommendationCount: recommendations.length,
      error: error.message,
    });
    throw new Error(`Gemini reply generation failed: ${error.message}`);
  }
};

const loadSessionMessages = async (sessionId, userId) => {
  if (!(await chatPersistenceReady())) return null;
  const session = await getChatSession(sessionId, userId);
  if (!session) return null;

  const [rows] = await db.query(
    `SELECT id, role, content, parsed_filters_json, recommendations_json, created_at
     FROM chat_messages
     WHERE session_id = ?
     ORDER BY created_at ASC, id ASC`,
    [session.id]
  );

  return {
    session,
    messages: rows.map((row) => ({
      id: row.id,
      role: String(row.role || "USER").toLowerCase(),
      text: row.content,
      parsed_filters: row.parsed_filters_json || null,
      recommendations: row.recommendations_json || null,
      time: row.created_at,
    })),
  };
};

const handleChatQuery = async (req, res) => {
  const message = String(req.body.message || "").trim();
  const requestedSessionId = req.body.session_id ? Number(req.body.session_id) : null;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    logChatbot("Received chat request", {
      userId: req.user.id,
      requestedSessionId,
      messagePreview: message.slice(0, 200),
    });

    let session = requestedSessionId ? await getChatSession(requestedSessionId, req.user.id) : null;
    if (requestedSessionId && !session) {
      logChatbot("Requested session not found", { userId: req.user.id, requestedSessionId });
      return res.status(404).json({ message: "Chat session not found" });
    }
    if (!session) {
      session = await createChatSession(req.user.id, message.slice(0, 60) || "CarBot Session");
      logChatbot("Created new chat session", { sessionId: session?.id, userId: req.user.id });
    } else {
      logChatbot("Loaded existing chat session", { sessionId: session.id, userId: req.user.id, title: session.title });
    }

    const historyRows = session?.id
      ? (await db.query(
          `SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC, id ASC LIMIT 6`,
          [session.id]
        ))[0]
      : [];

    logChatbot("Loaded chat history", {
      sessionId: session?.id || null,
      historyRows: historyRows.length,
    });

    if (session?.id) {
      await saveChatMessage(session.id, "USER", message);
      await updateChatSession(session.id, { last_message_at: new Date() });
    }

    const intent = await extractIntent(message, historyRows);
    const recommendationsRaw = await searchCars(intent.filters);
    const recommendations = recommendationsRaw.map((car) => scoreRecommendation(car, intent)).sort((a, b) => b.match_score - a.match_score);
    logChatbot("Search completed", {
      sessionId: session?.id || null,
      recommendationCount: recommendations.length,
      recommendationTitles: recommendations.slice(0, 5).map((car) => car.title),
    });
    const replyPayload = await composeReply({ intent, recommendations });

    const responsePayload = {
      session_id: session?.id || null,
      session_title: session?.title || "CarBot Session",
      parsed_filters: intent.filters,
      missing_fields: intent.missing_fields,
      follow_up_question: replyPayload.follow_up_question || null,
      summary: replyPayload.summary,
      recommendations,
      reply: replyPayload.reply,
      generation_source: replyPayload.source,
    };

    if (session?.id) {
      await saveChatMessage(session.id, "BOT", replyPayload.reply, {
        parsed_filters: intent.filters,
        recommendations,
      });
      logChatbot("Saved bot response", {
        sessionId: session.id,
        replyPreview: replyPayload.reply.slice(0, 200),
      });
    }

    if (session?.id && session.title === "CarBot Session") {
      const derivedTitle = intent.summary ? intent.summary.slice(0, 60) : message.slice(0, 60);
      await updateChatSession(session.id, { title: derivedTitle || session.title });
      responsePayload.session_title = derivedTitle || session.title;
    }

    res.json(responsePayload);
  } catch (err) {
    console.error("[Chatbot] Request failed", {
      userId: req.user?.id,
      messagePreview: message.slice(0, 200),
      error: err.message,
      stack: err.stack,
    });
    res.status(502).json({ message: err.message || "Chatbot request failed", error: err.message });
  }
};

const chatbot = async (req, res) => handleChatQuery(req, res);

const getChatSessionById = async (req, res) => {
  try {
    const data = await loadSessionMessages(req.params.id, req.user.id);
    if (!data) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { chatbot, handleChatQuery, getChatSessionById };
