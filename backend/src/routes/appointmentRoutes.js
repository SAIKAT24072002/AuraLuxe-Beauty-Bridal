import { Router } from "express";
import {
  getAppointmentById,
  listAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { appointmentStatusSchema } from "../validators/bookingValidators.js";

const router = Router();

router.get("/", listAppointments);
router.get("/:id", getAppointmentById);
router.patch("/:id/status", validateRequest(appointmentStatusSchema), updateAppointmentStatus);

export default router;

