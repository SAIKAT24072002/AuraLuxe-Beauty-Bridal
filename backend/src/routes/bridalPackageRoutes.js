import { Router } from "express";
import {
  createBridalPackage,
  deleteBridalPackage,
  getBridalPackageById,
  listBridalPackages,
  updateBridalPackage,
} from "../controllers/bridalPackageController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { bridalPackageSchema } from "../validators/catalogValidators.js";

const router = Router();

router.get("/", listBridalPackages);
router.get("/:id", getBridalPackageById);
router.post("/", validateRequest(bridalPackageSchema), createBridalPackage);
router.put("/:id", validateRequest(bridalPackageSchema), updateBridalPackage);
router.delete("/:id", deleteBridalPackage);

export default router;

