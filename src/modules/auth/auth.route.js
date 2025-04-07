import * as authController from "./auth.controller.js";
import express from "express";

const router = express.Router();

// User Registration
router.post("/register", authController.register);
// User Login
router.post("/login", authController.login);


export default router;
