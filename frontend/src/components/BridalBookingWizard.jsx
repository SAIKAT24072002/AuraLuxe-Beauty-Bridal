import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPinned,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { bookingApiService } from "../services/bookingApiService";
import { loadRazorpayCheckoutScript } from "../services/razorpayClient";

const stepLabels = [
  "Choose Package",
  "Event Details",
  "Available Time",
  "Bride Details",
  "Location",
  "Summary",
];

const initialForm = {
  eventType: "WEDDING",
  otherEventType: "",
  eventDate: "",
  preferredStartTime: "",
  brideName: "",
  phone: "",
  whatsapp: "",
  email: "",
  alternativeContact: "",
  serviceLocation: "AT_HOME",
  venueName: "",
  fullAddress: "",
  city: "",
  pinCode: "",
  landmark: "",
  googleMapsUrl: "",
  additionalRequirements: "",
  specialNotes: "",
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

function normalizeLocationLabel(value) {
  if (value === "AT_HOME") return "Bride's Home";
  if (value === "AT_WEDDING_VENUE") return "Wedding Venue";
  return value;
}

export default function BridalBookingWizard({
  bridalPackages,
  initialPackage,
  onBookingCreated,
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage?.id || "");
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
    if (initialPackage?.id) {
      setSelectedPackageId(initialPackage.id);
    }
  }, [initialPackage?.id]);

  useEffect(() => {
    setCouponCode("");
    setCouponState(initialCouponState);
  }, [selectedPackageId]);

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

  const selectedPackage = useMemo(
    () =>
      bridalPackages.find((item) => item.id === selectedPackageId) ||
      initialPackage ||
      null,
    [bridalPackages, initialPackage, selectedPackageId]
  );

  useEffect(() => {
    async function loadAvailability() {
      if (!form.eventDate || !selectedPackage?.id || step < 1) return;
      setAvailabilityState({ loading: true, error: "" });

      try {
        const response = await bookingApiService.getBridalAvailability(
          form.eventDate,
          selectedPackage.id
        );
        setAvailability(response.data.slots || []);
        setAvailabilityState({ loading: false, error: "" });
      } catch (error) {
        setAvailability([]);
        setAvailabilityState({
          loading: false,
          error:
            error.response?.data?.message ||
            "Unable to load bridal availability right now.",
        });
      }
    }

    loadAvailability();
  }, [form.eventDate, selectedPackage?.id, step]);

  const summary = useMemo(() => {
    if (!selectedPackage) return null;
    const totalAmount = Number(selectedPackage.discountPrice || selectedPackage.price || 0);
    const advancePercentage = Number(selectedPackage.advancePercentage || 50);
    const advanceAmount = Number(((totalAmount * advancePercentage) / 100).toFixed(2));

    return {
      totalAmount,
      advancePercentage,
      advanceAmount,
      remainingAmount: Number((totalAmount - advanceAmount).toFixed(2)),
    };
  }, [selectedPackage]);

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
    if (step === 0) return Boolean(selectedPackage);
    if (step === 1) {
      return Boolean(
        form.eventDate &&
          form.eventType &&
          (form.eventType !== "OTHER" || form.otherEventType.trim())
      );
    }
    if (step === 2) return Boolean(form.preferredStartTime);
    if (step === 3) return Boolean(form.brideName.trim() && form.phone.trim());
    if (step === 4) {
      return Boolean(
        form.serviceLocation &&
          form.venueName.trim() &&
          form.fullAddress.trim() &&
          form.city.trim() &&
          form.pinCode.trim()
      );
    }
    return true;
  }, [form, selectedPackage, step]);

  async function handleCreateBooking() {
    if (!selectedPackage) return;
    setSubmission({ loading: true, error: "", success: null });
    setPaymentState({ loading: false, error: "", success: null });

    try {
      const response = await bookingApiService.createBridalBooking({
        brideName: form.brideName,
        phone: form.phone,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        alternativeContact: form.alternativeContact || undefined,
        eventType: form.eventType,
        otherEventType: form.eventType === "OTHER" ? form.otherEventType : undefined,
        bridalPackage: selectedPackage.id,
        selectedItemType: "PACKAGE",
        eventDate: form.eventDate,
        preferredStartTime: form.preferredStartTime,
        serviceLocation: form.serviceLocation,
        venueName: form.venueName,
        fullAddress: form.fullAddress,
        city: form.city,
        pinCode: form.pinCode,
        landmark: form.landmark || undefined,
        googleMapsUrl: form.googleMapsUrl || undefined,
        additionalRequirements: form.additionalRequirements || undefined,
        specialNotes: form.specialNotes || undefined,
        couponCode: couponState.applied?.couponCode || undefined,
      });

      setSubmission({ loading: false, error: "", success: response.data });
      onBookingCreated?.(response.data);
    } catch (error) {
      setSubmission({
        loading: false,
        error:
          error.response?.data?.message ||
          "Bridal booking could not be created. Please adjust the slot and try again.",
        success: null,
      });
    }
  }

  async function handleApplyCoupon() {
    if (!selectedPackage?.id || !couponCode.trim()) return;

    setCouponState({ loading: true, error: "", applied: null });
    try {
      const response = await bookingApiService.validateCoupon({
        couponCode: couponCode.trim().toUpperCase(),
        bookingType: "BRIDAL",
        bridalPackageId: selectedPackage.id,
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
        bookingType: "BRIDAL",
        paymentStage: "ADVANCE",
      });

      const order = orderResponse.data.order;
      const checkout = new window.Razorpay({
        key: paymentConfig.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Beauty Parlour Bridal",
        description: `${selectedPackage?.name || "Bridal Package"} advance payment`,
        notes: {
          bookingId: submission.success.bookingId,
          bookingType: "BRIDAL",
        },
        prefill: {
          name: form.brideName,
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

  return (
    <div className="rounded-[2rem] border border-rosewood/10 bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rosewood">
            Bridal Booking Flow
          </p>
          <h3 className="mt-3 font-display text-4xl">
            {selectedPackage?.name || "Premium bridal booking"}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal/68">
            Real package selection, conflict-aware availability, premium venue form, and
            Razorpay-ready advance payment architecture.
          </p>
        </div>
        <div className="rounded-full bg-blush/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-charcoal">
          Pay Advance
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-6">
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bridalPackages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPackageId(item.id)}
                  className={`rounded-[1.7rem] border p-5 text-left transition ${
                    selectedPackageId === item.id
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-rosewood/10 bg-porcelain hover:border-rosewood"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <Sparkles size={18} className="text-rosewood" />
                    {item.featured && (
                      <span className="rounded-full bg-blush/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-charcoal">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-5 font-display text-2xl">{item.name}</p>
                  <p className="mt-3 text-sm leading-6 opacity-80">{item.tagline}</p>
                  <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                    <span>{item.duration}</span>
                    <span className="font-semibold">
                      {formatCurrency(item.discountPrice || item.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Event Type</span>
                <select
                  value={form.eventType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      eventType: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                >
                  <option value="WEDDING">Wedding</option>
                  <option value="ENGAGEMENT">Engagement</option>
                  <option value="RECEPTION">Reception</option>
                  <option value="HALDI">Haldi</option>
                  <option value="MEHENDI">Mehendi</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Event Date</span>
                <input
                  type="date"
                  min={todayDate}
                  value={form.eventDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      eventDate: event.target.value,
                      preferredStartTime: "",
                    }))
                  }
                  className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                />
              </label>
              {form.eventType === "OTHER" && (
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">Other Event Type</span>
                  <input
                    value={form.otherEventType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        otherEventType: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                    placeholder="Describe the event"
                  />
                </label>
              )}
              <div className="rounded-[1.6rem] bg-cream p-5 text-sm leading-6 text-charcoal/72 md:col-span-2">
                Choose the bridal event and date first. Available start times are loaded live
                from the backend to prevent conflicting artist schedules.
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {availabilityState.loading && (
                <div className="flex items-center gap-3 rounded-[1.6rem] bg-cream p-4 text-sm">
                  <LoaderCircle className="animate-spin" size={18} />
                  Loading bridal availability...
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
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          preferredStartTime: slot.start,
                        }))
                      }
                      className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm transition ${
                        form.preferredStartTime === slot.start
                          ? "border-charcoal bg-charcoal text-white"
                          : slot.isAvailable
                            ? "border-rosewood/10 bg-white hover:border-rosewood"
                            : "border-transparent bg-cream text-charcoal/40"
                      }`}
                    >
                      <p className="font-semibold">{slot.label}</p>
                      <p className="mt-1 text-xs">
                        {slot.isAvailable ? "Available" : slot.conflictReason || "Blocked"}
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
                value={form.brideName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, brideName: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Bride Name"
              />
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Mobile Number"
              />
              <input
                value={form.whatsapp}
                onChange={(event) =>
                  setForm((current) => ({ ...current, whatsapp: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="WhatsApp Number"
              />
              <input
                value={form.alternativeContact}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    alternativeContact: event.target.value,
                  }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Alternative Contact (optional)"
              />
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Email (optional)"
              />
              <textarea
                rows="4"
                value={form.additionalRequirements}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    additionalRequirements: event.target.value,
                  }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Special Requirements"
              />
              <textarea
                rows="4"
                value={form.specialNotes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    specialNotes: event.target.value,
                  }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Notes"
              />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm md:col-span-2">
                <span className="font-medium">Service Location</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["AT_HOME", "Bride's Home"],
                    ["AT_WEDDING_VENUE", "Wedding Venue"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          serviceLocation: value,
                        }))
                      }
                      className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm transition ${
                        form.serviceLocation === value
                          ? "border-charcoal bg-charcoal text-white"
                          : "border-rosewood/10 bg-white hover:border-rosewood"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>
              <input
                value={form.venueName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, venueName: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Venue / House Name"
              />
              <input
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="City"
              />
              <input
                value={form.pinCode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pinCode: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="PIN Code"
              />
              <input
                value={form.landmark}
                onChange={(event) =>
                  setForm((current) => ({ ...current, landmark: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none"
                placeholder="Landmark (optional)"
              />
              <textarea
                rows="4"
                value={form.fullAddress}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullAddress: event.target.value }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Full Address"
              />
              <input
                value={form.googleMapsUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    googleMapsUrl: event.target.value,
                  }))
                }
                className="rounded-2xl border border-rosewood/15 bg-porcelain px-4 py-3 outline-none md:col-span-2"
                placeholder="Google Maps Link (optional)"
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-[1.6rem] bg-porcelain p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Booking Type", "Bridal Package"],
                    ["Bride", form.brideName],
                    ["Package", selectedPackage?.name],
                    [
                      "Event",
                      form.eventType === "OTHER" ? form.otherEventType : form.eventType,
                    ],
                    ["Date", formatDate(form.eventDate)],
                    ["Time", form.preferredStartTime || "--"],
                    ["Location", normalizeLocationLabel(form.serviceLocation)],
                    ["Address", `${form.venueName}, ${form.city}`],
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
                      <p className="font-semibold">Bridal booking created successfully.</p>
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
            {step < 5 && (
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => setStep((current) => current + 1)}
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            )}
            {step === 5 && !submission.success && (
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={submission.loading}
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submission.loading ? "Creating Booking..." : "Create Booking"}
              </button>
            )}
            {step === 5 && submission.success && (
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
            {step === 5 && submission.success && paymentState.error && paymentConfig.ready && (
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
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">Booking Summary</p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Package</span>
              <span className="font-medium">{selectedPackage?.name || "--"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Duration</span>
              <span className="font-medium">{selectedPackage?.duration || "--"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/68">Location</span>
              <span className="font-medium">
                {normalizeLocationLabel(form.serviceLocation)}
              </span>
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
                    <span className="font-semibold">
                      {formatCurrency(activePricing?.originalAmount || 0)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-white/68">Coupon Code</span>
                    <span className="font-semibold">{activePricing?.couponCode || "--"}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-white/68">Discount</span>
                    <span className="font-semibold text-emerald-300">
                      - {formatCurrency(activePricing?.discountAmount || 0)}
                    </span>
                  </div>
                </>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-white/68">{hasCoupon ? "Final Total" : "Total Amount"}</span>
                <span className="font-semibold">
                  {formatCurrency(activePricing?.finalAmount || 0)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-white/68">Advance Required</span>
                <span className="font-semibold text-blush">
                  {formatCurrency(activePricing?.advanceAmount || 0)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-white/68">Remaining Amount</span>
                <span className="font-semibold">
                  {formatCurrency(activePricing?.remainingAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 p-4 text-sm leading-6 text-white/70">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-1 text-blush" />
              <p>
                Backend uses MongoDB package pricing and advance percentage as authoritative
                values. Frontend only opens verified backend payment orders.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-white/10 p-4 text-sm leading-6 text-white/70">
            <div className="flex items-start gap-3">
              <MapPinned size={18} className="mt-1 text-blush" />
              <p>
                Home and venue addresses stay linked to the booking so bridal artists can
                prepare before departure.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
