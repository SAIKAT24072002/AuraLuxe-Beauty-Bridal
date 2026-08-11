import Offer from "../models/Offer.js";
import { cleanupMediaAfterDelete, cleanupMediaAfterUpdate } from "../utils/mediaCleanup.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(Offer, {
  populate: "applicableServices applicableBridalPackages",
  createTransform: async (req) => ({
    ...req.body,
    couponCode: req.body.couponCode ? String(req.body.couponCode).trim().toUpperCase() : undefined,
  }),
  updateTransform: async (req) => ({
    ...req.body,
    couponCode: req.body.couponCode ? String(req.body.couponCode).trim().toUpperCase() : undefined,
  }),
});

export const listOffers = base.list;
export const getOfferById = base.getById;
export const createOffer = base.create;
export const updateOffer = asyncHandler(async (req, res) => {
  const existing = await Offer.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  const payload = {
    ...req.validated.body,
    couponCode: req.validated.body.couponCode
      ? String(req.validated.body.couponCode).trim().toUpperCase()
      : undefined,
  };

  const item = await Offer.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate("applicableServices applicableBridalPackages");

  await cleanupMediaAfterUpdate(existing.imagePublicId, item.imagePublicId);
  res.json({ success: true, data: item });
});

export const deleteOffer = asyncHandler(async (req, res) => {
  const existing = await Offer.findByIdAndDelete(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  await cleanupMediaAfterDelete(existing.imagePublicId);
  res.json({ success: true, message: "Deleted successfully." });
});

export const listActiveOffers = asyncHandler(async (_req, res) => {
  const now = new Date();
  const items = await Offer.find({
    isActive: true,
    $and: [
      {
        $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }],
      },
      {
        $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
      },
    ],
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: items });
});
