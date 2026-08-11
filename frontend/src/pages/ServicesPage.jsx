import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import AppointmentBookingWizard from "../components/AppointmentBookingWizard";
import EmptyStateCard from "../components/EmptyStateCard";
import LoadingCard from "../components/LoadingCard";
import PageHero from "../components/PageHero";
import SectionHeader from "../components/SectionHeader";
import ServiceCard from "../components/ServiceCard";
import { useSiteContent } from "../context/SiteContentContext";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, services, serviceCategories } = useSiteContent();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedService, setSelectedService] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const serviceIdFromQuery = searchParams.get("serviceId") || "";

  const filteredServices = services.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!serviceIdFromQuery || loading || !services.length || selectedService?.id === serviceIdFromQuery) {
      return;
    }

    const matchedService = services.find((item) => item.id === serviceIdFromQuery);
    if (!matchedService) {
      return;
    }

    setSelectedService(matchedService);
    setActiveCategory("All");
    setSearch("");
  }, [loading, selectedService?.id, serviceIdFromQuery, services]);

  function handleSelectService(service) {
    setSelectedService(service);
  }

  function handleCloseBooking() {
    setSelectedService(null);

    if (!serviceIdFromQuery) {
      return;
    }

    navigate("/services", { replace: true });
  }

  return (
    <div>
      <PageHero
        eyebrow="Services"
        title="Premium beauty services presented with calm hierarchy and booking-ready clarity."
        description="Search, filter, compare durations, and explore polished service cards designed to move smoothly into your booking journey."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="Discover"
          title="Search and filter without losing the premium feel."
          description="Browse services by category, compare timing, and find the right appointment without losing the calm editorial feel."
        />

        <div className="mt-10 rounded-[2rem] border border-rosewood/10 bg-white p-5 shadow-panel">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={18} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search facial, makeup, hair spa..."
                className="w-full rounded-full border border-rosewood/15 bg-porcelain px-12 py-4 outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              {serviceCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeCategory === category
                      ? "bg-charcoal text-white"
                      : "bg-cream text-charcoal/70 hover:bg-blush/70"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {createdBooking && (
          <div className="mt-10 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
            Booking created successfully. Booking ID:{" "}
            <span className="font-semibold">{createdBooking.bookingId}</span>
          </div>
        )}

        {selectedService && (
          <div className="mt-10">
            <AppointmentBookingWizard
              service={selectedService}
              onClose={handleCloseBooking}
              onBookingCreated={setCreatedBooking}
            />
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <LoadingCard key={index} />)
            : filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBookNow={handleSelectService}
                />
              ))}
        </div>

        {!loading && filteredServices.length === 0 && (
          <div className="mt-10">
            <EmptyStateCard
              title="No services matched your filters."
              description="Try another category or use a broader search term."
            />
          </div>
        )}
      </section>
    </div>
  );
}
