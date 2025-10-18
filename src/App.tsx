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
import { useState } from "react";
import "./App.css";

export default function App() {
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
