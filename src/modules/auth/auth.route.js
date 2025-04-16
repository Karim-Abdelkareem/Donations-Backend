// استيراد وحدات التحكم في المصادقة
import * as authController from "./auth.controller.js";
// استيراد مكتبة إكسبرس
import express from "express";

const router = express.Router();

// تسجيل مستخدم جديد
router.post("/register", authController.register);
// تسجيل الدخول للمستخدم
router.post("/login", authController.login);

// تأكيد البريد الإلكتروني باستخدام الرمز
router.post("/confirm-email/:token", authController.confirmEmail);
// إعادة إرسال رابط تأكيد البريد الإلكتروني
router.post("/resend-confirmation", authController.resendConfirmation);
// طلب إعادة تعيين كلمة المرور المنسية
router.post("/forget-password", authController.forgetPassword);
// إعادة تعيين كلمة المرور باستخدام الرمز
router.post("/reset-password/:token", authController.resetPassword);

export default router;
