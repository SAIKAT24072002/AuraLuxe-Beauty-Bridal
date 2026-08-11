import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";

const footerLinks = [
  { label: "Services", to: "/services" },
  { label: "Bridal", to: "/bridal" },
  { label: "Offers", to: "/offers" },
  { label: "Gallery", to: "/gallery" },
  { label: "Track Booking", to: "/track-booking" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const { siteMeta } = useSiteContent();

  return (
    <footer className="border-t border-rosewood/10 bg-charcoal text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1fr_0.8fr_0.8fr]">
        <div>
          <p className="font-display text-4xl">AuraLuxe</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
            Premium beauty appointments and bridal makeup experiences for women who
            want polished service, clear planning, and luxurious presentation.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">Explore</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/75">
            {footerLinks.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">Contact</p>
          <div className="mt-5 space-y-2 text-sm text-white/75">
            <p>{siteMeta?.phone}</p>
            <p>{siteMeta?.email}</p>
            <p>{siteMeta?.address}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

