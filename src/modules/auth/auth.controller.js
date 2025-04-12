import userModel from "../../database/models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import {
  sendConfirmationEmail,
  sendResetPasswordEmail,
} from "../../email/email.js";

export const register = catchAsync(async (req, res, next) => {
  const { username, email, password, phone, age, gender } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    return next(new AppError("User already exists", 400));
  }
  const createUser = new userModel({
    username,
    email,
    password,
    phone,
    age,
    gender,
  });
  const token = jwt.sign({ id: createUser._id }, process.env.JWT_SECRET, {
    expiresIn: "20m",
  });

  await sendConfirmationEmail(email, token);

  await createUser.save();
  return res.status(201).json({
    status: "success",
    data: {
      message: "Confirmation email sent to your email",
      user: createUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user.active)
    return next(new AppError("User is not Confirmed Check Your Email", 401));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  res.json({
    status: "success",
    token,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

export const confirmEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) return next(new AppError("Invalid token", 400));

    user.active = true;
    await user.save();

    res.json({ status: "success", message: "Email confirmed" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Token expired, find user by email and resend confirmation
      const user = await userModel.findOne({ active: false });
      if (!user)
        return next(new AppError("Invalid or already activated account", 400));

      // Generate new token
      const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "20m",
      });

      // Resend confirmation email
      await sendConfirmationEmail(user.email, newToken);

      return res.status(401).json({
        status: "error",
        message:
          "Token expired. A new confirmation email has been sent to your email address.",
      });
    }

    return next(new AppError("Invalid token", 400));
  }
});

export const resendConfirmation = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email, active: false });
  if (!user)
    return next(
      new AppError("Invalid email or account already activated", 400)
    );

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "20m",
  });

  await sendConfirmationEmail(user.email, token);

  res.status(200).json({
    status: "success",
    message: "Confirmation email has been resent",
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return next(new AppError("Invalid email", 400));
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "20m",
  });
  await sendResetPasswordEmail(user.email, token);
  res.status(200).json({
    status: "success",
    message: "Reset password email has been sent to your email address",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!token) return next(new AppError("Invalid token", 400));
  if (!password) return next(new AppError("Enter your new password", 400));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userModel.findByIdAndUpdate(
    decoded.id,
    {
      password,
    },
    {
      new: true,
    }
  );
  if (!user) return next(new AppError("Invalid token", 400));
  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully",
    data: user,
  });
});
