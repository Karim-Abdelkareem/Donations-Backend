import mongoose from "mongoose";

const addictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addictions: [
      {
        category: {
          type: String,
          required: true,
          enum: [
            "smoking",
            "alcohol",
            "drugs",
            "gambling",
            "social_media",
            "other",
          ],
        },
        targetDays: {
          type: Number,
          required: true,
          default: function () {
            // Default streak goals for each category
            const goals = {
              smoking: 30,
              alcohol: 90,
              drugs: 90,
              gambling: 60,
              social_media: 30,
              other: 30,
            };
            return goals[this.category] || 30;
          },
        },
        days: [
          {
            type: Date,
            required: true,
          },
        ],
        lastCheckIn: {
          type: Date,
          default: null,
        },
        streak: {
          type: Number,
          default: 0,
        },
        notes: {
          type: String,
        },
        progress: {
          type: Number,
          default: 0,
          get: function () {
            return (this.streak / this.targetDays) * 100;
          },
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

export default mongoose.model("Addiction", addictionSchema);
