import mongoose from "mongoose";
import {
  BRIDAL_BOOKING_STATUSES,
  BRIDAL_EVENT_TYPES,
  PAYMENT_STATUSES,
  SERVICE_LOCATIONS,
} from "../utils/constants.js";
import { calculatePaymentAmounts } from "../utils/calculatePaymentAmounts.js";
import { generateBookingId } from "../utils/generateBookingId.js";

const bridalBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },
    brideName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    alternativeContact: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      enum: BRIDAL_EVENT_TYPES,
      required: true,
    },
    otherEventType: String,
    bridalPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BridalPackage",
    },
    selectedServiceName: String,
    selectedItemType: {
      type: String,
      enum: ["PACKAGE", "SERVICE"],
      required: true,
    },
    selectedItemSnapshot: {
      name: String,
      price: Number,
      advancePercentage: Number,
      durationMinutes: Number,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    preferredStartTime: {
      type: String,
      required: true,
    },
    startTimeMinutes: {
      type: Number,
      index: true,
    },
    endTimeMinutes: {
      type: Number,
      index: true,
    },
    serviceLocation: {
      type: String,
      enum: SERVICE_LOCATIONS,
      required: true,
    },
    venueName: String,
    fullAddress: String,
    city: String,
    pinCode: String,
    landmark: String,
    googleMapsUrl: String,
    additionalRequirements: String,
    specialNotes: String,
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalAmount: {
      type: Number,
      min: 0,
    },
    couponCode: String,
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED", null],
      default: null,
    },
    discountValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalAmount: {
      type: Number,
      min: 0,
    },
    advancePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: BRIDAL_BOOKING_STATUSES,
      default: "PENDING_PAYMENT",
      index: true,
    },
    paymentRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  { timestamps: true }
);

bridalBookingSchema.pre("validate", async function prepareBridalBooking(next) {
  if (!this.bookingId) {
    this.bookingId = await generateBookingId("BRIDAL");
  }

  const shouldRecalculateAmounts =
    this.isNew ||
    this.isModified("originalAmount") ||
    this.isModified("totalAmount") ||
    this.isModified("finalAmount") ||
    this.isModified("advancePercentage") ||
    this.isModified("discountAmount") ||
    this.isModified("discountValue");

  if (shouldRecalculateAmounts) {
    const originalAmount = Number(this.originalAmount ?? this.totalAmount ?? 0);
    const finalAmount = Number(this.finalAmount ?? this.totalAmount ?? originalAmount);
    const amounts = calculatePaymentAmounts(finalAmount, this.advancePercentage);

    this.originalAmount = originalAmount;
    this.discountAmount = Number(
      Math.max(originalAmount - amounts.totalAmount, this.discountAmount || 0).toFixed(2)
    );
    this.totalAmount = amounts.totalAmount;
    this.finalAmount = amounts.totalAmount;
    this.advancePercentage = amounts.advancePercentage;
    this.advanceAmount = amounts.advanceAmount;
    this.remainingAmount = amounts.remainingAmount;
  }

  next();
});

bridalBookingSchema.index({ eventDate: 1, startTimeMinutes: 1, endTimeMinutes: 1 });

const BridalBooking = mongoose.model("BridalBooking", bridalBookingSchema);

export default BridalBooking;
