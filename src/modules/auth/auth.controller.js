import userModel from "../../database/models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";

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
  await createUser.save();
  return res.status(201).json({
    status: "success",
    data: {
      user: createUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
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
