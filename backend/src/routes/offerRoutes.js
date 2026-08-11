import { Router } from "express";
import {
  createOffer,
  deleteOffer,
  getOfferById,
  listOffers,
  updateOffer,
} from "../controllers/offerController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { offerSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/", listOffers);
router.get("/:id", getOfferById);
router.post("/", validateRequest(offerSchema), createOffer);
router.put("/:id", validateRequest(offerSchema), updateOffer);
router.delete("/:id", deleteOffer);

export default router;

