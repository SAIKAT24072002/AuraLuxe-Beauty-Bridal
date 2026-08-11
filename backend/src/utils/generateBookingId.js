import Counter from "../models/Counter.js";
import { isDatabaseConnected } from "../config/database.js";

const inMemoryCounters = new Map();

export async function generateBookingId(prefix, date = new Date()) {
  if (!isDatabaseConnected()) {
    const year = date.getFullYear();
    const key = `${prefix}-${year}`;
    const current = (inMemoryCounters.get(key) || 0) + 1;
    inMemoryCounters.set(key, current);
    return `${prefix}-${year}-${String(current).padStart(4, "0")}`;
  }

  const year = date.getFullYear();
  const counterKey = `${prefix}-${year}`;
  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `${prefix}-${year}-${String(counter.sequence).padStart(4, "0")}`;
}
