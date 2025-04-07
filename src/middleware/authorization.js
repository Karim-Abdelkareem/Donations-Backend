import userModel from "../database/models/user.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { promisify } from "util";

export const protect = catchAsync(async (req, res, next) => {
  let { authorization } = req.headers;
  if (!authorization) {
    next(
      new AppError(
        "You are not logged in. Please log in to access this route.",
        401
      )
    );
  }
  const decodedToken = await promisify(jwt.verify)(
    authorization,
    process.env.JWT_SECRET
  );
  const user = await userModel.findById(decodedToken.id);
  if (!user) {
    next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};
