import { Star } from "lucide-react";
import { optimizeCloudinaryImage } from "../utils/media";

export default function TestimonialCard({ item }) {
  return (
    <article className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
      <div className="flex items-center gap-4">
        {item.image ? (
          <img
            src={optimizeCloudinaryImage(item.image, { width: 160, height: 160, crop: "fill" })}
            alt={item.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full bg-cream text-lg font-semibold text-rosewood">
            {String(item.name || "A").charAt(0)}
          </div>
        )}
        <div className="flex items-center gap-1 text-rosewood">
          {Array.from({ length: item.rating }).map((_, index) => (
            <Star key={`${item.id}-${index}`} size={16} fill="currentColor" />
          ))}
        </div>
      </div>
      <p className="mt-5 text-base leading-7 text-charcoal/74">"{item.quote}"</p>
      <div className="mt-6">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-charcoal/55">{item.service}</p>
      </div>
    </article>
  );
}
