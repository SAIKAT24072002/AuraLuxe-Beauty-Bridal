import mongoose from "mongoose";
import { AVAILABILITY_TYPES } from "../utils/constants.js";

const availabilitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: AVAILABILITY_TYPES,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    specificDate: Date,
    openingTime: String,
    closingTime: String,
    slotDurationMinutes: {
      type: Number,
      default: 60,
      min: 15,
    },
    availableDays: {
      type: [Number],
      default: [],
    },
    individualSlots: {
      type: [
        {
          start: String,
          end: String,
          isAvailable: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },
    blockedTimeSlots: {
      type: [
        {
          start: String,
          end: String,
          reason: String,
        },
      ],
      default: [],
    },
    blockedDates: {
      type: [
        {
          date: Date,
          reason: String,
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
