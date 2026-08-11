export default function LoadingCard({ lines = 3 }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
      <div className="h-48 animate-pulse rounded-[1.5rem] bg-cream" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded-full bg-cream ${
              index === 0 ? "w-2/3" : index === lines - 1 ? "w-1/3" : "w-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
