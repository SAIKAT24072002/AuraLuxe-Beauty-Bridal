import AdminAuditLog from "../models/AdminAuditLog.js";

function sanitizeMetadata(metadata = {}) {
  const blockedKeys = new Set([
    "password",
    "newPassword",
    "currentPassword",
    "confirmPassword",
    "token",
    "hash",
  ]);

  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      if (blockedKeys.has(key)) return false;
      return value !== undefined;
    })
  );
}

export async function createAdminAuditLog({
  actorAdminId,
  targetAdminId = null,
  action,
  description,
  metadata = {},
}) {
  if (!actorAdminId || !action || !description) {
    return null;
  }

  return AdminAuditLog.create({
    actorAdmin: actorAdminId,
    targetAdmin: targetAdminId,
    action,
    description,
    metadata: sanitizeMetadata(metadata),
  });
}
