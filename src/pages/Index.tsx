import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AgencySection } from "@/components/landing/AgencySection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PainPointsSection />
      <FeaturesSection />
      <AgencySection />
      <IntegrationsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
