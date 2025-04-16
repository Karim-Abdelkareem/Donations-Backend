// استيراد النماذج والأدوات المساعدة
import donationModel from "../../database/models/donation.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";

// دالة لإنشاء رمز فريد للتبرع
const generateDonationCode = () => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DON-${(parseInt(timestamp) + random) % 100000}`.padStart(9, "0");
};

// إنشاء حملة تبرع جديدة
export const createCampaign = catchAsync(async (req, res, next) => {
  const { title, description, goalAmount, category, proofImages } = req.body;

  if (!title || !description || !goalAmount || !category || !proofImages) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const donationCode = generateDonationCode();
  const newCampaign = await donationModel.create({
    user: req.user._id,
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

// الحصول على جميع الحملات النشطة
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

// الحصول على الحملات غير النشطة (للمشرف)
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

// الحصول على حملة محددة
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

// تحديث بيانات حملة
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

// حذف حملة
export const deleteCampaign = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const campaign = await donationModel.findByIdAndDelete(req.params.id);
  if (!campaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// تفعيل حملة
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

// تعطيل حملة
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

// الحصول على جميع الحملات للمشرف
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

export const getUserCampaigns = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new AppError("Please login first", 401));
  const campaigns = await donationModel.find({ user: req.user.id });
  res.status(200).json({
    status: "success",
    results: campaigns.length,
    data: campaigns,
  });
});
