import Payment from "../models/Payment.js";
import { isDatabaseConnected } from "../config/database.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {
  applyVerifiedPayment,
  markManualRemainingPaymentReceived,
  markPaymentFailed,
  resolveBookingByBookingId,
  resolvePayableAmount,
  upsertPendingPaymentRecord,
} from "../services/paymentBookingService.js";
import {
  createGatewayOrder,
  getPaymentGatewayPublicConfig,
  isWebhookConfigured,
  verifyGatewayPaymentSignature,
  verifyGatewayWebhookSignature,
} from "../services/paymentGatewayService.js";

function buildPaymentQuery(query) {
  const filter = {};

  if (query.bookingType) filter.bookingType = query.bookingType;
  if (query.paymentStage) filter.paymentStage = query.paymentStage;
  if (query.status) filter.paymentStatus = query.status;
  if (query.paymentMethod) {
    filter.$or = [{ paymentMethod: query.paymentMethod }, { method: query.paymentMethod }];
  }
  if (query.bookingId) filter.bookingId = { $regex: query.bookingId, $options: "i" };
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt.$lt = endDate;
    }
  }

  return filter;
}

function mapPaymentRecord(item) {
  const booking = item.appointment || item.bridalBooking;
  return {
    _id: item._id,
    bookingId: item.bookingId,
    bookingType: item.bookingType,
    paymentStage: item.paymentStage,
    amount: item.amount,
    amountPaid: item.amountPaid,
    totalAmount: item.totalAmount,
    remainingAmount: item.remainingAmount,
    advancePercentage: item.advancePercentage,
    currency: item.currency,
    paymentMethod: item.paymentMethod || item.method,
    provider: item.provider,
    status: item.paymentStatus,
    verified: item.verified,
    providerOrderId: item.providerOrderId,
    providerPaymentId: item.providerPaymentId,
    transactionId: item.transactionId,
    failureReason: item.failureReason,
    createdAt: item.createdAt,
    paidAt: item.paidAt,
    customerName: booking?.customerName || booking?.brideName || "",
    bookingStatus: booking?.bookingStatus || "",
    bookingPaymentStatus: booking?.paymentStatus || "",
  };
}

async function findPaymentByOrderId(orderId) {
  const payment = await Payment.findOne({
    $or: [{ providerOrderId: orderId }, { gatewayOrderId: orderId }],
  }).populate("appointment bridalBooking");

  if (!payment) {
    throw new ApiError(404, "Payment order record was not found.");
  }

  return payment;
}

async function processCapturedPayment({ orderId, paymentId, signature, payload }) {
  const payment = await findPaymentByOrderId(orderId);
  const booking = payment.bookingType === "BEAUTY" ? payment.appointment : payment.bridalBooking;

  if (!booking) {
    throw new ApiError(404, "Linked booking was not found for this payment.");
  }

  if (payment.verified && payment.providerPaymentId === paymentId) {
    return { booking, payment };
  }

  return applyVerifiedPayment({
    booking,
    bookingType: payment.bookingType,
    payment,
    providerPaymentId: paymentId,
    providerSignature: signature,
    providerPayload: payload,
    paymentMethod: "RAZORPAY",
  });
}

export const getPaymentConfig = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: getPaymentGatewayPublicConfig(),
  });
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    throw new ApiError(
      503,
      "Online payment is currently unavailable. Please contact us or try again later."
    );
  }

  const { bookingId, bookingType, paymentStage } = req.validated.body;
  const booking = await resolveBookingByBookingId(bookingType, bookingId);
  const { amount, currency } = await resolvePayableAmount(booking, paymentStage);

  const gatewayOrder = await createGatewayOrder({
    amount,
    currency,
    receipt: `${booking.bookingId}-${paymentStage}`,
    notes: {
      bookingId: booking.bookingId,
      bookingType,
      paymentStage,
    },
  });

  const payment = await upsertPendingPaymentRecord({
    booking,
    bookingType,
    paymentStage,
    amount,
    provider: "RAZORPAY",
    paymentMethod: "RAZORPAY",
    providerOrderId: gatewayOrder.id,
    providerPayload: gatewayOrder,
  });

  res.status(201).json({
    success: true,
    data: {
      bookingId: booking.bookingId,
      bookingType,
      paymentStage,
      amount,
      currency,
      razorpayEnabled: true,
      keyId: getPaymentGatewayPublicConfig().keyId,
      order: {
        id: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        receipt: gatewayOrder.receipt,
      },
      paymentRecordId: payment._id,
      paymentStatus: payment.paymentStatus,
      bookingStatus: booking.bookingStatus,
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.validated.body;
  const isValid = verifyGatewayPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    throw new ApiError(400, "Payment signature verification failed.");
  }

  const { booking, payment } = await processCapturedPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    payload: req.validated.body,
  });

  res.json({
    success: true,
    data: {
      bookingId: booking.bookingId,
      bookingType: payment.bookingType,
      paymentStage: payment.paymentStage,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      amountPaid: payment.amount,
      remainingAmount: booking.remainingAmount,
      paymentId: payment.providerPaymentId,
    },
  });
});

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  if (!isWebhookConfigured()) {
    res.status(202).json({
      success: false,
      message: "Razorpay webhook secret is not configured yet.",
    });
    return;
  }

  const signature = req.headers["x-razorpay-signature"];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  const isValid = verifyGatewayWebhookSignature(rawBody, signature);

  if (!isValid) {
    throw new ApiError(400, "Webhook signature verification failed.");
  }

  const payload = JSON.parse(rawBody.toString("utf8"));
  const event = payload.event;
  const entity = payload.payload || {};

  if (event === "payment.failed") {
    const failedEntity = entity.payment?.entity;
    if (failedEntity?.order_id) {
      const payment = await findPaymentByOrderId(failedEntity.order_id);
      if (!payment.verified) {
        await markPaymentFailed({
          payment,
          failureReason: failedEntity.error_description || "Payment failed.",
          providerPayload: payload,
        });
      }
    }
  }

  if (event === "payment.captured" || event === "order.paid") {
    const capturedPayment = entity.payment?.entity;
    const paidOrder = entity.order?.entity;
    const orderId = capturedPayment?.order_id || paidOrder?.id;
    const paymentId = capturedPayment?.id;

    if (orderId && paymentId) {
      await processCapturedPayment({
        orderId,
        paymentId,
        signature: signature || "webhook-verified",
        payload,
      });
    }
  }

  res.json({ success: true });
});

export const listPayments = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    res.json({ success: true, data: [], meta: { source: "demo-fallback" } });
    return;
  }

  const items = await Payment.find(buildPaymentQuery(req.query))
    .populate("appointment bridalBooking")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: items.map(mapPaymentRecord),
  });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  }).populate("appointment bridalBooking");

  if (!payment) {
    throw new ApiError(404, "Payment record not found.");
  }

  res.json({ success: true, data: mapPaymentRecord(payment) });
});

export const markRemainingPaymentReceived = asyncHandler(async (req, res) => {
  const { bookingId, bookingType, amount, paymentMethod, receivedByAdmin, note } =
    req.validated.body;
  const booking = await resolveBookingByBookingId(bookingType, bookingId);
  const payable = await resolvePayableAmount(booking, "REMAINING");

  if (Number(amount) !== Number(payable.amount)) {
    throw new ApiError(400, "Remaining payment amount does not match the booking balance.");
  }

  const { payment } = await markManualRemainingPaymentReceived({
    booking,
    bookingType,
    amount: payable.amount,
    receivedByAdmin,
    note,
    paymentMethod,
  });

  res.json({
    success: true,
    data: {
      bookingId: booking.bookingId,
      bookingType,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      payment: mapPaymentRecord(payment),
    },
  });
});
