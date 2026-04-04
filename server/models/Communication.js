import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    channel: {
      type: String,
      enum: ["email", "whatsapp"],
      required: true,
      index: true
    },
    direction: {
      type: String,
      enum: ["outbound"],
      default: "outbound"
    },
    status: {
      type: String,
      enum: ["sent", "opened"],
      required: true,
      index: true
    },
    subject: {
      type: String,
      trim: true,
      default: ""
    },
    body: {
      type: String,
      trim: true,
      required: true
    },
    targetName: {
      type: String,
      trim: true,
      default: ""
    },
    targetRole: {
      type: String,
      trim: true,
      default: ""
    },
    targetEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    targetPhone: {
      type: String,
      trim: true,
      default: ""
    },
    provider: {
      type: String,
      trim: true,
      default: ""
    },
    externalId: {
      type: String,
      trim: true,
      default: ""
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

communicationSchema.index({ institutionId: 1, sentAt: -1 });
communicationSchema.index({ opportunityId: 1, sentAt: -1 });

export const Communication =
  mongoose.models.Communication ?? mongoose.model("Communication", communicationSchema);
