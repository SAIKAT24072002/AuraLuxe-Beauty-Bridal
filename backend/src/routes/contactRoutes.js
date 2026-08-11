import { Router } from "express";
import {
  deleteContactMessage,
  listContactMessages,
  updateContactMessageStatus,
} from "../controllers/contactController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { messageStatusSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/", listContactMessages);
router.patch("/:id/status", validateRequest(messageStatusSchema), updateContactMessageStatus);
router.delete("/:id", deleteContactMessage);

export default router;
