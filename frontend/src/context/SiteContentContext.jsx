import { createContext, useContext, useEffect, useState } from "react";
import { customerContentService } from "../services/customerContentService";

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({
    loading: true,
    siteMeta: null,
    services: [],
    serviceCategories: [],
    bridalPackages: [],
    bridalServices: [],
    offers: [],
    gallery: [],
    testimonials: [],
    openingHours: [],
    stats: [],
    whyChooseUs: [],
    trackTimeline: [],
  });

  useEffect(() => {
    async function loadContent() {
      const [
        siteMeta,
        services,
        serviceCategories,
        bridalPackages,
        bridalServices,
        offers,
        gallery,
        testimonials,
        openingHours,
        stats,
        whyChooseUs,
        trackTimeline,
      ] = await Promise.all([
        customerContentService.getSiteMeta(),
        customerContentService.getServices(),
        customerContentService.getServiceCategories(),
        customerContentService.getBridalPackages(),
        customerContentService.getBridalServices(),
        customerContentService.getOffers(),
        customerContentService.getGallery(),
        customerContentService.getTestimonials(),
        customerContentService.getOpeningHours(),
        customerContentService.getStats(),
        customerContentService.getWhyChooseUs(),
        customerContentService.getTrackTimeline(),
      ]);

      setContent({
        loading: false,
        siteMeta,
        services,
        serviceCategories,
        bridalPackages,
        bridalServices,
        offers,
        gallery,
        testimonials,
        openingHours,
        stats,
        whyChooseUs,
        trackTimeline,
      });
    }

    loadContent();
  }, []);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider.");
  }
  return context;
}

