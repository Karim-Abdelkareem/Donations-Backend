import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    goalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    proofImages: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
