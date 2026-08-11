import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { getAllowedOrigins, isOriginAllowed } from "./config/cors.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { handleRazorpayWebhook } from "./controllers/paymentController.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import publicPaymentRoutes from "./routes/publicPaymentRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin not allowed."));
    },
    credentials: true,
  })
);
app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api", apiLimiter);

app.get("/", (_req, res) => {
  res.json({
    message: "Beauty Parlour API is running.",
    phase: "PRODUCTION_AUDIT",
    corsOrigins: getAllowedOrigins(),
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth/admin", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/payments", publicPaymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
