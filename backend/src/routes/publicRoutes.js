import { Router } from "express";
import {
  createAppointment,
  getAppointmentAvailability,
} from "../controllers/appointmentController.js";
import {
  createBridalBooking,
  getBridalBookingAvailability,
} from "../controllers/bridalBookingController.js";
import { validateCoupon } from "../controllers/couponController.js";
import { listPublicBridalPackages } from "../controllers/bridalPackageController.js";
import { listActiveCategories } from "../controllers/categoryController.js";
import { createContactMessage } from "../controllers/contactController.js";
import { listPublicGallery } from "../controllers/galleryController.js";
import { listActiveOffers } from "../controllers/offerController.js";
import { createPaymentOrder, getPaymentConfig } from "../controllers/paymentController.js";
import { listPublicServices } from "../controllers/serviceController.js";
import { getSiteSettings } from "../controllers/siteSettingsController.js";
import { listFeaturedTestimonials } from "../controllers/testimonialController.js";
import { trackBooking } from "../controllers/trackingController.js";
import { listPublicAvailability } from "../controllers/availabilityController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  appointmentCreateSchema,
  bridalBookingCreateSchema,
  couponValidationSchema,
  trackBookingSchema,
} from "../validators/bookingValidators.js";
import { contactMessageSchema } from "../validators/contentValidators.js";
import { paymentOrderSchema } from "../validators/paymentValidators.js";

const router = Router();

router.get("/categories", listActiveCategories);
router.get("/services", listPublicServices);
router.get("/bridal-packages", listPublicBridalPackages);
router.get("/offers", listActiveOffers);
router.get("/gallery", listPublicGallery);
router.get("/testimonials", listFeaturedTestimonials);
router.get("/settings", getSiteSettings);
router.get("/payment-config", getPaymentConfig);
router.get("/availability", listPublicAvailability);
router.get("/appointments/availability", getAppointmentAvailability);
router.get("/bridal-bookings/availability", getBridalBookingAvailability);
router.post("/coupons/validate", validateRequest(couponValidationSchema), validateCoupon);
router.post("/contact-messages", validateRequest(contactMessageSchema), createContactMessage);
router.post("/appointments", validateRequest(appointmentCreateSchema), createAppointment);
router.post("/bridal-bookings", validateRequest(bridalBookingCreateSchema), createBridalBooking);
router.post("/payments/create-order", validateRequest(paymentOrderSchema), createPaymentOrder);
router.post("/track-booking", validateRequest(trackBookingSchema), trackBooking);

export default router;
