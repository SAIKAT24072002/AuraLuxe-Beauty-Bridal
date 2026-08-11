import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/apiError.js";

const PROJECT_FOLDERS = {
  services: "auraluxe/services",
  bridal: "auraluxe/bridal",
  gallery: "auraluxe/gallery",
  testimonials: "auraluxe/testimonials",
  offers: "auraluxe/offers",
  site: "auraluxe/site",
};

const ALLOWED_MEDIA_FOLDERS = new Set(Object.values(PROJECT_FOLDERS));
let configured = false;

function getCloudinaryConfig() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };
}

function ensureCloudinaryConfigured() {
  if (!isMediaServiceConfigured()) {
    throw new ApiError(
      503,
      "Cloudinary credentials are not configured yet. Media upload setup is pending."
    );
  }

  if (!configured) {
    cloudinary.config(getCloudinaryConfig());
    configured = true;
  }
}

export function isMediaServiceConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function getMediaFolder(folderKey) {
  const folder = PROJECT_FOLDERS[folderKey];
  if (!folder) {
    throw new ApiError(400, "Unsupported media folder requested.");
  }
  return folder;
}

export async function uploadImageBuffer({
  buffer,
  folder,
  filename,
  resourceType = "image",
}) {
  ensureCloudinaryConfigured();

  if (!buffer?.length) {
    throw new ApiError(400, "No upload file was received.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id_prefix: filename
          ? String(filename)
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-z0-9-_]/gi, "-")
              .slice(0, 50)
          : undefined,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(502, "Cloudinary upload failed.", error));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function deleteImageByPublicId(publicId) {
  if (!publicId || !isKnownProjectAsset(publicId) || !isMediaServiceConfigured()) {
    return false;
  }

  ensureCloudinaryConfigured();
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });

  return ["ok", "not found"].includes(result?.result);
}

export function isKnownProjectAsset(publicId) {
  if (!publicId) {
    return false;
  }

  return Array.from(ALLOWED_MEDIA_FOLDERS).some((folder) =>
    String(publicId).startsWith(`${folder}/`)
  );
}

export function createOptimizedImageUrl(url, transformations = "f_auto,q_auto") {
  if (!url || !String(url).includes("/upload/")) {
    return url;
  }

  if (String(url).includes("/upload/f_auto")) {
    return url;
  }

  return String(url).replace("/upload/", `/upload/${transformations}/`);
}

export { PROJECT_FOLDERS };
