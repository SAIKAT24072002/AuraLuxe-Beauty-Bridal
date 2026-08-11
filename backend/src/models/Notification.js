import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../utils/constants.js";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "SYSTEM",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      default: "ADMIN",
    },
    relatedModel: String,
    relatedId: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    isRealtime: {
      type: Boolean,
      default: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

