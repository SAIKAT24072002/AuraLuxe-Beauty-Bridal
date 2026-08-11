import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  paymentOrderSchema,
  paymentVerifySchema,
} from "../validators/paymentValidators.js";

const router = Router();

router.post("/create-order", validateRequest(paymentOrderSchema), createPaymentOrder);
router.post("/verify", validateRequest(paymentVerifySchema), verifyPayment);

export default router;
