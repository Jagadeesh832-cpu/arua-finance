import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["info", "warning", "critical", "success"],
      default: "info"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    relatedFeature: {
      type: String,
      enum: [
        "expense",
        "budget",
        "category_budget",
        "anomaly",
        "daily_spending",
        "goal",
        "report",
        "health_score",
        "ai_recommendation",
        "system"
      ],
      default: "expense"
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    bufferCommands: false
  }
);

// Compound indexes for fast user-specific query and sorting
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification =
  mongoose.models.notifications ||
  mongoose.model("notifications", notificationSchema);

export default Notification;
