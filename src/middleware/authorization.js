// Import required models, utilities and packages
import userModel from "../database/models/user.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { promisify } from "util";

// Middleware to protect routes - Verifies JWT token and user authentication
export const protect = catchAsync(async (req, res, next) => {
  // Extract JWT token from request headers
  let { authorization } = req.headers;
  if (!authorization) {
    next(
      new AppError(
        "You are not logged in. Please log in to access this route.",
        401
      )
    );
  }
  
  // Verify the JWT token using promisified jwt.verify
  const decodedToken = await promisify(jwt.verify)(
    authorization,
    process.env.JWT_SECRET
  );
  
  // Check if user still exists in database
  const user = await userModel.findById(decodedToken.id);
  if (!user) {
    next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  
  // Attach user to request object for use in subsequent middleware
  req.user = user;
  next();
});

// Middleware factory to restrict access based on user roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};
