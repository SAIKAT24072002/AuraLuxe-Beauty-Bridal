import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import { connectDatabase } from "../config/database.js";

dotenv.config();

async function seedAdmin() {
  const { ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, ADMIN_SEED_PHONE } =
    process.env;

  if (!ADMIN_SEED_NAME || !ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
    console.error(
      "Missing ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, or ADMIN_SEED_PASSWORD in environment."
    );
    process.exit(1);
  }

  await connectDatabase();

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is required to seed the initial admin.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: ADMIN_SEED_EMAIL });
  if (existing) {
    console.log("Admin already exists for this email.");
    process.exit(0);
  }

  const admin = await Admin.create({
    name: ADMIN_SEED_NAME,
    email: ADMIN_SEED_EMAIL,
    password: ADMIN_SEED_PASSWORD,
    phone: ADMIN_SEED_PHONE,
    role: "SUPER_ADMIN",
    isActive: true,
  });

  console.log(`Admin created successfully: ${admin.email}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Admin seed failed:", error.message);
  process.exit(1);
});
