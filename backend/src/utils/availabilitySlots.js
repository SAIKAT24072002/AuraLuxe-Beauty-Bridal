function pad(value) {
  return String(value).padStart(2, "0");
}

function toMinutes(value) {
  const [hour, minute] = String(value).split(":").map(Number);
  return hour * 60 + minute;
}

function toTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

function toLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${pad(minutes)} ${suffix}`;
}

export function generateTimeSlots({
  openingTime = "10:00",
  closingTime = "19:00",
  durationMinutes = 60,
}) {
  const slots = [];
  let current = toMinutes(openingTime);
  const end = toMinutes(closingTime);

  while (current + durationMinutes <= end) {
    const slotEnd = current + durationMinutes;
    const start = toTime(current);
    const endTime = toTime(slotEnd);
    slots.push({
      start,
      end: endTime,
      key: `${start}-${endTime}`,
      label: `${toLabel(current)} - ${toLabel(slotEnd)}`,
    });
    current += durationMinutes;
  }

  return slots;
}
