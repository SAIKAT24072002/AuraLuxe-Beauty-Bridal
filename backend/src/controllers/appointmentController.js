import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import { isDatabaseConnected } from "../config/database.js";
import {
  createDemoAppointment,
  findDemoAppointmentById,
  findDemoServiceById,
  listDemoAppointments,
} from "../data/demoStore.js";
import { resolveCouponAdjustedPricing } from "../services/couponService.js";
import { createNotification } from "../services/notificationService.js";
import {
  enrichBeautySlots,
  getAvailabilityRule,
  isDateBlocked,
} from "../services/availabilityRuleService.js";
import { getSocketServer } from "../socket/index.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function buildAvailabilityResponse(service, rule, bookedSlots = []) {
  const slots = enrichBeautySlots(service.durationMinutes, rule, bookedSlots);

  return {
    date: null,
    slots,
    openingTime: rule?.openingTime || "10:00",
    closingTime: rule?.closingTime || "19:00",
  };
}

function emitAppointmentEvent(eventName, payload) {
  const io = getSocketServer();
  if (io) {
    io.to("admins").emit(eventName, payload);
  }
}

export const createAppointment = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const service = isDatabaseConnected()
    ? await Service.findById(payload.service).populate("category")
    : findDemoServiceById(payload.service);

  if (!service || !service.isAvailable) {
    throw new ApiError(404, "Selected service is unavailable.");
  }

  if (!isDatabaseConnected()) {
    const result = createDemoAppointment(payload, service);
    if (result.conflict) {
      throw new ApiError(409, "This appointment slot is already booked.");
    }

    await createNotification({
      type: "NEW_APPOINTMENT",
      title: "New beauty booking",
      message: `${result.appointment.customerName} booked ${service.name} on ${result.appointment.timeSlot.label}.`,
      relatedModel: "Appointment",
      relatedId: String(result.appointment._id),
    });
    emitAppointmentEvent("booking:new", {
      bookingType: "BEAUTY",
      bookingId: result.appointment.bookingId,
      bookingStatus: result.appointment.bookingStatus,
      paymentStatus: result.appointment.paymentStatus,
    });

    res.status(201).json({
      success: true,
      data: result.appointment,
      meta: { source: "demo-fallback", paymentReady: false },
    });
    return;
  }

  const pricing = await resolveCouponAdjustedPricing({
    couponCode: payload.couponCode,
    bookingType: "BEAUTY",
    serviceId: service._id,
    originalAmount: service.price,
    advancePercentage: service.advancePercentage,
  });

  const appointment = await Appointment.create({
    ...payload,
    appointmentDate: new Date(payload.appointmentDate),
    timeSlot: {
      ...payload.timeSlot,
      key:
        payload.timeSlot.key ||
        `${payload.timeSlot.start}-${payload.timeSlot.end}`,
    },
    couponCode: pricing.couponCode || undefined,
    discountType: pricing.discountType,
    discountValue: pricing.discountValue,
    discountAmount: pricing.discountAmount,
    originalAmount: pricing.originalAmount,
    finalAmount: pricing.finalAmount,
    totalAmount: pricing.finalAmount,
    advancePercentage: pricing.advancePercentage,
    serviceSnapshot: {
      name: service.name,
      categoryName: service.category?.name || "",
      price: service.price,
      durationMinutes: service.durationMinutes,
    },
  }).catch((error) => {
    if (error?.code === 11000) {
      throw new ApiError(409, "This appointment slot is already booked.");
    }
    throw error;
  });

  await createNotification({
    type: "NEW_APPOINTMENT",
    title: "New beauty booking",
    message: `${appointment.customerName} booked ${service.name} on ${appointment.timeSlot.label}.`,
    relatedModel: "Appointment",
    relatedId: String(appointment._id),
  });
  emitAppointmentEvent("booking:new", {
    bookingType: "BEAUTY",
    bookingId: appointment.bookingId,
    bookingStatus: appointment.bookingStatus,
    paymentStatus: appointment.paymentStatus,
  });

  res.status(201).json({ success: true, data: appointment });
});

export const getAppointmentAvailability = asyncHandler(async (req, res) => {
  const { serviceId, date } = req.query;
  if (!serviceId || !date) {
    throw new ApiError(400, "serviceId and date are required.");
  }

  const service = isDatabaseConnected()
    ? await Service.findById(serviceId)
    : findDemoServiceById(serviceId);

  if (!service || !service.isAvailable) {
    throw new ApiError(404, "Selected service is unavailable.");
  }

  let bookedSlots = [];
  const rule = isDatabaseConnected() ? await getAvailabilityRule("BEAUTY", date) : null;

  if (rule && isDateBlocked(rule, date)) {
    res.json({
      success: true,
      data: {
        date,
        slots: [],
        openingTime: rule.openingTime || "10:00",
        closingTime: rule.closingTime || "19:00",
        blocked: true,
      },
      meta: { source: "database" },
    });
    return;
  }

  if (isDatabaseConnected()) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: start, $lt: end },
      bookingStatus: {
        $in: ["PENDING_PAYMENT", "CONFIRMED", "IN_PROGRESS", "SERVICE_COMPLETED"],
      },
    }).select("timeSlot");

    bookedSlots = appointments.map((item) => item.timeSlot.key);
  } else {
    bookedSlots = listDemoAppointments({ date }).map((item) => item.timeSlot.key);
  }

  const availability = buildAvailabilityResponse(service, rule, bookedSlots);
  availability.date = date;
  res.json({
    success: true,
    data: availability,
    meta: { source: isDatabaseConnected() ? "database" : "demo-fallback" },
  });
});

export const listAppointments = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    const appointments = listDemoAppointments({
      status: req.query.status,
      bookingStatus: req.query.status,
      paymentStatus: req.query.paymentStatus,
      phone: req.query.phone,
      date: req.query.date,
      search: req.query.search,
    });
    res.json({ success: true, data: appointments, meta: { source: "demo-fallback" } });
    return;
  }

  const query = {};
  if (req.query.status) query.bookingStatus = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  if (req.query.phone) query.phone = req.query.phone;
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    query.appointmentDate = { $gte: date, $lt: nextDate };
  }
  if (req.query.search) {
    query.$or = [
      { customerName: { $regex: req.query.search, $options: "i" } },
      { bookingId: { $regex: req.query.search, $options: "i" } },
      { phone: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const appointments = await Appointment.find(query)
    .populate("service paymentRecords")
    .sort({ appointmentDate: 1, "timeSlot.start": 1 });

  res.json({ success: true, data: appointments });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    const appointment = findDemoAppointmentById(req.params.id);
    if (!appointment) {
      throw new ApiError(404, "Appointment not found.");
    }
    res.json({ success: true, data: appointment, meta: { source: "demo-fallback" } });
    return;
  }

  const appointment = await Appointment.findById(req.params.id).populate(
    "service paymentRecords"
  );

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  res.json({ success: true, data: appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.validated.body,
    { new: true, runValidators: true }
  );

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  emitAppointmentEvent("booking:status-updated", {
    bookingType: "BEAUTY",
    bookingId: appointment.bookingId,
    bookingStatus: appointment.bookingStatus,
    paymentStatus: appointment.paymentStatus,
  });

  res.json({ success: true, data: appointment });
});
