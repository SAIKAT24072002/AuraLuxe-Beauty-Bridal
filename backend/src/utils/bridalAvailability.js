const defaultStartTimes = [
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
];

export function timeToMinutes(value) {
  if (!value) return 0;
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hrs}:${mins}`;
}

export function formatTimeLabel(value) {
  if (!value) return "--";
  const minutes = timeToMinutes(value);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
}

export function buildBridalTimeSlots(durationMinutes = 240) {
  return defaultStartTimes.map((start) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = startMinutes + durationMinutes;
    const end = minutesToTime(endMinutes);
    return {
      key: start,
      start,
      end,
      startLabel: formatTimeLabel(start),
      endLabel: formatTimeLabel(end),
      label: `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`,
    };
  });
}

export function hasBridalTimeConflict(candidateStart, candidateEnd, booking) {
  if (!booking) return false;
  const existingStart = Number(booking.startTimeMinutes || 0);
  const existingEnd = Number(booking.endTimeMinutes || existingStart);
  return candidateStart < existingEnd && existingStart < candidateEnd;
}
