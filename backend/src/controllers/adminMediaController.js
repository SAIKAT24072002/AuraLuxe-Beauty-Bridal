import { getMediaFolder, uploadImageBuffer } from "../services/mediaService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadAdminImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please select an image to upload.");
  }

  const folder = getMediaFolder(req.body.folderKey);
  const result = await uploadImageBuffer({
    buffer: req.file.buffer,
    folder,
    filename: req.file.originalname,
  });

  res.status(201).json({
    success: true,
    data: {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    },
  });
});
