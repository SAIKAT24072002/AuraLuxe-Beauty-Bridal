import { isDatabaseConnected } from "../config/database.js";
import { getDemoServices } from "../data/demoStore.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import { cleanupMediaAfterDelete, cleanupMediaAfterUpdate } from "../utils/mediaCleanup.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(Service, {
  populate: "category",
  createTransform: async (req) => {
    const category = await Category.findById(req.body.category);
    if (!category) {
      throw new ApiError(404, "Selected category not found.");
    }
    return req.body;
  },
});

export const listServices = base.list;
export const getServiceById = base.getById;
export const createService = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new ApiError(404, "Selected category not found.");
  }

  const item = await Service.create(req.validated.body);
  const populated = await Service.findById(item._id).populate("category");
  res.status(201).json({ success: true, data: populated });
});

export const updateService = asyncHandler(async (req, res) => {
  const existing = await Service.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  if (req.validated.body.category) {
    const category = await Category.findById(req.validated.body.category);
    if (!category) {
      throw new ApiError(404, "Selected category not found.");
    }
  }

  const item = await Service.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  }).populate("category");

  await cleanupMediaAfterUpdate(existing.imagePublicId, item.imagePublicId);
  res.json({ success: true, data: item });
});

export const deleteService = asyncHandler(async (req, res) => {
  const existing = await Service.findByIdAndDelete(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  await cleanupMediaAfterDelete(existing.imagePublicId);
  res.json({ success: true, message: "Deleted successfully." });
});

export const listPublicServices = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    let items = getDemoServices().filter((item) => item.isAvailable);
    if (req.query.category) {
      items = items.filter((item) => item.category._id === req.query.category);
    }
    if (req.query.search) {
      const term = req.query.search.toLowerCase();
      items = items.filter((item) =>
        `${item.name} ${item.description} ${item.category.name}`.toLowerCase().includes(term)
      );
    }
    res.json({ success: true, data: items, meta: { source: "demo-fallback" } });
    return;
  }

  const query = { isAvailable: true };
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const services = await Service.find(query).populate("category").sort({
    featured: -1,
    createdAt: -1,
  });
  res.json({ success: true, data: services });
});
