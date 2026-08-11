import Admin from "../models/Admin.js";
import { createAdminToken } from "../utils/createAdminToken.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function attachAuthCookie(res, token) {
  res.cookie("adminToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const setupInitialAdmin = asyncHandler(async (req, res) => {
  if (process.env.ENABLE_ADMIN_SETUP_ROUTE !== "true") {
    throw new ApiError(403, "Admin setup route is disabled.");
  }

  const { setupKey, ...payload } = req.validated.body;
  const adminSetupKey = process.env.ADMIN_SETUP_KEY;

  if (!adminSetupKey) {
    throw new ApiError(500, "ADMIN_SETUP_KEY is not configured.");
  }

  const existingAdminCount = await Admin.countDocuments();
  if (existingAdminCount > 0) {
    throw new ApiError(403, "Initial admin setup is already completed.");
  }

  if (setupKey !== adminSetupKey) {
    throw new ApiError(403, "Invalid admin setup key.");
  }

  const admin = await Admin.create(payload);
  const token = createAdminToken(admin._id);
  attachAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Initial admin created successfully.",
    token,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !admin.isActive) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = createAdminToken(admin._id);
  attachAuthCookie(res, token);

  res.json({
    success: true,
    token,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

export const logoutAdmin = asyncHandler(async (_req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    success: true,
    message: "Admin logged out successfully.",
  });
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
});
