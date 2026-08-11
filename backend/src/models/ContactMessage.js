import mongoose from "mongoose";
import { MESSAGE_STATUSES } from "../utils/constants.js";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    subject: String,
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: MESSAGE_STATUSES,
      default: "UNREAD",
    },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;

