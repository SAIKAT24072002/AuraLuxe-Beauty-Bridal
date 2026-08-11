import { Router } from "express";
import {
  getAdminProfile,
  loginAdmin,
  logoutAdmin,
  setupInitialAdmin,
} from "../controllers/authController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  adminLoginSchema,
  adminSetupSchema,
} from "../validators/authValidators.js";

const router = Router();

router.post("/setup", validateRequest(adminSetupSchema), setupInitialAdmin);
router.post("/login", validateRequest(adminLoginSchema), loginAdmin);
router.post("/logout", protectAdmin, logoutAdmin);
router.get("/me", protectAdmin, getAdminProfile);

export default router;
