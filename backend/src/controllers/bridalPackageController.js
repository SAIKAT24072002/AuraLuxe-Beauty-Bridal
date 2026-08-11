import BridalPackage from "../models/BridalPackage.js";
import { cleanupMediaAfterDelete, cleanupMediaAfterUpdate } from "../utils/mediaCleanup.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(BridalPackage);

export const listBridalPackages = base.list;
export const getBridalPackageById = base.getById;
export const createBridalPackage = asyncHandler(async (req, res) => {
  const item = await BridalPackage.create(req.validated.body);
  res.status(201).json({ success: true, data: item });
});

export const updateBridalPackage = asyncHandler(async (req, res) => {
  const existing = await BridalPackage.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  const item = await BridalPackage.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  });

  await cleanupMediaAfterUpdate(
    [existing.coverImagePublicId, existing.galleryMedia],
    [item.coverImagePublicId, item.galleryMedia]
  );
  res.json({ success: true, data: item });
});

export const deleteBridalPackage = asyncHandler(async (req, res) => {
  const existing = await BridalPackage.findByIdAndDelete(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  await cleanupMediaAfterDelete([existing.coverImagePublicId, existing.galleryMedia]);
  res.json({ success: true, message: "Deleted successfully." });
});

export const listPublicBridalPackages = asyncHandler(async (_req, res) => {
  const items = await BridalPackage.find({ isActive: true }).sort({
    featured: -1,
    createdAt: -1,
  });
  res.json({ success: true, data: items });
});
