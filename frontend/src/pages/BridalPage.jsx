import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, House, Sparkles } from "lucide-react";
import { BridalBookingPanel } from "../components/BookingPanels";
import BridalPackageCard from "../components/BridalPackageCard";
import PageHero from "../components/PageHero";
import SectionHeader from "../components/SectionHeader";
import { useSiteContent } from "../context/SiteContentContext";

export default function BridalPage() {
  const { bridalPackages, bridalServices } = useSiteContent();
  const [createdBooking, setCreatedBooking] = useState(null);
  const featuredPackage = useMemo(
    () => bridalPackages.find((item) => item.featured) || bridalPackages[0],
    [bridalPackages]
  );

  return (
    <div>
      <PageHero
        eyebrow="Bridal"
        title="A bridal destination shaped for storytelling, trust, and venue-ready booking confidence."
        description="From HD bridal makeup to reception, haldi, and mehendi styling, discover premium packages planned for home, venue, and celebration-ready preparation."
        primaryAction={
          <Link
            to={`/bridal/packages/${featuredPackage?.slug || "royal-bridal"}`}
            className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white"
          >
            View Royal Package
          </Link>
        }
        secondaryAction={
          <a href="#bridal-booking-ui" className="rounded-full border border-charcoal/15 px-6 py-3 text-sm font-semibold">
            Explore Booking UI
          </a>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="Bridal Services"
          title="Every wedding event has its own tone, timing, and visual finish."
          description="Choose from event-specific bridal artistry shaped around ceremony mood, timing, and personal style."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {bridalServices.map((item) => (
            <div key={item} className="rounded-[1.7rem] border border-rosewood/10 bg-white p-5 shadow-panel">
              <Sparkles size={18} className="text-rosewood" />
              <p className="mt-4 font-medium text-charcoal/78">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="Bridal Packages"
          title="Packages positioned as premium experiences, not just price cards."
          description="Each package brings together artistry, timing, and preparation support in one clear bridal plan."
        />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {bridalPackages.map((item) => (
              <BridalPackageCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-6 rounded-[2.2rem] bg-charcoal p-8 text-white shadow-panel lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blush">Venue / Home Highlight</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Parlour service, bride home support, and wedding venue readiness in one flow.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Bride home appointment capture",
              "Wedding venue timing coordination",
              "Preferred start time and address fields",
              "Payment summary preview for advance booking",
            ].map((item) => (
              <div key={item} className="rounded-[1.6rem] bg-white/7 p-5">
                <House size={18} className="text-blush" />
                <p className="mt-4 text-sm leading-6 text-white/76">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="bridal-booking-ui" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="Booking UI"
          title="Plan your bridal date, venue details, and advance summary in one guided flow."
          description="Choose your package, confirm the date and time, then share bride and venue details in one guided booking flow."
        />
        {createdBooking && (
          <div className="mt-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
            Bridal booking created successfully. Booking ID:{" "}
            <span className="font-semibold">{createdBooking.bookingId}</span>
          </div>
        )}
        <div className="mt-10 space-y-8">
          <BridalBookingPanel
            bridalPackages={bridalPackages}
            initialPackage={featuredPackage}
            onBookingCreated={setCreatedBooking}
          />
        </div>
        <div className="mt-8">
          <Link to="/track-booking" className="inline-flex items-center gap-2 text-sm font-semibold text-rosewood">
            See Track Booking UI
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
