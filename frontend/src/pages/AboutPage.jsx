import { Sparkles } from "lucide-react";
import PageHero from "../components/PageHero";
import SectionHeader from "../components/SectionHeader";
import { useSiteContent } from "../context/SiteContentContext";
import { optimizeCloudinaryImage } from "../utils/media";

export default function AboutPage() {
  const { stats, whyChooseUs, siteMeta } = useSiteContent();

  return (
    <div>
      <PageHero
        eyebrow="About"
        title="A beauty brand story shaped around calm luxury and trustworthy execution."
        description="This page introduces the business story, experience, mission, and proof points in a portfolio-worthy presentation."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
            <SectionHeader
              eyebrow="Our Story"
              title={
                siteMeta?.aboutTitle ||
                "Created for women who want beauty services to feel graceful and organized."
              }
              description={
                siteMeta?.aboutText ||
                "AuraLuxe is presented as a premium beauty atelier where salon rituals and bridal artistry share the same calm, detail-focused standard."
              }
            />
          </div>
          {siteMeta?.aboutImage ? (
            <div className="overflow-hidden rounded-[2rem] border border-rosewood/10 bg-white p-3 shadow-panel">
              <img
                src={optimizeCloudinaryImage(siteMeta.aboutImage, { width: 1200, height: 1000, crop: "fill" })}
                alt={siteMeta?.aboutTitle || "About AuraLuxe"}
                className="h-full min-h-[320px] w-full rounded-[1.5rem] object-cover"
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.75rem] border border-rosewood/10 bg-gradient-to-br from-white to-cream p-6 shadow-panel">
                  <p className="font-display text-4xl">{item.value}</p>
                  <p className="mt-3 text-sm text-charcoal/65">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <SectionHeader
            eyebrow="Why Clients Return"
            title="Premium doesn’t just mean pretty, it means consistent."
            description="These content blocks are suitable for later admin-editable about content without changing layout structure."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {whyChooseUs.map((item) => (
              <div key={item} className="rounded-[1.7rem] bg-white/7 p-6">
                <Sparkles className="text-blush" />
                <p className="mt-4 text-sm leading-7 text-white/76">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
