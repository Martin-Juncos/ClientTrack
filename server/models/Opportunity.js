import mongoose from "mongoose";
import {
  interestLevels,
  opportunityStates,
  priorityOptions,
  solutionTypes
} from "../../shared/catalogs.js";

const nextActionSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    dueAt: { type: Date, default: null },
    responsibleId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sourceType: {
      type: String,
      enum: ["task", "interaction", ""],
      default: ""
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId, default: null }
  },
  { _id: false }
);

const opportunitySchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true
    },
    responsibleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    solutionType: {
      type: String,
      enum: solutionTypes.map((item) => item.value),
      required: true
    },
    status: {
      type: String,
      enum: opportunityStates.map((item) => item.value),
      default: "new_lead",
      index: true
    },
    interestLevel: {
      type: String,
      enum: interestLevels.map((item) => item.value),
      default: "warm"
    },
    priority: {
      type: String,
      enum: priorityOptions.map((item) => item.value),
      default: "medium",
      index: true
    },
    estimatedBudget: {
      type: Number,
      default: null
    },
    estimatedCloseDate: {
      type: Date,
      default: null
    },
    winProbability: {
      type: Number,
      default: 25
    },
    needSummary: {
      type: String,
      trim: true,
      default: ""
    },
    problemStatement: {
      type: String,
      trim: true,
      default: ""
    },
    currentSystem: {
      type: String,
      trim: true,
      default: ""
    },
    objections: {
      type: String,
      trim: true,
      default: ""
    },
    commercialNotes: {
      type: String,
      trim: true,
      default: ""
    },
    nextActionSnapshot: {
      type: nextActionSnapshotSchema,
      default: () => ({})
    },
    lastInteractionAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

opportunitySchema.index({ status: 1, priority: 1 });
opportunitySchema.index({ responsibleId: 1, estimatedCloseDate: 1 });
opportunitySchema.index({ "nextActionSnapshot.dueAt": 1 });
opportunitySchema.index({ lastInteractionAt: -1 });

export const Opportunity =
  mongoose.models.Opportunity ?? mongoose.model("Opportunity", opportunitySchema);
