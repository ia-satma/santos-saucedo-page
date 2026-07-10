import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { isStaticSite } from "@/lib/queryClient";

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
const About = lazy(() => import("@/pages/About"));
const Careers = lazy(() => import("@/pages/Careers"));
const Interns = lazy(() => import("@/pages/Interns"));
const Experience = lazy(() => import("@/pages/Experience"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Offices = lazy(() => import("@/pages/Offices"));
const Articles = lazy(() => import("@/pages/Articles"));
const Newsletter = lazy(() => import("@/pages/Newsletter"));
const Events = lazy(() => import("@/pages/Events"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("@/pages/admin/AdminPosts"));
const AdminPostForm = lazy(() => import("@/pages/admin/AdminPostForm"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminNews = lazy(() => import("@/pages/admin/AdminNews"));
const AdminAgents = lazy(() => import("@/pages/AdminAgents"));
const AdminArticleProcessing = lazy(() => import("@/pages/admin/AdminArticleProcessing"));
const AdminAudits = lazy(() => import("@/pages/admin/AdminAudits"));
const AdminTeam = lazy(() => import("@/pages/admin/AdminTeam"));
const AdminTeamForm = lazy(() => import("@/pages/admin/AdminTeamForm"));
const AdminGuide = lazy(() => import("@/pages/admin/AdminGuide"));
const AdminPerformance = lazy(() => import("@/pages/admin/AdminPerformance"));
const AdminPracticeGroups = lazy(() => import("@/pages/admin/AdminPracticeGroups"));
const AdminIndustryGroups = lazy(() => import("@/pages/admin/AdminIndustryGroups"));
const AdminKnowledge = lazy(() => import("@/pages/admin/AdminKnowledge"));
const AdminTranslations = lazy(() => import("@/pages/admin/AdminTranslations"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminHealthCheck = lazy(() => import("@/pages/admin/AdminHealthCheck"));
const SystemExplorer = lazy(() => import("@/pages/admin/SystemExplorer"));
const AdminArticleDetail = lazy(() => import("@/pages/admin/AdminArticleDetail"));
const GalleryAdmin = lazy(() => import("@/pages/admin/GalleryAdmin"));

function SkipLinks() {
  const { language } = useLanguage();
  
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
  
  return (
    <div className="skip-links">
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

function StaticAdminUnavailable() {
  return (
    <main className="min-h-screen bg-[#111110] text-white flex items-center justify-center px-6">
      <section className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60 mb-5">
          Admin requiere backend
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
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

function Router() {
  const [location] = useLocation();

  if (isStaticSite && location.startsWith("/admin")) {
    return <StaticAdminUnavailable />;
  }

  return (
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
        <Route path="/experience" component={Experience} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms" component={Terms} />
        <Route path="/offices" component={Offices} />
        <Route path="/articles" component={Articles} />
        <Route path="/newsletter" component={Newsletter} />
        <Route path="/events" component={Events} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/posts" component={AdminPosts} />
        <Route path="/admin/posts/new" component={AdminPostForm} />
        <Route path="/admin/posts/:id/edit" component={AdminPostForm} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/news" component={AdminNews} />
        <Route path="/admin/news/:id" component={AdminArticleDetail} />
        <Route path="/admin/agents" component={AdminAgents} />
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
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={routerBase}>
            <ScrollToTop />
            <SkipLinks />
            <Toaster />
            <Router />
          </WouterRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
