import { optimizeCloudinaryImage } from "../utils/media";

export default function GalleryCard({ item }) {
  return (
    <figure className="group overflow-hidden rounded-[1.8rem] border border-rosewood/10 bg-white shadow-panel">
      <div className="h-72 overflow-hidden">
        <img
          src={optimizeCloudinaryImage(item.image, { width: 900, height: 720, crop: "fill" })}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="font-display text-2xl">{item.title}</p>
          <p className="mt-1 text-sm text-charcoal/60">{item.category}</p>
        </div>
      </figcaption>
    </figure>
  );
}
