import Appointment from "../models/Appointment.js";
import BridalBooking from "../models/BridalBooking.js";
import { isDatabaseConnected } from "../config/database.js";
import { findDemoAppointmentForTracking } from "../data/demoStore.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const trackBooking = asyncHandler(async (req, res) => {
  const { bookingId, phone } = req.validated.body;

  if (!isDatabaseConnected()) {
    const appointment = findDemoAppointmentForTracking(bookingId, phone);
    if (appointment) {
      res.json({
        success: true,
        bookingType: "BEAUTY",
        data: appointment,
        meta: { source: "demo-fallback" },
      });
      return;
    }

    throw new ApiError(404, "No booking found for the provided booking ID and phone number.");
  }

  const appointment = await Appointment.findOne({ bookingId, phone }).populate("service");
  if (appointment) {
    res.json({ success: true, bookingType: "BEAUTY", data: appointment });
    return;
  }

  const bridalBooking = await BridalBooking.findOne({ bookingId, phone }).populate("bridalPackage");
  if (bridalBooking) {
    res.json({ success: true, bookingType: "BRIDAL", data: bridalBooking });
    return;
  }

  throw new ApiError(404, "No booking found for the provided booking ID and phone number.");
});
