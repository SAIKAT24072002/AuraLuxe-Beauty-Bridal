import Gallery from "../models/Gallery.js";
import { cleanupMediaAfterDelete, cleanupMediaAfterUpdate } from "../utils/mediaCleanup.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(Gallery);

export const listGallery = base.list;
export const getGalleryById = base.getById;
export const createGallery = base.create;
export const updateGallery = asyncHandler(async (req, res) => {
  const existing = await Gallery.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  const item = await Gallery.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  });

  await cleanupMediaAfterUpdate(existing.publicId, item.publicId);
  res.json({ success: true, data: item });
});

export const deleteGallery = asyncHandler(async (req, res) => {
  const existing = await Gallery.findByIdAndDelete(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  await cleanupMediaAfterDelete(existing.publicId);
  res.json({ success: true, message: "Deleted successfully." });
});

export const listPublicGallery = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.category) {
    query.category = req.query.category;
  }
  const items = await Gallery.find(query).sort({ featured: -1, sortOrder: 1, createdAt: -1 });
  res.json({ success: true, data: items });
});
