import Availability from "../models/Availability.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudControllers } from "../utils/createCrudControllers.js";

const base = createCrudControllers(Availability);

export const listAvailability = base.list;
export const getAvailabilityById = base.getById;
export const createAvailability = base.create;
export const updateAvailability = base.update;
export const deleteAvailability = base.remove;

export const listPublicAvailability = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.type) {
    query.type = req.query.type;
  }
  const items = await Availability.find(query).sort({ specificDate: 1, dayOfWeek: 1 });
  res.json({ success: true, data: items });
});

