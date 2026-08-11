import { Router } from "express";
import {
  createGallery,
  deleteGallery,
  getGalleryById,
  listGallery,
  updateGallery,
} from "../controllers/galleryController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { gallerySchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/", listGallery);
router.get("/:id", getGalleryById);
router.post("/", validateRequest(gallerySchema), createGallery);
router.put("/:id", validateRequest(gallerySchema), updateGallery);
router.delete("/:id", deleteGallery);

export default router;

