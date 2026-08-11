import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip(req) {
    const ip = req.ip || req.socket?.remoteAddress || "";
    const forwardedFor = req.headers["x-forwarded-for"] || "";
    const isLocalRequest =
      ip.includes("127.0.0.1") ||
      ip.includes("::1") ||
      String(forwardedFor).includes("127.0.0.1") ||
      String(forwardedFor).includes("::1");
    return process.env.NODE_ENV !== "production" && isLocalRequest;
  },
});
