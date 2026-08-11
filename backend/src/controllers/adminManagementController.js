import Admin from "../models/Admin.js";
import AdminAuditLog from "../models/AdminAuditLog.js";
import { createAdminAuditLog } from "../services/adminAuditService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function sanitizeAdmin(admin) {
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    phone: admin.phone || "",
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt || null,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

async function countActiveSuperAdmins() {
  return Admin.countDocuments({ role: "SUPER_ADMIN", isActive: true });
}

async function ensureSuperAdminSafety(targetAdmin, nextState = {}) {
  const nextRole = nextState.role ?? targetAdmin.role;
  const nextIsActive = nextState.isActive ?? targetAdmin.isActive;
  const remainsActiveSuperAdmin = nextRole === "SUPER_ADMIN" && nextIsActive;

  if (remainsActiveSuperAdmin) {
    return;
  }

  if (targetAdmin.role !== "SUPER_ADMIN" || !targetAdmin.isActive) {
    return;
  }

  const activeSuperAdmins = await countActiveSuperAdmins();
  if (activeSuperAdmins <= 1) {
    throw new ApiError(400, "At least one active super admin account must remain.");
  }
}

export const listAdmins = asyncHandler(async (_req, res) => {
  const admins = await Admin.find().sort({ createdAt: 1 });
  res.json({ success: true, data: admins.map(sanitizeAdmin) });
});

export const createAdminAccount = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const existing = await Admin.findOne({ email: payload.email });
  if (existing) {
    throw new ApiError(409, "An admin account already exists with this email.");
  }

  const admin = await Admin.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: payload.role || "ADMIN",
    isActive: payload.isActive ?? true,
  });

  await createAdminAuditLog({
    actorAdminId: req.admin._id,
    targetAdminId: admin._id,
    action: "ADMIN_CREATED",
    description: `${req.admin.email} created admin ${admin.email}.`,
    metadata: {
      role: admin.role,
      isActive: admin.isActive,
    },
  });

  res.status(201).json({ success: true, data: sanitizeAdmin(admin) });
});

export const updateAdminAccount = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const targetAdmin = await Admin.findById(req.params.id);
  if (!targetAdmin) {
    throw new ApiError(404, "Admin account not found.");
  }

  if (String(targetAdmin._id) === String(req.admin._id) && payload.isActive === false) {
    throw new ApiError(400, "You cannot deactivate your own account.");
  }

  if (payload.email && payload.email !== targetAdmin.email) {
    const duplicate = await Admin.findOne({ email: payload.email, _id: { $ne: targetAdmin._id } });
    if (duplicate) {
      throw new ApiError(409, "Another admin account already uses this email.");
    }
  }

  await ensureSuperAdminSafety(targetAdmin, payload);

  if (
    String(targetAdmin._id) === String(req.admin._id) &&
    payload.role &&
    payload.role !== targetAdmin.role
  ) {
    throw new ApiError(400, "You cannot change your own role from this screen.");
  }

  Object.assign(targetAdmin, payload);
  await targetAdmin.save();

  await createAdminAuditLog({
    actorAdminId: req.admin._id,
    targetAdminId: targetAdmin._id,
    action: "ADMIN_UPDATED",
    description: `${req.admin.email} updated admin ${targetAdmin.email}.`,
    metadata: {
      role: targetAdmin.role,
      isActive: targetAdmin.isActive,
    },
  });

  res.json({ success: true, data: sanitizeAdmin(targetAdmin) });
});

export const resetAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.validated.body;
  const targetAdmin = await Admin.findById(req.params.id).select("+password");
  if (!targetAdmin) {
    throw new ApiError(404, "Admin account not found.");
  }

  targetAdmin.password = newPassword;
  await targetAdmin.save();

  await createAdminAuditLog({
    actorAdminId: req.admin._id,
    targetAdminId: targetAdmin._id,
    action: "ADMIN_PASSWORD_RESET",
    description: `${req.admin.email} reset the password for ${targetAdmin.email}.`,
    metadata: {
      role: targetAdmin.role,
    },
  });

  res.json({
    success: true,
    message: "Admin password reset successfully.",
    data: sanitizeAdmin(targetAdmin),
  });
});

export const deleteAdminAccount = asyncHandler(async (req, res) => {
  const targetAdmin = await Admin.findById(req.params.id);
  if (!targetAdmin) {
    throw new ApiError(404, "Admin account not found.");
  }

  if (String(targetAdmin._id) === String(req.admin._id)) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  await ensureSuperAdminSafety(targetAdmin, {
    role: targetAdmin.role,
    isActive: false,
  });

  await Admin.findByIdAndDelete(targetAdmin._id);

  await createAdminAuditLog({
    actorAdminId: req.admin._id,
    targetAdminId: targetAdmin._id,
    action: "ADMIN_DELETED",
    description: `${req.admin.email} deleted admin ${targetAdmin.email}.`,
    metadata: {
      role: targetAdmin.role,
      wasActive: targetAdmin.isActive,
    },
  });

  res.json({ success: true, message: "Admin account deleted successfully." });
});

export const listAdminAuditLogs = asyncHandler(async (_req, res) => {
  const logs = await AdminAuditLog.find()
    .populate("actorAdmin", "name email role")
    .populate("targetAdmin", "name email role")
    .sort({ createdAt: -1 })
    .limit(100);

  const items = logs.map((item) => ({
    id: String(item._id),
    action: item.action,
    description: item.description,
    metadata: item.metadata || {},
    createdAt: item.createdAt,
    actorAdmin: item.actorAdmin
      ? {
          id: String(item.actorAdmin._id),
          name: item.actorAdmin.name,
          email: item.actorAdmin.email,
          role: item.actorAdmin.role,
        }
      : null,
    targetAdmin: item.targetAdmin
      ? {
          id: String(item.targetAdmin._id),
          name: item.targetAdmin.name,
          email: item.targetAdmin.email,
          role: item.targetAdmin.role,
        }
      : null,
  }));

  res.json({ success: true, data: items });
});
