import { Link } from "wouter";
import { motion } from "framer-motion";
import { Award, Star, Trophy, Medal, BookOpen, Users, Scale, Building2, Globe2, Briefcase, ChevronRight, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { NumberedCard } from "@/components/editorial";
import type { TeamMember } from "@shared/schema";

interface DirectoryInfo {
  id: string;
  name: string;
  nameEs: string;
  icon: typeof Award;
  description: string;
  descriptionEs: string;
  rankings: { en: string; es: string }[];
}

const directories: DirectoryInfo[] = [
  {
    id: "labor-practice",
    name: "Labor Law Practice",
    nameEs: "Derecho Laboral",
    icon: Globe2,
    description: "Specialized counsel for companies in individual and collective labor matters.",
    descriptionEs: "Asesoría especializada para empresas en asuntos laborales individuales y colectivos.",
    rankings: [
      { en: "Individual and collective conflicts", es: "Conflictos individuales y colectivos" },
      { en: "Labor administration review", es: "Revisión de administración laboral" },
      { en: "Strategic labor planning", es: "Planeación laboral estratégica" },
    ],
  },
  {
    id: "preventive-counsel",
    name: "Preventive Counsel",
    nameEs: "Asesoría Preventiva",
    icon: Award,
    description: "Preventive legal consulting for national and international companies operating in Mexico.",
    descriptionEs: "Consultoría legal preventiva para empresas nacionales e internacionales que operan en México.",
    rankings: [
      { en: "Labor relations diagnostics", es: "Diagnóstico de relaciones laborales" },
      { en: "Improvement plans", es: "Planes de mejora" },
      { en: "Legal-labor audits", es: "Auditoría jurídico laboral" },
    ],
  },
  {
    id: "experience",
    name: "35+ Years of Experience",
    nameEs: "Más de 35 Años de Experiencia",
    icon: BookOpen,
    description: "A labor-law boutique built around long-term company counsel and workplace relations.",
    descriptionEs: "Una firma laboral construida alrededor de la asesoría empresarial y las relaciones de trabajo.",
    rankings: [
      { en: "Company-side counsel", es: "Asesoría empresarial" },
      { en: "Preventive approach", es: "Enfoque preventivo" },
      { en: "Labor compliance", es: "Cumplimiento laboral" },
    ],
  },
];

interface AwardInfo {
  id: string;
  title: string;
  titleEs: string;
  years?: string[];
  description: string;
  descriptionEs: string;
}

const awards: AwardInfo[] = [
  {
    id: "conflicts",
    title: "Individual and Collective Labor Conflicts",
    titleEs: "Conflictos Individuales y Colectivos",
    description: "Representation in individual and collective disputes before labor authorities.",
    descriptionEs: "Representación en conflictos individuales y colectivos ante autoridades laborales.",
  },
  {
    id: "audit",
    title: "Legal-Labor Auditing",
    titleEs: "Auditoría Jurídico Laboral",
    description: "Review of labor documentation, processes, and compliance exposure.",
    descriptionEs: "Revisión de documentación laboral, procesos y exposición de cumplimiento.",
  },
  {
    id: "training",
    title: "Strategic Labor Planning",
    titleEs: "Planeación Laboral Estratégica",
    description: "Courses, workshops, and planning designed to prevent labor risk.",
    descriptionEs: "Cursos, talleres y planeación diseñados para prevenir riesgos laborales.",
  },
  {
    id: "relations",
    title: "Labor Relations Diagnostics",
    titleEs: "Diagnóstico de Relaciones Laborales",
    description: "Analysis of workplace relations to identify risks and improvement opportunities.",
    descriptionEs: "Análisis de relaciones laborales para identificar riesgos y oportunidades de mejora.",
  },
];

const rankedLawyers = [
  { name: "Mario Saucedo Montemayor", slug: "mario-saucedo-montemayor", title: "Managing Partner", titleEs: "Socio Director" },
  { name: "Enrique Santos Gúzman", slug: "enrique-santos-guzman", title: "Managing Partner", titleEs: "Socio Director" },
  { name: "Enrique Santos Arce", slug: "enrique-santos-arce", title: "Founding Partner", titleEs: "Socio Fundador" },
  { name: "Jaime Herrera de Herrera", slug: "jaime-herrera-de-herrera", title: "Partner", titleEs: "Socio" },
  { name: "David Martínez Saucedo", slug: "david-martinez-saucedo", title: "Partner", titleEs: "Socio" },
  { name: "Jorge A. Garza Martínez", slug: "jorge-a-garza-martinez", title: "Senior Associate", titleEs: "Asociado Senior" },
];

export default function Rankings() {
  const { language } = useLanguage();

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const content: Record<string, {
    title: string;
    subtitle: string;
    overviewTitle: string;
    overviewText1: string;
    overviewText2: string;
    directoriesTitle: string;
    directoriesSubtitle: string;
    awardsTitle: string;
    awardsSubtitle: string;
    lawyersTitle: string;
    lawyersSubtitle: string;
    viewProfile: string;
    quoteText: string;
    quoteSource: string;
    viewAllTeam: string;
    recognitions: string;
    awards: string;
    rankings: string;
    year: string;
  }> = {
    en: {
      title: "Rankings & Recognition",
      subtitle: "Consistently recognized as one of the leading law firms in Mexico and Latin America",
      overviewTitle: "Excellence Recognized Worldwide",
      overviewText1: "Santos & Saucedo is consistently ranked among the top law firms in Mexico and Latin America by the world's most prestigious legal directories. Our commitment to excellence, deep expertise, and client-focused approach have earned us recognition across all major practice areas.",
      overviewText2: "For over seven decades, we have maintained our position as a market leader, earning top-tier rankings from Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250, and other leading publications.",
      directoriesTitle: "Major Legal Directories",
      directoriesSubtitle: "Top rankings across all major international legal directories",
      awardsTitle: "Awards & Achievements",
      awardsSubtitle: "Recent accolades recognizing our excellence in legal services",
      lawyersTitle: "Ranked Lawyers",
      lawyersSubtitle: "Our attorneys are individually recognized as leaders in their fields",
      viewProfile: "View Profile",
      quoteText: "Santos & Saucedo is 'the standout Mexican firm' with 'an enviable client roster and stellar reputation for high-end transactional and contentious work.'",
      quoteSource: "Chambers Latin America",
      viewAllTeam: "View All Team Members",
      recognitions: "Recognitions",
      awards: "Awards",
      rankings: "Rankings",
      year: "Year",
    },
    es: {
      title: "Reconocimientos",
      subtitle: "Santos & Saucedo ha sido reconocido a nivel internacional por diversas instituciones que incluyen Chambers Global, Chambers Latin America, Latin Lawyer 250, Global Arbitration Review (GAR 100), Global Competition Review (GCR), Global Investigations Review (GIR), Legal 500, Lexology Index, Latin America Corporate Counsel Association (LACCA), IFLR 1000 e IFLR Energy & Infrastructure y Benchmark Litigation entre otras.",
      overviewTitle: "Excelencia Reconocida Mundialmente",
      overviewText1: "Santos & Saucedo es consistentemente clasificado entre las principales firmas de abogados en México y América Latina por los directorios legales más prestigiosos del mundo. Nuestro compromiso con la excelencia, profunda experiencia y enfoque centrado en el cliente nos han ganado reconocimiento en todas las principales áreas de práctica.",
      overviewText2: "Durante más de siete décadas, hemos mantenido nuestra posición como líder del mercado, obteniendo clasificaciones de primer nivel de Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250 y otras publicaciones líderes.",
      directoriesTitle: "Principales Directorios Legales",
      directoriesSubtitle: "Clasificaciones superiores en todos los principales directorios legales internacionales",
      awardsTitle: "Premios y Logros",
      awardsSubtitle: "Reconocimientos recientes que destacan nuestra excelencia en servicios legales",
      lawyersTitle: "Abogados Reconocidos",
      lawyersSubtitle: "Nuestros abogados son individualmente reconocidos como líderes en sus campos",
      viewProfile: "Ver Perfil",
      quoteText: "Santos & Saucedo es 'la firma mexicana destacada' con 'una envidiable cartera de clientes y una reputación estelar para trabajo transaccional y contencioso de alto nivel.'",
      quoteSource: "Chambers América Latina",
      viewAllTeam: "Ver Todo el Equipo",
      recognitions: "Reconocimientos",
      awards: "Premios",
      rankings: "Rankings",
      year: "Año",
    },
    de: {
      title: "Auszeichnungen",
      subtitle: "Unsere Anerkennungen und Auszeichnungen",
      overviewTitle: "Weltweit anerkannte Exzellenz",
      overviewText1: "Santos & Saucedo wird von den weltweit renommiertesten Rechtsverzeichnissen regelmäßig unter den besten Anwaltskanzleien in Mexiko und Lateinamerika eingestuft. Unser Engagement für Exzellenz, tiefgreifende Expertise und kundenorientierter Ansatz haben uns Anerkennung in allen wichtigen Praxisbereichen eingebracht.",
      overviewText2: "Seit über sieben Jahrzehnten behaupten wir unsere Position als Marktführer und erhalten Top-Bewertungen von Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250 und anderen führenden Publikationen.",
      directoriesTitle: "Wichtige Rechtsverzeichnisse",
      directoriesSubtitle: "Spitzenplatzierungen in allen wichtigen internationalen Rechtsverzeichnissen",
      awardsTitle: "Preise und Erfolge",
      awardsSubtitle: "Aktuelle Auszeichnungen, die unsere Exzellenz in Rechtsdienstleistungen würdigen",
      lawyersTitle: "Ausgezeichnete Anwälte",
      lawyersSubtitle: "Unsere Anwälte werden individuell als Führungskräfte in ihren Bereichen anerkannt",
      viewProfile: "Profil ansehen",
      quoteText: "Santos & Saucedo ist 'die herausragende mexikanische Kanzlei' mit 'einem beneidenswerten Mandantenkreis und einem hervorragenden Ruf für hochwertige transaktionale und streitige Arbeit.'",
      quoteSource: "Chambers Lateinamerika",
      viewAllTeam: "Alle Teammitglieder anzeigen",
      recognitions: "Anerkennungen",
      awards: "Auszeichnungen",
      rankings: "Rankings",
      year: "Jahr",
    },
    zh: {
      title: "荣誉",
      subtitle: "我们的认可和奖项",
      overviewTitle: "全球公认的卓越",
      overviewText1: "Santos & Saucedo被世界上最负盛名的法律目录一致评为墨西哥和拉丁美洲顶级律师事务所之一。我们对卓越的承诺、深厚的专业知识和以客户为中心的方法使我们在所有主要业务领域获得认可。",
      overviewText2: "七十多年来，我们一直保持着市场领导者的地位，获得了Chambers and Partners、Legal 500、IFLR1000、Latin Lawyer 250和其他领先出版物的顶级评级。",
      directoriesTitle: "主要法律目录",
      directoriesSubtitle: "在所有主要国际法律目录中名列前茅",
      awardsTitle: "奖项与成就",
      awardsSubtitle: "表彰我们法律服务卓越的最新荣誉",
      lawyersTitle: "获评律师",
      lawyersSubtitle: "我们的律师个人被公认为各自领域的领导者",
      viewProfile: "查看简介",
      quoteText: "Santos & Saucedo是'杰出的墨西哥律所'，拥有'令人羡慕的客户名单和卓越的高端交易和争议工作声誉。'",
      quoteSource: "Chambers 拉丁美洲",
      viewAllTeam: "查看所有团队成员",
      recognitions: "认可",
      awards: "奖项",
      rankings: "排名",
      year: "年份",
    },
    ko: {
      title: "순위 및 인정",
      subtitle: "멕시코와 라틴 아메리카 최고의 로펌으로 지속적으로 인정받고 있습니다",
      overviewTitle: "전 세계적으로 인정받는 우수성",
      overviewText1: "Santos & Saucedo는 세계에서 가장 권위 있는 법률 디렉토리에서 멕시코와 라틴 아메리카 최고의 로펌으로 꾸준히 평가받고 있습니다. 우수성에 대한 헌신, 깊은 전문성, 고객 중심 접근 방식으로 모든 주요 업무 분야에서 인정받고 있습니다.",
      overviewText2: "70년 이상 우리는 시장 리더로서의 위치를 유지하며 Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250 및 기타 주요 출판물에서 최고 등급을 받아왔습니다.",
      directoriesTitle: "주요 법률 디렉토리",
      directoriesSubtitle: "모든 주요 국제 법률 디렉토리에서 최고 순위",
      awardsTitle: "수상 및 성과",
      awardsSubtitle: "법률 서비스의 우수성을 인정하는 최근 수상",
      lawyersTitle: "순위에 오른 변호사",
      lawyersSubtitle: "우리 변호사들은 각자의 분야에서 리더로 개별 인정받고 있습니다",
      viewProfile: "프로필 보기",
      quoteText: "Santos & Saucedo는 '부러운 고객 명단과 고급 거래 및 소송 업무에 대한 탁월한 명성을 가진' '뛰어난 멕시코 로펌'입니다.",
      quoteSource: "Chambers 라틴 아메리카",
      viewAllTeam: "모든 팀원 보기",
      recognitions: "인정",
      awards: "수상",
      rankings: "순위",
      year: "연도",
    },
    ja: {
      title: "ランキングと表彰",
      subtitle: "メキシコとラテンアメリカを代表する法律事務所として一貫して認められています",
      overviewTitle: "世界的に認められた卓越性",
      overviewText1: "Santos & Saucedoは、世界で最も権威ある法律ディレクトリによって、メキシコとラテンアメリカのトップ法律事務所として一貫して評価されています。卓越性へのコミットメント、深い専門知識、クライアント重視のアプローチにより、すべての主要な業務分野で認められています。",
      overviewText2: "70年以上にわたり、Chambers and Partners、Legal 500、IFLR1000、Latin Lawyer 250、その他の主要出版物からトップランクを獲得し、市場リーダーとしての地位を維持してきました。",
      directoriesTitle: "主要法律ディレクトリ",
      directoriesSubtitle: "すべての主要な国際法律ディレクトリでトップランク",
      awardsTitle: "受賞と実績",
      awardsSubtitle: "法律サービスの卓越性を認める最近の受賞",
      lawyersTitle: "ランク入りした弁護士",
      lawyersSubtitle: "当事務所の弁護士は、それぞれの分野でリーダーとして個別に認められています",
      viewProfile: "プロフィールを見る",
      quoteText: "Santos & Saucedoは'羨望のクライアントリストと高級トランザクションおよび訴訟業務に対する卓越した評判を持つ''傑出したメキシコの法律事務所'です。",
      quoteSource: "Chambers ラテンアメリカ",
      viewAllTeam: "すべてのチームメンバーを見る",
      recognitions: "表彰",
      awards: "受賞",
      rankings: "ランキング",
      year: "年",
    },
    ar: {
      title: "التصنيفات والتقدير",
      subtitle: "معترف بها باستمرار كواحدة من أبرز مكاتب المحاماة في المكسيك وأمريكا اللاتينية",
      overviewTitle: "التميز المعترف به عالمياً",
      overviewText1: "يتم تصنيف Santos & Saucedo باستمرار بين أفضل مكاتب المحاماة في المكسيك وأمريكا اللاتينية من قبل أكثر الدلائل القانونية المرموقة في العالم. التزامنا بالتميز والخبرة العميقة والنهج المركز على العميل أكسبنا التقدير في جميع مجالات الممارسة الرئيسية.",
      overviewText2: "على مدى أكثر من سبعة عقود، حافظنا على مكانتنا كرائد في السوق، وحصلنا على تصنيفات من الدرجة الأولى من Chambers and Partners وLegal 500 وIFLR1000 وLatin Lawyer 250 وغيرها من المنشورات الرائدة.",
      directoriesTitle: "الدلائل القانونية الرئيسية",
      directoriesSubtitle: "تصنيفات متقدمة في جميع الدلائل القانونية الدولية الرئيسية",
      awardsTitle: "الجوائز والإنجازات",
      awardsSubtitle: "تقديرات حديثة تعترف بتميزنا في الخدمات القانونية",
      lawyersTitle: "المحامون المصنفون",
      lawyersSubtitle: "يتم الاعتراف بمحامينا فردياً كقادة في مجالاتهم",
      viewProfile: "عرض الملف الشخصي",
      quoteText: "Santos & Saucedo هي 'شركة المحاماة المكسيكية البارزة' مع 'قائمة عملاء يُحسد عليها وسمعة ممتازة للعمل التعاقدي والخلافي رفيع المستوى.'",
      quoteSource: "Chambers أمريكا اللاتينية",
      viewAllTeam: "عرض جميع أعضاء الفريق",
      recognitions: "التقديرات",
      awards: "الجوائز",
      rankings: "التصنيفات",
      year: "السنة",
    },
    ru: {
      title: "Награды",
      subtitle: "Наши признания и награды",
      overviewTitle: "Признанное во всем мире превосходство",
      overviewText1: "Santos & Saucedo неизменно входит в число лучших юридических фирм Мексики и Латинской Америки по версии самых престижных юридических справочников мира. Наша приверженность совершенству, глубокая экспертиза и клиентоориентированный подход принесли нам признание во всех основных областях практики.",
      overviewText2: "Более семи десятилетий мы сохраняем позицию лидера рынка, получая высшие рейтинги от Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250 и других ведущих изданий.",
      directoriesTitle: "Основные юридические справочники",
      directoriesSubtitle: "Высшие рейтинги во всех основных международных юридических справочниках",
      awardsTitle: "Награды и достижения",
      awardsSubtitle: "Последние награды, признающие наше превосходство в юридических услугах",
      lawyersTitle: "Рейтинговые юристы",
      lawyersSubtitle: "Наши адвокаты индивидуально признаны лидерами в своих областях",
      viewProfile: "Посмотреть профиль",
      quoteText: "Santos & Saucedo — это 'выдающаяся мексиканская фирма' с 'завидным списком клиентов и безупречной репутацией в сфере высококлассной транзакционной и судебной работы.'",
      quoteSource: "Chambers Латинская Америка",
      viewAllTeam: "Смотреть всех членов команды",
      recognitions: "Признания",
      awards: "Награды",
      rankings: "Рейтинги",
      year: "Год",
    },
    fr: {
      title: "Classements et Reconnaissance",
      subtitle: "Régulièrement reconnu comme l'un des cabinets d'avocats de premier plan au Mexique et en Amérique latine",
      overviewTitle: "Excellence reconnue mondialement",
      overviewText1: "Santos & Saucedo est régulièrement classé parmi les meilleurs cabinets d'avocats au Mexique et en Amérique latine par les annuaires juridiques les plus prestigieux du monde. Notre engagement envers l'excellence, notre expertise approfondie et notre approche axée sur le client nous ont valu une reconnaissance dans tous les principaux domaines de pratique.",
      overviewText2: "Depuis plus de sept décennies, nous maintenons notre position de leader du marché, obtenant des classements de premier plan de Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250 et d'autres publications de référence.",
      directoriesTitle: "Principaux annuaires juridiques",
      directoriesSubtitle: "Meilleurs classements dans tous les principaux annuaires juridiques internationaux",
      awardsTitle: "Prix et Réalisations",
      awardsSubtitle: "Distinctions récentes reconnaissant notre excellence dans les services juridiques",
      lawyersTitle: "Avocats classés",
      lawyersSubtitle: "Nos avocats sont individuellement reconnus comme des leaders dans leurs domaines",
      viewProfile: "Voir le profil",
      quoteText: "Santos & Saucedo est 'le cabinet mexicain remarquable' avec 'un portefeuille de clients enviable et une réputation stellaire pour le travail transactionnel et contentieux haut de gamme.'",
      quoteSource: "Chambers Amérique latine",
      viewAllTeam: "Voir tous les membres de l'équipe",
      recognitions: "Reconnaissances",
      awards: "Prix",
      rankings: "Classements",
      year: "Année",
    },
    it: {
      title: "Riconoscimenti",
      subtitle: "I nostri riconoscimenti e premi",
      overviewTitle: "Eccellenza riconosciuta a livello mondiale",
      overviewText1: "Santos & Saucedo è costantemente classificato tra i migliori studi legali in Messico e America Latina dalle directory legali più prestigiose del mondo. Il nostro impegno per l'eccellenza, la profonda competenza e l'approccio incentrato sul cliente ci hanno fatto guadagnare riconoscimenti in tutte le principali aree di pratica.",
      overviewText2: "Da oltre sette decenni, abbiamo mantenuto la nostra posizione di leader di mercato, ottenendo le migliori classifiche da Chambers and Partners, Legal 500, IFLR1000, Latin Lawyer 250 e altre pubblicazioni leader.",
      directoriesTitle: "Principali directory legali",
      directoriesSubtitle: "Classifiche ai vertici in tutte le principali directory legali internazionali",
      awardsTitle: "Premi e Risultati",
      awardsSubtitle: "Recenti riconoscimenti che celebrano la nostra eccellenza nei servizi legali",
      lawyersTitle: "Avvocati in classifica",
      lawyersSubtitle: "I nostri avvocati sono individualmente riconosciuti come leader nei loro campi",
      viewProfile: "Vedi profilo",
      quoteText: "Santos & Saucedo è 'lo studio messicano di spicco' con 'un invidiabile portafoglio clienti e una reputazione stellare per il lavoro transazionale e contenzioso di alto livello.'",
      quoteSource: "Chambers America Latina",
      viewAllTeam: "Vedi tutti i membri del team",
      recognitions: "Riconoscimenti",
      awards: "Premi",
      rankings: "Classifiche",
      year: "Anno",
    },
  };

  const baseT = content[language] || content.en;
  const t = {
    ...baseT,
    title: language === "es" ? "Trayectoria" : "Experience",
    subtitle: language === "es"
      ? "Más de 35 años de experiencia especializada en Derecho Laboral"
      : "More than 35 years of specialized experience in labor law",
    overviewTitle: language === "es" ? "Experiencia Laboral Especializada" : "Specialized Labor Experience",
    overviewText1: language === "es"
      ? "Santos & Saucedo es un despacho jurídico especializado en Derecho Laboral que asesora a empresas nacionales e internacionales con un enfoque preventivo y práctico."
      : "Santos & Saucedo is a legal firm specialized in labor law, advising national and international companies through a preventive and practical approach.",
    overviewText2: language === "es"
      ? "La firma trabaja en conflictos individuales y colectivos, auditoría jurídico laboral, diagnóstico de relaciones laborales, planes de mejora y planeación laboral estratégica."
      : "The firm works on individual and collective disputes, legal-labor audits, workplace relations diagnostics, improvement plans, and strategic labor planning.",
    directoriesTitle: language === "es" ? "Capacidades" : "Capabilities",
    directoriesSubtitle: language === "es" ? "Áreas de trabajo públicas de la firma" : "Public practice capabilities of the firm",
    awardsTitle: language === "es" ? "Servicios Relevantes" : "Relevant Services",
    awardsSubtitle: language === "es" ? "Frentes de asesoría laboral descritos por la firma" : "Labor counsel workstreams described by the firm",
    lawyersTitle: language === "es" ? "Equipo Principal" : "Core Team",
    lawyersSubtitle: language === "es" ? "Socios y abogados de Santos & Saucedo" : "Partners and attorneys at Santos & Saucedo",
    quoteText: language === "es"
      ? "Somos un despacho jurídico que lleva más de 35 años de experiencia, especializado en Derecho Laboral."
      : "We are a legal firm with more than 35 years of experience, specialized in labor law.",
    quoteSource: "Santos & Saucedo",
    recognitions: language === "es" ? "Experiencia" : "Experience",
    awards: language === "es" ? "Servicios" : "Services",
    rankings: language === "es" ? "Capacidades" : "Capabilities",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-rankings">
      <SEOHead page="rankings" language={language} />
      <Header />

      <section className="pt-36 pb-20 bg-[#1a1a19]" data-testid="section-rankings-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <div className="h-0.5 w-12 bg-primary mx-auto mb-6" />
            <h1
              className="text-4xl md:text-5xl font-heading font-light text-white mb-5 uppercase tracking-[0.15em]"
              data-testid="text-rankings-title"
            >
              {t.title}
            </h1>
            <p
              className="text-base text-white/60 max-w-3xl mx-auto"
              data-testid="text-rankings-subtitle"
            >
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20"
            data-testid="section-rankings-overview"
          >
            <h2 className="text-2xl font-heading font-light text-foreground mb-6 uppercase tracking-[0.12em]">
              {t.overviewTitle}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <p className="text-lg text-foreground leading-relaxed text-justify">
                {t.overviewText1}
              </p>
              <p className="text-lg text-foreground leading-relaxed text-justify">
                {t.overviewText2}
              </p>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mb-20"
            data-testid="section-directories"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-heading font-light text-foreground mb-4 uppercase tracking-[0.12em]">
                {t.directoriesTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t.directoriesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directories.map((directory) => (
                <motion.div key={directory.id} variants={itemVariants}>
                  <NumberedCard
                    index={directories.indexOf(directory)}
                    title={language === "es" ? directory.nameEs : directory.name}
                    body={language === "es" ? directory.descriptionEs : directory.description}
                    icon={directory.icon}
                    dataTestid={`card-directory-${directory.id}`}
                  >
                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {directory.rankings.map((ranking, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                            data-testid={`badge-ranking-${directory.id}-${idx}`}
                          >
                            {language === "es" ? ranking.es : ranking.en}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </NumberedCard>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mb-20"
            data-testid="section-awards"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-heading font-light text-foreground mb-4 uppercase tracking-[0.12em]">
                {t.awardsTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t.awardsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((award) => (
                <motion.div key={award.id} variants={itemVariants}>
                  <NumberedCard
                    index={awards.indexOf(award)}
                    title={language === "es" ? award.titleEs : award.title}
                    body={
                      <>
                        {award.years && (
                          <span className="flex flex-wrap gap-2 mb-3">
                            {award.years.map((year) => (
                              <Badge
                                key={year}
                                variant="outline"
                                className="text-xs"
                              >
                                {year}
                              </Badge>
                            ))}
                          </span>
                        )}
                        <span className="block">
                          {language === "es" ? award.descriptionEs : award.description}
                        </span>
                      </>
                    }
                    dataTestid={`card-award-${award.id}`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 py-12 px-8"
            data-testid="section-rankings-quote"
          >
            <div className="max-w-4xl mx-auto text-center">
              <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
              <blockquote className="text-xl md:text-2xl font-heading font-light text-foreground mb-6">
                "{t.quoteText}"
              </blockquote>
              <cite className="text-primary font-medium">
                — {t.quoteSource}
              </cite>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mb-12"
            data-testid="section-ranked-lawyers"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-heading font-light text-foreground mb-4 uppercase tracking-[0.12em]">
                {t.lawyersTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t.lawyersSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankedLawyers.map((lawyer) => {
                const teamMember = teamMembers?.find(
                  (m) => m.slug === lawyer.slug || m.name === lawyer.name
                );

                return (
                  <motion.div key={lawyer.slug} variants={itemVariants}>
                    <Link href={teamMember ? `/team/${teamMember.slug}` : `/team/${lawyer.slug}`}>
                      <Card
                        className="h-full hover-elevate transition-all duration-300 cursor-pointer group"
                        data-testid={`card-lawyer-${lawyer.slug}`}
                      >
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                            {lawyer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {lawyer.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {language === "es" ? lawyer.titleEs : lawyer.title}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link href="/team">
                <Button
                  variant="outline"
                  className="gap-2"
                  data-testid="button-view-all-team"
                >
                  {t.viewAllTeam}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
