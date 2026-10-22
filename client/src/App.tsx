import CookieBanner from "@/components/CookieBanner";
import { AdminShell } from "@/features/admin/AdminShell";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { isStaticSite } from "@/lib/queryClient";
import { chrome26 } from "@/components/home26/chrome26";

const routerBase = isStaticSite ? "/santos-saucedo-page" : "";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

import Home from "@/pages/Home";
const NotFound = lazy(() => import("@/pages/not-found"));

const PracticeGroups = lazy(() => import("@/pages/PracticeGroups"));
const PracticeGroupDetail = lazy(() => import("@/pages/PracticeGroupDetail"));
const Team = lazy(() => import("@/pages/Team"));
const TeamMemberDetail = lazy(() => import("@/pages/TeamMemberDetail"));
const NewsDetail = lazy(() => import("@/pages/NewsDetail"));
const News = lazy(() => import("@/pages/News"));
const Contact = lazy(() => import("@/pages/Contact"));
const Offices = lazy(() => import("@/pages/Offices"));
const About = lazy(() => import("@/pages/About"));
const Careers = lazy(() => import("@/pages/Careers"));
const Interns = lazy(() => import("@/pages/Interns"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NewsletterUnsubscribe = lazy(() => import("@/pages/NewsletterUnsubscribe"));
const Newsletter = lazy(() => import("@/pages/Newsletter"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const TestimonialWrite = lazy(() => import("@/pages/TestimonialWrite"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview"));
const AdminContentHub = lazy(() => import("@/pages/admin/AdminContentHub"));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminAccount = lazy(() => import("@/pages/admin/AdminAccount"));
const AdminOrder = lazy(() => import("@/pages/admin/AdminOrder"));
const AdminNewsForm = lazy(() => import("@/pages/admin/AdminNewsForm"));
const AdminManual = lazy(() => import("@/pages/admin/AdminManual"));
const ContentPreview = lazy(() => import("@/features/admin/ContentPreview"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminSiteConfig = lazy(() => import("@/pages/admin/AdminSiteConfig"));
const AdminJobs = lazy(() => import("@/pages/admin/AdminJobs"));
const AdminApplications = lazy(() => import("@/pages/admin/AdminApplications"));
const AdminInbox = lazy(() => import("@/pages/admin/AdminInbox"));
const AdminSetup = lazy(() => import("@/pages/admin/AdminSetup"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("@/pages/admin/AdminPosts"));
const AdminPostForm = lazy(() => import("@/pages/admin/AdminPostForm"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminNews = lazy(() => import("@/pages/admin/AdminNews"));
const AdminAgents = lazy(() => import("@/pages/admin/AdminAgents"));
const AdminArticleProcessing = lazy(() => import("@/pages/admin/AdminArticleProcessing"));
const AdminAudits = lazy(() => import("@/pages/admin/AdminAudits"));
const AdminTeam = lazy(() => import("@/pages/admin/AdminTeam"));
const AdminTeamForm = lazy(() => import("@/pages/admin/AdminTeamForm"));
const AdminGuide = lazy(() => import("@/pages/admin/AdminGuide"));
const AdminPerformance = lazy(() => import("@/pages/admin/AdminPerformance"));
const AdminPracticeGroups = lazy(() => import("@/pages/admin/AdminPracticeGroups"));
const AdminIndustryGroups = lazy(() => import("@/pages/admin/AdminIndustryGroups"));
const AdminGeneratedImages = lazy(() => import("@/pages/admin/AdminGeneratedImages"));
const AdminGeneratedAudio = lazy(() => import("@/pages/admin/AdminGeneratedAudio"));
const AdminPresentations = lazy(() => import("@/pages/admin/AdminPresentations"));
const AdminCopyHistory = lazy(() => import("@/pages/admin/AdminCopyHistory"));
const AdminKnowledge = lazy(() => import("@/pages/admin/AdminKnowledge"));
const AdminTranslations = lazy(() => import("@/pages/admin/AdminTranslations"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminHealthCheck = lazy(() => import("@/pages/admin/AdminHealthCheck"));
const SystemExplorer = lazy(() => import("@/pages/admin/SystemExplorer"));
const AdminArticleDetail = lazy(() => import("@/pages/admin/AdminArticleDetail"));
const GalleryAdmin = lazy(() => import("@/pages/admin/GalleryAdmin"));

function SkipLinks() {
  const { language } = useLanguage();
  const [location] = useLocation();
  if(location.startsWith("/admin")&&!location.startsWith("/admin/preview/"))return null;
  
  const labels = {
    en: {
      skipToMain: "Skip to main content",
      skipToNav: "Skip to navigation",
    },
    es: {
      skipToMain: "Saltar al contenido principal",
      skipToNav: "Saltar a la navegación",
    },
    de: {
      skipToMain: "Zum Hauptinhalt springen",
      skipToNav: "Zur Navigation springen",
    },
    zh: {
      skipToMain: "跳至主要内容",
      skipToNav: "跳至导航",
    },
    ko: {
      skipToMain: "주요 콘텐츠로 건너뛰기",
      skipToNav: "탐색으로 건너뛰기",
    },
    ja: {
      skipToMain: "メインコンテンツにスキップ",
      skipToNav: "ナビゲーションにスキップ",
    },
    ar: {
      skipToMain: "انتقل إلى المحتوى الرئيسي",
      skipToNav: "انتقل إلى التنقل",
    },
    ru: {
      skipToMain: "Перейти к основному содержанию",
      skipToNav: "Перейти к навигации",
    },
    fr: {
      skipToMain: "Aller au contenu principal",
      skipToNav: "Aller à la navigation",
    },
    it: {
      skipToMain: "Vai al contenuto principale",
      skipToNav: "Vai alla navigazione",
    },
  };
  
  const t = labels[language as keyof typeof labels] || labels.en;
  
  // Los enlaces van en el idioma del visitante y lo declaran: en la portada en inglés,
  // <html> lleva lang="en" (Home.tsx) aunque el visitante haya elegido otro
  return (
    <div className="skip-links" {...chrome26[language].attrs}>
      <a
        href="#main-content"
        className="skip-link"
        data-testid="link-skip-to-main"
      >
        {t.skipToMain}
      </a>
      <a
        href="#main-navigation"
        className="skip-link"
        data-testid="link-skip-to-nav"
      >
        {t.skipToNav}
      </a>
    </div>
  );
}

function PublicCookiePreferences(){const {language}=useLanguage();return <CookieBanner language={language}/>;}

function StaticAdminUnavailable() {
  return (
    <main className="min-h-screen bg-[#111110] text-white flex items-center justify-center px-6">
      <section className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60 mb-5">
          Admin requiere backend
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6 text-white">
          El CMS no está disponible en GitHub Pages.
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          Esta vista pública muestra el front real con datos estáticos. Las herramientas de administración,
          sesiones, cargas y agentes necesitan el servidor local o un backend desplegado.
        </p>
        <a
          href={`${import.meta.env.BASE_URL}`}
          className="inline-flex min-h-11 items-center justify-center border border-white/40 px-5 text-xs font-bold uppercase tracking-[0.16em] hover:bg-white/10 hover:text-white transition-colors"
        >
          Volver al sitio
        </a>
      </section>
    </main>
  );
}

// Rutas retiradas (D4, E4): /experience pasa a /practice-groups, y /articles (repetía /news)
// y /events (sin eventos) a /news. El servidor responde 301 (server/routes.ts); en GitHub
// Pages no hay servidor y la redirección es del cliente: Redirect antepone la base del router
// (/santos-saucedo-page) y se conservan la consulta y el ancla. Las páginas Articles y
// Events quedan en el código, sin ruta; Experience se borró (N8). /offices vuelve como
// "La oficina" (H1).
function RedirectKeepingQuery({ to }: { to: string }) {
  return <Redirect to={`${to}${window.location.search}${window.location.hash}`} replace />;
}

function Router() {
  const [location] = useLocation();

  if (isStaticSite && location.startsWith("/admin")) {
    return <StaticAdminUnavailable />;
  }

  const routes = (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/practice-groups" component={PracticeGroups} />
        <Route path="/practice-groups/:slug" component={PracticeGroupDetail} />
        <Route path="/team" component={Team} />
        <Route path="/team/:slug" component={TeamMemberDetail} />
        <Route path="/news" component={News} />
        <Route path="/news/:slug" component={NewsDetail} />
        <Route path="/contact" component={Contact} />
        <Route path="/careers" component={Careers} />
        <Route path="/careers/interns" component={Interns} />
        <Route path="/experience/*?">
          <RedirectKeepingQuery to="/practice-groups" />
        </Route>
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms" component={Terms} />
        <Route path="/offices" component={Offices} />
        {/* Testimonios: una sola ruta para todos los idiomas, como las demás páginas;
            /testimonials (inglés) lleva a la misma */}
        <Route path="/testimonios" component={Testimonials} />
        <Route path="/testimonios/escribir" component={TestimonialWrite} />
        <Route path="/testimonials">
          <RedirectKeepingQuery to="/testimonios" />
        </Route>
        <Route path="/articles/*?">
          <RedirectKeepingQuery to="/news" />
        </Route>
        <Route path="/newsletter/unsubscribe" component={NewsletterUnsubscribe} />
        <Route path="/newsletter" component={Newsletter} />
        <Route path="/events/*?">
          <RedirectKeepingQuery to="/news" />
        </Route>
        <Route path="/admin/navigation"><AdminSiteConfig fixedSection="navigation"/></Route>
        <Route path="/admin/integrations"><AdminSiteConfig fixedSection="integrations"/></Route>
        <Route path="/admin/cookie-consent"><AdminSiteConfig fixedSection="consent"/></Route>
        <Route path="/admin/site-config/:section"><AdminSiteConfig/></Route>
        <Route path="/admin/site-config"><AdminSiteConfig/></Route>
        <Route path="/admin/jobs" component={AdminJobs} />
        <Route path="/admin/inbox" component={AdminInbox} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/applications" component={AdminApplications} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/setup" component={AdminSetup} />
        <Route path="/admin/dashboard" component={AdminOverview} />
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/content" component={AdminContentHub} />
        <Route path="/admin/media" component={AdminMedia} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/account" component={AdminAccount} />
        <Route path="/admin/order" component={AdminOrder} />
        <Route path="/admin/manual" component={AdminManual} />
        <Route path="/admin/operations"><Redirect to="/admin/dashboard"/></Route>
        <Route path="/admin/preview/:kind/:slug" component={ContentPreview} />
        <Route path="/admin/posts" component={AdminPosts} />
        <Route path="/admin/posts/new" component={AdminPostForm} />
        <Route path="/admin/posts/:id/edit" component={AdminPostForm} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/news/new" component={AdminNewsForm} />
        <Route path="/admin/news/:id/edit" component={AdminNewsForm} />
        <Route path="/admin/news" component={AdminNews} />
        <Route path="/admin/news/:id" component={AdminArticleDetail} />
        <Route path="/admin/agents" component={AdminAgents} />
        <Route path="/admin/generated-images" component={AdminGeneratedImages} />
        <Route path="/admin/generated-audio" component={AdminGeneratedAudio} />
        <Route path="/admin/presentations" component={AdminPresentations} />
        <Route path="/admin/copies-ai" component={AdminCopyHistory} />
        <Route path="/admin/processing" component={AdminArticleProcessing} />
        <Route path="/admin/audits" component={AdminAudits} />
        <Route path="/admin/team" component={AdminTeam} />
        <Route path="/admin/team/new" component={AdminTeamForm} />
        <Route path="/admin/team/:id/edit" component={AdminTeamForm} />
        <Route path="/admin/guide" component={AdminGuide} />
        <Route path="/admin/performance" component={AdminPerformance} />
        <Route path="/admin/practice-groups" component={AdminPracticeGroups} />
        <Route path="/admin/industry-groups" component={AdminIndustryGroups} />
        <Route path="/admin/knowledge" component={AdminKnowledge} />
        <Route path="/admin/translations" component={AdminTranslations} />
        <Route path="/admin/events" component={AdminEvents} />
        <Route path="/admin/health-check" component={AdminHealthCheck} />
        <Route path="/admin/explorer" component={SystemExplorer} />
        <Route path="/admin/gallery" component={GalleryAdmin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
  const administrative = location.startsWith("/admin") && !["/admin/login","/admin/setup"].includes(location) && !location.startsWith("/admin/preview/");
  return administrative ? <AdminShell>{routes}</AdminShell> : routes;
}

// reducedMotion="user": con "reducir movimiento" del sistema, framer-motion deja de mover
// (translateY, escala) lo poco que aún anima (diálogos); solo queda la opacidad. El sitio no
// tiene entradas al aparecer: solo la máscara del título del héroe de portada (Hero26).
function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <WouterRouter base={routerBase}>
              <ScrollToTop />
              <SkipLinks />
              <Toaster />
              <Router />
              <PublicCookiePreferences/>
            </WouterRouter>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}

export default App;
