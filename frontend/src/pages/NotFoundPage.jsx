import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-rosewood">404</p>
      <h1 className="mt-4 font-display text-5xl">This beauty page could not be found.</h1>
      <p className="mt-4 max-w-xl text-base leading-8 text-charcoal/70">
        The route may have moved while the customer experience is being styled.
      </p>
      <Link to="/" className="mt-8 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </section>
  );
}
