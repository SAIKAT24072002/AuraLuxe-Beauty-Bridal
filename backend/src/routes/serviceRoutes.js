import { Router } from "express";
import {
  createService,
  deleteService,
  getServiceById,
  listServices,
  updateService,
} from "../controllers/serviceController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { serviceSchema } from "../validators/catalogValidators.js";

const router = Router();

router.get("/", listServices);
router.get("/:id", getServiceById);
router.post("/", validateRequest(serviceSchema), createService);
router.put("/:id", validateRequest(serviceSchema), updateService);
router.delete("/:id", deleteService);

export default router;

