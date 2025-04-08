import express from "express";
import { protect } from "../../middleware/authorization.js";
import {
  getProgress,
  checkIn,
  resetProgress,
  addAddiction,
  removeAddiction,
} from "./addection.controller.js";

const router = express.Router();

router.use(protect);
router.get("/progress", getProgress);
router.post("/checkin", checkIn);
router.post("/reset", resetProgress);
router.post("/add", addAddiction);
router.delete("/remove", removeAddiction);

export default router;
