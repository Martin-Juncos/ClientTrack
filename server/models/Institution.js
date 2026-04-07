import mongoose from "mongoose";
import { institutionTypes } from "../../shared/catalogs.js";

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    x: { type: String, trim: true, default: "" },
    tiktok: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" }
  },
  { _id: true }
);

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: institutionTypes.map((item) => item.value),
      required: true
    },
    city: {
      type: String,
      trim: true,
      default: ""
    },
    province: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    leadSource: {
      type: String,
      trim: true,
      default: ""
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    responsibleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    socials: {
      type: socialLinksSchema,
      default: () => ({})
    },
    primaryContact: {
      type: contactSchema,
      required: true
    },
    additionalContacts: {
      type: [contactSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

institutionSchema.index({ name: 1 });
institutionSchema.index({ type: 1 });
institutionSchema.index({ phone: 1 });
institutionSchema.index({ "primaryContact.email": 1 });
institutionSchema.index({ "primaryContact.phone": 1 });
institutionSchema.index({ "additionalContacts.email": 1 });
institutionSchema.index({ "additionalContacts.phone": 1 });

export const Institution =
  mongoose.models.Institution ?? mongoose.model("Institution", institutionSchema);
