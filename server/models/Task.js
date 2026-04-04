import mongoose from "mongoose";
import { priorityOptions, taskStatuses } from "../../shared/catalogs.js";

const taskSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      default: null,
      index: true
    },
    responsibleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      required: true
    },
    priority: {
      type: String,
      enum: priorityOptions.map((item) => item.value),
      default: "medium"
    },
    dueAt: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: taskStatuses.map((item) => item.value),
      default: "pending",
      index: true
    },
    comment: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ status: 1, dueAt: 1 });

export const Task = mongoose.models.Task ?? mongoose.model("Task", taskSchema);
