import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return req.cookies?.adminToken;
}

export const protectAdmin = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not configured.");
  }

  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Admin session expired. Please log in again.");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid admin token.");
    }

    throw error;
  }
  const admin = await Admin.findById(payload.id).select("-password");

  if (!admin || !admin.isActive) {
    throw new ApiError(401, "Admin account is unavailable.");
  }

  req.admin = admin;
  next();
});

export const requireAdmin = protectAdmin;

export function requireSuperAdmin(req, _res, next) {
  if (req.admin?.role !== "SUPER_ADMIN") {
    next(new ApiError(403, "Super admin access is required."));
    return;
  }

  next();
}
