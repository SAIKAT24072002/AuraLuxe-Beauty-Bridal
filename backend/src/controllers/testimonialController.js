import Testimonial from "../models/Testimonial.js";
import { cleanupMediaAfterDelete, cleanupMediaAfterUpdate } from "../utils/mediaCleanup.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(Testimonial);

export const listTestimonials = base.list;
export const getTestimonialById = base.getById;
export const createTestimonial = base.create;
export const updateTestimonial = asyncHandler(async (req, res) => {
  const existing = await Testimonial.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  const item = await Testimonial.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  });

  await cleanupMediaAfterUpdate(existing.imagePublicId, item.imagePublicId);
  res.json({ success: true, data: item });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const existing = await Testimonial.findByIdAndDelete(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  await cleanupMediaAfterDelete(existing.imagePublicId);
  res.json({ success: true, message: "Deleted successfully." });
});

export const listFeaturedTestimonials = asyncHandler(async (_req, res) => {
  const items = await Testimonial.find({ isActive: true }).sort({
    featured: -1,
    createdAt: -1,
  });
  res.json({ success: true, data: items });
});
