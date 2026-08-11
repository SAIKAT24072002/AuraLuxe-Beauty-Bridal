import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { bookingApiService } from "../services/bookingApiService";
import { loadRazorpayCheckoutScript } from "../services/razorpayClient";

const stepLabels = [
  "Select Service",
  "Choose Date",
  "Available Slot",
  "Customer Details",
  "Booking Summary",
];

const initialForm = {
  customerName: "",
  phone: "",
  email: "",
  appointmentDate: "",
  timeSlot: null,
  numberOfPersons: 1,
  notes: "",
};

const initialCouponState = {
  loading: false,
  error: "",
  applied: null,
};

const todayDate = new Date().toISOString().slice(0, 10);

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AppointmentBookingWizard({ service, onClose, onBookingCreated }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [availability, setAvailability] = useState([]);
  const [availabilityState, setAvailabilityState] = useState({
    loading: false,
    error: "",
  });
  const [paymentConfig, setPaymentConfig] = useState({
    loading: false,
    ready: false,
    keyId: "",
    message: "Online payment is currently unavailable. Please contact us or try again later.",
  });
  const [submission, setSubmission] = useState({
    loading: false,
    error: "",
    success: null,
  });
  const [paymentState, setPaymentState] = useState({
    loading: false,
    error: "",
    success: null,
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState(initialCouponState);

  useEffect(() => {
    setStep(0);
    setForm(initialForm);
    setAvailability([]);
    setAvailabilityState({ loading: false, error: "" });
    setSubmission({ loading: false, error: "", success: null });
    setPaymentState({ loading: false, error: "", success: null });
    setCouponCode("");
    setCouponState(initialCouponState);
  }, [service?.id]);

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
    async function loadAvailability() {
      if (!service?.id || !form.appointmentDate || step < 1) return;
      setAvailabilityState({ loading: true, error: "" });

      try {
        const response = await bookingApiService.getAvailability(
          service.id,
          form.appointmentDate
        );
        setAvailability(response.data.slots);
        setAvailabilityState({ loading: false, error: "" });
      } catch (error) {
        setAvailability([]);
        setAvailabilityState({
          loading: false,
          error:
            error.response?.data?.message ||
            "Unable to load available time slots right now.",
        });
      }
    }

    loadAvailability();
  }, [form.appointmentDate, service?.id, step]);

  const summary = useMemo(() => {
    if (!service) return null;
    const totalAmount = Number(service.price || 0);
    const advancePercentage = Number(service.advancePercentage || 50);
    const advanceAmount = Number(((totalAmount * advancePercentage) / 100).toFixed(2));
    return {
      totalAmount,
      advancePercentage,
      advanceAmount,
      remainingAmount: Number((totalAmount - advanceAmount).toFixed(2)),
    };
  }, [service]);

  const activePricing = useMemo(() => {
    const source = submission.success || couponState.applied || summary;
    if (!source) return null;

    return {
      originalAmount: Number(source.originalAmount ?? source.totalAmount ?? 0),
      discountAmount: Number(source.discountAmount || 0),
      finalAmount: Number(source.finalAmount ?? source.totalAmount ?? 0),
      advancePercentage: Number(source.advancePercentage || 50),
      advanceAmount: Number(source.advanceAmount || 0),
      remainingAmount: Number(source.remainingAmount || 0),
      couponCode: source.couponCode || "",
    };
  }, [couponState.applied, submission.success, summary]);
  const hasCoupon = Boolean(activePricing?.couponCode && Number(activePricing?.discountAmount || 0) > 0);

  const canProceed = useMemo(() => {
    if (step === 0) return Boolean(service);
    if (step === 1) return Boolean(form.appointmentDate);
    if (step === 2) return Boolean(form.timeSlot);
    if (step === 3) return form.customerName.trim() && form.phone.trim();
    return true;
  }, [form, service, step]);

  async function handleCreateBooking() {
    if (!service || !form.timeSlot) return;
    setSubmission({ loading: true, error: "", success: null });
    setPaymentState({ loading: false, error: "", success: null });

    try {
      const response = await bookingApiService.createAppointment({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email || undefined,
        service: service.id,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        numberOfPersons: Number(form.numberOfPersons) || 1,
        notes: form.notes || undefined,
        couponCode: couponState.applied?.couponCode || undefined,
      });

      setSubmission({ loading: false, error: "", success: response.data });
      onBookingCreated?.(response.data);
    } catch (error) {
      setSubmission({
        loading: false,
        error:
          error.response?.data?.message ||
          "Booking could not be created. Please choose another slot.",
        success: null,
      });
    }
  }

  async function handlePayAdvance() {
    if (!submission.success?.bookingId || !paymentConfig.ready || !paymentConfig.keyId) {
      setPaymentState({
        loading: false,
        error: paymentConfig.message,
        success: null,
      });
      return;
    }

    setPaymentState({ loading: true, error: "", success: null });

    try {
      await loadRazorpayCheckoutScript();
      const orderResponse = await bookingApiService.createPaymentOrder({
        bookingId: submission.success.bookingId,
        bookingType: "BEAUTY",
        paymentStage: "ADVANCE",
      });

      const order = orderResponse.data.order;
      const checkout = new window.Razorpay({
        key: paymentConfig.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Beauty Parlour",
        description: `${service.name} advance payment`,
        notes: {
          bookingId: submission.success.bookingId,
          bookingType: "BEAUTY",
        },
        prefill: {
          name: form.customerName,
          contact: form.phone,
          email: form.email || undefined,
        },
        theme: { color: "#222222" },
        modal: {
          ondismiss: () => {
            setPaymentState({
              loading: false,
              error: "Payment was cancelled before verification.",
              success: null,
            });
          },
        },
        handler: async (response) => {
          try {
            const verification = await bookingApiService.verifyPayment(response);
            setPaymentState({ loading: false, error: "", success: verification.data });
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
                "Payment verification failed. Please contact us before retrying.",
              success: null,
            });
          }
        },
      });

      checkout.on("payment.failed", (event) => {
        setPaymentState({
          loading: false,
          error:
            event.error?.description ||
            "Payment failed before completion. Please try again.",
          success: null,
        });
      });
      checkout.open();
      setPaymentState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setPaymentState({
        loading: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Secure checkout could not be started right now.",
        success: null,
      });
    }
  }

  async function handleApplyCoupon() {
    if (!service?.id || !couponCode.trim()) return;

    setCouponState({ loading: true, error: "", applied: null });
    try {
      const response = await bookingApiService.validateCoupon({
        couponCode: couponCode.trim().toUpperCase(),
        bookingType: "BEAUTY",
        serviceId: service.id,
      });
      setCouponCode(response.data.couponCode || couponCode.trim().toUpperCase());
      setCouponState({ loading: false, error: "", applied: response.data });
    } catch (error) {
      setCouponState({
        loading: false,
        error:
          error.response?.data?.message ||
          "Coupon could not be applied right now. Please try again.",
        applied: null,
      });
    }
  }

  function handleRemoveCoupon() {
    setCouponCode("");
    setCouponState(initialCouponState);
  }

  if (!service || !summary || !activePricing) return null;

  return (
    <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rosewood">Beauty Booking Flow</p>
          <h3 className="mt-3 font-display text-4xl">{service.name}</h3>
          <p className="mt-2 text-sm leading-6 text-charcoal/68">
            Choose your date, preferred slot, and guest details before confirming a polished advance summary.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-rosewood/15 px-4 py-2 text-sm font-semibold"
        >
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className={`rounded-[1.4rem] px-4 py-3 text-sm ${
              index === step
                ? "bg-charcoal text-white"
                : index < step
                  ? "bg-blush/60 text-charcoal"
                  : "bg-cream text-charcoal/60"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          {step === 0 && (
            <div className="rounded-[1.6rem] bg-porcelain p-5">
              <p className="text-sm leading-7 text-charcoal/74">
                Selected service: <span className="font-semibold">{service.name}</span>
              </p>
            </div>
          )}

          {step === 1 && (
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Appointment Date</span>
              <input
                type="date"
                min={todayDate}
                value={form.appointmentDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    appointmentDate: event.target.value,
                    timeSlot: null,
                  }))
                }
                className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
              />
            </label>
          )}

          {step === 2 && (
            <div>
              {availabilityState.loading && (
                <div className="flex items-center gap-3 rounded-[1.6rem] bg-cream p-4 text-sm">
                  <LoaderCircle className="animate-spin" size={18} />
                  Loading available time slots...
                </div>
              )}
              {availabilityState.error && (
                <div className="rounded-[1.6rem] bg-red-50 p-4 text-sm text-red-700">
                  {availabilityState.error}
                </div>
              )}
              {!availabilityState.loading && !availabilityState.error && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availability.map((slot) => (
                    <button
                      key={slot.key}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setForm((current) => ({ ...current, timeSlot: slot }))}
                      className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm transition ${
                        form.timeSlot?.key === slot.key
                          ? "border-charcoal bg-charcoal text-white"
                          : slot.isAvailable
                            ? "border-rosewood/10 bg-white hover:border-rosewood"
                            : "border-transparent bg-cream text-charcoal/40"
                      }`}
                    >
                      <p className="font-semibold">{slot.label}</p>
                      <p className="mt-1 text-xs">
                        {slot.isAvailable ? "Available" : "Already booked"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.customerName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerName: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Full Name"
              />
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Phone Number"
              />
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Email (optional)"
              />
              <input
                type="number"
                min="1"
                value={form.numberOfPersons}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    numberOfPersons: event.target.value,
                  }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Number of Persons"
              />
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Notes (optional)"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-[1.6rem] bg-porcelain p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Customer", form.customerName],
                    ["Phone", form.phone],
                    ["Service", service.name],
                    ["Date", formatDate(form.appointmentDate)],
                    ["Time", form.timeSlot?.label],
                    ["Persons", String(form.numberOfPersons || 1)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs uppercase tracking-[0.25em] text-charcoal/45">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-charcoal/75">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {!paymentConfig.ready && (
                <div className="rounded-[1.6rem] bg-amber-50 p-4 text-sm text-amber-800">
                  {paymentConfig.message}
                </div>
              )}

              {submission.error && (
                <div className="rounded-[1.6rem] bg-red-50 p-4 text-sm text-red-700">
                  {submission.error}
                </div>
              )}

              {submission.success && (
                <div className="rounded-[1.6rem] bg-emerald-50 p-4 text-sm text-emerald-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5" />
                    <div>
                      <p className="font-semibold">Pending booking created successfully.</p>
                      <p className="mt-1">
                        Booking ID: {submission.success.bookingId} | Status:{" "}
                        {submission.success.bookingStatus}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentState.error && (
                <div className="rounded-[1.6rem] bg-red-50 p-4 text-sm text-red-700">
                  {paymentState.error}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="rounded-full border border-rosewood/15 px-5 py-3 text-sm font-semibold"
              >
                Back
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => setStep((current) => current + 1)}
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            )}
            {step === 4 && !submission.success && (
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={submission.loading}
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submission.loading ? "Creating Booking..." : "Create Pending Booking"}
              </button>
            )}
            {step === 4 && submission.success && (
              <button
                type="button"
                onClick={handlePayAdvance}
                disabled={paymentState.loading || !paymentConfig.ready}
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentState.loading ? <LoaderCircle className="animate-spin" size={16} /> : <CreditCard size={16} />}
                Pay Securely
              </button>
            )}
            {step === 4 && submission.success && paymentState.error && paymentConfig.ready && (
              <button
                type="button"
                onClick={handlePayAdvance}
                className="inline-flex items-center gap-2 rounded-full border border-rosewood/15 px-5 py-3 text-sm font-semibold"
              >
                <RefreshCcw size={16} />
                Retry Payment
              </button>
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-rosewood/10 bg-charcoal p-6 text-white shadow-panel">
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">Payment Summary</p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Service</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Duration</span>
              <span className="font-medium">{service.duration}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Advance %</span>
              <span className="font-medium">{summary.advancePercentage}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Payment Status</span>
              <span className="font-medium">
                {paymentState.success?.paymentStatus ||
                  submission.success?.paymentStatus ||
                  "PENDING"}
              </span>
            </div>
            <div className="rounded-[1.4rem] bg-white/8 p-4">
              <div className="space-y-3 rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                  Coupon Code
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
                  />
                  {couponState.applied ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponState.loading || !couponCode.trim()}
                      className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {couponState.loading ? "Applying..." : "Apply Coupon"}
                    </button>
                  )}
                </div>
                {couponState.applied ? (
                  <p className="text-sm text-emerald-300">
                    Applied {couponState.applied.couponCode} successfully.
                  </p>
                ) : null}
                {couponState.error ? (
                  <p className="text-sm text-rose-200">{couponState.error}</p>
                ) : null}
              </div>
              {hasCoupon ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/68">Original Price</span>
                    <span className="font-semibold">{formatCurrency(activePricing.originalAmount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-white/68">Coupon Code</span>
                    <span className="font-semibold">{activePricing.couponCode}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-white/68">Discount</span>
                    <span className="font-semibold text-emerald-300">
                      - {formatCurrency(activePricing.discountAmount)}
                    </span>
                  </div>
                </>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-white/68">{hasCoupon ? "Final Total" : "Total Amount"}</span>
                <span className="font-semibold">{formatCurrency(activePricing.finalAmount)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-white/68">Advance Amount</span>
                <span className="font-semibold text-blush">
                  {formatCurrency(activePricing.advanceAmount)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-white/68">Remaining</span>
                <span className="font-semibold">
                  {formatCurrency(activePricing.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 p-4 text-sm leading-6 text-white/70">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-1 text-blush" />
              <p>
                Final totals, advance amounts, and payment verification are always confirmed securely before checkout opens.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
