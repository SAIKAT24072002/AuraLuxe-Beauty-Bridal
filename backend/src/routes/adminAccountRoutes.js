import { Router } from "express";
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAuditLogs,
  listAdmins,
  resetAdminPassword,
  updateAdminAccount,
} from "../controllers/adminManagementController.js";
import { requireSuperAdmin } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  adminCreateSchema,
  adminResetPasswordSchema,
  adminUpdateSchema,
} from "../validators/authValidators.js";

const router = Router();

router.use(requireSuperAdmin);
router.get("/", listAdmins);
router.get("/audit-logs", listAdminAuditLogs);
router.post("/", validateRequest(adminCreateSchema), createAdminAccount);
router.put("/:id", validateRequest(adminUpdateSchema), updateAdminAccount);
router.post("/:id/reset-password", validateRequest(adminResetPasswordSchema), resetAdminPassword);
router.delete("/:id", deleteAdminAccount);

export default router;
