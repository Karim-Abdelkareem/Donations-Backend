// استيراد النماذج والأدوات المساعدة
import donateModel from "../../database/models/donate.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";

// دالة لإنشاء رمز فريد للتبرع العيني
const generateDonationCode = () => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DON-${(parseInt(timestamp) + random) % 100000}`.padStart(9, "0");
};

// إنشاء حملة تبرع عيني جديدة
export const createCampaign = catchAsync(async (req, res, next) => {
  const { title, description, phone, proofImages } = req.body;

  if (!title || !description || !phone || !proofImages) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const donateCode = generateDonationCode();
  const newCampaign = await donateModel.create({
    user: req.user._id,
    donateCode,
    title,
    description,
    phone,
    proofImages,
  });

  res.status(201).json({
    status: "success",
    data: {
      campaign: newCampaign,
    },
  });
});

// الحصول على جميع حملات التبرع العيني النشطة
export const getAllCampaigns = catchAsync(async (req, res, next) => {
  const campaigns = await donateModel.find({ status: "active" });
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
  const campaigns = await donateModel.find({ status: "inactive" });
  res.status(200).json({
    status: "success",
    results: campaigns.length,
    data: {
      campaigns,
    },
  });
});

// الحصول على حملة تبرع عيني محددة
export const getSingleCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donateModel.findById(req.params.id);
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

// تحديث بيانات حملة تبرع عيني
export const updateCampaign = catchAsync(async (req, res, next) => {
  const { title, description, phone, proofImages } = req.body;

  const updatedCampaign = await donateModel.findByIdAndUpdate(
    req.params.id,
    { title, description, phone, proofImages },
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

// حذف حملة تبرع عيني
export const deleteCampaign = catchAsync(async (req, res, next) => {
  console.log(req.params.id);

  const campaign = await donateModel.findByIdAndDelete(req.params.id);
  if (!campaign) {
    return next(new AppError("No campaign found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// تفعيل حملة تبرع عيني
export const activateCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donateModel.findByIdAndUpdate(
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

// تعطيل حملة تبرع عيني
export const deactivateCampaign = catchAsync(async (req, res, next) => {
  const campaign = await donateModel.findByIdAndUpdate(
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

// الحصول على جميع حملات التبرع العيني للمشرف
export const getAllCampaignsAdmin = catchAsync(async (req, res, next) => {
  const campaigns = await donateModel.find();
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
  const campaigns = await donateModel.find({ user: req.user.id });
  res.status(200).json({
    status: "success",
    results: campaigns.length,
    data: campaigns,
  });
});
