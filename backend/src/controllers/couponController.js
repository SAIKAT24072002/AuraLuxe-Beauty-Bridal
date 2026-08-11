import BridalPackage from "../models/BridalPackage.js";
import Service from "../models/Service.js";
import { isDatabaseConnected } from "../config/database.js";
import { resolveCouponAdjustedPricing } from "../services/couponService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validateCoupon = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    throw new ApiError(503, "Coupon validation requires live database offer data.");
  }

  const { bookingType, serviceId, bridalPackageId, couponCode } = req.validated.body;

  if (bookingType === "BEAUTY") {
    const service = await Service.findById(serviceId);
    if (!service || !service.isAvailable) {
      throw new ApiError(404, "Selected service is unavailable.");
    }

    const pricing = await resolveCouponAdjustedPricing({
      couponCode,
      bookingType,
      serviceId: service._id,
      originalAmount: service.price,
      advancePercentage: service.advancePercentage,
    });

    res.json({ success: true, data: pricing });
    return;
  }

  const bridalPackage = await BridalPackage.findById(bridalPackageId);
  if (!bridalPackage || !bridalPackage.isActive) {
    throw new ApiError(404, "Selected bridal package is unavailable.");
  }

  const pricing = await resolveCouponAdjustedPricing({
    couponCode,
    bookingType,
    bridalPackageId: bridalPackage._id,
    originalAmount: bridalPackage.discountPrice || bridalPackage.price,
    advancePercentage: bridalPackage.advancePercentage || 50,
  });

  res.json({ success: true, data: pricing });
});
