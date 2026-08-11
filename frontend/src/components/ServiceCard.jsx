import { Link } from "react-router-dom";
import { Clock3, IndianRupee } from "lucide-react";
import { optimizeCloudinaryImage } from "../utils/media";

export default function ServiceCard({ service, onBookNow, bookingHref }) {
  const ctaClassName =
    "w-full rounded-full bg-charcoal px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-rosewood";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-rosewood/10 bg-white shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="relative h-64 overflow-hidden">
        <img
          src={optimizeCloudinaryImage(service.image, { width: 900, height: 720, crop: "fill" })}
          alt={service.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rosewood">
          {service.category}
        </span>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <h3 className="font-display text-3xl">{service.name}</h3>
          <p className="mt-2 text-sm leading-6 text-charcoal/70">{service.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal/65">
          <span className="inline-flex items-center gap-2">
            <IndianRupee size={16} />
            {service.price.toLocaleString("en-IN")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={16} />
            {service.duration}
          </span>
        </div>
        {bookingHref ? (
          <Link to={bookingHref} className={ctaClassName}>
            Book Now
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onBookNow?.(service)}
            className={ctaClassName}
          >
            Book Now
          </button>
        )}
      </div>
    </article>
  );
}
