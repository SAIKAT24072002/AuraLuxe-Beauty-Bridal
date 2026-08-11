import { Router } from "express";
import { getDatabaseStatus } from "../config/database.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "API healthy",
    timestamp: new Date().toISOString(),
    database: getDatabaseStatus(),
  });
});

export default router;
