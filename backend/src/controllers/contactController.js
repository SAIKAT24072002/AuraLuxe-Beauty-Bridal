import ContactMessage from "../models/ContactMessage.js";
import { createNotification } from "../services/notificationService.js";
import { getSocketServer } from "../socket/index.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.validated.body);

  await createNotification({
    type: "CONTACT_MESSAGE",
    title: "New contact message",
    message: `${message.name} sent a new contact query.`,
    relatedModel: "ContactMessage",
    relatedId: String(message._id),
  });
  const io = getSocketServer();
  if (io) {
    io.to("admins").emit("message:new", message);
  }

  res.status(201).json({ success: true, data: message });
});

export const listContactMessages = asyncHandler(async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ success: true, data: messages });
});

export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    req.validated.body,
    { new: true, runValidators: true }
  );

  if (!message) {
    throw new ApiError(404, "Contact message not found.");
  }

  res.json({ success: true, data: message });
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) {
    throw new ApiError(404, "Contact message not found.");
  }
  res.json({ success: true, data: message });
});
