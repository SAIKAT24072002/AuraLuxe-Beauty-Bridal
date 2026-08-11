import { Link, useParams } from "react-router-dom";
import { Check, MessageCircle } from "lucide-react";
import PageHero from "../components/PageHero";
import { BridalBookingPanel } from "../components/BookingPanels";
import SectionHeader from "../components/SectionHeader";
import { useSiteContent } from "../context/SiteContentContext";
import { optimizeCloudinaryImage } from "../utils/media";

export default function BridalPackageDetailPage() {
  const { slug } = useParams();
  const { bridalPackages, siteMeta } = useSiteContent();
  const item = bridalPackages.find((entry) => entry.slug === slug) || bridalPackages[0];
  const galleryImages = item?.galleryMedia?.length
    ? item.galleryMedia.map((entry) => entry.url).filter(Boolean)
    : item?.galleryImages || [];

  if (!item) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-4xl flex-col justify-center px-4 py-20 md:px-8">
        <p className="text-xs uppercase tracking-[0.35em] text-rosewood">Package Detail</p>
        <h1 className="mt-4 font-display text-5xl">Preparing bridal package preview...</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal/68">
          The content layer is loading package information for this page.
        </p>
      </section>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Package Detail"
        title={item.name}
        description={item.description}
        primaryAction={
          <a
            href={`https://wa.me/${siteMeta?.whatsapp}?text=${encodeURIComponent(
              `Hello, I want to know more about ${item.name}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle size={16} />
            Discuss on WhatsApp
          </a>
        }
        secondaryAction={
          <Link
            to="/bridal"
            className="rounded-full border border-charcoal/15 px-6 py-3 text-sm font-semibold"
          >
            Back to Bridal
          </Link>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(620px,1.05fr)]">
          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-rosewood/10 bg-white shadow-panel">
              <img
                src={optimizeCloudinaryImage(item.image, { width: 1400, height: 1000, crop: "fill" })}
                alt={item.name}
                className="h-[420px] w-full object-cover"
              />
            </div>
            {galleryImages.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-[1.6rem] border border-rosewood/10 bg-white shadow-panel"
                  >
                    <img
                      src={optimizeCloudinaryImage(image, { width: 900, height: 640, crop: "fill" })}
                      alt={`${item.name} gallery ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Offer Price", `Rs ${item.discountPrice.toLocaleString("en-IN")}`],
                ["Duration", item.duration],
                ["Advance", `${item.advancePercentage}%`],
                ["Venue Support", item.venueService ? "Available" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.6rem] border border-rosewood/10 bg-white p-5 shadow-panel">
                  <p className="text-xs uppercase tracking-[0.25em] text-rosewood">{label}</p>
                  <p className="mt-3 text-lg font-semibold text-charcoal">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
              <SectionHeader
                eyebrow="Included Services"
                title="Everything packaged into one graceful bridal preparation flow."
                description="Every inclusion is selected to keep the bridal morning smooth, elegant, and beautifully coordinated."
              />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {item.includes.map((feature) => (
                  <div key={feature} className="flex gap-3 rounded-[1.4rem] bg-cream p-4">
                    <Check className="mt-1 text-rosewood" size={18} />
                    <p className="text-sm leading-6 text-charcoal/75">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <BridalBookingPanel bridalPackages={bridalPackages} initialPackage={item} />
          </div>
        </div>
      </section>
    </div>
  );
}
