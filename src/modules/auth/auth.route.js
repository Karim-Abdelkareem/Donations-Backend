import * as authController from "./auth.controller.js";
import express from "express";

const router = express.Router();

// User Registration
router.post("/register", authController.register);
// User Login
router.post("/login", authController.login);

router.post("/confirm-email/:token", authController.confirmEmail);
router.post("/resend-confirmation", authController.resendConfirmation);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password/:token", authController.resetPassword);

export default router;
