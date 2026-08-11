import { deleteImageByPublicId } from "../services/mediaService.js";

function toArray(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

export function collectPublicIds(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectPublicIds(item));
  }

  if (typeof value === "object") {
    return collectPublicIds(value.publicId);
  }

  return [String(value)];
}

export async function cleanupMediaAfterUpdate(previousValues, nextValues) {
  const before = toArray(collectPublicIds(previousValues));
  const after = new Set(toArray(collectPublicIds(nextValues)));
  const staleAssets = before.filter((publicId) => !after.has(publicId));

  await Promise.all(staleAssets.map((publicId) => deleteImageByPublicId(publicId)));
}

export async function cleanupMediaAfterDelete(values) {
  const ids = toArray(collectPublicIds(values));
  await Promise.all(ids.map((publicId) => deleteImageByPublicId(publicId)));
}
