import { Link } from "react-router-dom";
import { optimizeCloudinaryImage } from "../utils/media";

export default function BridalPackageCard({ item }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-rosewood/10 bg-white shadow-panel">
      <div className="relative h-72 overflow-hidden">
        <img
          src={optimizeCloudinaryImage(item.image, { width: 1100, height: 760, crop: "fill" })}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {item.featured && (
          <span className="absolute left-5 top-5 rounded-full bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
            Featured
          </span>
        )}
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rosewood">{item.duration}</p>
          <h3 className="mt-2 font-display text-3xl">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-charcoal/70">{item.description}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-charcoal">
            Rs {item.discountPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-charcoal/45 line-through">
            Rs {item.price.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.includes.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-charcoal/70"
            >
              {feature}
            </span>
          ))}
        </div>
        <Link
          to={`/bridal/packages/${item.slug}`}
          className="inline-flex rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-rosewood"
        >
          View Package
        </Link>
      </div>
    </article>
  );
}
