import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "../components/PageHero";
import SectionHeader from "../components/SectionHeader";
import { useSiteContent } from "../context/SiteContentContext";

export default function ContactPage() {
  const { siteMeta, openingHours } = useSiteContent();

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="A premium contact space for appointments, bridal consultations, and venue conversations."
        description="Reach out for salon visits, home service planning, bridal consultations, and venue coordination with one calm, polished contact flow."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
            <SectionHeader
              eyebrow="Reach Us"
              title="Beauty consultation should feel approachable and polished."
              description="Use phone, WhatsApp, or the contact form depending on how quickly you want to move."
            />
            <div className="grid gap-4">
              {[
                { icon: Phone, label: "Phone", value: siteMeta?.phone },
                { icon: Mail, label: "Email", value: siteMeta?.email },
                { icon: MapPin, label: "Address", value: siteMeta?.address },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-[1.5rem] bg-cream p-4">
                  <item.icon className="mt-1 text-rosewood" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-charcoal/72">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
              <h2 className="font-display text-4xl">Send Us a Message</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none" placeholder="Full name" />
                <input className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none" placeholder="Phone number" />
                <input className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2" placeholder="Email address" />
                <input className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2" placeholder="Subject" />
                <textarea rows="5" className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2" placeholder="Tell us about your service requirement..." />
              </div>
              <button className="mt-5 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white">
                Send Message
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
                <p className="text-xs uppercase tracking-[0.3em] text-rosewood">Opening Hours</p>
                <div className="mt-5 space-y-3 text-sm">
                  {openingHours.slice(0, 4).map((item) => (
                    <div key={item.day} className="flex items-center justify-between gap-4">
                      <span>{item.day}</span>
                      <span className="text-charcoal/60">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-rosewood/10 bg-gradient-to-br from-almond to-cream p-6 shadow-panel">
                <p className="text-xs uppercase tracking-[0.3em] text-rosewood">Location</p>
                <p className="mt-4 font-display text-3xl">Visit Our Studio</p>
                <p className="mt-3 text-sm leading-6 text-charcoal/70">
                  Use the address above for salon visits, or share your venue details when booking on-location bridal support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
