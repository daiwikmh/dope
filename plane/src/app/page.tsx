import { Navbar } from "@/src/components/landing/navbar";
import { HeroSection } from "@/src/components/landing/hero-section";
import { FeatureGrid } from "@/src/components/landing/feature-grid";
import { GlitchMarquee } from "@/src/components/landing/glitch-marquee";
import { Footer } from "@/src/components/landing/footer";

export default function Page() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureGrid />
        <GlitchMarquee />
      </main>
      <Footer />
    </div>
  );
}
