import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoadingCard from "./components/LoadingCard";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const BridalPage = lazy(() => import("./pages/BridalPage"));
const BridalPackageDetailPage = lazy(() => import("./pages/BridalPackageDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const TrackBookingPage = lazy(() => import("./pages/TrackBookingPage"));
const AdminShellPage = lazy(() => import("./admin/AdminShellPage"));

function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <LoadingCard />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/bridal" element={<BridalPage />} />
          <Route path="/bridal/packages/:slug" element={<BridalPackageDetailPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track-booking" element={<TrackBookingPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<AdminShellPage />} />
      </Routes>
    </Suspense>
  );
}
