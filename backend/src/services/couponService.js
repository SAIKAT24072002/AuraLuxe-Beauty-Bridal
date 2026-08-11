import Offer from "../models/Offer.js";
import { calculatePaymentAmounts } from "../utils/calculatePaymentAmounts.js";
import { ApiError } from "../utils/apiError.js";

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function normalizeCouponCode(couponCode) {
  return String(couponCode || "").trim().toUpperCase();
}

function ensureOfferActiveForNow(offer, now = new Date()) {
  if (!offer) {
    throw new ApiError(404, "Coupon code was not found.");
  }

  if (!offer.isActive) {
    throw new ApiError(400, "This coupon is currently inactive.");
  }

  if (offer.startDate && new Date(offer.startDate) > now) {
    throw new ApiError(400, "This coupon is not active yet.");
  }

  if (offer.endDate && new Date(offer.endDate) < now) {
    throw new ApiError(400, "This coupon has expired.");
  }
}

function ensureOfferApplicability({
  offer,
  bookingType,
  serviceId,
  bridalPackageId,
  originalAmount,
}) {
  if (
    Array.isArray(offer.applicableBookingTypes) &&
    offer.applicableBookingTypes.length &&
    !offer.applicableBookingTypes.includes(bookingType)
  ) {
    throw new ApiError(
      400,
      bookingType === "BEAUTY"
        ? "This coupon is not applicable for beauty bookings."
        : "This coupon is not applicable for bridal bookings."
    );
  }

  if (Number(originalAmount) < Number(offer.minimumBookingAmount || 0)) {
    throw new ApiError(
      400,
      `This coupon requires a minimum booking amount of ${formatCurrency(
        offer.minimumBookingAmount
      )}.`
    );
  }

  if (bookingType === "BEAUTY" && Array.isArray(offer.applicableServices) && offer.applicableServices.length) {
    const serviceMatch = offer.applicableServices.some(
      (item) => String(item) === String(serviceId)
    );
    if (!serviceMatch) {
      throw new ApiError(400, "This coupon is not valid for the selected beauty service.");
    }
  }

  if (
    bookingType === "BRIDAL" &&
    Array.isArray(offer.applicableBridalPackages) &&
    offer.applicableBridalPackages.length
  ) {
    const packageMatch = offer.applicableBridalPackages.some(
      (item) => String(item) === String(bridalPackageId)
    );
    if (!packageMatch) {
      throw new ApiError(400, "This coupon is not valid for the selected bridal package.");
    }
  }
}

function calculateCouponDiscount(offer, originalAmount) {
  const safeOriginalAmount = Number(originalAmount || 0);
  let discountAmount = 0;

  if (offer.discountType === "PERCENTAGE") {
    discountAmount = (safeOriginalAmount * Number(offer.discountValue || 0)) / 100;
  } else {
    discountAmount = Number(offer.discountValue || 0);
  }

  if (Number(offer.maximumDiscount || 0) > 0) {
    discountAmount = Math.min(discountAmount, Number(offer.maximumDiscount));
  }

  discountAmount = Number(Math.min(discountAmount, safeOriginalAmount).toFixed(2));
  const finalAmount = Number(Math.max(safeOriginalAmount - discountAmount, 0).toFixed(2));

  return {
    discountAmount,
    finalAmount,
  };
}

export async function validateCouponForBooking({
  couponCode,
  bookingType,
  serviceId,
  bridalPackageId,
  originalAmount,
  advancePercentage,
}) {
  const normalizedCode = normalizeCouponCode(couponCode);
  if (!normalizedCode) {
    throw new ApiError(400, "Please enter a coupon code.");
  }

  const offer = await Offer.findOne({ couponCode: normalizedCode });
  ensureOfferActiveForNow(offer);
  ensureOfferApplicability({
    offer,
    bookingType,
    serviceId,
    bridalPackageId,
    originalAmount,
  });

  const { discountAmount, finalAmount } = calculateCouponDiscount(offer, originalAmount);
  const paymentBreakdown = calculatePaymentAmounts(finalAmount, advancePercentage);

  return {
    offerId: offer._id,
    couponCode: normalizedCode,
    discountType: offer.discountType,
    discountValue: Number(offer.discountValue || 0),
    originalAmount: Number(Number(originalAmount || 0).toFixed(2)),
    discountAmount,
    finalAmount,
    advancePercentage: paymentBreakdown.advancePercentage,
    advanceAmount: paymentBreakdown.advanceAmount,
    remainingAmount: paymentBreakdown.remainingAmount,
  };
}

export async function resolveCouponAdjustedPricing({
  couponCode,
  bookingType,
  serviceId,
  bridalPackageId,
  originalAmount,
  advancePercentage,
}) {
  const baseAmount = Number(Number(originalAmount || 0).toFixed(2));
  const baseAdvancePercentage = Number(advancePercentage || 50);

  if (!String(couponCode || "").trim()) {
    const paymentBreakdown = calculatePaymentAmounts(baseAmount, baseAdvancePercentage);
    return {
      couponCode: "",
      discountType: null,
      discountValue: 0,
      originalAmount: baseAmount,
      discountAmount: 0,
      finalAmount: paymentBreakdown.totalAmount,
      advancePercentage: paymentBreakdown.advancePercentage,
      advanceAmount: paymentBreakdown.advanceAmount,
      remainingAmount: paymentBreakdown.remainingAmount,
    };
  }

  return validateCouponForBooking({
    couponCode,
    bookingType,
    serviceId,
    bridalPackageId,
    originalAmount: baseAmount,
    advancePercentage: baseAdvancePercentage,
  });
}
