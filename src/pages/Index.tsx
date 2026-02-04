import { NewNavbar } from "@/components/landing/NewNavbar";
import { NewHeroSection } from "@/components/landing/NewHeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { NewFeaturesSection } from "@/components/landing/NewFeaturesSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { NewFooter } from "@/components/landing/NewFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <NewHeroSection />
      <PainPointsSection />
      <SolutionSection />
      <NewFeaturesSection />
      <IntegrationsSection />
      <PricingSection />
      <FinalCTASection />
      <NewFooter />
    </div>
  );
};

export default Index;
