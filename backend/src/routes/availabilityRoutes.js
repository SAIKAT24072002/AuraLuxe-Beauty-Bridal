import { Router } from "express";
import {
  createAvailability,
  deleteAvailability,
  getAvailabilityById,
  listAvailability,
  updateAvailability,
} from "../controllers/availabilityController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { availabilitySchema } from "../validators/availabilityValidators.js";

const router = Router();

router.get("/", listAvailability);
router.get("/:id", getAvailabilityById);
router.post("/", validateRequest(availabilitySchema), createAvailability);
router.put("/:id", validateRequest(availabilitySchema), updateAvailability);
router.delete("/:id", deleteAvailability);

export default router;

