import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const storage = multer.memoryStorage();

function fileFilter(_req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new ApiError(400, "Only JPG, JPEG, PNG, and WEBP images are allowed."));
    return;
  }

  callback(null, true);
}

export const adminImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});
