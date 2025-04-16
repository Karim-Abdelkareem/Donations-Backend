// استيراد وحدات التحكم في التبرعات العينية
import * as donateController from "./donate.controller.js";
import express from "express";
// استيراد وسائط الحماية وتقييد الصلاحيات
import { protect, restrictTo } from "../../middleware/authorization.js";

// إنشاء موجه جديد
const router = express.Router();

// مسارات إدارة حملات التبرع العيني
router.post("/", protect, donateController.createCampaign); // إنشاء حملة تبرع عيني جديدة
router.get("/", donateController.getAllCampaigns); // عرض جميع الحملات النشطة
router.get("/user", protect, donateController.getUserCampaigns);
router.get("/admin", donateController.getAllCampaignsAdmin); // عرض جميع الحملات للمشرف
router.get(
  "/inactive",
  protect,
  restrictTo("admin"),
  donateController.getAllInactiveCampaigns // عرض الحملات غير النشطة (للمشرف فقط)
);
router.get("/:id", donateController.getSingleCampaign); // عرض حملة محددة

// مسارات خاصة بالمشرف
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  donateController.updateCampaign // تحديث حملة
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin", "user"),
  donateController.deleteCampaign // حذف حملة
);
router.patch(
  "/:id/activate",
  protect,
  restrictTo("admin"),
  donateController.activateCampaign // تفعيل حملة
);
router.patch(
  "/:id/deactivate",
  protect,
  restrictTo("admin"),
  donateController.deactivateCampaign // تعطيل حملة
);

export default router;
