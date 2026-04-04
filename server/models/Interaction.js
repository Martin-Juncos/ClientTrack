import mongoose from "mongoose";
import { interactionTypes } from "../../shared/catalogs.js";

const interactionSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: interactionTypes.map((item) => item.value),
      required: true
    },
    occurredAt: {
      type: Date,
      required: true
    },
    summary: {
      type: String,
      trim: true,
      required: true
    },
    clientResponse: {
      type: String,
      trim: true,
      default: ""
    },
    result: {
      type: String,
      trim: true,
      default: ""
    },
    nextActionTitle: {
      type: String,
      trim: true,
      default: ""
    },
    nextActionDueAt: {
      type: Date,
      default: null
    },
    internalNotes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

interactionSchema.index({ opportunityId: 1, occurredAt: -1 });
interactionSchema.index({ institutionId: 1, occurredAt: -1 });

export const Interaction =
  mongoose.models.Interaction ?? mongoose.model("Interaction", interactionSchema);
