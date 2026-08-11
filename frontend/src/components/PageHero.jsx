import { motion } from "framer-motion";
import Reveal from "./Reveal";

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  return (
    <section className="relative overflow-hidden border-b border-rosewood/10 bg-mesh">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(166,93,99,0.16),_transparent_55%)]" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <Reveal className="space-y-6 rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-panel backdrop-blur md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rosewood">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-5xl leading-[0.98] md:text-7xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-charcoal/72 md:text-lg">
            {description}
          </p>
          <div className="flex flex-wrap gap-4">
            {primaryAction}
            {secondaryAction}
          </div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="grid gap-4 self-end"
        >
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-panel backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-rosewood">Crafted Experience</p>
            <p className="mt-4 font-display text-3xl">
              Premium UI scaffolding for bookings, bridal stories, and service discovery.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-charcoal p-5 text-white shadow-panel">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Responsive</p>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Tuned for desktop, tablet, and mobile without horizontal overflow.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-gradient-to-br from-blush to-almond p-5 shadow-panel">
              <p className="text-xs uppercase tracking-[0.25em] text-charcoal/50">Ready For API</p>
              <p className="mt-3 text-sm leading-6 text-charcoal/75">
                Mock-backed sections are structured for easy data replacement later.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
