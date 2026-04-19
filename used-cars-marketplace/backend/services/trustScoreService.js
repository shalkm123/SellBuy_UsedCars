const db = require("../config/db");
const { callGemini } = require("./gemini");

const parseJsonFromText = (text) => {
  const trimmed = String(text || "").trim();
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

const toBand = (score) => {
  if (score < 40) return "LOW";
  if (score < 70) return "MEDIUM";
  return "HIGH";
};

const sanitizeFactors = (factors = []) => {
  return factors
    .slice(0, 8)
    .map((factor, index) => ({
      factor_key: String(factor.factor_key || `factor_${index + 1}`).slice(0, 100),
      factor_label: String(factor.factor_label || "Unnamed factor").slice(0, 120),
      factor_value: factor.factor_value == null ? null : String(factor.factor_value).slice(0, 255),
      impact_score: Number.isFinite(Number(factor.impact_score)) ? Math.round(Number(factor.impact_score)) : 0,
      explanation: factor.explanation == null ? null : String(factor.explanation).slice(0, 500),
    }));
};

const buildPrompt = ({ car, sellerVerificationStatus, imageCount }) => {
  return [
    "You are scoring trust for used car listings in India.",
    "Return STRICT JSON only.",
    "Schema:",
    '{"score": number 0-100, "factors": [{"factor_key": string, "factor_label": string, "factor_value": string, "impact_score": integer -20..20, "explanation": string}], "summary": string}',
    "Use the listing details below:",
    JSON.stringify(
      {
        title: car.title,
        brand: car.brand,
        model_name: car.model_name,
        manufacturing_year: car.manufacturing_year,
        price: Number(car.price),
        kilometers_driven: car.kilometers_driven,
        ownership: car.ownership,
        status: car.status,
        seller_verification_status: sellerVerificationStatus,
        image_count: imageCount,
      },
      null,
      2
    ),
    "Use balanced scoring. Higher score for complete metadata, verified seller, reasonable price, lower kms for age, and multiple images.",
    "Provide 4 to 6 factors.",
  ].join("\n");
};

const computeAndPersistTrustScore = async (carId) => {
  const [carRows] = await db.query(
    `SELECT c.*, COALESCE(sv.verification_status, 'PENDING') AS seller_verification_status,
      (SELECT COUNT(*) FROM car_images ci WHERE ci.car_id = c.id) AS image_count
     FROM cars c
     LEFT JOIN seller_verification sv ON sv.user_id = c.seller_id
     WHERE c.id = ? AND c.deleted_at IS NULL`,
    [carId]
  );

  if (carRows.length === 0) {
    throw new Error("Car not found for trust-score processing");
  }

  const car = carRows[0];
  const prompt = buildPrompt({
    car,
    sellerVerificationStatus: car.seller_verification_status,
    imageCount: Number(car.image_count || 0),
  });

  const responseText = await callGemini({
    systemInstruction: "You are a trust scoring engine for used car listings. Only output valid JSON.",
    prompt,
    temperature: 0.1,
    maxOutputTokens: 700,
  });

  const parsed = parseJsonFromText(responseText);
  const score = Math.min(100, Math.max(0, Math.round(Number(parsed.score || 0))));
  const trustBand = toBand(score);
  const factors = sanitizeFactors(Array.isArray(parsed.factors) ? parsed.factors : []);

  await db.query(
    "UPDATE cars SET trust_score = ?, trust_band = ?, trust_updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [score, trustBand, carId]
  );

  await db.query("DELETE FROM car_trust_factors WHERE car_id = ?", [carId]);

  if (factors.length > 0) {
    const values = factors.map((factor) => [
      carId,
      factor.factor_key,
      factor.factor_label,
      factor.factor_value,
      factor.impact_score,
      factor.explanation,
    ]);
    await db.query(
      "INSERT INTO car_trust_factors (car_id, factor_key, factor_label, factor_value, impact_score, explanation) VALUES ?",
      [values]
    );
  }

  return { score, trustBand, factorsCount: factors.length };
};

module.exports = { computeAndPersistTrustScore };
