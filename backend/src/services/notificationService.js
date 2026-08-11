import Notification from "../models/Notification.js";
import { getSocketServer } from "../socket/index.js";
import { isDatabaseConnected } from "../config/database.js";

export async function createNotification(payload) {
  const notification = isDatabaseConnected()
    ? await Notification.create(payload)
    : {
        ...payload,
        _id: `demo-notification-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
  const io = getSocketServer();

  if (io) {
    io.to("admins").emit("notification:new", notification);
    io.emit("notification:broadcast", {
      type: notification.type,
      title: notification.title,
      message: notification.message,
    });
  }

  return notification;
}
