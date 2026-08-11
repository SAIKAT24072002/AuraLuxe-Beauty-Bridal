import { isDatabaseConnected } from "../config/database.js";
import { getDemoCategories } from "../data/demoStore.js";
import Category from "../models/Category.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(Category);

export const listCategories = base.list;
export const getCategoryById = base.getById;
export const createCategory = base.create;
export const updateCategory = base.update;
export const deleteCategory = base.remove;

export async function listActiveCategories(_req, res) {
  if (!isDatabaseConnected()) {
    res.json({ success: true, data: getDemoCategories(), meta: { source: "demo-fallback" } });
    return;
  }
  const categories = await Category.find({ isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
  res.json({ success: true, data: categories });
}
