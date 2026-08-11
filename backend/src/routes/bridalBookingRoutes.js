import { Router } from "express";
import {
  getBridalBookingById,
  listBridalBookings,
  updateBridalBookingStatus,
} from "../controllers/bridalBookingController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { bridalBookingStatusSchema } from "../validators/bookingValidators.js";

const router = Router();

router.get("/", listBridalBookings);
router.get("/:id", getBridalBookingById);
router.patch("/:id/status", validateRequest(bridalBookingStatusSchema), updateBridalBookingStatus);

export default router;

