import { createContext, useContext, type ReactNode } from "react";
import Telon from "@/v3/marca/Telon";
import { Band, FilosofiaBand, IndustriasBand, IntroBand } from "@/v3/home/Bands";
import { PracticasBaker, usePracticeItems } from "@/v3/home/Practicas";
import { SociosBand } from "@/v3/home/Socios";
import { Monitor26, Extranjeras26 } from "@/components/home26/Sections26";
import { useLanguage } from "@/contexts/LanguageContext";
import type { V3Lang } from "@/v3/shared";
import About from "@/pages/About";
import PracticeGroups from "@/pages/PracticeGroups";
import Industries from "@/pages/Industries";
import Team from "@/pages/Team";
import NewsPage from "@/pages/News";
import Contact from "@/pages/Contact";
import Offices from "@/pages/Offices";
import Careers from "@/pages/Careers";
import Interns from "@/pages/Interns";
import Newsletter from "@/pages/Newsletter";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import Testimonials from "@/pages/Testimonials";
import NotFound from "@/pages/not-found";

type PreviewContextValue = { pageId: string; language: string };

export const VisualBuilderPreviewContext = createContext<PreviewContextValue>({ pageId: "", language: "es" });

export function VisualFallback({ children }: { children: ReactNode }) {
  const { pageId } = useContext(VisualBuilderPreviewContext);
  return pageId === "home" ? null : <>{children}</>;
}

const primarySectionForPage: Record<string, RegExp> = {
  about: /^about$/,
  practices: /^practices?$/,
  industries: /^industries?$/,
  team: /^team$/,
  news: /^news/,
  contact: /^contact/,
  offices: /^offices?$/,
  careers: /^careers?$/,
  interns: /^interns?$/,
  newsletter: /^newsletter$/,
  privacy: /^privacy/,
  terms: /^terms/,
  testimonials: /^testimonials?$/,
  "not-found": /^not-found$/,
};

function isPrimarySection(pageId: string, sectionId: string) {
  return primarySectionForPage[pageId]?.test(sectionId) === true;
}

function pageComponent(pageId: string) {
  switch (pageId) {
    case "about": return <About />;
    case "practices": return <PracticeGroups />;
    case "industries": return <Industries />;
    case "team": return <Team />;
    case "news": return <NewsPage />;
    case "contact": return <Contact />;
    case "offices": return <Offices />;
    case "careers": return <Careers />;
    case "interns": return <Interns />;
    case "newsletter": return <Newsletter />;
    case "privacy": return <PrivacyPolicy />;
    case "terms": return <Terms />;
    case "testimonials": return <Testimonials />;
    case "not-found": return <NotFound />;
    default: return null;
  }
}

export function PageSectionPreview({ sectionId, title, description }: { sectionId?: string; title?: string; description?: string }) {
  const { pageId } = useContext(VisualBuilderPreviewContext);
  if (pageId === "home") return <section className="visual-builder-surface visual-builder-surface--paper"><div className="visual-builder-reference"><span>Fuente CMS · {sectionId || "contenido"}</span><h2>{title || sectionId}</h2><p>{description || "Bloque conectado a la fuente editorial actual."}</p></div></section>;
  if (!isPrimarySection(pageId, sectionId || "")) return null;
  return <div className="visual-builder-live-page" data-visual-live-page={pageId}>{pageComponent(pageId)}</div>;
}

function visualLanguage(language: string): V3Lang {
  return language === "es" ? "es" : "en";
}

export function HomeHeroPreview({ title, description, mediaPath }: { title?: string; description?: string; mediaPath?: string }) {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <Telon lang={visualLanguage(language)} preview={{ tagline: title, firma: description, poster: mediaPath, videoEnabled: false }} />;
}

export function HomeIntroPreview({ title, body, stats }: { title?: string; body?: string; stats?: Array<{ value?: string; label?: string }> }) {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <Band start="light" name="intro"><IntroBand lang={visualLanguage(language)} areas={4} preview={{ title, body: body ? [body] : undefined, stats }} /></Band>;
}

export function HomeQuotePreview({ quote, author }: { quote?: string; author?: string }) {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <Band start="dark" name="filosofia"><FilosofiaBand lang={visualLanguage(language)} preview={{ quote, label: author }} /></Band>;
}

export function HomePracticesPreview({ limit = 6 }: { limit?: number }) {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  const items = usePracticeItems(visualLanguage(language));
  if (pageId !== "home") return null;
  return <Band start="dark" end="light" name="practicas"><PracticasBaker lang={visualLanguage(language)} items={items.slice(0, limit)} /></Band>;
}

export function HomeIndustriesPreview() {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <IndustriasBand lang={visualLanguage(language)} />;
}

export function HomeTeamPreview() {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <Band start="light" name="socios"><SociosBand lang={visualLanguage(language)} /></Band>;
}

export function HomeMonitorPreview({ limit = 3 }: { limit?: number }) {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <Monitor26 lang={visualLanguage(language)} limit={limit} />;
}

export function HomeForeignCompaniesPreview() {
  const { pageId, language } = useContext(VisualBuilderPreviewContext);
  if (pageId !== "home") return null;
  return <Extranjeras26 lang={visualLanguage(language)} />;
}

export function HomeCatalogPreview({ source, limit }: { source?: string; limit?: number }) {
  if (source === "practices") return <HomePracticesPreview limit={limit} />;
  if (source === "industries") return <HomeIndustriesPreview />;
  if (source === "team") return <HomeTeamPreview />;
  if (source === "news") return <HomeMonitorPreview limit={limit} />;
  if (source === "media") return <HomeForeignCompaniesPreview />;
  return null;
}
