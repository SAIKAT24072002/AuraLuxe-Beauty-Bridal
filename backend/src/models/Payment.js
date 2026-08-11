import mongoose from "mongoose";
import {
  BOOKING_TYPES,
  PAYMENT_METHODS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  PAYMENT_STAGES,
} from "../utils/constants.js";

const paymentSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      enum: BOOKING_TYPES,
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    bridalBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BridalBooking",
    },
    paymentStage: {
      type: String,
      enum: PAYMENT_STAGES,
      required: true,
    },
    bookingId: {
      type: String,
      required: true,
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "NONE",
    },
    provider: {
      type: String,
      enum: PAYMENT_PROVIDERS,
      default: "MANUAL",
    },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "NONE",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    providerOrderId: {
      type: String,
      index: true,
      sparse: true,
    },
    providerPaymentId: {
      type: String,
      index: true,
      sparse: true,
      unique: true,
    },
    providerSignature: String,
    transactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advancePercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
      index: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
      index: true,
    },
    providerPayload: mongoose.Schema.Types.Mixed,
    paidAt: Date,
    receivedAt: Date,
    receivedByAdmin: String,
    note: String,
    failureReason: String,
    refundNote: String,
    refundReference: String,
  },
  { timestamps: true }
);

paymentSchema.pre("validate", function syncPaymentFields(next) {
  if (!this.amount && this.amountPaid) {
    this.amount = this.amountPaid;
  }

  if (!this.amountPaid && this.amount) {
    this.amountPaid = this.amount;
  }

  if (this.paymentMethod && this.method !== this.paymentMethod) {
    this.method = this.paymentMethod;
  }

  if (this.method && this.paymentMethod !== this.method) {
    this.paymentMethod = this.method;
  }

  if (this.providerOrderId && this.gatewayOrderId !== this.providerOrderId) {
    this.gatewayOrderId = this.providerOrderId;
  }

  if (this.gatewayOrderId && this.providerOrderId !== this.gatewayOrderId) {
    this.providerOrderId = this.gatewayOrderId;
  }

  if (this.providerPaymentId && this.gatewayPaymentId !== this.providerPaymentId) {
    this.gatewayPaymentId = this.providerPaymentId;
  }

  if (this.gatewayPaymentId && this.providerPaymentId !== this.gatewayPaymentId) {
    this.providerPaymentId = this.gatewayPaymentId;
  }

  if (this.providerSignature && this.gatewaySignature !== this.providerSignature) {
    this.gatewaySignature = this.providerSignature;
  }

  if (this.gatewaySignature && this.providerSignature !== this.gatewaySignature) {
    this.providerSignature = this.gatewaySignature;
  }

  if (this.status && this.paymentStatus !== this.status) {
    this.paymentStatus = this.status;
  }

  if (this.paymentStatus && this.status !== this.paymentStatus) {
    this.status = this.paymentStatus;
  }

  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
