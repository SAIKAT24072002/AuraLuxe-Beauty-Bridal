import mongoose from "mongoose";
import {
  APPOINTMENT_BOOKING_STATUSES,
  PAYMENT_STATUSES,
  SERVICE_LOCATIONS,
} from "../utils/constants.js";
import { calculatePaymentAmounts } from "../utils/calculatePaymentAmounts.js";
import { generateBookingId } from "../utils/generateBookingId.js";

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },
    customerName: {
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
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceSnapshot: {
      name: String,
      categoryName: String,
      price: Number,
      durationMinutes: Number,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      start: { type: String, required: true },
      end: { type: String, required: true },
      label: { type: String, required: true },
      key: { type: String, required: true },
    },
    numberOfPersons: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: String,
    serviceLocation: {
      type: String,
      enum: SERVICE_LOCATIONS,
      default: "AT_PARLOUR",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalAmount: {
      type: Number,
      min: 0,
    },
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
      enum: APPOINTMENT_BOOKING_STATUSES,
      default: "PENDING_PAYMENT",
      index: true,
    },
    couponCode: String,
    paymentRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  { timestamps: true }
);

appointmentSchema.pre("validate", async function prepareAppointment(next) {
  if (!this.bookingId) {
    this.bookingId = await generateBookingId("BEAUTY");
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

  if (!this.timeSlot?.key && this.timeSlot?.start && this.timeSlot?.end) {
    this.timeSlot.key = `${this.timeSlot.start}-${this.timeSlot.end}`;
  }

  next();
});

appointmentSchema.index(
  { appointmentDate: 1, "timeSlot.key": 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: {
        $in: ["PENDING_PAYMENT", "CONFIRMED", "IN_PROGRESS", "SERVICE_COMPLETED"],
      },
    },
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
