// Import required packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import custom modules and middleware
import dbConnection from "./src/database/dbConnection.js";
import globalErrorHandler from "./src/middleware/globalErrorHandler.js";
import { AppError } from "./src/utils/AppError.js";

// Import route modules
import authRoute from "./src/modules/auth/auth.route.js";
import donationRoute from "./src/modules/donation/dontaion.route.js";
import addictionRoute from "./src/modules/addection/addection.route.js";
import donateRoute from "./src/modules/donate/donate.route.js";

// Initialize Express application
const app = express();

// Configure CORS middleware to allow all origins
app.use(
  cors({
    origin: "*",
  })
);

// Configure middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load environment variables from .env file
dotenv.config();

//Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome To Donation Backend Code!</h1>");
});

// Register API routes
app.use("/api/auth", authRoute);
app.use("/api/donation", donationRoute);
app.use("/api/addiction", addictionRoute);
app.use("/api/donate", donateRoute);

//Undefined Routes Handling
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error Handling Middleware
app.use(globalErrorHandler);

//Database Connection
dbConnection();

//Server Startup
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
