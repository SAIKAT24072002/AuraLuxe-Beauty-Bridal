import mongoose from "mongoose";
import { GALLERY_CATEGORIES } from "../utils/constants.js";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: String,
    category: {
      type: String,
      enum: GALLERY_CATEGORIES,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;

