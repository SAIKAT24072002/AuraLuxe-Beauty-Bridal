import { Router } from "express";
import {
  getSiteSettings,
  upsertSiteSettings,
} from "../controllers/siteSettingsController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { siteSettingsSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/", getSiteSettings);
router.put("/", validateRequest(siteSettingsSchema), upsertSiteSettings);

export default router;

