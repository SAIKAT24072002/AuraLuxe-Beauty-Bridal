import Appointment from "../models/Appointment.js";
import BridalBooking from "../models/BridalBooking.js";
import ContactMessage from "../models/ContactMessage.js";
import Payment from "../models/Payment.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  const today = new Date("2026-08-11T00:00:00.000Z");
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const nextThirtyDays = new Date(todayEnd);
  nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);

  const [appointments, bridalBookings, messages, payments] = await Promise.all([
    Appointment.find({}).lean(),
    BridalBooking.find({}).lean(),
    ContactMessage.find({}).lean(),
    Payment.find({ verified: true }).lean(),
  ]);

  const upcomingAppointments = appointments.filter((item) => {
    const date = new Date(item.appointmentDate);
    return date > todayEnd && date <= nextThirtyDays;
  });
  const upcomingBridal = bridalBookings.filter((item) => {
    const date = new Date(item.eventDate);
    return date >= todayStart;
  });

  const monthlyMap = new Map();
  [...appointments, ...bridalBookings].forEach((item) => {
    const date = new Date(item.appointmentDate || item.eventDate);
    const key = toMonthKey(date);
    const current = monthlyMap.get(key) || { month: key, beauty: 0, bridal: 0, total: 0 };
    if (item.customerName) current.beauty += 1;
    if (item.brideName) current.bridal += 1;
    current.total += 1;
    monthlyMap.set(key, current);
  });

  const revenueMap = new Map();
  payments.forEach((item) => {
    const date = new Date(item.paidAt || item.createdAt);
    const key = toMonthKey(date);
    const current = revenueMap.get(key) || { month: key, revenue: 0 };
    current.revenue += Number(item.amount || item.amountPaid || 0);
    revenueMap.set(key, current);
  });

  res.json({
    success: true,
    data: {
      cards: {
        todaysAppointments: appointments.filter((item) => {
          const date = new Date(item.appointmentDate);
          return date >= todayStart && date <= todayEnd;
        }).length,
        upcomingAppointments: upcomingAppointments.length,
        upcomingBridalBookings: upcomingBridal.length,
        pendingPayments: [...appointments, ...bridalBookings].filter((item) =>
          ["PENDING", "PARTIALLY_PAID", "ADVANCE_PAID"].includes(item.paymentStatus)
        ).length,
        advanceCollected: payments
          .filter((item) => item.paymentStage === "ADVANCE")
          .reduce((sum, item) => sum + Number(item.amount || item.amountPaid || 0), 0),
        remainingReceivable: [...appointments, ...bridalBookings].reduce(
          (sum, item) =>
            ["PAID", "FULLY_PAID"].includes(item.paymentStatus)
              ? sum
              : sum + Number(item.remainingAmount || 0),
          0
        ),
        completedServices: [...appointments, ...bridalBookings].filter((item) =>
          ["SERVICE_COMPLETED", "FULLY_PAID"].includes(item.bookingStatus)
        ).length,
        unreadMessages: messages.filter((item) => item.status === "UNREAD").length,
      },
      charts: {
        monthlyBookings: Array.from(monthlyMap.values()).sort((a, b) =>
          a.month.localeCompare(b.month)
        ),
        revenueOverview: Array.from(revenueMap.values()).sort((a, b) =>
          a.month.localeCompare(b.month)
        ),
        bookingMix: {
          beauty: appointments.length,
          bridal: bridalBookings.length,
        },
      },
    },
  });
});
