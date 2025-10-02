import { 
  HeroSection, 
  FeaturesSection, 
  UseCasesSection, 
  HowItWorks, 
  SocialProof,
  CallToAction, 
  Footer 
} from '../components/home';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <HowItWorks />
      <SocialProof />
      <CallToAction />
      <Footer />
    </main>
  );
}
