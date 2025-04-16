// استيراد المكتبات المطلوبة
import express from "express";
import { protect } from "../../middleware/authorization.js";

// استيراد وحدات التحكم الخاصة بالإدمان
import {
  getProgress,
  checkIn,
  resetProgress,
  addAddiction,
  removeAddiction,
} from "./addection.controller.js";

const router = express.Router();

// تطبيق وسيط الحماية على جميع المسارات
router.use(protect);

// تعريف مسارات API الخاصة بالإدمان
router.get("/progress", getProgress);      // الحصول على تقدم المستخدم
router.post("/checkin", checkIn);          // تسجيل الدخول اليومي
router.post("/reset", resetProgress);      // إعادة تعيين التقدم
router.post("/add", addAddiction);         // إضافة فئة إدمان جديدة
router.delete("/remove", removeAddiction); // حذف فئة إدمان

export default router;
