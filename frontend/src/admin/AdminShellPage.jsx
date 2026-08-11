import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarRange,
  CreditCard,
  FolderKanban,
  GalleryVerticalEnd,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Menu,
  Package2,
  PanelLeftClose,
  PanelLeftOpen,
  Scissors,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { bookingApiService } from "../services/bookingApiService";
import { getSocketClient } from "../services/socketClient";
import { optimizeCloudinaryImage } from "../utils/media";

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "beauty", label: "Beauty Appointments", icon: Scissors },
  { id: "bridal", label: "Bridal Bookings", icon: Sparkles },
  { id: "categories", label: "Categories", icon: FolderKanban },
  { id: "services", label: "Beauty Services", icon: Package2 },
  { id: "packages", label: "Bridal Packages", icon: Sparkles },
  { id: "availability", label: "Availability", icon: CalendarRange },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "offers", label: "Offers & Coupons", icon: Tag },
  { id: "gallery", label: "Gallery", icon: ImagePlus },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "content", label: "Website Content", icon: GalleryVerticalEnd },
  { id: "settings", label: "Settings", icon: Settings },
];

const emptyCategoryForm = {
  name: "",
  description: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

const emptyServiceForm = {
  name: "",
  category: "",
  shortDescription: "",
  description: "",
  image: "",
  imagePublicId: "",
  price: 0,
  durationMinutes: 60,
  advancePercentage: 50,
  featured: false,
  isAvailable: true,
};

const emptyPackageForm = {
  name: "",
  coverImage: "",
  coverImagePublicId: "",
  shortDescription: "",
  fullDescription: "",
  includedServices: "",
  price: 0,
  discountPrice: 0,
  durationMinutes: 240,
  advancePercentage: 50,
  homeServiceAvailable: true,
  venueServiceAvailable: true,
  featured: false,
  isActive: true,
  galleryImages: "",
  galleryMedia: [],
};

const emptyAvailabilityForm = {
  type: "BEAUTY",
  openingTime: "10:00",
  closingTime: "19:00",
  slotDurationMinutes: 30,
  availableDays: "0,1,2,3,4,5,6",
  blockedDates: "",
  blockedTimeSlots: "",
  isActive: true,
};

const emptyOfferForm = {
  name: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  couponCode: "",
  minimumBookingAmount: 0,
  maximumDiscount: 0,
  applicableBookingTypes: ["BEAUTY", "BRIDAL"],
  applicableServices: [],
  applicableBridalPackages: [],
  startDate: "",
  endDate: "",
  image: "",
  imagePublicId: "",
  isActive: true,
};

const emptyGalleryForm = {
  title: "",
  imageUrl: "",
  publicId: "",
  category: "BRIDAL",
  featured: false,
  sortOrder: 0,
};

const emptyTestimonialForm = {
  customerName: "",
  rating: 5,
  review: "",
  serviceLabel: "",
  image: "",
  imagePublicId: "",
  featured: false,
  isActive: true,
};

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-GB");
}

function formatDateTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-GB");
}

function getStoredToken() {
  return window.localStorage.getItem("beauty-admin-token") || "";
}

function parseLines(value, mapper = (item) => item) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(mapper);
}

function toggleArrayValue(items, value) {
  if (!Array.isArray(items)) {
    return [value];
  }

  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function ShellCard({ title, value, tone = "default" }) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 shadow-sm ${
        tone === "dark"
          ? "border-charcoal/10 bg-charcoal text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <p className={`text-sm ${tone === "dark" ? "text-white/65" : "text-slate-500"}`}>{title}</p>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, description, actions, children }) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[1.8rem] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ state, onCancel, onConfirm }) {
  if (!state) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-[1.6rem] bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{state.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">{state.message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ${
        props.className || ""
      }`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ${
        props.className || ""
      }`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ${
        props.className || ""
      }`}
    />
  );
}

function ImagePreview({ src, alt }) {
  if (!src) {
    return (
      <div className="grid h-44 place-items-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        No image selected
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <img
        src={optimizeCloudinaryImage(src, { width: 900, height: 720, crop: "fill" })}
        alt={alt}
        className="h-44 w-full object-cover"
      />
    </div>
  );
}

function UploadActions({ uploading, onUpload, onRemove, disabled }) {
  return (
    <div className="flex flex-wrap gap-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
        {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        {uploading ? "Uploading..." : "Select Image"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || uploading}
          onChange={onUpload}
        />
      </label>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled || uploading}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}

function PackageGalleryPreview({ items, onRemove, uploading }) {
  if (!items.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        Upload package gallery images to show them on the bridal detail page.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <div key={`${item.url || item.publicId || index}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
          <img
            src={optimizeCloudinaryImage(item.url, { width: 900, height: 640, crop: "fill" })}
            alt={`Package gallery ${index + 1}`}
            className="h-36 w-full object-cover"
          />
          <div className="flex items-center justify-between gap-3 p-3">
            <p className="truncate text-xs text-slate-500">{item.publicId || "Uploaded image"}</p>
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={uploading}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileCards({ items, render }) {
  return <div className="grid gap-4 lg:hidden">{items.map(render)}</div>;
}

function DesktopTable({ headers, rows }) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            {headers.map((header) => (
              <th key={header} className="pb-3 pr-6 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default function AdminShellPage() {
  const [token, setToken] = useState(getStoredToken);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [authState, setAuthState] = useState({ loading: false, error: "" });
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [state, setState] = useState({
    loading: false,
    error: "",
    notice: "",
  });
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bridalBookings, setBridalBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [offers, setOffers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    bookingStatus: "",
    paymentStatus: "",
    eventType: "",
    date: "",
  });
  const [modal, setModal] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState("");

  useEffect(() => {
    if (!token) {
      setProfile(null);
      window.localStorage.removeItem("beauty-admin-token");
      return;
    }
    window.localStorage.setItem("beauty-admin-token", token);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadAll(token, true);
    loadProfile(token);
  }, [token]);

  useEffect(() => {
    let socket;
    async function bindRealtime() {
      if (!token) return;
      try {
        socket = await getSocketClient();
        socket.emit("admin:join");
        ["booking:new", "booking:status-updated", "payment:verified", "message:new", "notification:new"].forEach(
          (eventName) => {
            socket.on(eventName, () => loadAll(token, false));
          }
        );
      } catch {
        // non-blocking
      }
    }
    bindRealtime();
    return () => {
      if (socket) {
        ["booking:new", "booking:status-updated", "payment:verified", "message:new", "notification:new"].forEach(
          (eventName) => socket.off(eventName)
        );
      }
    };
  }, [token]);

  async function loadProfile(activeToken) {
    try {
      const response = await bookingApiService.getAdminProfile(activeToken);
      setProfile(response.data);
    } catch {
      setProfile(null);
    }
  }

  async function loadAll(activeToken, showLoader) {
    if (!activeToken) return;
    if (showLoader) {
      setState((current) => ({ ...current, loading: true, error: "" }));
    }

    try {
      const [
        dashboardResponse,
        appointmentResponse,
        bridalResponse,
        paymentResponse,
        categoryResponse,
        serviceResponse,
        packageResponse,
        availabilityResponse,
        offerResponse,
        galleryResponse,
        testimonialResponse,
        messageResponse,
        settingsResponse,
        notificationResponse,
      ] = await Promise.all([
        bookingApiService.getAdminDashboardSummary(activeToken),
        bookingApiService.getAdminAppointments(activeToken),
        bookingApiService.getAdminBridalBookings(activeToken),
        bookingApiService.getAdminPayments(activeToken),
        bookingApiService.getAdminCategories(activeToken),
        bookingApiService.getAdminServices(activeToken),
        bookingApiService.getAdminBridalPackages(activeToken),
        bookingApiService.getAdminAvailability(activeToken),
        bookingApiService.getAdminOffers(activeToken),
        bookingApiService.getAdminGallery(activeToken),
        bookingApiService.getAdminTestimonials(activeToken),
        bookingApiService.getAdminMessages(activeToken),
        bookingApiService.getAdminSiteSettings(activeToken),
        bookingApiService.getAdminNotifications(activeToken),
      ]);

      setDashboard(dashboardResponse.data);
      setAppointments(appointmentResponse.data || []);
      setBridalBookings(bridalResponse.data || []);
      setPayments(paymentResponse.data || []);
      setCategories(categoryResponse.data || []);
      setServices(serviceResponse.data || []);
      setPackages(packageResponse.data || []);
      setAvailability(availabilityResponse.data || []);
      setOffers(offerResponse.data || []);
      setGallery(galleryResponse.data || []);
      setTestimonials(testimonialResponse.data || []);
      setMessages(messageResponse.data || []);
      setSettings(settingsResponse.data || {});
      setNotifications(notificationResponse.data || []);
      setState((current) => ({ ...current, loading: false, error: "" }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.response?.data?.message || "Admin data could not be loaded right now.",
      }));
    }
  }

  function openModal(kind, payload = null) {
    const normalizedPackagePayload = payload
      ? {
          ...payload,
          galleryMedia: Array.isArray(payload.galleryMedia)
            ? payload.galleryMedia
            : (payload.galleryImages || []).map((url) => ({ url })),
        }
      : emptyPackageForm;

    const formMap = {
      category: payload || emptyCategoryForm,
      service:
        payload ||
        {
          ...emptyServiceForm,
            category: categories[0]?._id || "",
        },
      package: normalizedPackagePayload,
      availability:
        payload ||
        {
          ...emptyAvailabilityForm,
          blockedDates: "",
          blockedTimeSlots: "",
        },
      offer: payload || emptyOfferForm,
      gallery: payload || emptyGalleryForm,
      testimonial: payload || emptyTestimonialForm,
      settings: payload || settings || {},
    };
    setModal({ kind, form: formMap[kind] });
  }

  function closeModal() {
    setModal(null);
  }

  function updateModalForm(field, value) {
    setModal((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: value,
      },
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthState({ loading: true, error: "" });
    try {
      const response = await bookingApiService.adminLogin(loginForm);
      setToken(response.token);
      setAuthState({ loading: false, error: "" });
    } catch (error) {
      setAuthState({
        loading: false,
        error: error.response?.data?.message || "Admin login failed.",
      });
    }
  }

  async function handleLogout() {
    try {
      if (token) {
        await bookingApiService.adminLogout(token);
      }
    } catch {
      // ignore
    } finally {
      setToken("");
      setProfile(null);
      setSidebarOpen(false);
    }
  }

  function showNotice(message) {
    setState((current) => ({ ...current, notice: message, error: "" }));
    window.setTimeout(() => {
      setState((current) => ({ ...current, notice: "" }));
    }, 2500);
  }

  async function uploadMediaFile(file, folderKey) {
    if (!token || !file) return null;

    setUploadingAsset(folderKey);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folderKey", folderKey);

    try {
      const response = await bookingApiService.uploadAdminMedia(token, formData);
      return response.data;
    } finally {
      setUploadingAsset("");
    }
  }

  async function handleSingleMediaUpload(event, config) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const result = await uploadMediaFile(file, config.folderKey);
      if (!result) return;
      updateModalForm(config.urlField, result.secureUrl);
      updateModalForm(config.publicIdField, result.publicId);
      showNotice(`${config.label} uploaded successfully.`);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.response?.data?.message || `${config.label} upload failed.`,
      }));
    }
  }

  function removeSingleMedia(urlField, publicIdField) {
    updateModalForm(urlField, "");
    updateModalForm(publicIdField, "");
  }

  async function handlePackageGalleryUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadMediaFile(file, "bridal");
        if (result) {
          uploaded.push({ url: result.secureUrl, publicId: result.publicId });
        }
      }

      if (!uploaded.length) return;
      updateModalForm("galleryMedia", [...(modal?.form.galleryMedia || []), ...uploaded]);
      showNotice("Package gallery updated successfully.");
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.response?.data?.message || "Package gallery upload failed.",
      }));
    }
  }

  function removePackageGalleryImage(index) {
    updateModalForm(
      "galleryMedia",
      (modal?.form.galleryMedia || []).filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function submitModal() {
    if (!modal || !token) return;
    setSubmitting(true);
    try {
      if (modal.kind === "category") {
        if (modal.form._id) {
          await bookingApiService.updateAdminCategory(token, modal.form._id, modal.form);
        } else {
          await bookingApiService.createAdminCategory(token, modal.form);
        }
      }
      if (modal.kind === "service") {
        const payload = {
          ...modal.form,
          price: Number(modal.form.price),
          durationMinutes: Number(modal.form.durationMinutes),
          advancePercentage: Number(modal.form.advancePercentage),
        };
        if (modal.form._id) {
          await bookingApiService.updateAdminService(token, modal.form._id, payload);
        } else {
          await bookingApiService.createAdminService(token, payload);
        }
      }
      if (modal.kind === "package") {
        const payload = {
          ...modal.form,
          includedServices: parseLines(modal.form.includedServices || modal.form.includedServicesText),
          galleryMedia: modal.form.galleryMedia || [],
          galleryImages: (modal.form.galleryMedia || []).map((item) => item.url).filter(Boolean),
          price: Number(modal.form.price),
          discountPrice: Number(modal.form.discountPrice || 0),
          durationMinutes: Number(modal.form.durationMinutes),
          advancePercentage: Number(modal.form.advancePercentage),
        };
        if (modal.form._id) {
          await bookingApiService.updateAdminBridalPackage(token, modal.form._id, payload);
        } else {
          await bookingApiService.createAdminBridalPackage(token, payload);
        }
      }
      if (modal.kind === "availability") {
        const payload = {
          ...modal.form,
          slotDurationMinutes: Number(modal.form.slotDurationMinutes),
          availableDays: String(modal.form.availableDays)
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isInteger(item)),
          blockedDates: parseLines(modal.form.blockedDates, (item) => ({
            date: new Date(`${item}T00:00:00.000Z`).toISOString(),
          })),
          blockedTimeSlots: parseLines(modal.form.blockedTimeSlots, (item) => {
            const [start, end] = item.split("-").map((part) => part.trim());
            return { start, end, reason: "Admin blocked" };
          }),
        };
        if (modal.form._id) {
          await bookingApiService.updateAdminAvailability(token, modal.form._id, payload);
        } else {
          await bookingApiService.createAdminAvailability(token, payload);
        }
      }
      if (modal.kind === "offer") {
        const payload = {
          ...modal.form,
          discountValue: Number(modal.form.discountValue),
          minimumBookingAmount: Number(modal.form.minimumBookingAmount || 0),
          maximumDiscount: Number(modal.form.maximumDiscount || 0),
          applicableBookingTypes: modal.form.applicableBookingTypes || ["BEAUTY", "BRIDAL"],
          applicableServices: modal.form.applicableServices || [],
          applicableBridalPackages: modal.form.applicableBridalPackages || [],
          startDate: modal.form.startDate
            ? new Date(`${modal.form.startDate}T00:00:00.000Z`).toISOString()
            : undefined,
          endDate: modal.form.endDate
            ? new Date(`${modal.form.endDate}T00:00:00.000Z`).toISOString()
            : undefined,
        };
        if (modal.form._id) {
          await bookingApiService.updateAdminOffer(token, modal.form._id, payload);
        } else {
          await bookingApiService.createAdminOffer(token, payload);
        }
      }
      if (modal.kind === "gallery") {
        const payload = {
          ...modal.form,
          sortOrder: Number(modal.form.sortOrder || 0),
        };
        if (modal.form._id) {
          await bookingApiService.updateAdminGallery(token, modal.form._id, payload);
        } else {
          await bookingApiService.createAdminGallery(token, payload);
        }
      }
      if (modal.kind === "testimonial") {
        const payload = {
          ...modal.form,
          rating: Number(modal.form.rating),
        };
        if (modal.form._id) {
          await bookingApiService.updateAdminTestimonial(token, modal.form._id, payload);
        } else {
          await bookingApiService.createAdminTestimonial(token, payload);
        }
      }
      if (modal.kind === "settings") {
        const payload = {
          ...modal.form,
          whyChooseUs: parseLines(modal.form.whyChooseUsText),
          trackTimeline: parseLines(modal.form.trackTimelineText),
          stats: parseLines(modal.form.statsText, (item) => {
            const [label, value] = item.split(":").map((part) => part.trim());
            return { label, value };
          }).filter((item) => item.label && item.value),
          openingHours: parseLines(modal.form.openingHoursText, (item) => {
            const [day, schedule] = item.split(":").map((part) => part.trim());
            if (!day) return null;
            if (!schedule || schedule.toLowerCase() === "closed") {
              return { day, isClosed: true };
            }
            const [open, close] = schedule.split("-").map((part) => part.trim());
            return { day, open, close, isClosed: false };
          }).filter(Boolean),
          defaultAdvancePercentage: Number(modal.form.defaultAdvancePercentage || 50),
        };
        await bookingApiService.updateAdminSiteSettings(token, payload);
      }

      closeModal();
      showNotice("Changes saved successfully.");
      await loadAll(token, false);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.response?.data?.message || "Save failed.",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  function askDelete(label, action) {
    setConfirmState({
      title: `Delete ${label}?`,
      message:
        "This action can remove data from the admin panel. If the item already appears in bookings, prefer deactivation instead of deleting it.",
      action,
    });
  }

  async function handleDelete(kind, id) {
    if (!token) return;
    try {
      if (kind === "category") await bookingApiService.deleteAdminCategory(token, id);
      if (kind === "service") await bookingApiService.deleteAdminService(token, id);
      if (kind === "package") await bookingApiService.deleteAdminBridalPackage(token, id);
      if (kind === "availability") await bookingApiService.deleteAdminAvailability(token, id);
      if (kind === "offer") await bookingApiService.deleteAdminOffer(token, id);
      if (kind === "gallery") await bookingApiService.deleteAdminGallery(token, id);
      if (kind === "testimonial") await bookingApiService.deleteAdminTestimonial(token, id);
      if (kind === "message") await bookingApiService.deleteAdminMessage(token, id);
      showNotice("Item removed successfully.");
      await loadAll(token, false);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.response?.data?.message || "Delete failed.",
      }));
    }
  }

  async function handleAppointmentStatus(id, payload) {
    if (!token) return;
    await bookingApiService.updateAdminAppointmentStatus(token, id, payload);
    await loadAll(token, false);
  }

  async function handleBridalStatus(id, payload) {
    if (!token) return;
    await bookingApiService.updateAdminBridalBookingStatus(token, id, payload);
    await loadAll(token, false);
  }

  async function handleMessageStatus(id, status) {
    if (!token) return;
    await bookingApiService.updateAdminMessageStatus(token, id, { status });
    await loadAll(token, false);
  }

  async function handleNotificationRead(id) {
    if (!token) return;
    await bookingApiService.markAdminNotificationRead(token, id);
    await loadAll(token, false);
  }

  async function handleReadAllNotifications() {
    if (!token) return;
    await bookingApiService.markAllAdminNotificationsRead(token);
    await loadAll(token, false);
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        !search ||
        `${item.bookingId} ${item.customerName} ${item.phone} ${item.serviceSnapshot?.name || ""}`
          .toLowerCase()
          .includes(search);
      const matchesStatus = !filters.bookingStatus || item.bookingStatus === filters.bookingStatus;
      const matchesPayment = !filters.paymentStatus || item.paymentStatus === filters.paymentStatus;
      const matchesDate =
        !filters.date || new Date(item.appointmentDate).toISOString().slice(0, 10) === filters.date;
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [appointments, filters]);

  const filteredBridal = useMemo(() => {
    return bridalBookings.filter((item) => {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        !search ||
        `${item.bookingId} ${item.brideName} ${item.phone} ${item.venueName || ""}`
          .toLowerCase()
          .includes(search);
      const matchesStatus = !filters.bookingStatus || item.bookingStatus === filters.bookingStatus;
      const matchesPayment = !filters.paymentStatus || item.paymentStatus === filters.paymentStatus;
      const matchesEvent = !filters.eventType || item.eventType === filters.eventType;
      const matchesDate =
        !filters.date || new Date(item.eventDate).toISOString().slice(0, 10) === filters.date;
      return matchesSearch && matchesStatus && matchesPayment && matchesEvent && matchesDate;
    });
  }, [bridalBookings, filters]);

  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const unreadMessages = messages.filter((item) => item.status === "UNREAD").length;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#eef1f6] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-white/55">Admin Workspace</p>
            <h1 className="mt-4 text-4xl font-semibold">
              Premium Beauty Parlour SaaS dashboard.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Log in with the seeded admin account to manage bookings, content, payments,
              availability, and live notifications from one workspace.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <LockKeyhole size={18} />
              <p className="text-xs uppercase tracking-[0.3em]">Secure Admin Login</p>
            </div>
            <div className="mt-6 grid gap-4">
              <TextInput
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Admin Email"
              />
              <TextInput
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Password"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">
                {authState.loading ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                Login to Admin
              </button>
              {authState.error ? (
                <div className="rounded-[1.4rem] bg-red-50 p-4 text-sm text-red-700">
                  {authState.error}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    );
  }

  const sectionTitle = adminNav.find((item) => item.id === activeSection)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#eef1f6] text-slate-900">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-slate-950 text-white transition-all lg:sticky ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "w-24" : "w-80"}`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">AuraLuxe Admin</p>
              <h2 className="mt-2 text-2xl font-semibold">Control Center</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                  return;
                }
                setSidebarCollapsed((current) => !current);
              }}
              className="rounded-full border border-white/10 p-2 text-white/75"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
          <div className="space-y-2 px-4 py-4">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                    isActive ? "bg-white text-slate-950" : "text-white/75 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className={`mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-rose-200 transition hover:bg-white/10 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <X size={18} />
              {!sidebarCollapsed ? <span>Logout</span> : null}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 border-b border-slate-200 bg-[#eef1f6]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
                >
                  <Menu size={18} />
                </button>
                {sidebarCollapsed ? (
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className="hidden rounded-full border border-slate-200 bg-white p-2 text-slate-700 lg:inline-flex"
                  >
                    <PanelLeftOpen size={18} />
                  </button>
                ) : null}
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin Panel</p>
                  <h1 className="mt-1 text-2xl font-semibold">{sectionTitle}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotifications((current) => !current)}
                  className="relative rounded-full border border-slate-200 bg-white p-3 text-slate-700"
                >
                  <Bell size={18} />
                  {unreadNotifications ? (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {unreadNotifications}
                    </span>
                  ) : null}
                </button>
                {showNotifications ? (
                  <div className="absolute right-4 top-20 z-50 w-[22rem] rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-2xl md:right-8">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">Notifications</p>
                      <button
                        type="button"
                        onClick={handleReadAllNotifications}
                        className="text-xs font-semibold text-slate-500"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {notifications.slice(0, 5).map((item) => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => handleNotificationRead(item._id)}
                          className={`block w-full rounded-[1rem] p-3 text-left ${
                            item.isRead ? "bg-slate-50" : "bg-amber-50"
                          }`}
                        >
                          <p className="text-sm font-medium text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{item.message}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm md:block">
                  {profile?.name || "Admin"}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 md:px-8">
            {state.error ? (
              <div className="mb-6 rounded-[1.3rem] bg-red-50 p-4 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}
            {state.notice ? (
              <div className="mb-6 rounded-[1.3rem] bg-emerald-50 p-4 text-sm text-emerald-800">
                {state.notice}
              </div>
            ) : null}

            {state.loading && !dashboard ? (
              <div className="flex items-center gap-3 rounded-[1.6rem] bg-white p-6 text-sm text-slate-600 shadow-sm">
                <LoaderCircle className="animate-spin" size={18} />
                Loading admin workspace...
              </div>
            ) : null}

            {!state.loading || dashboard ? (
              <div className="space-y-6">
                {activeSection === "dashboard" ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <ShellCard title="Today's Appointments" value={dashboard?.cards?.todaysAppointments || 0} />
                      <ShellCard title="Upcoming Appointments" value={dashboard?.cards?.upcomingAppointments || 0} />
                      <ShellCard title="Upcoming Bridal Bookings" value={dashboard?.cards?.upcomingBridalBookings || 0} />
                      <ShellCard title="Unread Messages" value={dashboard?.cards?.unreadMessages || 0} tone="dark" />
                      <ShellCard title="Pending Payments" value={dashboard?.cards?.pendingPayments || 0} />
                      <ShellCard title="Advance Collected" value={formatCurrency(dashboard?.cards?.advanceCollected || 0)} />
                      <ShellCard title="Remaining Receivable" value={formatCurrency(dashboard?.cards?.remainingReceivable || 0)} />
                      <ShellCard title="Completed Services" value={dashboard?.cards?.completedServices || 0} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                      <Panel title="Monthly Bookings" description="Beauty vs bridal volume from real MongoDB records.">
                        <div className="space-y-4">
                          {(dashboard?.charts?.monthlyBookings || []).slice(-6).map((item) => (
                            <div key={item.month}>
                              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                <span>{item.month}</span>
                                <span>{item.total}</span>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-3 flex-1 rounded-full bg-slate-100">
                                  <div
                                    className="h-3 rounded-full bg-slate-950"
                                    style={{ width: `${Math.max(item.beauty * 12, 8)}px` }}
                                  />
                                </div>
                                <div className="h-3 flex-1 rounded-full bg-slate-100">
                                  <div
                                    className="h-3 rounded-full bg-rose-400"
                                    style={{ width: `${Math.max(item.bridal * 12, 8)}px` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Panel>
                      <Panel title="Revenue Overview" description="Verified payments grouped by month.">
                        <div className="space-y-4">
                          {(dashboard?.charts?.revenueOverview || []).slice(-6).map((item) => (
                            <div key={item.month}>
                              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                <span>{item.month}</span>
                                <span>{formatCurrency(item.revenue)}</span>
                              </div>
                              <div className="h-3 rounded-full bg-slate-100">
                                <div
                                  className="h-3 rounded-full bg-emerald-500"
                                  style={{ width: `${Math.max(item.revenue / 400, 12)}px` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Panel>
                      <Panel title="Notification Center" description="Latest live admin alerts.">
                        <div className="space-y-3">
                          {notifications.slice(0, 6).map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => handleNotificationRead(item._id)}
                              className={`block w-full rounded-[1.2rem] p-4 text-left ${
                                item.isRead ? "bg-slate-50" : "bg-amber-50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-medium text-slate-900">{item.title}</p>
                                <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                            </button>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  </>
                ) : null}

                {["beauty", "bridal"].includes(activeSection) ? (
                  <Panel
                    title={activeSection === "beauty" ? "Beauty Appointments" : "Bridal Bookings"}
                    description="Search, filter, inspect details, and update status without leaving the dashboard."
                  >
                    <div className="grid gap-3 md:grid-cols-5">
                      <TextInput
                        value={filters.search}
                        onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                        placeholder="Search booking, customer, phone..."
                      />
                      <TextInput
                        type="date"
                        value={filters.date}
                        onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
                      />
                      <Select
                        value={filters.bookingStatus}
                        onChange={(event) => setFilters((current) => ({ ...current, bookingStatus: event.target.value }))}
                      >
                        <option value="">All Statuses</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="ON_THE_WAY">On The Way</option>
                        <option value="SERVICE_STARTED">Service Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="SERVICE_COMPLETED">Service Completed</option>
                        <option value="FULLY_PAID">Fully Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                      </Select>
                      <Select
                        value={filters.paymentStatus}
                        onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value }))}
                      >
                        <option value="">All Payments</option>
                        <option value="PENDING">Pending</option>
                        <option value="PARTIALLY_PAID">Partially Paid</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                      </Select>
                      {activeSection === "bridal" ? (
                        <Select
                          value={filters.eventType}
                          onChange={(event) => setFilters((current) => ({ ...current, eventType: event.target.value }))}
                        >
                          <option value="">All Events</option>
                          <option value="WEDDING">Wedding</option>
                          <option value="ENGAGEMENT">Engagement</option>
                          <option value="RECEPTION">Reception</option>
                          <option value="HALDI">Haldi</option>
                          <option value="MEHENDI">Mehendi</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                          Pagination foundation ready
                        </div>
                      )}
                    </div>

                    {activeSection === "beauty" ? (
                      <>
                        <DesktopTable
                          headers={["Booking ID", "Customer", "Service", "Date", "Time", "Payment", "Status", "Actions"]}
                          rows={filteredAppointments.map((item) => (
                            <tr key={item._id} className="border-b border-slate-100">
                              <td className="py-4 pr-6 font-medium">{item.bookingId}</td>
                              <td className="py-4 pr-6">{item.customerName}</td>
                              <td className="py-4 pr-6">{item.serviceSnapshot?.name}</td>
                              <td className="py-4 pr-6">{formatDate(item.appointmentDate)}</td>
                              <td className="py-4 pr-6">{item.timeSlot?.label}</td>
                              <td className="py-4 pr-6">{item.paymentStatus}</td>
                              <td className="py-4 pr-6">{item.bookingStatus}</td>
                              <td className="py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setModal({ kind: "details", form: item, title: item.bookingId })}
                                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAppointmentStatus(item._id, { bookingStatus: "CONFIRMED" })}
                                    className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        />
                        <MobileCards
                          items={filteredAppointments}
                          render={(item) => (
                            <div key={item._id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                              <p className="font-semibold text-slate-900">{item.bookingId}</p>
                              <p className="mt-2 text-sm text-slate-600">{item.customerName} · {item.serviceSnapshot?.name}</p>
                              <p className="mt-2 text-sm text-slate-500">{formatDate(item.appointmentDate)} · {item.timeSlot?.label}</p>
                            </div>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <DesktopTable
                          headers={["Booking ID", "Bride", "Event", "Date", "Venue/Home", "Total", "Payment", "Status", "Actions"]}
                          rows={filteredBridal.map((item) => (
                            <tr key={item._id} className="border-b border-slate-100">
                              <td className="py-4 pr-6 font-medium">{item.bookingId}</td>
                              <td className="py-4 pr-6">{item.brideName}</td>
                              <td className="py-4 pr-6">{item.eventType}</td>
                              <td className="py-4 pr-6">{formatDate(item.eventDate)}</td>
                              <td className="py-4 pr-6">{item.serviceLocation}</td>
                              <td className="py-4 pr-6">{formatCurrency(item.totalAmount)}</td>
                              <td className="py-4 pr-6">{item.paymentStatus}</td>
                              <td className="py-4 pr-6">{item.bookingStatus}</td>
                              <td className="py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setModal({ kind: "details", form: item, title: item.bookingId })}
                                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleBridalStatus(item._id, { bookingStatus: "CONFIRMED" })}
                                    className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        />
                        <MobileCards
                          items={filteredBridal}
                          render={(item) => (
                            <div key={item._id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                              <p className="font-semibold text-slate-900">{item.bookingId}</p>
                              <p className="mt-2 text-sm text-slate-600">{item.brideName} · {item.eventType}</p>
                              <p className="mt-2 text-sm text-slate-500">{formatDate(item.eventDate)} · {item.serviceLocation}</p>
                            </div>
                          )}
                        />
                      </>
                    )}
                  </Panel>
                ) : null}

                {["categories", "services", "packages", "availability", "offers", "gallery", "testimonials"].includes(activeSection) ? (
                  <Panel
                    title={sectionTitle}
                    description="Create, edit, deactivate, or delete website management records."
                    actions={
                      <button
                        type="button"
                        onClick={() =>
                          openModal(
                            activeSection === "categories"
                              ? "category"
                              : activeSection === "services"
                                ? "service"
                                : activeSection === "packages"
                                  ? "package"
                                  : activeSection === "availability"
                                    ? "availability"
                                    : activeSection === "offers"
                                      ? "offer"
                                      : activeSection === "gallery"
                                        ? "gallery"
                                        : "testimonial"
                          )
                        }
                        className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                      >
                        Add New
                      </button>
                    }
                  >
                    {activeSection === "categories" ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {categories.map((item) => (
                          <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                                <p className="mt-2 text-sm text-slate-500">{item.description || "No description"}</p>
                              </div>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {item.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="mt-5 flex gap-3">
                              <button type="button" onClick={() => openModal("category", item)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(item.name, () => handleDelete("category", item._id))}
                                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {activeSection === "services" ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {services.map((item) => (
                          <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            {item.image ? (
                              <img
                                src={optimizeCloudinaryImage(item.image, { width: 720, height: 420, crop: "fill" })}
                                alt={item.name}
                                className="mb-4 h-40 w-full rounded-[1.2rem] object-cover"
                              />
                            ) : null}
                            <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                            <p className="mt-2 text-sm text-slate-500">{item.category?.name}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-2xl bg-white p-3">{formatCurrency(item.price)}</div>
                              <div className="rounded-2xl bg-white p-3">{item.durationMinutes} min</div>
                            </div>
                            <div className="mt-5 flex gap-3">
                              <button type="button" onClick={() => openModal("service", { ...item, category: item.category?._id || item.category })} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(item.name, () => handleDelete("service", item._id))}
                                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {activeSection === "packages" ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {packages.map((item) => (
                          <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            {item.coverImage ? (
                              <img
                                src={optimizeCloudinaryImage(item.coverImage, { width: 720, height: 420, crop: "fill" })}
                                alt={item.name}
                                className="mb-4 h-40 w-full rounded-[1.2rem] object-cover"
                              />
                            ) : null}
                            <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                            <p className="mt-2 text-sm text-slate-500">{item.shortDescription}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-2xl bg-white p-3">{formatCurrency(item.price)}</div>
                              <div className="rounded-2xl bg-white p-3">{item.durationMinutes} min</div>
                            </div>
                            <div className="mt-5 flex gap-3">
                              <button type="button" onClick={() => openModal("package", { ...item, includedServices: (item.includedServices || []).join("\n"), galleryImages: (item.galleryImages || []).join("\n") })} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(item.name, () => handleDelete("package", item._id))}
                                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {activeSection === "availability" ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {availability.map((item) => (
                          <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-lg font-semibold text-slate-900">{item.type}</p>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {item.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="mt-3 text-sm text-slate-500">
                              {item.openingTime} - {item.closingTime} · {item.slotDurationMinutes} min slots
                            </p>
                            <p className="mt-3 text-sm text-slate-500">
                              Blocked dates: {(item.blockedDates || []).length} · Blocked slots: {(item.blockedTimeSlots || []).length}
                            </p>
                            <div className="mt-5 flex gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  openModal("availability", {
                                    ...item,
                                    availableDays: (item.availableDays || []).join(","),
                                    blockedDates: (item.blockedDates || [])
                                      .map((entry) => new Date(entry.date).toISOString().slice(0, 10))
                                      .join("\n"),
                                    blockedTimeSlots: (item.blockedTimeSlots || [])
                                      .map((entry) => `${entry.start} - ${entry.end}`)
                                      .join("\n"),
                                  })
                                }
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(item.type, () => handleDelete("availability", item._id))}
                                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {activeSection === "offers" ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {offers.map((item) => (
                          <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            {item.image ? (
                              <img
                                src={optimizeCloudinaryImage(item.image, { width: 720, height: 360, crop: "fill" })}
                                alt={item.name}
                                className="mb-4 h-36 w-full rounded-[1.2rem] object-cover"
                              />
                            ) : null}
                            <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                            <p className="mt-3 text-sm text-slate-600">
                              {item.discountType} · {item.discountValue}
                            </p>
                            <div className="mt-5 flex gap-3">
                              <button type="button" onClick={() => openModal("offer", { ...item, startDate: item.startDate?.slice(0, 10), endDate: item.endDate?.slice(0, 10) })} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(item.name, () => handleDelete("offer", item._id))}
                                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {activeSection === "gallery" ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {gallery.map((item) => (
                          <article key={item._id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                            <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
                            <div className="p-5">
                              <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-2 text-sm text-slate-500">{item.category}</p>
                              <div className="mt-5 flex gap-3">
                                <button type="button" onClick={() => openModal("gallery", item)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => askDelete(item.title, () => handleDelete("gallery", item._id))}
                                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {activeSection === "testimonials" ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {testimonials.map((item) => (
                          <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            {item.image ? (
                              <img
                                src={optimizeCloudinaryImage(item.image, { width: 320, height: 320, crop: "fill" })}
                                alt={item.customerName}
                                className="mb-4 h-20 w-20 rounded-full object-cover"
                              />
                            ) : null}
                            <p className="text-lg font-semibold text-slate-900">{item.customerName}</p>
                            <p className="mt-2 text-sm text-slate-500">{item.serviceLabel}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{item.review}</p>
                            <div className="mt-5 flex gap-3">
                              <button type="button" onClick={() => openModal("testimonial", item)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(item.customerName, () => handleDelete("testimonial", item._id))}
                                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </Panel>
                ) : null}

                {activeSection === "payments" ? (
                  <Panel title="Payments" description="Ledger, stage tracking, and manual remaining-payment capture.">
                    <DesktopTable
                      headers={["Booking ID", "Customer", "Type", "Stage", "Amount", "Method", "Status", "Date"]}
                      rows={payments.map((item) => (
                        <tr key={item._id} className="border-b border-slate-100">
                          <td className="py-4 pr-6 font-medium">{item.bookingId}</td>
                          <td className="py-4 pr-6">{item.customerName || "--"}</td>
                          <td className="py-4 pr-6">{item.bookingType}</td>
                          <td className="py-4 pr-6">{item.paymentStage}</td>
                          <td className="py-4 pr-6">{formatCurrency(item.amountPaid || item.amount)}</td>
                          <td className="py-4 pr-6">{item.paymentMethod || "--"}</td>
                          <td className="py-4 pr-6">{item.status}</td>
                          <td className="py-4">{formatDateTime(item.paidAt || item.createdAt)}</td>
                        </tr>
                      ))}
                    />
                    <MobileCards
                      items={payments}
                      render={(item) => (
                        <div key={item._id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                          <p className="font-semibold text-slate-900">{item.bookingId}</p>
                          <p className="mt-2 text-sm text-slate-600">{item.bookingType} · {item.paymentStage}</p>
                          <p className="mt-2 text-sm text-slate-500">{formatCurrency(item.amountPaid || item.amount)} · {item.status}</p>
                        </div>
                      )}
                    />
                  </Panel>
                ) : null}

                {activeSection === "messages" ? (
                  <Panel title="Messages" description="Read, resolve, or delete customer contact messages.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {messages.map((item) => (
                        <article key={item._id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                              <p className="mt-1 text-sm text-slate-500">{item.phone} · {item.email || "No email"}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "UNREAD" ? "bg-amber-100 text-amber-800" : "bg-white text-slate-700"}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-4 text-sm leading-6 text-slate-600">{item.message}</p>
                          <p className="mt-4 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button type="button" onClick={() => handleMessageStatus(item._id, "READ")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                              Mark Read
                            </button>
                            <button type="button" onClick={() => handleMessageStatus(item._id, "UNREAD")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
                              Mark Unread
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(item.name, () => handleDelete("message", item._id))}
                              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {["content", "settings"].includes(activeSection) ? (
                  <Panel
                    title={activeSection === "content" ? "Website Content" : "Settings"}
                    description="Update business info, hero copy, contact details, business hours, social links, booking rules, and website text."
                    actions={
                      <button
                        type="button"
                        onClick={() =>
                          openModal("settings", {
                            ...(settings || {}),
                            openingHoursText: (settings?.openingHours || [])
                              .map((item) =>
                                item.isClosed
                                  ? `${item.day}: Closed`
                                  : `${item.day}: ${item.open || ""} - ${item.close || ""}`
                              )
                              .join("\n"),
                            whyChooseUsText: (settings?.whyChooseUs || []).join("\n"),
                            trackTimelineText: (settings?.trackTimeline || []).join("\n"),
                            statsText: (settings?.stats || [])
                              .map((item) => `${item.label}: ${item.value}`)
                              .join("\n"),
                          })
                        }
                        className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                      >
                        Edit Content
                      </button>
                    }
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        ["Business Name", settings?.businessName],
                        ["Phone", settings?.phone],
                        ["WhatsApp", settings?.whatsapp],
                        ["Email", settings?.email],
                        ["Address", settings?.address],
                        ["Razorpay Status", "Configured / Not Configured via backend env only"],
                        ["Booking Notice", settings?.bookingNoticePeriod || "--"],
                        ["Default Advance %", settings?.defaultAdvancePercentage || "--"],
                        ["Footer Text", settings?.footerText || "--"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[1.4rem] bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
                          <p className="mt-2 text-sm font-medium text-slate-800">{value || "--"}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>
      </div>

      <Modal
        open={Boolean(modal)}
        title={modal?.title || (modal?.kind ? `Manage ${modal.kind}` : "")}
        onClose={closeModal}
      >
        {modal && state.error ? (
          <div className="mb-4 rounded-[1.2rem] bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}
        {modal?.kind === "details" ? (
          <div className="space-y-6">
            {modal.form?.bookingId ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Original Price", formatCurrency(modal.form.originalAmount ?? modal.form.totalAmount ?? 0)],
                  ["Discount", formatCurrency(modal.form.discountAmount || 0)],
                  ["Final Total", formatCurrency(modal.form.finalAmount ?? modal.form.totalAmount ?? 0)],
                  ["Advance", formatCurrency(modal.form.advanceAmount || 0)],
                  ["Remaining", formatCurrency(modal.form.remainingAmount || 0)],
                  ["Coupon Code", modal.form.couponCode || "--"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.2rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
                    <p className="mt-2 break-words text-sm font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(modal.form || {}).slice(0, 18).map(([key, value]) => (
                <div key={key} className="rounded-[1.2rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{key}</p>
                  <p className="mt-2 break-words text-sm text-slate-800">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {modal?.kind === "category" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <TextInput value={modal.form.name || ""} onChange={(event) => updateModalForm("name", event.target.value)} />
            </Field>
            <Field label="Sort Order">
              <TextInput type="number" value={modal.form.sortOrder || 0} onChange={(event) => updateModalForm("sortOrder", Number(event.target.value))} />
            </Field>
            <Field label="Description">
              <TextArea rows="4" value={modal.form.description || ""} onChange={(event) => updateModalForm("description", event.target.value)} className="md:col-span-2" />
            </Field>
            <Field label="Image URL">
              <TextInput value={modal.form.image || ""} onChange={(event) => updateModalForm("image", event.target.value)} className="md:col-span-2" />
            </Field>
          </div>
        ) : null}

        {modal?.kind === "service" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Service Name"><TextInput value={modal.form.name || ""} onChange={(event) => updateModalForm("name", event.target.value)} /></Field>
            <Field label="Category">
              <Select value={modal.form.category || ""} onChange={(event) => updateModalForm("category", event.target.value)}>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Short Description"><TextArea rows="3" value={modal.form.shortDescription || ""} onChange={(event) => updateModalForm("shortDescription", event.target.value)} /></Field>
            <Field label="Description"><TextArea rows="3" value={modal.form.description || ""} onChange={(event) => updateModalForm("description", event.target.value)} /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Service Image">
                <ImagePreview src={modal.form.image} alt={modal.form.name || "Service"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "services"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "services",
                    urlField: "image",
                    publicIdField: "imagePublicId",
                    label: "Service image",
                  })
                }
                onRemove={() => removeSingleMedia("image", "imagePublicId")}
              />
            </div>
            <Field label="Price"><TextInput type="number" value={modal.form.price || 0} onChange={(event) => updateModalForm("price", event.target.value)} /></Field>
            <Field label="Duration Minutes"><TextInput type="number" value={modal.form.durationMinutes || 60} onChange={(event) => updateModalForm("durationMinutes", event.target.value)} /></Field>
            <Field label="Advance Percentage"><TextInput type="number" value={modal.form.advancePercentage || 50} onChange={(event) => updateModalForm("advancePercentage", event.target.value)} /></Field>
          </div>
        ) : null}

        {modal?.kind === "package" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Package Name"><TextInput value={modal.form.name || ""} onChange={(event) => updateModalForm("name", event.target.value)} /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Cover Image">
                <ImagePreview src={modal.form.coverImage} alt={modal.form.name || "Package"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "bridal"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "bridal",
                    urlField: "coverImage",
                    publicIdField: "coverImagePublicId",
                    label: "Package cover",
                  })
                }
                onRemove={() => removeSingleMedia("coverImage", "coverImagePublicId")}
              />
            </div>
            <Field label="Short Description"><TextArea rows="3" value={modal.form.shortDescription || ""} onChange={(event) => updateModalForm("shortDescription", event.target.value)} /></Field>
            <Field label="Full Description"><TextArea rows="3" value={modal.form.fullDescription || ""} onChange={(event) => updateModalForm("fullDescription", event.target.value)} /></Field>
            <Field label="Price"><TextInput type="number" value={modal.form.price || 0} onChange={(event) => updateModalForm("price", event.target.value)} /></Field>
            <Field label="Discount Price"><TextInput type="number" value={modal.form.discountPrice || 0} onChange={(event) => updateModalForm("discountPrice", event.target.value)} /></Field>
            <Field label="Duration Minutes"><TextInput type="number" value={modal.form.durationMinutes || 240} onChange={(event) => updateModalForm("durationMinutes", event.target.value)} /></Field>
            <Field label="Advance Percentage"><TextInput type="number" value={modal.form.advancePercentage || 50} onChange={(event) => updateModalForm("advancePercentage", event.target.value)} /></Field>
            <Field label="Included Services"><TextArea rows="5" value={modal.form.includedServices || ""} onChange={(event) => updateModalForm("includedServices", event.target.value)} className="md:col-span-2" /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Package Gallery">
                <PackageGalleryPreview
                  items={modal.form.galleryMedia || []}
                  onRemove={removePackageGalleryImage}
                  uploading={uploadingAsset === "bridal"}
                />
              </Field>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                {uploadingAsset === "bridal" ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadingAsset === "bridal" ? "Uploading..." : "Add Gallery Images"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handlePackageGalleryUpload}
                  disabled={uploadingAsset === "bridal"}
                />
              </label>
            </div>
          </div>
        ) : null}

        {modal?.kind === "availability" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type">
              <Select value={modal.form.type || "BEAUTY"} onChange={(event) => updateModalForm("type", event.target.value)}>
                <option value="BEAUTY">BEAUTY</option>
                <option value="BRIDAL">BRIDAL</option>
              </Select>
            </Field>
            <Field label="Available Days (comma separated 0-6)">
              <TextInput value={modal.form.availableDays || ""} onChange={(event) => updateModalForm("availableDays", event.target.value)} />
            </Field>
            <Field label="Opening Time"><TextInput value={modal.form.openingTime || ""} onChange={(event) => updateModalForm("openingTime", event.target.value)} /></Field>
            <Field label="Closing Time"><TextInput value={modal.form.closingTime || ""} onChange={(event) => updateModalForm("closingTime", event.target.value)} /></Field>
            <Field label="Slot Duration"><TextInput type="number" value={modal.form.slotDurationMinutes || 30} onChange={(event) => updateModalForm("slotDurationMinutes", event.target.value)} /></Field>
            <Field label="Blocked Dates (YYYY-MM-DD)">
              <TextArea rows="5" value={modal.form.blockedDates || ""} onChange={(event) => updateModalForm("blockedDates", event.target.value)} />
            </Field>
            <Field label="Blocked Time Slots (HH:MM - HH:MM)">
              <TextArea rows="5" value={modal.form.blockedTimeSlots || ""} onChange={(event) => updateModalForm("blockedTimeSlots", event.target.value)} />
            </Field>
          </div>
        ) : null}

        {modal?.kind === "offer" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Offer Name"><TextInput value={modal.form.name || ""} onChange={(event) => updateModalForm("name", event.target.value)} /></Field>
            <Field label="Coupon Code"><TextInput value={modal.form.couponCode || ""} onChange={(event) => updateModalForm("couponCode", event.target.value.toUpperCase())} /></Field>
            <Field label="Description"><TextArea rows="4" value={modal.form.description || ""} onChange={(event) => updateModalForm("description", event.target.value)} /></Field>
            <Field label="Discount Type">
              <Select value={modal.form.discountType || "PERCENTAGE"} onChange={(event) => updateModalForm("discountType", event.target.value)}>
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="FIXED">FIXED</option>
              </Select>
            </Field>
            <Field label="Discount Value"><TextInput type="number" value={modal.form.discountValue || 0} onChange={(event) => updateModalForm("discountValue", event.target.value)} /></Field>
            <Field label="Minimum Booking Amount"><TextInput type="number" value={modal.form.minimumBookingAmount || 0} onChange={(event) => updateModalForm("minimumBookingAmount", event.target.value)} /></Field>
            <Field label="Maximum Discount Cap"><TextInput type="number" value={modal.form.maximumDiscount || 0} onChange={(event) => updateModalForm("maximumDiscount", event.target.value)} /></Field>
            <Field label="Offer Status">
              <Select value={String(modal.form.isActive ?? true)} onChange={(event) => updateModalForm("isActive", event.target.value === "true")}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Banner Image">
                <ImagePreview src={modal.form.image} alt={modal.form.name || "Offer"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "offers"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "offers",
                    urlField: "image",
                    publicIdField: "imagePublicId",
                    label: "Offer banner",
                  })
                }
                onRemove={() => removeSingleMedia("image", "imagePublicId")}
              />
            </div>
            <Field label="Start Date"><TextInput type="date" value={modal.form.startDate || ""} onChange={(event) => updateModalForm("startDate", event.target.value)} /></Field>
            <Field label="End Date"><TextInput type="date" value={modal.form.endDate || ""} onChange={(event) => updateModalForm("endDate", event.target.value)} /></Field>
            <Field label="Booking Types">
              <div className="grid gap-3 sm:grid-cols-2">
                {["BEAUTY", "BRIDAL"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      updateModalForm(
                        "applicableBookingTypes",
                        toggleArrayValue(modal.form.applicableBookingTypes, type)
                      )
                    }
                    className={`rounded-[1.2rem] border px-4 py-3 text-sm font-semibold ${
                      (modal.form.applicableBookingTypes || []).includes(type)
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Beauty Service Applicability">
              <div className="max-h-48 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {services.map((item) => (
                  <label key={item._id} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={(modal.form.applicableServices || []).includes(item._id)}
                      onChange={() =>
                        updateModalForm(
                          "applicableServices",
                          toggleArrayValue(modal.form.applicableServices, item._id)
                        )
                      }
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Bridal Package Applicability">
              <div className="max-h-48 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {packages.map((item) => (
                  <label key={item._id} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={(modal.form.applicableBridalPackages || []).includes(item._id)}
                      onChange={() =>
                        updateModalForm(
                          "applicableBridalPackages",
                          toggleArrayValue(modal.form.applicableBridalPackages, item._id)
                        )
                      }
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        ) : null}

        {modal?.kind === "gallery" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><TextInput value={modal.form.title || ""} onChange={(event) => updateModalForm("title", event.target.value)} /></Field>
            <Field label="Category">
              <Select value={modal.form.category || "BRIDAL"} onChange={(event) => updateModalForm("category", event.target.value)}>
                {["BRIDAL", "HAIR", "MAKEUP", "FACIAL", "NAILS", "ENGAGEMENT", "RECEPTION", "BEFORE_AFTER"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Gallery Image">
                <ImagePreview src={modal.form.imageUrl} alt={modal.form.title || "Gallery"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "gallery"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "gallery",
                    urlField: "imageUrl",
                    publicIdField: "publicId",
                    label: "Gallery image",
                  })
                }
                onRemove={() => removeSingleMedia("imageUrl", "publicId")}
              />
            </div>
            <Field label="Sort Order"><TextInput type="number" value={modal.form.sortOrder || 0} onChange={(event) => updateModalForm("sortOrder", event.target.value)} /></Field>
          </div>
        ) : null}

        {modal?.kind === "testimonial" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Customer Name"><TextInput value={modal.form.customerName || ""} onChange={(event) => updateModalForm("customerName", event.target.value)} /></Field>
            <Field label="Rating"><TextInput type="number" min="1" max="5" value={modal.form.rating || 5} onChange={(event) => updateModalForm("rating", event.target.value)} /></Field>
            <Field label="Service Label"><TextInput value={modal.form.serviceLabel || ""} onChange={(event) => updateModalForm("serviceLabel", event.target.value)} /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Customer Image">
                <ImagePreview src={modal.form.image} alt={modal.form.customerName || "Testimonial"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "testimonials"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "testimonials",
                    urlField: "image",
                    publicIdField: "imagePublicId",
                    label: "Testimonial image",
                  })
                }
                onRemove={() => removeSingleMedia("image", "imagePublicId")}
              />
            </div>
            <Field label="Review"><TextArea rows="5" value={modal.form.review || ""} onChange={(event) => updateModalForm("review", event.target.value)} className="md:col-span-2" /></Field>
          </div>
        ) : null}

        {modal?.kind === "settings" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business Name"><TextInput value={modal.form.businessName || ""} onChange={(event) => updateModalForm("businessName", event.target.value)} /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Logo">
                <ImagePreview src={modal.form.logo} alt={modal.form.businessName || "Logo"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "site"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "site",
                    urlField: "logo",
                    publicIdField: "logoPublicId",
                    label: "Logo",
                  })
                }
                onRemove={() => removeSingleMedia("logo", "logoPublicId")}
              />
            </div>
            <Field label="Hero Title"><TextArea rows="3" value={modal.form.heroTitle || ""} onChange={(event) => updateModalForm("heroTitle", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Hero Subtitle"><TextArea rows="3" value={modal.form.heroSubtitle || ""} onChange={(event) => updateModalForm("heroSubtitle", event.target.value)} className="md:col-span-2" /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="Hero Image">
                <ImagePreview src={modal.form.heroImage} alt={modal.form.heroTitle || "Hero"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "site"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "site",
                    urlField: "heroImage",
                    publicIdField: "heroImagePublicId",
                    label: "Hero image",
                  })
                }
                onRemove={() => removeSingleMedia("heroImage", "heroImagePublicId")}
              />
            </div>
            <Field label="About Title"><TextInput value={modal.form.aboutTitle || ""} onChange={(event) => updateModalForm("aboutTitle", event.target.value)} /></Field>
            <Field label="About Description"><TextArea rows="4" value={modal.form.aboutText || ""} onChange={(event) => updateModalForm("aboutText", event.target.value)} /></Field>
            <div className="space-y-3 md:col-span-2">
              <Field label="About Image">
                <ImagePreview src={modal.form.aboutImage} alt={modal.form.aboutTitle || "About"} />
              </Field>
              <UploadActions
                uploading={uploadingAsset === "site"}
                onUpload={(event) =>
                  handleSingleMediaUpload(event, {
                    folderKey: "site",
                    urlField: "aboutImage",
                    publicIdField: "aboutImagePublicId",
                    label: "About image",
                  })
                }
                onRemove={() => removeSingleMedia("aboutImage", "aboutImagePublicId")}
              />
            </div>
            <Field label="Phone"><TextInput value={modal.form.phone || ""} onChange={(event) => updateModalForm("phone", event.target.value)} /></Field>
            <Field label="WhatsApp"><TextInput value={modal.form.whatsapp || ""} onChange={(event) => updateModalForm("whatsapp", event.target.value)} /></Field>
            <Field label="Email"><TextInput value={modal.form.email || ""} onChange={(event) => updateModalForm("email", event.target.value)} /></Field>
            <Field label="Address"><TextArea rows="4" value={modal.form.address || ""} onChange={(event) => updateModalForm("address", event.target.value)} /></Field>
            <Field label="Google Maps URL"><TextInput value={modal.form.googleMapsUrl || ""} onChange={(event) => updateModalForm("googleMapsUrl", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Opening Hours (Day: open - close)"><TextArea rows="6" value={modal.form.openingHoursText || ""} onChange={(event) => updateModalForm("openingHoursText", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Why Choose Us (one per line)"><TextArea rows="6" value={modal.form.whyChooseUsText || ""} onChange={(event) => updateModalForm("whyChooseUsText", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Stats (Label: Value)"><TextArea rows="6" value={modal.form.statsText || ""} onChange={(event) => updateModalForm("statsText", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Track Timeline (one per line)"><TextArea rows="6" value={modal.form.trackTimelineText || ""} onChange={(event) => updateModalForm("trackTimelineText", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Footer Text"><TextArea rows="3" value={modal.form.footerText || ""} onChange={(event) => updateModalForm("footerText", event.target.value)} className="md:col-span-2" /></Field>
            <Field label="Booking Notice Period"><TextInput value={modal.form.bookingNoticePeriod || ""} onChange={(event) => updateModalForm("bookingNoticePeriod", event.target.value)} /></Field>
            <Field label="Default Advance Percentage"><TextInput type="number" value={modal.form.defaultAdvancePercentage || 50} onChange={(event) => updateModalForm("defaultAdvancePercentage", event.target.value)} /></Field>
            <Field label="Cancellation Policy"><TextArea rows="4" value={modal.form.cancellationPolicy || ""} onChange={(event) => updateModalForm("cancellationPolicy", event.target.value)} className="md:col-span-2" /></Field>
          </div>
        ) : null}

        {modal && modal.kind !== "details" ? (
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitModal}
              disabled={submitting}
              className="flex-1 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        state={confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={async () => {
          if (!confirmState?.action) return;
          await confirmState.action();
          setConfirmState(null);
        }}
      />
    </div>
  );
}
