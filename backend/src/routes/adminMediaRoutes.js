import { Router } from "express";
import { uploadAdminImage } from "../controllers/adminMediaController.js";
import { adminImageUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/upload", adminImageUpload.single("image"), uploadAdminImage);

export default router;
