import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, MapPin, PhoneCall, Sparkles } from "lucide-react";
import BridalPackageCard from "../components/BridalPackageCard";
import GalleryCard from "../components/GalleryCard";
import OfferCard from "../components/OfferCard";
import SectionHeader from "../components/SectionHeader";
import ServiceCard from "../components/ServiceCard";
import TestimonialCard from "../components/TestimonialCard";
import { useSiteContent } from "../context/SiteContentContext";
import { fadeUp, staggerParent } from "../utils/animations";
import { optimizeCloudinaryImage } from "../utils/media";

export default function HomePage() {
  const {
    siteMeta,
    services,
    bridalPackages,
    offers,
    gallery,
    testimonials,
    openingHours,
    stats,
    whyChooseUs,
  } = useSiteContent();

  const popularServices = services.filter((item) => item.popular).slice(0, 3);
  const featuredPackages = bridalPackages.filter((item) => item.featured).slice(0, 2);

  return (
    <div>
      <section className="relative overflow-hidden bg-mesh">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(166,93,99,0.16),_transparent_58%)] lg:block" />
        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.whileInView}
            transition={fadeUp.transition}
            className="space-y-8 rounded-[2.2rem] border border-white/70 bg-white/58 p-6 shadow-panel backdrop-blur md:border-0 md:bg-transparent md:p-0 md:shadow-none"
          >
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rosewood">
                Premium Women Beauty Parlour
              </p>
              <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
                {siteMeta?.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-charcoal/72">
                {siteMeta?.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/services"
                className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-rosewood"
              >
                Book Appointment
              </Link>
              <Link
                to="/bridal"
                className="rounded-full border border-charcoal/15 px-6 py-3 text-sm font-semibold transition hover:border-rosewood hover:text-rosewood"
              >
                Explore Bridal
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/80 bg-white/65 p-5 shadow-panel backdrop-blur">
                  <p className="font-display text-3xl">{item.value}</p>
                  <p className="mt-2 text-sm text-charcoal/60">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {siteMeta?.heroImage ? (
            <motion.div
              initial={fadeUp.initial}
              animate={fadeUp.whileInView}
              transition={fadeUp.transition}
              className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/55 p-3 shadow-glow backdrop-blur"
            >
              <img
                src={optimizeCloudinaryImage(siteMeta.heroImage, { width: 1400, height: 1600, crop: "fill" })}
                alt={siteMeta?.businessName || "AuraLuxe"}
                className="h-[540px] w-full rounded-[1.8rem] object-cover"
              />
            </motion.div>
          ) : (
            <motion.div variants={staggerParent} initial="initial" animate="whileInView" className="grid gap-4 md:pl-6">
              {[
                {
                  title: "Luxury Beauty Services",
                  text: "Curated salon care with premium ambience, polish, and schedule clarity.",
                },
                {
                  title: "Signature Bridal Makeup",
                  text: "HD, airbrush, and event-ready bridal artistry with timeline-focused prep.",
                },
                {
                  title: "Home & Venue Visits",
                  text: "Professional on-location bridal preparation support across home and venue.",
                },
              ].map((item) => (
                <motion.article
                  key={item.title}
                  variants={fadeUp}
                  className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-glow backdrop-blur"
                >
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-charcoal/72">{item.text}</p>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader
          eyebrow="Popular Services"
          title="Rituals that feel elevated before the appointment even begins."
          description="Premium cards, calm spacing, and pricing clarity make discovery feel polished while staying ready for later API-powered booking flows."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {popularServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-blush">Bridal Highlight</p>
            <h2 className="font-display text-4xl md:text-6xl">
              Bridal styling for wedding, engagement, reception, haldi, and mehendi moments.
            </h2>
            <p className="text-base leading-8 text-white/72">
              Built to present bridal experiences as a story, not just a list, with room
              for venue booking, package discovery, and WhatsApp discussion.
            </p>
            <Link
              to="/bridal"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-charcoal"
            >
              Explore Bridal Studio
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "HD Bridal Makeup",
              "Engagement Styling",
              "Reception Glam",
              "Haldi & Mehendi Makeup",
            ].map((item) => (
              <div key={item} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <Sparkles size={18} className="text-blush" />
                <p className="mt-4 font-display text-2xl">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader
          eyebrow="Featured Packages"
          title="Signature bridal packages prepared for parlour, home, and venue bookings."
          description="Structured for detail pages, booking forms, payment summaries, and later track-booking integration."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredPackages.map((item) => (
            <BridalPackageCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="grid gap-6 rounded-[2.25rem] bg-gradient-to-r from-almond via-cream to-blush/70 p-8 shadow-panel lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-rosewood">
              Bride Home / Venue Service
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Bridal preparation can travel to the bride, not just the other way around.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "At Beauty Parlour",
              "At Bride's Home",
              "At Wedding Venue",
              "Address & timing capture UI ready",
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] bg-white/70 p-5">
                <Check size={18} className="text-rosewood" />
                <p className="mt-3 text-sm font-medium text-charcoal/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader
          eyebrow="Why Choose Us"
          title="The experience is designed to feel premium, clear, and genuinely bridal-first."
          description="This section is shaped to communicate trust, planning comfort, and luxury without feeling like a generic salon template."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {whyChooseUs.map((item) => (
            <div key={item} className="rounded-[1.8rem] border border-rosewood/10 bg-white p-6 shadow-panel">
              <Check className="text-rosewood" />
              <p className="mt-4 text-base leading-7 text-charcoal/72">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream/70">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader
            eyebrow="Gallery Preview"
            title="A visual language that hints at softness, polish, and bridal confidence."
            description="Preview cards for bridal, reception, hair, nails, and before-after storytelling."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gallery.slice(0, 3).map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader
          eyebrow="Current Offers"
          title="Offers presented with strong hierarchy and easy coupon visibility."
          description="Built for admin-managed promotions later, but already shaped to feel campaign-ready."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <section className="bg-charcoal/95 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader
            eyebrow="Testimonials"
            title="Client words anchored in warmth, trust, and polish."
            description="Premium cards and spacing make social proof feel editorial instead of crowded."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-rosewood">Opening Hours</p>
            <div className="mt-6 space-y-4">
              {openingHours.map((item) => (
                <div
                  key={item.day}
                  className="flex items-center justify-between border-b border-rosewood/10 pb-3 text-sm"
                >
                  <span>{item.day}</span>
                  <span className="text-charcoal/60">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-rosewood/10 bg-gradient-to-br from-white to-almond p-6 shadow-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-rosewood">Location</p>
            <h3 className="mt-4 font-display text-4xl">Visit the studio or book us at your venue.</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white p-5">
                <MapPin className="text-rosewood" />
                <p className="mt-3 text-sm leading-6 text-charcoal/75">{siteMeta?.address}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5">
                <PhoneCall className="text-rosewood" />
                <p className="mt-3 text-sm leading-6 text-charcoal/75">
                  WhatsApp and direct call support for appointments and bridal conversations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2.4rem] bg-charcoal px-6 py-10 text-white shadow-panel md:flex-row md:items-center md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">WhatsApp CTA</p>
            <h3 className="mt-3 font-display text-4xl">Need help choosing the right bridal package?</h3>
          </div>
          <a
            href={`https://wa.me/${siteMeta?.whatsapp}?text=${encodeURIComponent(
              "Hello, I want to know more about Royal Bridal Package."
            )}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-charcoal"
          >
            Discuss on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
