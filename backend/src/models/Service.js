import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    shortDescription: String,
    description: String,
    image: String,
    imagePublicId: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
    advancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

serviceSchema.pre("validate", function deriveSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;
