const db = require("../config/db");

const createAdminAuditLog = async ({
  actorUserId,
  actionType,
  targetType,
  targetId = null,
  metadata = null,
}) => {
  try {
    await db.query(
      `INSERT INTO admin_audit_logs (actor_user_id, action_type, target_type, target_id, metadata_json)
       VALUES (?, ?, ?, ?, ?)`,
      [actorUserId || null, actionType, targetType, targetId, metadata ? JSON.stringify(metadata) : null]
    );
  } catch {
    // Do not fail core business action if audit logging table is not migrated yet.
  }
};

module.exports = { createAdminAuditLog };
