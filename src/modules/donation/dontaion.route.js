// استيراد وحدات التحكم في التبرعات
import * as donationController from "./donation.controller.js";
import express from "express";
// استيراد وسائط الحماية وتقييد الصلاحيات
import { protect, restrictTo } from "../../middleware/authorization.js";

// إنشاء موجه جديد
const router = express.Router();

// مسارات إدارة حملات التبرع
router.post("/", protect, donationController.createCampaign); // إنشاء حملة تبرع جديدة
router.get("/", donationController.getAllCampaigns); // عرض جميع الحملات النشطة
router.get("/user", protect, donationController.getUserCampaigns);
router.get("/admin", donationController.getAllCampaignsAdmin); // عرض جميع الحملات للمشرف
router.get(
  "/inactive",
  protect,
  restrictTo("admin"),
  donationController.getAllInactiveCampaigns // عرض الحملات غير النشطة (للمشرف فقط)
);
router.get("/:id", donationController.getSingleCampaign); // عرض حملة محددة

// مسارات خاصة بالمشرف
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  donationController.updateCampaign // تحديث حملة
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin", "user"),
  donationController.deleteCampaign // حذف حملة
);
router.patch(
  "/:id/activate",
  protect,
  restrictTo("admin"),
  donationController.activateCampaign // تفعيل حملة
);
router.patch(
  "/:id/deactivate",
  protect,
  restrictTo("admin"),
  donationController.deactivateCampaign // تعطيل حملة
);

export default router;
