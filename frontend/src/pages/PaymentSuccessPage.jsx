import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import PageHero from "../components/PageHero";

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "--";
  const paymentId = searchParams.get("paymentId") || "--";
  const amount = searchParams.get("amount") || 0;
  const remaining = searchParams.get("remaining") || 0;
  const status = searchParams.get("status") || "CONFIRMED";

  return (
    <div>
      <PageHero
        eyebrow="Payment Verified"
        title="Your payment was verified successfully."
        description="A premium confirmation screen that hands guests straight back to booking tracking."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="rounded-[2.4rem] border border-rosewood/10 bg-white p-8 shadow-panel">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="text-emerald-600" size={34} />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rosewood">Payment Successful</p>
              <h2 className="mt-2 font-display text-4xl text-charcoal">PAYMENT SUCCESSFUL</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Booking ID", bookingId],
              ["Payment ID", paymentId],
              ["Amount Paid", formatCurrency(amount)],
              ["Remaining Amount", formatCurrency(remaining)],
              ["Booking Status", status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] bg-porcelain p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">{label}</p>
                <p className="mt-2 text-sm font-semibold text-charcoal/78">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/track-booking?bookingId=${encodeURIComponent(bookingId)}`}
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white"
            >
              <ArrowRight size={16} />
              Track Booking
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-rosewood/15 px-6 py-3 text-sm font-semibold text-charcoal"
            >
              <Home size={16} />
              Back To Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
