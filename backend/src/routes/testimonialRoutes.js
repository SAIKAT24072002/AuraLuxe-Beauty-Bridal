import { Router } from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonialById,
  listTestimonials,
  updateTestimonial,
} from "../controllers/testimonialController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { testimonialSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/", listTestimonials);
router.get("/:id", getTestimonialById);
router.post("/", validateRequest(testimonialSchema), createTestimonial);
router.put("/:id", validateRequest(testimonialSchema), updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;

