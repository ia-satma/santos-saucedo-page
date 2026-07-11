import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PracticesSection from "@/components/PracticesSection";
import CoberturaSection from "@/components/CoberturaSection";
import ExperienceBanner from "@/components/ExperienceBanner";
import AboutUsSection from "@/components/AboutUsSection";
import MapSection from "@/components/MapSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import JsonLdSchema from "@/components/JsonLdSchema";
import CookieBanner from "@/components/CookieBanner";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-card" data-testid="page-home">
      <SEOHead page="home" language={language} />
      <JsonLdSchema language={language} />
      
      {/* 1. Header/Nav with deep menu */}
      <Header />
      
      <main id="main-content">
        {/* 2. Hero Section with news overlay */}
        <HeroSection language={language} />

        {/* 3. Areas of Specialty (4) */}
        <PracticesSection />

        {/* 4. National Coverage / Alliance (+72 cities) */}
        <CoberturaSection />

        {/* 5. Experience Banner */}
        <ExperienceBanner />

        {/* Upcoming Events */}
        <EventsSection language={language} />

        {/* 5. About Us (Vision, Mission, Values) */}
        <AboutUsSection />

        {/* 6. Map / Location */}
        <MapSection language={language} />
      </main>
      
      {/* 14. Footer */}
      <Footer />
      
      {/* Popups and Banners */}
      <CookieBanner language={language} />
    </div>
  );
}
