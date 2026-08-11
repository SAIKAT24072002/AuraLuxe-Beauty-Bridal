import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import PageHero from "../components/PageHero";
import SectionHeader from "../components/SectionHeader";
import { bookingApiService } from "../services/bookingApiService";
import { getSocketClient } from "../services/socketClient";
import { loadRazorpayCheckoutScript } from "../services/razorpayClient";
import { useSiteContent } from "../context/SiteContentContext";

const beautyTimeline = [
  "Booking Created",
  "Advance Payment",
  "Advance Verified",
  "Booking Confirmed",
  "Beautician Preparing",
  "Service Started",
  "Service Completed",
  "Remaining Payment",
  "Fully Paid",
];

const bridalTimeline = [
  "Booking Created",
  "Advance Payment",
  "Advance Verified",
  "Booking Confirmed",
  "Preparing",
  "Service Started",
  "Service Completed",
  "Remaining Payment",
  "Fully Paid",
];

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function resolveTimelineIndex(bookingType, result) {
  if (!result) return 0;
  if (["PAID", "FULLY_PAID"].includes(result.paymentStatus) || result.bookingStatus === "FULLY_PAID") {
    return 8;
  }
  if (result.bookingStatus === "SERVICE_COMPLETED") return 6;
  if (["PARTIALLY_PAID", "ADVANCE_PAID"].includes(result.paymentStatus)) {
    if (["CONFIRMED", "PREPARING", "ON_THE_WAY", "IN_PROGRESS", "SERVICE_STARTED"].includes(result.bookingStatus)) {
      return 3;
    }
    return 2;
  }
  if (result.bookingStatus === "CONFIRMED") return 3;
  if (bookingType === "BRIDAL" && result.bookingStatus === "PREPARING") return 4;
  if (bookingType === "BEAUTY" && result.bookingStatus === "IN_PROGRESS") return 5;
  if (bookingType === "BRIDAL" && result.bookingStatus === "SERVICE_STARTED") return 5;
  return 0;
}

export default function TrackBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackTimeline } = useSiteContent();
  const [form, setForm] = useState({
    bookingId: searchParams.get("bookingId") || "",
    phone: "",
  });
  const [state, setState] = useState({
    loading: false,
    error: "",
    result: null,
    bookingType: "BEAUTY",
    socketMessage: "",
  });
  const [paymentConfig, setPaymentConfig] = useState({
    loading: false,
    ready: false,
    keyId: "",
    message: "Online payment is currently unavailable. Please contact us or try again later.",
  });
  const [paymentState, setPaymentState] = useState({
    loading: false,
    error: "",
  });

  const timeline = state.bookingType === "BRIDAL" ? bridalTimeline : trackTimeline || beautyTimeline;
  const activeIndex = useMemo(
    () => resolveTimelineIndex(state.bookingType, state.result),
    [state.bookingType, state.result]
  );

  useEffect(() => {
    let active = true;

    async function loadPaymentConfig() {
      setPaymentConfig((current) => ({ ...current, loading: true }));
      try {
        const response = await bookingApiService.getPaymentConfig();
        if (!active) return;
        setPaymentConfig({
          loading: false,
          ready: Boolean(response.data?.razorpayEnabled),
          keyId: response.data?.keyId || "",
          message:
            response.data?.message ||
            "Online payment is currently unavailable. Please contact us or try again later.",
        });
      } catch {
        if (!active) return;
        setPaymentConfig({
          loading: false,
          ready: false,
          keyId: "",
          message: "Online payment is currently unavailable. Please contact us or try again later.",
        });
      }
    }

    loadPaymentConfig();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let socket;

    async function connect() {
      if (!state.result?.bookingId) return;

      try {
        socket = await getSocketClient();
        socket.emit("booking:subscribe", state.result.bookingId);
        socket.on("booking:status-updated", (payload) => {
          if (!active || payload.bookingId !== state.result.bookingId) return;
          setState((current) => ({
            ...current,
            result: current.result
              ? {
                  ...current.result,
                  bookingStatus: payload.bookingStatus,
                  paymentStatus: payload.paymentStatus,
                  remainingAmount:
                    payload.remainingAmount ?? current.result.remainingAmount,
                  advanceAmount: payload.advanceAmount ?? current.result.advanceAmount,
                  finalAmount: payload.finalAmount ?? current.result.finalAmount,
                  originalAmount:
                    payload.originalAmount ?? current.result.originalAmount,
                  discountAmount:
                    payload.discountAmount ?? current.result.discountAmount,
                  couponCode: payload.couponCode ?? current.result.couponCode,
                }
              : current.result,
            socketMessage:
              payload.paymentStage === "ADVANCE" || payload.paymentStage === "REMAINING"
                ? current.socketMessage || "Payment verified in real time."
                : "Booking status updated in real time.",
          }));
        });
        socket.on("payment:verified", (payload) => {
          if (!active || payload.bookingId !== state.result.bookingId) return;
          setState((current) => ({
            ...current,
            result: current.result
              ? {
                  ...current.result,
                  bookingStatus: payload.bookingStatus,
                  paymentStatus: payload.paymentStatus,
                  remainingAmount:
                    payload.remainingAmount ?? current.result.remainingAmount,
                  advanceAmount: payload.advanceAmount ?? current.result.advanceAmount,
                  finalAmount: payload.finalAmount ?? current.result.finalAmount,
                  originalAmount:
                    payload.originalAmount ?? current.result.originalAmount,
                  discountAmount:
                    payload.discountAmount ?? current.result.discountAmount,
                  couponCode: payload.couponCode ?? current.result.couponCode,
                }
              : current.result,
            socketMessage: "Payment verified in real time.",
          }));
        });
      } catch {
        // Silent fallback.
      }
    }

    connect();

    return () => {
      active = false;
      if (socket && state.result?.bookingId) {
        socket.emit("booking:unsubscribe", state.result.bookingId);
        socket.off("booking:status-updated");
        socket.off("payment:verified");
      }
    };
  }, [state.result?.bookingId]);

  async function handleTrack(event) {
    event.preventDefault();
    setState({
      loading: true,
      error: "",
      result: null,
      bookingType: "BEAUTY",
      socketMessage: "",
    });
    setPaymentState({ loading: false, error: "" });

    try {
      const response = await bookingApiService.trackBooking({
        bookingId: form.bookingId.trim().toUpperCase(),
        phone: form.phone.trim(),
      });
      setState({
        loading: false,
        error: "",
        result: response.data,
        bookingType: response.bookingType || "BEAUTY",
        socketMessage: "",
      });
    } catch (error) {
      setState({
        loading: false,
        error:
          error.response?.data?.message ||
          "Booking could not be found with the provided details.",
        result: null,
        bookingType: "BEAUTY",
        socketMessage: "",
      });
    }
  }

  async function handlePayRemaining() {
    if (!state.result?.bookingId || !paymentConfig.ready || !paymentConfig.keyId) {
      setPaymentState({ loading: false, error: paymentConfig.message });
      return;
    }

    setPaymentState({ loading: true, error: "" });

    try {
      await loadRazorpayCheckoutScript();
      const orderResponse = await bookingApiService.createPaymentOrder({
        bookingId: state.result.bookingId,
        bookingType: state.bookingType,
        paymentStage: "REMAINING",
      });

      const order = orderResponse.data.order;
      const checkout = new window.Razorpay({
        key: paymentConfig.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Beauty Parlour",
        description: `${state.result.bookingId} remaining payment`,
        theme: { color: "#222222" },
        prefill: {
          name: state.result.customerName || state.result.brideName || "",
          contact: state.result.phone || "",
          email: state.result.email || "",
        },
        handler: async (response) => {
          try {
            const verification = await bookingApiService.verifyPayment(response);
            setPaymentState({ loading: false, error: "" });
            navigate(
              `/payment-success?bookingId=${encodeURIComponent(
                verification.data.bookingId
              )}&paymentId=${encodeURIComponent(
                verification.data.paymentId
              )}&amount=${encodeURIComponent(
                verification.data.amountPaid
              )}&remaining=${encodeURIComponent(
                verification.data.remainingAmount
              )}&status=${encodeURIComponent(verification.data.bookingStatus)}`
            );
          } catch (error) {
            setPaymentState({
              loading: false,
              error:
                error.response?.data?.message ||
                "Remaining payment verification failed. Please contact us before retrying.",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentState({
              loading: false,
              error: "Payment was cancelled before verification.",
            });
          },
        },
      });
      checkout.on("payment.failed", (event) => {
        setPaymentState({
          loading: false,
          error:
            event.error?.description ||
            "Payment failed before completion. Please try again.",
        });
      });
      checkout.open();
      setPaymentState({ loading: false, error: "" });
    } catch (error) {
      setPaymentState({
        loading: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Secure checkout could not be started right now.",
      });
    }
  }

  const canPayRemaining = Boolean(
    state.result &&
      Number(state.result.remainingAmount) > 0 &&
      state.result.bookingStatus === "SERVICE_COMPLETED" &&
      !["PAID", "FULLY_PAID"].includes(state.result.paymentStatus)
  );
  const hasCoupon = Boolean(state.result?.couponCode && Number(state.result?.discountAmount || 0) > 0);

  const originalAmount = Number(
    state.result?.originalAmount ?? state.result?.totalAmount ?? 0
  );
  const discountAmount = Number(state.result?.discountAmount || 0);
  const finalAmount = Number(state.result?.finalAmount ?? state.result?.totalAmount ?? 0);

  return (
    <div>
      <PageHero
        eyebrow="Track Booking"
        title="A guest-friendly tracking page that now reflects real payment and status events."
        description="Use your booking ID and phone number to follow timing, payment progress, and service updates with clarity."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
            <SectionHeader
              eyebrow="Lookup"
              title="Check your appointment or bridal booking in seconds."
              description="Enter the booking ID and the same phone number used during booking."
            />
            <form onSubmit={handleTrack} className="mt-6 grid gap-4">
              <input
                value={form.bookingId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bookingId: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 uppercase outline-none"
                placeholder="Booking ID (e.g. BEAUTY-2026-0001)"
              />
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Phone Number"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white">
                {state.loading ? <LoaderCircle className="animate-spin" size={16} /> : <Search size={16} />}
                Track Booking
              </button>
            </form>
            {state.error ? (
              <div className="mt-6 rounded-[1.5rem] bg-red-50 p-4 text-sm leading-6 text-red-700">
                {state.error}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] bg-cream p-4 text-sm leading-6 text-charcoal/68">
                Enter your booking ID and phone number to load your latest appointment or bridal booking details.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rosewood">
                    {state.result
                      ? `${state.bookingType} Booking`
                      : "Booking Preview"}
                  </p>
                  <h2 className="mt-3 font-display text-4xl">
                    {state.result?.bookingId || "BEAUTY-2026-0001"}
                  </h2>
                </div>
                <span className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                  {state.result?.bookingStatus || "Pending"}
                </span>
              </div>
              {state.socketMessage ? (
                <div className="mt-4 rounded-[1.2rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {state.socketMessage}
                </div>
              ) : null}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    state.bookingType === "BRIDAL" ? "Bride Name" : "Customer Name",
                    state.result?.customerName || state.result?.brideName || "Customer name",
                  ],
                  [
                    state.bookingType === "BRIDAL" ? "Package" : "Service",
                    state.result?.serviceSnapshot?.name ||
                      state.result?.selectedItemSnapshot?.name ||
                      state.result?.bridalPackage?.name ||
                      "Selected item",
                  ],
                  [
                    "Event / Service",
                    state.bookingType === "BRIDAL"
                      ? state.result?.eventType || "Selected event"
                      : state.result?.serviceSnapshot?.categoryName || "Beauty appointment",
                  ],
                  [
                    "Date",
                    state.result?.appointmentDate || state.result?.eventDate
                      ? new Date(
                          state.result?.appointmentDate || state.result?.eventDate
                        ).toLocaleDateString("en-GB")
                      : "DD/MM/YYYY",
                  ],
                  [
                    "Time",
                    state.result?.timeSlot?.label ||
                      state.result?.preferredStartTime ||
                      "Selected slot",
                  ],
                  [
                    "Location",
                    state.result?.serviceLocation || "AT_HOME",
                  ],
                  ...(hasCoupon
                    ? [
                        ["Original Price", state.result ? formatCurrency(originalAmount) : "Rs 0"],
                        ["Coupon Code", state.result?.couponCode || "--"],
                        ["Discount", state.result ? formatCurrency(discountAmount) : "Rs 0"],
                      ]
                    : []),
                  [
                    hasCoupon ? "Final Total" : "Total Amount",
                    state.result ? formatCurrency(finalAmount) : "Rs 0",
                  ],
                  ["Advance Paid", state.result ? formatCurrency(state.result.advanceAmount) : "Rs 0"],
                  ["Remaining Amount", state.result ? formatCurrency(state.result.remainingAmount) : "Rs 0"],
                  ["Payment Status", state.result?.paymentStatus || "PENDING"],
                  ["Booking Status", state.result?.bookingStatus || "PENDING_PAYMENT"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.4rem] bg-porcelain p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">{label}</p>
                    <p className="mt-2 text-sm font-medium text-charcoal/75">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-rosewood/10 bg-cream/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">
                      Payment Section
                    </p>
                    <p className="mt-2 text-sm leading-6 text-charcoal/70">
                      Remaining amount becomes payable here after the service is marked completed.
                    </p>
                  </div>
                  {canPayRemaining ? (
                    <button
                      type="button"
                      onClick={handlePayRemaining}
                      disabled={paymentState.loading || !paymentConfig.ready}
                      className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paymentState.loading ? <LoaderCircle className="animate-spin" size={16} /> : <CreditCard size={16} />}
                      Pay Remaining Amount
                    </button>
                  ) : (
                    <div className="rounded-full border border-rosewood/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/55">
                      No payment action pending
                    </div>
                  )}
                </div>
                {canPayRemaining && !paymentConfig.ready ? (
                  <p className="mt-4 text-sm text-amber-800">{paymentConfig.message}</p>
                ) : null}
                {paymentState.error ? (
                  <div className="mt-4 flex items-center gap-2 rounded-[1.2rem] bg-red-50 px-4 py-3 text-sm text-red-700">
                    <RefreshCcw size={16} />
                    {paymentState.error}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-rosewood/10 bg-charcoal p-6 text-white shadow-panel">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blush" />
                <p className="text-sm uppercase tracking-[0.3em] text-white/55">Timeline</p>
              </div>
              <div className="mt-6 space-y-4">
                {timeline.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`h-4 w-4 rounded-full ${
                          index <= activeIndex ? "bg-blush" : "bg-white/20"
                        }`}
                      />
                      {index !== timeline.length - 1 && (
                        <span className="mt-2 h-10 w-px bg-white/10" />
                      )}
                    </div>
                    <p className={`${index <= activeIndex ? "text-white" : "text-white/55"} text-sm`}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
