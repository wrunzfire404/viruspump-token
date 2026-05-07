"use client";

import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RecentInfections from "@/components/RecentInfections";
import InfectionMap from "@/components/InfectionMap";
import Tokenomics from "@/components/Tokenomics";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      {/* Background particle animation */}
      <ParticleField />

      {/* Navigation */}
      <Navbar />

      {/* Sections */}
      <HeroSection />

      {/* Divider */}
      <div className="relative h-px max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-virus-green/20 to-transparent" />
      </div>

      <AboutSection />

      <div className="relative h-px max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-virus-green/20 to-transparent" />
      </div>

      <RecentInfections />

      <div className="relative h-px max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-virus-green/20 to-transparent" />
      </div>

      <InfectionMap />

      <div className="relative h-px max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-virus-green/20 to-transparent" />
      </div>

      <Tokenomics />

      <Footer />
    </main>
  );
}
