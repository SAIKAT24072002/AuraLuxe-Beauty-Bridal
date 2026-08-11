import PageHero from "../components/PageHero";
import OfferCard from "../components/OfferCard";
import SectionHeader from "../components/SectionHeader";
import { useSiteContent } from "../context/SiteContentContext";

export default function OffersPage() {
  const { offers } = useSiteContent();

  return (
    <div>
      <PageHero
        eyebrow="Offers"
        title="Live offers that stay premium while remaining booking-ready."
        description="Every visible coupon here is already filtered by active validity and is backed by server-side validation during booking."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="Current Campaigns"
          title="Offers guests can actually use right now."
          description="Copy the code, check eligibility, and move straight into beauty or bridal booking without guesswork."
        />
        {offers.length ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-rosewood/10 bg-white p-8 text-sm leading-7 text-charcoal/68 shadow-panel">
            No live offers are available right now. Beauty and bridal booking still remain open
            with premium pricing and real-time availability.
          </div>
        )}
      </section>
    </div>
  );
}
