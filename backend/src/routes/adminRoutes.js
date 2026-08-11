import { Router } from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";
import appointmentRoutes from "./appointmentRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import bridalBookingRoutes from "./bridalBookingRoutes.js";
import bridalPackageRoutes from "./bridalPackageRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import contactRoutes from "./contactRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import adminMediaRoutes from "./adminMediaRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import offerRoutes from "./offerRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import siteSettingsRoutes from "./siteSettingsRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";

const router = Router();

router.use(protectAdmin);
router.use("/dashboard", dashboardRoutes);
router.use("/categories", categoryRoutes);
router.use("/services", serviceRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/bridal-packages", bridalPackageRoutes);
router.use("/bridal-bookings", bridalBookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/offers", offerRoutes);
router.use("/gallery", galleryRoutes);
router.use("/media", adminMediaRoutes);
router.use("/messages", contactRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/settings", siteSettingsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/availability", availabilityRoutes);

export default router;
