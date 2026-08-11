import {
  galleryItems,
  offers,
  openingHours,
  siteMeta,
  stats,
  testimonials,
  trackTimeline,
  whyChooseUs,
} from "../data/mockContent";
import { bookingApiService } from "./bookingApiService";
import { optimizeCloudinaryImage } from "../utils/media";

function normalizeOpeningHours(items = []) {
  if (!items.length) return openingHours;
  return items.map((item) => ({
    day: item.day,
    hours: item.isClosed ? "Closed" : `${item.open || "--"} - ${item.close || "--"}`,
  }));
}

function normalizeSiteMeta(settings) {
  if (!settings) return siteMeta;
  return {
    ...siteMeta,
    ...settings,
    heroSubtitle: settings.heroSubtitle || siteMeta.heroSubtitle,
    heroTitle: settings.heroTitle || siteMeta.heroTitle,
    logo: settings.logo || siteMeta.logo,
    heroImage: settings.heroImage || siteMeta.heroImage,
    aboutImage: settings.aboutImage || siteMeta.aboutImage,
  };
}

function normalizeOffers(items = []) {
  if (!items.length) return offers;
  return items.map((item) => ({
    id: item._id,
    title: item.name,
    description: item.description,
    badge: item.discountType,
    code: item.couponCode || "AUTO",
    discountType: item.discountType,
    discountValue: item.discountValue,
    minimumBookingAmount: Number(item.minimumBookingAmount || 0),
    applicableBookingTypes: item.applicableBookingTypes || ["BEAUTY", "BRIDAL"],
    image: optimizeCloudinaryImage(item.image, { width: 1200, crop: "fill" }),
    validUntil: item.endDate
      ? new Date(item.endDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Ongoing",
  }));
}

function normalizeGallery(items = []) {
  if (!items.length) return galleryItems;
  return items.map((item) => ({
    id: item._id,
    title: item.title,
    category: item.category.replaceAll("_", " "),
    image: optimizeCloudinaryImage(item.imageUrl, { width: 1200, crop: "fill" }),
  }));
}

function normalizeTestimonials(items = []) {
  if (!items.length) return testimonials;
  return items.map((item) => ({
    id: item._id,
    name: item.customerName,
    rating: item.rating,
    service: item.serviceLabel,
    quote: item.review,
    image: optimizeCloudinaryImage(item.image, { width: 320, height: 320, crop: "fill" }),
  }));
}

export const customerContentService = {
  async getSiteMeta() {
    try {
      const response = await bookingApiService.getPublicSiteSettings();
      return normalizeSiteMeta(response.data);
    } catch {
      return siteMeta;
    }
  },
  async getServices() {
    const response = await bookingApiService.getServices();
    return response.items;
  },
  async getServiceCategories() {
    const response = await bookingApiService.getCategories();
    return response.items;
  },
  async getBridalPackages() {
    const response = await bookingApiService.getBridalPackages();
    return response.items;
  },
  async getBridalServices() {
    const response = await bookingApiService.getBridalServices();
    return response.items;
  },
  async getOffers() {
    try {
      const response = await bookingApiService.getPublicOffers();
      return normalizeOffers(response.data || []);
    } catch {
      return offers;
    }
  },
  async getGallery() {
    try {
      const response = await bookingApiService.getPublicGallery();
      return normalizeGallery(response.data || []);
    } catch {
      return galleryItems;
    }
  },
  async getTestimonials() {
    try {
      const response = await bookingApiService.getPublicTestimonials();
      return normalizeTestimonials(response.data || []);
    } catch {
      return testimonials;
    }
  },
  async getOpeningHours() {
    try {
      const response = await bookingApiService.getPublicSiteSettings();
      return normalizeOpeningHours(response.data?.openingHours || []);
    } catch {
      return openingHours;
    }
  },
  async getStats() {
    try {
      const response = await bookingApiService.getPublicSiteSettings();
      return response.data?.stats?.length ? response.data.stats : stats;
    } catch {
      return stats;
    }
  },
  async getWhyChooseUs() {
    try {
      const response = await bookingApiService.getPublicSiteSettings();
      return response.data?.whyChooseUs?.length ? response.data.whyChooseUs : whyChooseUs;
    } catch {
      return whyChooseUs;
    }
  },
  async getTrackTimeline() {
    try {
      const response = await bookingApiService.getPublicSiteSettings();
      return response.data?.trackTimeline?.length ? response.data.trackTimeline : trackTimeline;
    } catch {
      return trackTimeline;
    }
  },
};
