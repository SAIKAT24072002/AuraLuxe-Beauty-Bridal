import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const bridalPackageSchema = new mongoose.Schema(
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
    coverImage: String,
    coverImagePublicId: String,
    galleryImages: {
      type: [String],
      default: [],
    },
    galleryMedia: {
      type: [
        {
          url: String,
          publicId: String,
        },
      ],
      default: [],
    },
    shortDescription: String,
    fullDescription: String,
    includedServices: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    advancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 30,
    },
    homeServiceAvailable: {
      type: Boolean,
      default: true,
    },
    venueServiceAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

bridalPackageSchema.pre("validate", function deriveSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

const BridalPackage = mongoose.model("BridalPackage", bridalPackageSchema);

export default BridalPackage;
