import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CalendarHeart, Menu, Sparkles, X } from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";
import { optimizeCloudinaryImage } from "../utils/media";

const links = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Bridal", to: "/bridal" },
  { label: "Offers", to: "/offers" },
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Track Booking", to: "/track-booking" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { siteMeta } = useSiteContent();

  return (
    <header className="sticky top-0 z-50 border-b border-rosewood/10 bg-porcelain/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="group flex items-center gap-3">
          {siteMeta?.logo ? (
            <img
              src={optimizeCloudinaryImage(siteMeta.logo, { width: 120, height: 120, crop: "fill" })}
              alt={siteMeta.businessName || "AuraLuxe"}
              className="h-11 w-11 rounded-full object-cover shadow-glow"
            />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-rosewood to-plum text-white shadow-glow">
              <Sparkles size={18} />
            </span>
          )}
          <span>
            <span className="block font-display text-2xl font-semibold tracking-wide">
              {siteMeta?.businessName || "AuraLuxe"}
            </span>
            <span className="block text-[11px] uppercase tracking-[0.35em] text-charcoal/45">
              Beauty & Bridal Atelier
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-rosewood" : "text-charcoal/75 hover:text-rosewood"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosewood"
          >
            <CalendarHeart size={16} />
            Book Now
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full border border-charcoal/15 p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-rosewood/10 bg-white/95 px-4 py-5 shadow-panel md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-charcoal/80"
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/services"
              onClick={() => setOpen(false)}
              className="rounded-full bg-charcoal px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
