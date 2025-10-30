import { Hero } from "./components/Hero";
import { ParcelTracker } from "./components/ParcelTracker";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { HowItWorks } from "./components/HowItWorks";
import { Team } from "./components/Team";
import { Footer } from "./components/Footer";
import { Cta } from "./components/Cta";
import { FAQ } from "./components/FAQ";
import { ScrollToTop } from "./components/ScrollToTop";
import { SparcelPoints } from "./components/SparcelPoints";
import { AdminPortal } from "./components/AdminPortal";
import { Checkout } from "./components/Checkout";
import "./App.css";

export default function App() {
  // Check for specific routes
  if (window.location.pathname === '/sparcelpoints') {
    return <SparcelPoints />;
  }

  if (window.location.pathname === '/admin') {
    return <AdminPortal />;
  }

  if (window.location.pathname === '/checkout') {
    return <Checkout />;
  }

  // Default main site
  return (
    <>
      <Hero />
      <ParcelTracker />
      <About />
      <HowItWorks />
      <Services />
      <Cta />
      <Team />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}
// Force deployment - Sat Oct 18 21:04:49 SAST 2025
// Webhook reset - Sat Oct 18 21:27:57 SAST 2025
// Final deployment check - Sat Oct 18 21:34:52 SAST 2025
