import BridalBooking from "../models/BridalBooking.js";
import BridalPackage from "../models/BridalPackage.js";
import {
  enrichBridalSlots,
  getAvailabilityRule,
  isDateBlocked,
} from "../services/availabilityRuleService.js";
import { resolveCouponAdjustedPricing } from "../services/couponService.js";
import { createNotification } from "../services/notificationService.js";
import { getSocketServer } from "../socket/index.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildBridalTimeSlots,
  hasBridalTimeConflict,
  timeToMinutes,
} from "../utils/bridalAvailability.js";

function activeBridalStatuses() {
  return [
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PREPARING",
    "ON_THE_WAY",
    "SERVICE_STARTED",
    "SERVICE_COMPLETED",
    "FULLY_PAID",
  ];
}

function emitBridalEvent(eventName, booking) {
  const io = getSocketServer();
  if (!io) return;

  io.to("admins").emit(eventName, {
    bookingType: "BRIDAL",
    bookingId: booking.bookingId,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
  });
  io.to(`booking:${booking.bookingId}`).emit("booking:status-updated", {
    bookingType: "BRIDAL",
    bookingId: booking.bookingId,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
  });
}

async function findConflictingBridalBooking({ eventDate, startTimeMinutes, endTimeMinutes }) {
  const start = new Date(eventDate);
  const end = new Date(eventDate);
  end.setDate(end.getDate() + 1);

  const bookings = await BridalBooking.find({
    eventDate: { $gte: start, $lt: end },
    bookingStatus: { $in: activeBridalStatuses() },
  }).select("bookingId brideName preferredStartTime startTimeMinutes endTimeMinutes");

  return (
    bookings.find((booking) =>
      hasBridalTimeConflict(startTimeMinutes, endTimeMinutes, booking)
    ) || null
  );
}

async function resolveBridalPricing(payload) {
  if (payload.selectedItemType === "PACKAGE") {
    const bridalPackage = await BridalPackage.findById(payload.bridalPackage);
    if (!bridalPackage || !bridalPackage.isActive) {
      throw new ApiError(404, "Selected bridal package is unavailable.");
    }

    const totalAmount = bridalPackage.discountPrice || bridalPackage.price;
    const advancePercentage = bridalPackage.advancePercentage || 50;

    return {
      bridalPackageId: bridalPackage._id,
      totalAmount,
      advancePercentage,
      durationMinutes: bridalPackage.durationMinutes,
      snapshot: {
        name: bridalPackage.name,
        price: totalAmount,
        advancePercentage,
        durationMinutes: bridalPackage.durationMinutes,
      },
    };
  }

  if (!payload.selectedServiceName || !payload.totalAmount) {
    throw new ApiError(
      400,
      "Custom bridal service bookings require selectedServiceName and totalAmount."
    );
  }

  return {
    bridalPackageId: null,
    totalAmount: payload.totalAmount,
    advancePercentage: payload.advancePercentage || 50,
    durationMinutes: 240,
    snapshot: {
      name: payload.selectedServiceName,
      price: payload.totalAmount,
      advancePercentage: payload.advancePercentage || 50,
      durationMinutes: 240,
    },
  };
}

export const getBridalBookingAvailability = asyncHandler(async (req, res) => {
  const { date, bridalPackageId } = req.query;

  if (!date) {
    throw new ApiError(400, "date is required.");
  }

  const eventDate = new Date(date);
  if (Number.isNaN(eventDate.getTime())) {
    throw new ApiError(400, "Invalid bridal booking date.");
  }

  let durationMinutes = 240;
  if (bridalPackageId) {
    const bridalPackage = await BridalPackage.findById(bridalPackageId).select(
      "durationMinutes isActive"
    );
    if (!bridalPackage || !bridalPackage.isActive) {
      throw new ApiError(404, "Selected bridal package is unavailable.");
    }
    durationMinutes = bridalPackage.durationMinutes;
  }
  const rule = await getAvailabilityRule("BRIDAL", date);
  if (rule && isDateBlocked(rule, date)) {
    res.json({
      success: true,
      data: {
        date,
        durationMinutes,
        slots: [],
        blocked: true,
      },
    });
    return;
  }

  const booked = await BridalBooking.find({
    eventDate: {
      $gte: new Date(date),
      $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
    },
    bookingStatus: { $in: activeBridalStatuses() },
  }).select("bookingId startTimeMinutes endTimeMinutes preferredStartTime brideName");

  const slots = enrichBridalSlots(durationMinutes, rule, booked);

  res.json({
    success: true,
    data: {
      date,
      durationMinutes,
      slots,
    },
  });
});

export const createBridalBooking = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const eventDate = new Date(payload.eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDate < today) {
    throw new ApiError(400, "Bridal bookings cannot be created for past dates.");
  }

  const pricing = await resolveBridalPricing(payload);
  const startTimeMinutes = timeToMinutes(payload.preferredStartTime);
  const endTimeMinutes = startTimeMinutes + pricing.durationMinutes;
  const couponPricing = await resolveCouponAdjustedPricing({
    couponCode: payload.couponCode,
    bookingType: "BRIDAL",
    bridalPackageId: pricing.bridalPackageId,
    originalAmount: pricing.totalAmount,
    advancePercentage: pricing.advancePercentage || 50,
  });

  const conflict = await findConflictingBridalBooking({
    eventDate,
    startTimeMinutes,
    endTimeMinutes,
  });

  if (conflict) {
    throw new ApiError(
      409,
      `This bridal time slot conflicts with existing booking ${conflict.bookingId}.`
    );
  }

  const booking = await BridalBooking.create({
    ...payload,
    eventDate,
    bridalPackage: pricing.bridalPackageId,
    couponCode: couponPricing.couponCode || undefined,
    discountType: couponPricing.discountType,
    discountValue: couponPricing.discountValue,
    discountAmount: couponPricing.discountAmount,
    originalAmount: couponPricing.originalAmount,
    finalAmount: couponPricing.finalAmount,
    totalAmount: couponPricing.finalAmount,
    advancePercentage: couponPricing.advancePercentage,
    selectedItemSnapshot: pricing.snapshot,
    startTimeMinutes,
    endTimeMinutes,
  }).catch((error) => {
    if (error?.code === 11000) {
      throw new ApiError(409, "This bridal time slot is already booked.");
    }
    throw error;
  });

  await createNotification({
    type: "NEW_BRIDAL_BOOKING",
    title: "New bridal booking",
    message: `${booking.brideName} booked a bridal ${booking.selectedItemType.toLowerCase()} for ${booking.preferredStartTime}.`,
    relatedModel: "BridalBooking",
    relatedId: String(booking._id),
  });
  emitBridalEvent("booking:new", booking);

  res.status(201).json({ success: true, data: booking });
});

export const listBridalBookings = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.bookingStatus = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  if (req.query.eventType) query.eventType = req.query.eventType;
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    query.eventDate = { $gte: date, $lt: nextDate };
  }
  if (req.query.search) {
    query.$or = [
      { brideName: { $regex: req.query.search, $options: "i" } },
      { bookingId: { $regex: req.query.search, $options: "i" } },
      { phone: { $regex: req.query.search, $options: "i" } },
      { venueName: { $regex: req.query.search, $options: "i" } },
      { city: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const items = await BridalBooking.find(query)
    .populate("bridalPackage paymentRecords")
    .sort({ eventDate: 1, preferredStartTime: 1 });

  res.json({ success: true, data: items });
});

export const getBridalBookingById = asyncHandler(async (req, res) => {
  const item = await BridalBooking.findById(req.params.id).populate(
    "bridalPackage paymentRecords"
  );
  if (!item) {
    throw new ApiError(404, "Bridal booking not found.");
  }
  res.json({ success: true, data: item });
});

export const updateBridalBookingStatus = asyncHandler(async (req, res) => {
  const item = await BridalBooking.findByIdAndUpdate(
    req.params.id,
    req.validated.body,
    { new: true, runValidators: true }
  );

  if (!item) {
    throw new ApiError(404, "Bridal booking not found.");
  }

  await createNotification({
    type: "BOOKING_STATUS",
    title: "Bridal booking updated",
    message: `${item.brideName} status changed to ${item.bookingStatus}.`,
    relatedModel: "BridalBooking",
    relatedId: String(item._id),
  });
  emitBridalEvent("booking:status-updated", item);

  res.json({ success: true, data: item });
});
