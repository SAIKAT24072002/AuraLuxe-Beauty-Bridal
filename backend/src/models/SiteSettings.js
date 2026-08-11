import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    businessName: String,
    logo: String,
    logoPublicId: String,
    heroTitle: String,
    heroSubtitle: String,
    heroDescription: String,
    heroPrimaryCta: String,
    heroSecondaryCta: String,
    heroImage: String,
    heroImagePublicId: String,
    aboutTitle: String,
    aboutText: String,
    aboutImage: String,
    aboutImagePublicId: String,
    footerText: String,
    phone: String,
    whatsapp: String,
    email: String,
    address: String,
    googleMapsUrl: String,
    openingHours: {
      type: [
        {
          day: String,
          open: String,
          close: String,
          isClosed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
    googleMapsEmbed: String,
    whyChooseUs: {
      type: [String],
      default: [],
    },
    stats: {
      type: [
        {
          label: String,
          value: String,
        },
      ],
      default: [],
    },
    trackTimeline: {
      type: [String],
      default: [],
    },
    facebookUrl: String,
    instagramUrl: String,
    youtubeUrl: String,
    bookingNoticePeriod: String,
    defaultAdvancePercentage: Number,
    cancellationPolicy: String,
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
