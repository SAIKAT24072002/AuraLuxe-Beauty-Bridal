import { Server } from "socket.io";
import { isOriginAllowed } from "../config/cors.js";

let io;

export function configureSocket(server) {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Socket origin not allowed."));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("admin:join", () => {
      socket.join("admins");
    });

    socket.on("booking:subscribe", (bookingId) => {
      if (!bookingId) return;
      socket.join(`booking:${String(bookingId).toUpperCase()}`);
    });

    socket.on("booking:unsubscribe", (bookingId) => {
      if (!bookingId) return;
      socket.leave(`booking:${String(bookingId).toUpperCase()}`);
    });

    socket.emit("system:connected", {
      message: "Socket connection established.",
    });
  });

  return io;
}

export function getSocketServer() {
  return io;
}
