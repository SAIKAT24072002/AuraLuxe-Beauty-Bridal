export default function EmptyStateCard({ title, description }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-rosewood/20 bg-white p-8 text-center shadow-panel">
      <h3 className="font-display text-3xl">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-charcoal/65">{description}</p>
    </div>
  );
}

