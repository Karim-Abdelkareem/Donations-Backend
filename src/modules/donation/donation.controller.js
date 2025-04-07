import donationModel from "../../database/models/donation.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";

const generateDonationCode = () => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DON-${(parseInt(timestamp) + random) % 100000}`.padStart(9, "0");
};

export const createCampaign = catchAsync(async (req, res, next) => {
  const { title, description, goalAmount, category, proofImages } = req.body;
  console.log(req.body);

  if (!title || !description || !goalAmount || !category || !proofImages) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const donationCode = generateDonationCode();
  const newCampaign = await donationModel.create({
    donationCode,
    title,
    description,
    goalAmount,
    category,
    proofImages,
  });

  res.status(201).json({
    status: "success",
    data: {
      campaign: newCampaign,
    },
  });
});

export const getAllCampaigns = catchAsync(async (req, res, next) => {
  const campaigns = await donationModel.find({ status: "active" });
  res.status(200).json({
    status: "success",
    results: campaigns.length,
    data: {
      campaigns,
    },
  });
});

export const getAllInactiveCampaigns = catchAsync(async (req, res, next) => {
  const campaigns = await donationModel.find({ status: "inactive" });
  res.status(200).json({
    status: "success",
    results: campaigns.length,
    data: {
      campaigns,
    },
  });
});

export const getSingleCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donationModel.findById(req.params.id);
  if (!campaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      campaign,
    },
  });
});

export const updateCampaign = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    goalAmount,
    currentAmount,
    category,
    proofImages,
  } = req.body;

  const updatedCampaign = await donationModel.findByIdAndUpdate(
    req.params.id,
    { title, description, goalAmount, currentAmount, category, proofImages },
    { new: true, runValidators: true }
  );

  if (!updatedCampaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      campaign: updatedCampaign,
    },
  });
});

export const deleteCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donationModel.findByIdAndDelete(req.params.id);
  if (!campaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const activateCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donationModel.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true, runValidators: true }
  );
  if (!campaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      campaign,
    },
  });
});

export const deactivateCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donationModel.findByIdAndUpdate(
    req.params.id,
    { status: "inactive" },
    { new: true, runValidators: true }
  );
  if (!campaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      campaign,
    },
  });
});

export const getAllCampaignsAdmin = catchAsync(async (req, res, next) => {
  const campaigns = await donationModel.find();
  res.status(200).json({
    status: "success",
    results: campaigns.length,
    data: {
      campaigns,
    },
  });
});
