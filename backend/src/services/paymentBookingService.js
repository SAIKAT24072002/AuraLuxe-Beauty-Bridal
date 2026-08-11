import Appointment from "../models/Appointment.js";
import BridalBooking from "../models/BridalBooking.js";
import Payment from "../models/Payment.js";
import { createNotification } from "./notificationService.js";
import { getSocketServer } from "../socket/index.js";
import { ApiError } from "../utils/apiError.js";

function getBookingModel(bookingType) {
  if (bookingType === "BEAUTY") return Appointment;
  if (bookingType === "BRIDAL") return BridalBooking;
  throw new ApiError(400, "Unsupported booking type.");
}

function getPaymentRefField(bookingType) {
  return bookingType === "BEAUTY" ? "appointment" : "bridalBooking";
}

function getBookingDisplayName(booking) {
  return booking.customerName || booking.brideName || "Customer";
}

function getBookingDisplayItem(booking, bookingType) {
  if (bookingType === "BEAUTY") {
    return booking.serviceSnapshot?.name || "Beauty Service";
  }
  return booking.selectedItemSnapshot?.name || "Bridal Package";
}

function getBookingFinalAmount(booking) {
  return Number(booking.finalAmount ?? booking.totalAmount ?? 0);
}

function getSuccessfulPaymentStatuses() {
  return ["PARTIALLY_PAID", "PAID", "FULLY_PAID"];
}

async function getSuccessfulPayments(booking) {
  return Payment.find({
    bookingId: booking.bookingId,
    paymentStatus: { $in: getSuccessfulPaymentStatuses() },
  }).sort({ createdAt: 1 });
}

async function getPaidAmounts(booking) {
  const payments = await getSuccessfulPayments(booking);
  const advancePaid = payments
    .filter((item) => item.paymentStage === "ADVANCE")
    .reduce((sum, item) => sum + Number(item.amountPaid ?? item.amount ?? 0), 0);
  const remainingPaid = payments
    .filter((item) => item.paymentStage === "REMAINING")
    .reduce((sum, item) => sum + Number(item.amountPaid ?? item.amount ?? 0), 0);
  const totalPaid = Number((advancePaid + remainingPaid).toFixed(2));

  return {
    payments,
    advancePaid: Number(advancePaid.toFixed(2)),
    remainingPaid: Number(remainingPaid.toFixed(2)),
    totalPaid,
    remainingBalance: Number(
      Math.max(getBookingFinalAmount(booking) - totalPaid, 0).toFixed(2)
    ),
  };
}

export async function resolveBookingByBookingId(bookingType, bookingId) {
  const Model = getBookingModel(bookingType);
  const booking = await Model.findOne({ bookingId });

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  return booking;
}

export async function resolveBookingByObjectId(bookingType, bookingId) {
  const Model = getBookingModel(bookingType);
  const booking = await Model.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  return booking;
}

export async function resolvePayableAmount(booking, paymentStage) {
  const paymentSnapshot = await getPaidAmounts(booking);

  if (paymentStage === "ADVANCE") {
    if (paymentSnapshot.advancePaid > 0 || paymentSnapshot.totalPaid > 0) {
      throw new ApiError(409, "Advance payment has already been received.");
    }

    return {
      amount: Number(booking.advanceAmount || 0),
      currency: "INR",
    };
  }

  if (paymentStage === "REMAINING") {
    if (!["SERVICE_COMPLETED", "FULLY_PAID"].includes(booking.bookingStatus)) {
      throw new ApiError(
        409,
        "Remaining payment can be collected after the service is completed."
      );
    }

    if (booking.paymentStatus === "PAID" || booking.bookingStatus === "FULLY_PAID") {
      throw new ApiError(409, "This booking is already fully paid.");
    }

    const successfulRemainingPayment = paymentSnapshot.payments.find(
      (item) => item.paymentStage === "REMAINING"
    );
    if (successfulRemainingPayment) {
      throw new ApiError(409, "Remaining payment has already been received.");
    }

    if (paymentSnapshot.remainingBalance <= 0) {
      throw new ApiError(409, "This booking has no remaining payable balance.");
    }

    return {
      amount: paymentSnapshot.remainingBalance,
      currency: "INR",
    };
  }

  throw new ApiError(400, "Unsupported payment stage.");
}

export async function upsertPendingPaymentRecord({
  booking,
  bookingType,
  paymentStage,
  amount,
  provider,
  paymentMethod,
  providerOrderId,
  providerPayload,
}) {
  const refField = getPaymentRefField(bookingType);
  const filter = {
    bookingId: booking.bookingId,
    bookingType,
    paymentStage,
    providerOrderId: providerOrderId || undefined,
  };

  let payment = await Payment.findOne({
    bookingId: booking.bookingId,
    bookingType,
    paymentStage,
    providerOrderId: providerOrderId || { $exists: false },
    paymentStatus: { $in: ["PENDING", "FAILED"] },
  });

  if (!payment) {
    payment = new Payment();
  }

  payment.bookingId = booking.bookingId;
  payment.bookingType = bookingType;
  payment[refField] = booking._id;
  payment.paymentStage = paymentStage;
  payment.amount = amount;
  payment.amountPaid = amount;
  payment.totalAmount = getBookingFinalAmount(booking);
  payment.remainingAmount = Number(booking.remainingAmount || 0);
  payment.advancePercentage = booking.advancePercentage;
  payment.provider = provider;
  payment.paymentMethod = paymentMethod;
  payment.method = paymentMethod;
  payment.providerOrderId = providerOrderId;
  payment.paymentStatus = "PENDING";
  payment.status = "PENDING";
  payment.providerPayload = providerPayload;
  payment.currency = "INR";
  await payment.save();

  if (!booking.paymentRecords?.some((id) => String(id) === String(payment._id))) {
    booking.paymentRecords = [...(booking.paymentRecords || []), payment._id];
    await booking.save();
  }

  return payment;
}

export async function markPaymentFailed({ payment, failureReason, providerPayload }) {
  payment.paymentStatus = "FAILED";
  payment.status = "FAILED";
  payment.failureReason = failureReason;
  payment.providerPayload = providerPayload || payment.providerPayload;
  payment.verified = false;
  await payment.save();
  return payment;
}

function emitPaymentEvents(booking, payment, bookingType) {
  const io = getSocketServer();
  if (!io) return;

  const payload = {
    bookingId: booking.bookingId,
    bookingType,
    paymentStage: payment.paymentStage,
    amount: payment.amount,
    originalAmount: booking.originalAmount ?? booking.totalAmount,
    finalAmount: booking.finalAmount ?? booking.totalAmount,
    advanceAmount: booking.advanceAmount,
    remainingAmount: booking.remainingAmount,
    discountAmount: booking.discountAmount || 0,
    couponCode: booking.couponCode || "",
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
  };

  io.to("admins").emit("payment:verified", payload);
  io.to(`booking:${booking.bookingId}`).emit("payment:verified", payload);
  io.to(`booking:${booking.bookingId}`).emit("booking:status-updated", payload);
  io.to("admins").emit("booking:status-updated", payload);
}

export async function applyVerifiedPayment({
  booking,
  bookingType,
  payment,
  providerPaymentId,
  providerSignature,
  providerPayload,
  paymentMethod = "RAZORPAY",
}) {
  const duplicate = await Payment.findOne({
    providerPaymentId,
    _id: { $ne: payment._id },
  });
  if (duplicate) {
    throw new ApiError(409, "Duplicate payment identifier detected.");
  }

  payment.providerPaymentId = providerPaymentId;
  payment.providerSignature = providerSignature;
  payment.paymentMethod = paymentMethod;
  payment.method = paymentMethod;
  payment.paymentStatus = payment.paymentStage === "ADVANCE" ? "PARTIALLY_PAID" : "PAID";
  payment.status = payment.paymentStatus;
  payment.transactionId = providerPaymentId;
  payment.verified = true;
  payment.paidAt = new Date();
  payment.providerPayload = providerPayload || payment.providerPayload;
  await payment.save();

  if (payment.paymentStage === "ADVANCE") {
    booking.paymentStatus = "PARTIALLY_PAID";
    booking.bookingStatus = "CONFIRMED";
  } else {
    booking.paymentStatus = "FULLY_PAID";
    booking.bookingStatus = "FULLY_PAID";
    booking.remainingAmount = 0;
  }

  await booking.save();

  await createNotification({
    type: "PAYMENT",
    title: "Advance payment received",
    message: `${getBookingDisplayName(booking)} - ${getBookingDisplayItem(
      booking,
      bookingType
    )} - Rs ${Number(payment.amount || 0).toLocaleString("en-IN")} ${
      payment.paymentStage === "ADVANCE" ? "Advance Paid" : "Remaining Paid"
    }`,
    relatedModel: bookingType === "BEAUTY" ? "Appointment" : "BridalBooking",
    relatedId: String(booking._id),
  });

  emitPaymentEvents(booking, payment, bookingType);

  return { booking, payment };
}

export async function markManualRemainingPaymentReceived({
  booking,
  bookingType,
  amount,
  receivedByAdmin,
  note,
  paymentMethod = "CASH",
}) {
  const refField = getPaymentRefField(bookingType);
  const payment = await Payment.findOne({
    bookingId: booking.bookingId,
    bookingType,
    paymentStage: "REMAINING",
    paymentStatus: { $ne: "PAID" },
  }).sort({ createdAt: -1 });

  const record = payment || new Payment();
  record.bookingId = booking.bookingId;
  record.bookingType = bookingType;
  record[refField] = booking._id;
  record.paymentStage = "REMAINING";
  record.amount = amount;
  record.amountPaid = amount;
  record.totalAmount = getBookingFinalAmount(booking);
  record.remainingAmount = 0;
  record.advancePercentage = booking.advancePercentage;
  record.paymentMethod = paymentMethod;
  record.method = paymentMethod;
  record.provider = paymentMethod;
  record.paymentStatus = "PAID";
  record.status = "PAID";
  record.currency = "INR";
  record.verified = true;
  record.paidAt = new Date();
  record.receivedAt = new Date();
  record.receivedByAdmin = receivedByAdmin;
  record.note = note;
  record.transactionId = `manual-${booking.bookingId}-${Date.now()}`;
  await record.save();

  if (!booking.paymentRecords?.some((id) => String(id) === String(record._id))) {
    booking.paymentRecords = [...(booking.paymentRecords || []), record._id];
  }
  booking.remainingAmount = 0;
  booking.paymentStatus = "FULLY_PAID";
  booking.bookingStatus = "FULLY_PAID";
  await booking.save();

  emitPaymentEvents(booking, record, bookingType);

  return { booking, payment: record };
}
