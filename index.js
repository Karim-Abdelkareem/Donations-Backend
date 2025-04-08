import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnection from "./src/database/dbConnection.js";
import globalErrorHandler from "./src/middleware/globalErrorHandler.js";
import { AppError } from "./src/utils/AppError.js";

import authRoute from "./src/modules/auth/auth.route.js";
import donationRoute from "./src/modules/donation/dontaion.route.js";
import addictionRoute from "./src/modules/addection/addection.route.js";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

//Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome To Donation Backend Code!</h1>");
});
app.use("/api/auth", authRoute);
app.use("/api/donation", donationRoute);
app.use("/api/addiction", addictionRoute);

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
