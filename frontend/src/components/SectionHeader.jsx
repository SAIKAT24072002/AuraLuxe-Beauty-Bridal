export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}) {
  return (
    <div
      className={`max-w-2xl space-y-3 ${
        align === "center" ? "mx-auto text-center" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rosewood">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl leading-tight md:text-5xl">{title}</h2>
      <p className="text-base leading-7 text-charcoal/72">{description}</p>
    </div>
  );
}
