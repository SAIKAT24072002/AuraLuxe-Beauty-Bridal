import SiteSettings from "../models/SiteSettings.js";
import { cleanupMediaAfterUpdate } from "../utils/mediaCleanup.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSiteSettings = asyncHandler(async (_req, res) => {
  let settings = await SiteSettings.findOne({ key: "default" });
  if (!settings) {
    settings = await SiteSettings.create({ key: "default" });
  }
  res.json({ success: true, data: settings });
});

export const upsertSiteSettings = asyncHandler(async (req, res) => {
  const previous = await SiteSettings.findOne({ key: "default" });
  const settings = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    req.validated.body,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  await cleanupMediaAfterUpdate(
    [previous?.logoPublicId, previous?.heroImagePublicId, previous?.aboutImagePublicId],
    [settings.logoPublicId, settings.heroImagePublicId, settings.aboutImagePublicId]
  );
  res.json({ success: true, data: settings });
});
