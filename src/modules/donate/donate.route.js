import * as donateController from "./donate.controller.js";
import express from "express";
import { protect, restrictTo } from "../../middleware/authorization.js";

const router = express.Router();

router.post("/", donateController.createCampaign);
router.get("/", donateController.getAllCampaigns);
router.get("/admin", donateController.getAllCampaignsAdmin);
router.get(
  "/inactive",
  protect,
  restrictTo("admin"),
  donateController.getAllInactiveCampaigns
);
router.get("/:id", donateController.getSingleCampaign);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  donateController.updateCampaign
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  donateController.deleteCampaign
);
router.patch(
  "/:id/activate",
  protect,
  restrictTo("admin"),
  donateController.activateCampaign
);
router.patch(
  "/:id/deactivate",
  protect,
  restrictTo("admin"),
  donateController.deactivateCampaign
);

export default router;
