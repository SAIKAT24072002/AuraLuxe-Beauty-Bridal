import mongoose from "mongoose";
import { BOOKING_TYPES, DISCOUNT_TYPES } from "../utils/constants.js";

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: DISCOUNT_TYPES,
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    startDate: Date,
    endDate: Date,
    minimumBookingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },
    applicableBookingTypes: [
      {
        type: String,
        enum: BOOKING_TYPES,
      },
    ],
    applicableServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    applicableBridalPackages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BridalPackage",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    image: String,
    imagePublicId: String,
  },
  { timestamps: true }
);

offerSchema.pre("validate", function normalizeOffer(next) {
  if (this.couponCode) {
    this.couponCode = String(this.couponCode).trim().toUpperCase();
  }

  if (!Array.isArray(this.applicableBookingTypes) || !this.applicableBookingTypes.length) {
    this.applicableBookingTypes = [...BOOKING_TYPES];
  }

  next();
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
