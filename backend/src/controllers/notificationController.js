import Notification from "../models/Notification.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (_req, res) => {
  const items = await Notification.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: items });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const item = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!item) {
    throw new ApiError(404, "Notification not found.");
  }
  res.json({ success: true, data: item });
});

export const markAllNotificationsRead = asyncHandler(async (_req, res) => {
  await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
  res.json({ success: true });
});
