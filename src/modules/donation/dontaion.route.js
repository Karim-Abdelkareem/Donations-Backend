import * as donationController from "./donation.controller.js";
import express from "express";
import { protect, restrictTo } from "../../middleware/authorization.js";

const router = express.Router();

router.post("/", donationController.createCampaign);
router.get("/", donationController.getAllCampaigns);
router.get("/admin", donationController.getAllCampaignsAdmin);
router.get(
  "/inactive",
  protect,
  restrictTo("admin"),
  donationController.getAllInactiveCampaigns
);
router.get("/:id", donationController.getSingleCampaign);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  donationController.updateCampaign
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  donationController.deleteCampaign
);
router.patch(
  "/:id/activate",
  protect,
  restrictTo("admin"),
  donationController.activateCampaign
);
router.patch(
  "/:id/deactivate",
  protect,
  restrictTo("admin"),
  donationController.deactivateCampaign
);

export default router;
