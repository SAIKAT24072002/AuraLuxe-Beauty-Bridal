import { MessageCircle } from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";

export default function WhatsAppFloat() {
  const { siteMeta } = useSiteContent();
  const href = `https://wa.me/${siteMeta?.whatsapp || ""}?text=${encodeURIComponent(
    "Hello, I want to know more about your bridal packages."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-panel transition hover:scale-105"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

