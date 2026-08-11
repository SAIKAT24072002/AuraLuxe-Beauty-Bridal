import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCheck, Copy } from "lucide-react";
import { optimizeCloudinaryImage } from "../utils/media";

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDiscount(offer) {
  if (offer.discountType === "PERCENTAGE") {
    return `${offer.discountValue}% OFF`;
  }

  return `${formatCurrency(offer.discountValue)} OFF`;
}

export default function OfferCard({ offer }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyCoupon() {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
      {offer.image ? (
        <div className="mb-5 overflow-hidden rounded-[1.6rem]">
          <img
            src={optimizeCloudinaryImage(offer.image, { width: 1200, height: 700, crop: "fill" })}
            alt={offer.title}
            className="h-48 w-full object-cover"
          />
        </div>
      ) : null}
      <span className="inline-flex rounded-full bg-blush/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-plum">
        {offer.badge}
      </span>
      <h3 className="mt-4 font-display text-3xl">{offer.title}</h3>
      <p className="mt-3 text-sm leading-6 text-charcoal/70">{offer.description}</p>
      <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-cream p-4 text-sm text-charcoal/72">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">Coupon Code</p>
            <p className="mt-1 text-sm font-semibold">{offer.code}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyCoupon}
            className="inline-flex items-center gap-2 rounded-full border border-rosewood/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal"
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy Coupon"}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">Discount</p>
            <p className="mt-1 font-semibold">{formatDiscount(offer)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">Validity</p>
            <p className="mt-1 font-semibold">{offer.validUntil}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">Minimum Booking</p>
            <p className="mt-1 font-semibold">
              {offer.minimumBookingAmount > 0
                ? formatCurrency(offer.minimumBookingAmount)
                : "No minimum"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">Applicable To</p>
            <p className="mt-1 font-semibold">
              {(offer.applicableBookingTypes || []).join(" / ")}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={(offer.applicableBookingTypes || []).includes("BRIDAL") ? "/bridal" : "/services"}
          className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
        >
          Apply / Book
        </Link>
      </div>
    </article>
  );
}
