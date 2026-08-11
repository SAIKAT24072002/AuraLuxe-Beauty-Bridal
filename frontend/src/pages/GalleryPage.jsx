import { useState } from "react";
import GalleryCard from "../components/GalleryCard";
import PageHero from "../components/PageHero";
import SectionHeader from "../components/SectionHeader";
import { useSiteContent } from "../context/SiteContentContext";

export default function GalleryPage() {
  const { gallery } = useSiteContent();
  const [active, setActive] = useState("All");
  const categories = ["All", ...new Set(gallery.map((item) => item.category))];
  const filtered = gallery.filter((item) => active === "All" || item.category === active);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="A premium visual grid for bridal, glam, hair, nails, and before-after stories."
        description="The gallery preview uses temporary data now, but the architecture is ready for Cloudinary-backed API content later."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="Category Filter"
          title="Browse visual work without losing rhythm or clarity."
          description="Filters stay lightweight and mobile-friendly while preserving the editorial feel."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                active === category ? "bg-charcoal text-white" : "bg-cream text-charcoal/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

