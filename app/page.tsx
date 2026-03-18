import Hero from "@/components/landing/sections/Hero";
import CodePreview from "@/components/landing/sections/CodePreview";
import Features from "@/components/landing/sections/Features";
import HowItWorks from "@/components/landing/sections/HowItWorks";
import DashboardPreview from "@/components/landing/sections/DashboardPreview";
import Testimonials from "@/components/landing/sections/Testimonials";
import Pricing from "@/components/landing/sections/Pricing";
import Footer from "@/components/landing/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] bg-grid-pattern overflow-x-hidden scroll-smooth">
      <Hero />
      <CodePreview />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
