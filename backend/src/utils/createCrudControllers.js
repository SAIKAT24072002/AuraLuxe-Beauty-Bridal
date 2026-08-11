import { ApiError } from "./apiError.js";
import { asyncHandler } from "./asyncHandler.js";

export function createCrudControllers(Model, options = {}) {
  const {
    createTransform,
    updateTransform,
    queryBuilder,
    defaultSort = "-createdAt",
    populate = "",
  } = options;

  return {
    list: asyncHandler(async (req, res) => {
      const query = queryBuilder ? queryBuilder(req) : {};
      const items = await Model.find(query).populate(populate).sort(defaultSort);
      res.json({ success: true, data: items });
    }),

    getById: asyncHandler(async (req, res) => {
      const item = await Model.findById(req.params.id).populate(populate);
      if (!item) {
        throw new ApiError(404, "Resource not found.");
      }
      res.json({ success: true, data: item });
    }),

    create: asyncHandler(async (req, res) => {
      const payload = createTransform ? await createTransform(req) : req.body;
      const item = await Model.create(payload);
      res.status(201).json({ success: true, data: item });
    }),

    update: asyncHandler(async (req, res) => {
      const payload = updateTransform ? await updateTransform(req) : req.body;
      const item = await Model.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      }).populate(populate);

      if (!item) {
        throw new ApiError(404, "Resource not found.");
      }

      res.json({ success: true, data: item });
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        throw new ApiError(404, "Resource not found.");
      }
      res.json({ success: true, message: "Deleted successfully." });
    }),
  };
}

