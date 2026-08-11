import Admin from "../models/Admin.js";

const PRIMARY_ADMIN_EMAIL = "admin@beautyparlour.local";

export async function ensurePrimarySuperAdmin() {
  const admin = await Admin.findOne({ email: PRIMARY_ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    return null;
  }

  const updates = {};

  if (admin.role !== "SUPER_ADMIN") {
    updates.role = "SUPER_ADMIN";
  }

  if (!admin.isActive) {
    updates.isActive = true;
  }

  if (!Object.keys(updates).length) {
    return admin;
  }

  Object.assign(admin, updates);
  await admin.save();

  console.log(`Primary admin "${PRIMARY_ADMIN_EMAIL}" was synchronized as an active SUPER_ADMIN.`);
  return admin;
}
