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
import "./App.css";

export default function App() {
  return (
    <>
      <div className="min-h-screen bg-orange-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Sparcel Landing Page</h1>
          <p className="text-xl">Testing deployment...</p>
        </div>
      </div>
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
