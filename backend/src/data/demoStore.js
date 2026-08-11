import { randomUUID } from "node:crypto";
import { calculatePaymentAmounts } from "../utils/calculatePaymentAmounts.js";
import { demoCategories, demoServices } from "./demoServices.js";

const state = {
  appointments: [],
  bookingSequence: 0,
};

export function getDemoServices() {
  return demoServices;
}

export function getDemoCategories() {
  return demoCategories;
}

export function findDemoServiceById(id) {
  return demoServices.find((item) => item._id === id);
}

export function listDemoAppointments(filters = {}) {
  return state.appointments
    .filter((item) => {
      if (filters.bookingStatus && item.bookingStatus !== filters.bookingStatus) return false;
      if (filters.paymentStatus && item.paymentStatus !== filters.paymentStatus) return false;
      if (filters.phone && item.phone !== filters.phone) return false;
      if (filters.search) {
        const haystack = `${item.customerName} ${item.phone} ${item.bookingId}`.toLowerCase();
        if (!haystack.includes(filters.search.toLowerCase())) return false;
      }
      if (filters.date) {
        if (new Date(item.appointmentDate).toDateString() !== new Date(filters.date).toDateString()) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
}

export function findDemoAppointmentById(id) {
  return state.appointments.find((item) => item._id === id);
}

export function findDemoAppointmentForTracking(bookingId, phone) {
  return state.appointments.find(
    (item) => item.bookingId === bookingId && item.phone === phone
  );
}

function nextDemoBookingId() {
  state.bookingSequence += 1;
  return `BEAUTY-${new Date().getFullYear()}-${String(state.bookingSequence).padStart(4, "0")}`;
}

export function createDemoAppointment(payload, service) {
  const slotKey = payload.timeSlot.key || `${payload.timeSlot.start}-${payload.timeSlot.end}`;
  const conflict = state.appointments.find(
    (item) =>
      new Date(item.appointmentDate).toDateString() === new Date(payload.appointmentDate).toDateString() &&
      item.timeSlot.key === slotKey &&
      ["PENDING_PAYMENT", "CONFIRMED", "IN_PROGRESS", "SERVICE_COMPLETED"].includes(
        item.bookingStatus
      )
  );

  if (conflict) {
    return { conflict: true };
  }

  const amounts = calculatePaymentAmounts(service.price, service.advancePercentage);
  const appointment = {
    _id: randomUUID(),
    bookingId: nextDemoBookingId(),
    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,
    service: service._id,
    serviceSnapshot: {
      name: service.name,
      categoryName: service.category.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    },
    appointmentDate: new Date(payload.appointmentDate).toISOString(),
    timeSlot: {
      ...payload.timeSlot,
      key: slotKey,
    },
    numberOfPersons: payload.numberOfPersons || 1,
    notes: payload.notes,
    serviceLocation: payload.serviceLocation || "AT_PARLOUR",
    totalAmount: amounts.totalAmount,
    advancePercentage: amounts.advancePercentage,
    advanceAmount: amounts.advanceAmount,
    remainingAmount: amounts.remainingAmount,
    paymentStatus: "PENDING",
    bookingStatus: "PENDING_PAYMENT",
    couponCode: payload.couponCode,
    paymentRecords: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.appointments.push(appointment);
  return { appointment };
}
