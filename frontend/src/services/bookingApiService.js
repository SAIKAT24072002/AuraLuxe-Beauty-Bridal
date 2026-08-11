import apiClient from "./apiClient";
import {
  bridalPackages as fallbackBridalPackages,
  bridalServices as fallbackBridalServices,
  serviceCategories as fallbackCategories,
  services as fallbackServices,
} from "../data/mockContent";

function mapService(item) {
  const fallbackIdMap = {
    "svc-1": "66b710000000000000000001",
    "svc-2": "66b710000000000000000002",
    "svc-3": "66b710000000000000000003",
    "svc-4": "66b710000000000000000004",
    "svc-5": "66b710000000000000000005",
    "svc-6": "66b710000000000000000006",
  };

  return {
    id: item._id || fallbackIdMap[item.id] || item.id,
    name: item.name,
    category: item.category?.name || item.category,
    categoryId: item.category?._id || item.categoryId,
    description: item.description || item.shortDescription || "",
    price: item.price,
    durationMinutes:
      item.durationMinutes || Number(String(item.duration || "0").replace(/\D/g, "")),
    duration: `${item.durationMinutes || Number(String(item.duration || "0").replace(/\D/g, ""))} min`,
    image: item.image,
    imagePublicId: item.imagePublicId,
    advancePercentage: item.advancePercentage ?? 50,
    popular: Boolean(item.featured || item.popular),
  };
}

function formatDurationMinutes(value) {
  const minutes = Number(value || 0);
  if (!minutes) return "0 min";
  if (minutes % 60 === 0) return `${minutes / 60} hours`;
  if (minutes > 60) return `${(minutes / 60).toFixed(1)} hours`;
  return `${minutes} min`;
}

function mapBridalPackage(item) {
  return {
    id: item._id || item.id,
    slug: item.slug || item.id,
    name: item.name,
    tagline: item.shortDescription || item.tagline || "",
    price: item.price,
    discountPrice: item.discountPrice || item.price,
    durationMinutes: item.durationMinutes || 0,
    duration: item.duration || formatDurationMinutes(item.durationMinutes),
    advancePercentage: item.advancePercentage ?? 50,
    featured: Boolean(item.featured),
    homeService: item.homeServiceAvailable ?? item.homeService ?? true,
    venueService: item.venueServiceAvailable ?? item.venueService ?? true,
    image: item.coverImage || item.image,
    imagePublicId: item.coverImagePublicId,
    galleryImages: item.galleryMedia?.length
      ? item.galleryMedia.map((entry) => entry.url).filter(Boolean)
      : item.galleryImages || [],
    galleryMedia: item.galleryMedia || [],
    includes: item.includedServices || item.includes || [],
    description: item.fullDescription || item.description || "",
    isActive: item.isActive ?? true,
  };
}

export const bookingApiService = {
  async getServices() {
    try {
      const response = await apiClient.get("/public/services");
      const items = response.data.data.map(mapService);
      const liveItems = items.filter((item) => /^[a-f\d]{24}$/i.test(String(item.id)));
      return {
        items: liveItems.length ? liveItems : fallbackServices.map(mapService),
        source: liveItems.length
          ? response.data.meta?.source || "database"
          : "frontend-fallback",
      };
    } catch {
      return {
        items: fallbackServices.map(mapService),
        source: "frontend-fallback",
      };
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get("/public/categories");
      const uniqueNames = Array.from(
        new Set(response.data.data.map((item) => item.name).filter(Boolean))
      );
      return {
        items: ["All", ...uniqueNames],
        source: response.data.meta?.source || "database",
      };
    } catch {
      return {
        items: fallbackCategories,
        source: "frontend-fallback",
      };
    }
  },

  async getBridalPackages() {
    try {
      const response = await apiClient.get("/public/bridal-packages");
      return {
        items: response.data.data.map(mapBridalPackage),
        source: "database",
      };
    } catch {
      return {
        items: fallbackBridalPackages,
        source: "frontend-fallback",
      };
    }
  },

  async getBridalServices() {
    try {
      const response = await apiClient.get("/public/services");
      const bridalNames = new Set([
        "Bridal Makeup",
        "HD Bridal Makeup",
        "Airbrush Bridal Makeup",
        "Engagement Makeup",
        "Reception Makeup",
        "Haldi Makeup",
        "Mehendi Makeup",
        "Hair Styling",
        "Saree Draping",
        "Pre-Bridal Preparation",
      ]);
      const items = response.data.data
        .map(mapService)
        .filter(
          (item) =>
            bridalNames.has(item.name) || item.category?.toLowerCase() === "bridal makeup"
        )
        .map((item) => item.name);

      return {
        items: items.length ? Array.from(new Set(items)) : fallbackBridalServices,
        source: "database",
      };
    } catch {
      return {
        items: fallbackBridalServices,
        source: "frontend-fallback",
      };
    }
  },

  async getAvailability(serviceId, date) {
    const response = await apiClient.get("/public/appointments/availability", {
      params: { serviceId, date },
    });
    return response.data;
  },

  async getPublicAvailability(params) {
    const response = await apiClient.get("/public/availability", { params });
    return response.data;
  },

  async createAppointment(payload) {
    const response = await apiClient.post("/public/appointments", payload);
    return response.data;
  },

  async validateCoupon(payload) {
    const response = await apiClient.post("/public/coupons/validate", payload);
    return response.data;
  },

  async getBridalAvailability(date, bridalPackageId) {
    const response = await apiClient.get("/public/bridal-bookings/availability", {
      params: { date, bridalPackageId },
    });
    return response.data;
  },

  async createBridalBooking(payload) {
    const response = await apiClient.post("/public/bridal-bookings", payload);
    return response.data;
  },

  async getPaymentConfig() {
    const response = await apiClient.get("/public/payment-config");
    return response.data;
  },

  async createPaymentOrder(payload) {
    const response = await apiClient.post("/payments/create-order", payload);
    return response.data;
  },

  async verifyPayment(payload) {
    const response = await apiClient.post("/payments/verify", payload);
    return response.data;
  },

  async trackBooking(payload) {
    const response = await apiClient.post("/public/track-booking", payload);
    return response.data;
  },

  async getPublicOffers() {
    const response = await apiClient.get("/public/offers");
    return response.data;
  },

  async getPublicGallery(params) {
    const response = await apiClient.get("/public/gallery", { params });
    return response.data;
  },

  async getPublicTestimonials() {
    const response = await apiClient.get("/public/testimonials");
    return response.data;
  },

  async getPublicSiteSettings() {
    const response = await apiClient.get("/public/settings");
    return response.data;
  },

  async adminLogin(payload) {
    const response = await apiClient.post("/auth/admin/login", payload);
    return response.data;
  },

  async adminLogout(token) {
    const response = await apiClient.post(
      "/auth/admin/logout",
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return response.data;
  },

  async getAdminProfile(token) {
    const response = await apiClient.get("/auth/admin/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminAppointments(token, params) {
    const response = await apiClient.get("/admin/appointments", {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminAppointmentStatus(token, id, payload) {
    const response = await apiClient.patch(`/admin/appointments/${id}/status`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminDashboardSummary(token) {
    const response = await apiClient.get("/admin/dashboard/summary", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminBridalBookings(token, params) {
    const response = await apiClient.get("/admin/bridal-bookings", {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminBridalBookingStatus(token, id, payload) {
    const response = await apiClient.patch(`/admin/bridal-bookings/${id}/status`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminPayments(token, params) {
    const response = await apiClient.get("/admin/payments", {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async markAdminRemainingPaymentReceived(token, payload) {
    const response = await apiClient.post("/admin/payments/manual-receive", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminCategories(token) {
    const response = await apiClient.get("/admin/categories", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminCategory(token, payload) {
    const response = await apiClient.post("/admin/categories", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminCategory(token, id, payload) {
    const response = await apiClient.put(`/admin/categories/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminCategory(token, id) {
    const response = await apiClient.delete(`/admin/categories/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminServices(token) {
    const response = await apiClient.get("/admin/services", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async uploadAdminMedia(token, formData) {
    const response = await apiClient.post("/admin/media/upload", formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminService(token, payload) {
    const response = await apiClient.post("/admin/services", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminService(token, id, payload) {
    const response = await apiClient.put(`/admin/services/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminService(token, id) {
    const response = await apiClient.delete(`/admin/services/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminBridalPackages(token) {
    const response = await apiClient.get("/admin/bridal-packages", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminBridalPackage(token, payload) {
    const response = await apiClient.post("/admin/bridal-packages", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminBridalPackage(token, id, payload) {
    const response = await apiClient.put(`/admin/bridal-packages/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminBridalPackage(token, id) {
    const response = await apiClient.delete(`/admin/bridal-packages/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminAvailability(token) {
    const response = await apiClient.get("/admin/availability", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminAvailability(token, payload) {
    const response = await apiClient.post("/admin/availability", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminAvailability(token, id, payload) {
    const response = await apiClient.put(`/admin/availability/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminAvailability(token, id) {
    const response = await apiClient.delete(`/admin/availability/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminOffers(token) {
    const response = await apiClient.get("/admin/offers", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminOffer(token, payload) {
    const response = await apiClient.post("/admin/offers", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminOffer(token, id, payload) {
    const response = await apiClient.put(`/admin/offers/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminOffer(token, id) {
    const response = await apiClient.delete(`/admin/offers/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminGallery(token) {
    const response = await apiClient.get("/admin/gallery", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminGallery(token, payload) {
    const response = await apiClient.post("/admin/gallery", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminGallery(token, id, payload) {
    const response = await apiClient.put(`/admin/gallery/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminGallery(token, id) {
    const response = await apiClient.delete(`/admin/gallery/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminTestimonials(token) {
    const response = await apiClient.get("/admin/testimonials", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async createAdminTestimonial(token, payload) {
    const response = await apiClient.post("/admin/testimonials", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminTestimonial(token, id, payload) {
    const response = await apiClient.put(`/admin/testimonials/${id}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminTestimonial(token, id) {
    const response = await apiClient.delete(`/admin/testimonials/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminMessages(token) {
    const response = await apiClient.get("/admin/messages", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminMessageStatus(token, id, payload) {
    const response = await apiClient.patch(`/admin/messages/${id}/status`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async deleteAdminMessage(token, id) {
    const response = await apiClient.delete(`/admin/messages/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminSiteSettings(token) {
    const response = await apiClient.get("/admin/settings", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async updateAdminSiteSettings(token, payload) {
    const response = await apiClient.put("/admin/settings", payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async getAdminNotifications(token) {
    const response = await apiClient.get("/admin/notifications", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async markAdminNotificationRead(token, id) {
    const response = await apiClient.patch(`/admin/notifications/${id}/read`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  async markAllAdminNotificationsRead(token) {
    const response = await apiClient.patch("/admin/notifications/read-all", {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },
};
