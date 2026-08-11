export default function BookingSummaryCard({ title, lines, total, advance }) {
  return (
    <aside className="rounded-[2rem] border border-rosewood/10 bg-charcoal p-6 text-white shadow-panel">
      <p className="text-xs uppercase tracking-[0.3em] text-white/55">{title}</p>
      <div className="mt-6 space-y-4">
        {lines.map((line) => (
          <div
            key={line.label}
            className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-sm"
          >
            <span className="text-white/68">{line.label}</span>
            <span className="font-medium">{line.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[1.5rem] bg-white/8 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/68">Total Amount</span>
          <span className="font-semibold">{total}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-white/68">Advance Payable</span>
          <span className="font-semibold text-blush">{advance}</span>
        </div>
      </div>
    </aside>
  );
}

