const db = require("../config/db");
const { computeAndPersistTrustScore } = require("../services/trustScoreService");

const MAX_ATTEMPTS = 4;
let workerTimer = null;
let isRunning = false;

const claimJob = async () => {
  const [rows] = await db.query(
    `SELECT id, car_id
     FROM trust_score_jobs
     WHERE status = 'PENDING' AND attempts < ?
     ORDER BY created_at ASC
     LIMIT 1`,
    [MAX_ATTEMPTS]
  );

  if (rows.length === 0) return null;

  const job = rows[0];
  const [result] = await db.query(
    "UPDATE trust_score_jobs SET status = 'PROCESSING', attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'PENDING'",
    [job.id]
  );

  if (result.affectedRows === 0) return null;
  return job;
};

const processNextJob = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const job = await claimJob();
    if (!job) return;

    try {
      await computeAndPersistTrustScore(job.car_id);
      await db.query(
        "UPDATE trust_score_jobs SET status = 'COMPLETED', error_message = NULL, processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [job.id]
      );
    } catch (error) {
      await db.query(
        "UPDATE trust_score_jobs SET status = IF(attempts >= ?, 'FAILED', 'PENDING'), error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [MAX_ATTEMPTS, String(error.message || "Unknown trust-score error").slice(0, 1000), job.id]
      );
    }
  } finally {
    isRunning = false;
  }
};

const trustQueueReady = async () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("Trust score worker disabled: GEMINI_API_KEY is not configured");
    return false;
  }

  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'trust_score_jobs'");
    if (!rows || rows.length === 0) {
      console.warn("Trust score worker disabled: trust_score_jobs table is missing. Run the latest schema.sql.");
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`Trust score worker disabled: ${error.message}`);
    return false;
  }
};

const startTrustScoreWorker = () => {
  const intervalMs = Number(process.env.TRUST_SCORE_WORKER_INTERVAL_MS || 15000);
  if (workerTimer) return;

  trustQueueReady()
    .then((ready) => {
      if (!ready) return;

      workerTimer = setInterval(() => {
        processNextJob().catch((error) => {
          console.error("Trust score worker loop error:", error.message);
        });
      }, intervalMs);

      processNextJob().catch((error) => {
        console.error("Trust score worker startup error:", error.message);
      });
    })
    .catch((error) => {
      console.warn(`Trust score worker disabled: ${error.message}`);
    });
};

module.exports = { startTrustScoreWorker };
