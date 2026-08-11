import jwt from "jsonwebtoken";
import { ApiError } from "./apiError.js";

export function createAdminToken(adminId, role = "ADMIN") {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not configured.");
  }

  return jwt.sign({ id: adminId, role }, secret, {
    expiresIn: "7d",
  });
}
