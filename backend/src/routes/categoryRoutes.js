import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { categorySchema } from "../validators/catalogValidators.js";

const router = Router();

router.get("/", listCategories);
router.get("/:id", getCategoryById);
router.post("/", validateRequest(categorySchema), createCategory);
router.put("/:id", validateRequest(categorySchema), updateCategory);
router.delete("/:id", deleteCategory);

export default router;

