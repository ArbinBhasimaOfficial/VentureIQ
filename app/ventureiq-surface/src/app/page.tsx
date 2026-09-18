import CTA from "@/components/layout/CTA";
import Features from "@/components/LandingPage/Features";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/LandingPage/Hero";
import LogoStrips from "@/components/LandingPage/LogoStrips";
import Navbar from "@/components/layout/Navbar";
import Reports from "@/components/LandingPage/Reports";
import Solutions from "@/components/LandingPage/Solutions";
import Stats from "@/components/LandingPage/Stats";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <LogoStrips />
        <Stats />
        <Features />
        <Solutions />
        <Reports />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
