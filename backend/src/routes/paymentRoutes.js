import { Router } from "express";
import {
  listPayments,
  markRemainingPaymentReceived,
  updatePayment,
} from "../controllers/paymentController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  manualRemainingPaymentSchema,
  paymentUpdateSchema,
} from "../validators/paymentValidators.js";

const router = Router();

router.get("/", listPayments);
router.post(
  "/manual-receive",
  validateRequest(manualRemainingPaymentSchema),
  markRemainingPaymentReceived
);
router.patch("/:id", validateRequest(paymentUpdateSchema), updatePayment);

export default router;
