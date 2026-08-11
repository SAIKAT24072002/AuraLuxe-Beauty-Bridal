import Availability from "../models/Availability.js";
import { generateTimeSlots } from "../utils/availabilitySlots.js";
import { buildBridalTimeSlots, timeToMinutes } from "../utils/bridalAvailability.js";

function isSameDate(left, right) {
  if (!left || !right) return false;
  return new Date(left).toDateString() === new Date(right).toDateString();
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export async function getAvailabilityRule(type, targetDate) {
  const date = new Date(targetDate);
  const dayOfWeek = date.getDay();

  const items = await Availability.find({
    type,
    isActive: true,
    $or: [
      { specificDate: { $exists: false } },
      { specificDate: null },
      { specificDate: date },
      { availableDays: dayOfWeek },
      { dayOfWeek },
    ],
  }).sort({ specificDate: -1, updatedAt: -1 });

  const exactDateRule = items.find((item) => isSameDate(item.specificDate, date));
  const generalRule =
    items.find((item) => item.availableDays?.includes(dayOfWeek)) ||
    items.find((item) => item.dayOfWeek === dayOfWeek) ||
    items.find((item) => !item.specificDate);

  return exactDateRule || generalRule || null;
}

export function isDateBlocked(rule, targetDate) {
  if (!rule) return false;
  const date = new Date(targetDate);

  if (rule.specificDate && isSameDate(rule.specificDate, date) && rule.openingTime === "BLOCKED") {
    return true;
  }

  return (rule.blockedDates || []).some((item) => isSameDate(item.date, date));
}

export function enrichBeautySlots(serviceDurationMinutes, rule, bookedSlots = []) {
  const baseSlots =
    rule?.individualSlots?.length
      ? rule.individualSlots.map((slot) => ({
          ...slot.toObject?.() || slot,
          key: `${slot.start}-${slot.end}`,
          label: `${slot.start} - ${slot.end}`,
        }))
      : generateTimeSlots({
          openingTime: rule?.openingTime || "10:00",
          closingTime: rule?.closingTime || "19:00",
          durationMinutes: serviceDurationMinutes,
        });

  return baseSlots.map((slot) => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    const blocked = (rule?.blockedTimeSlots || []).find((item) =>
      overlaps(slotStart, slotEnd, timeToMinutes(item.start), timeToMinutes(item.end))
    );

    return {
      ...slot,
      isAvailable: !blocked && !bookedSlots.includes(slot.key) && slot.isAvailable !== false,
      conflictReason: blocked?.reason,
    };
  });
}

export function enrichBridalSlots(durationMinutes, rule, booked = []) {
  const baseSlots =
    rule?.individualSlots?.length
      ? rule.individualSlots.map((slot) => ({
          key: slot.start,
          start: slot.start,
          end: slot.end,
          label: `${slot.start} - ${slot.end}`,
          isAvailable: slot.isAvailable !== false,
        }))
      : buildBridalTimeSlots(durationMinutes);

  return baseSlots.map((slot) => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    const blocked = (rule?.blockedTimeSlots || []).find((item) =>
      overlaps(slotStart, slotEnd, timeToMinutes(item.start), timeToMinutes(item.end))
    );
    const conflict = booked.find((booking) =>
      overlaps(slotStart, slotEnd, booking.startTimeMinutes, booking.endTimeMinutes)
    );

    return {
      ...slot,
      isAvailable: !blocked && !conflict && slot.isAvailable !== false,
      conflictReason:
        blocked?.reason || (conflict ? `Booked for ${conflict.brideName || "another bride"}` : undefined),
    };
  });
}
