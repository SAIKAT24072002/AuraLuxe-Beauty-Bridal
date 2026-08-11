import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import WhatsAppFloat from "../components/WhatsAppFloat";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-porcelain text-charcoal">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
