import { OfficePhotography } from "@/components/editorial/OfficePhotography";
import { CareerForm } from "@/features/public-forms/CareerForm";
import { useQuery } from "@tanstack/react-query";
import { jobTypes, type JobOpening } from "@shared/schema";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { PhotoPageHeader } from "@/components/editorial/PhotoPageHeader";
import { SplitSection, TextLink } from "@/components/home26/primitives";
// "Santos & Saucedo" con espacios duros al pintarlo: el nombre no se parte al final de línea.
// Para la frase de los 40 años, actualizada por indicación del cliente.
import { keepFirmName } from "@/lib/firmName";
import type { LanguageCode } from "@shared/schema";
// El área de trabajo de la oficina (oficina/area-trabajo, 1536 × 1024), junto a la entrada
import areaTrabajo768 from "@assets/ss26/oficina/area-trabajo-768.webp";
import areaTrabajo1536 from "@assets/ss26/oficina/area-trabajo-1536.webp";

// "Clásica": titulares con la escala única de index.css (.ss-h2 para las secciones, .ss-h2-sm
// para los sub-bloques, .ss-h3 para filas); entrada en romana 400 Gris Tinta (solo el primer
// párrafo); texto en sans 400 Gris Tinta.
const leadClass = "font-serif font-normal text-ss-tinta text-[clamp(21px,0.6vw_+_15px,23px)] leading-[1.55] tracking-[-0.003em] [text-wrap:pretty]";

// Vacantes abiertas. La redacción aprobada dice que hoy no hay ninguna: la lista va vacía en
// cada idioma y la página muestra esa frase. Para publicar una, añadir su ficha aquí.
type Position = { title: string; department: string; location: string; type: string; description: string };

// "Semillero S&S" con espacio duro al pintarlo: el nombre del programa no se parte entre líneas
// (en alemán quedaba "Semillero" al final de una línea y "S&S" al principio de la siguiente)
const keepProgramName = (text: string) => text.replace(/Semillero S&S/g, "Semillero\u00a0S&S");

// Texto alternativo de la foto del área de trabajo: el mismo de /offices en cada idioma
const workAreaAlt: Record<LanguageCode, string> = {
  es: "Área de trabajo abierta de la oficina de Santos & Saucedo",
  en: "Open work area at the Santos & Saucedo office",
  de: "Offener Arbeitsbereich der Kanzlei Santos & Saucedo",
  zh: "Santos & Saucedo办公室的开放式办公区",
  ko: "Santos & Saucedo 사무실의 개방형 업무 공간",
  ja: "Santos & Saucedoのオフィスのオープンな執務エリア",
  ar: "مساحة عمل مفتوحة في مكتب Santos & Saucedo",
  ru: "Открытая рабочая зона офиса Santos & Saucedo",
  fr: "Espace de travail ouvert du bureau de Santos & Saucedo",
  it: "Area di lavoro aperta della sede di Santos & Saucedo",
};


export default function Careers() {
  const siteDetails = useSiteDetails();
  const { photos } = useCmsMedia();
  const { language } = useLanguage();

  // Textos de la redacción aprobada (sección "Carreras"; la única página en tú). Sin valores
  // genéricos, prestaciones, salarios ni requisitos que la firma no haya confirmado. La frase
  // de los 40 años se actualiza por indicación del cliente.
  // h1 = la etiqueta del menú en cada idioma; "Tu carrera en Santos & Saucedo." es la entrada.
  // "Santos & Saucedo" con espacios duros: no se parte al final de línea (coreano, árabe).
  const content = {
    en: {
      heroTitle: "Careers",
      heroSubtitle: "Your career at Santos\u00a0&\u00a0Saucedo.",
      introText: "At Santos\u00a0&\u00a0Saucedo, interns and associates work on real matters from the start, alongside the partners: on-site audits, reviews of collective bargaining agreements, conciliation hearings and trials.",
      whyJoinSubtitle: "We look for students and lawyers interested in employer-side labor law, and administrative staff who want to grow in a partner-led firm. We value rigor, discretion and an interest in understanding how a business works from the inside.",
      cultureTitle: "What you will learn",
      cultureText: "In a firm of our size, your work is reviewed directly by a partner. You will learn to prepare a case file, to negotiate and to hold a position before the authorities, and you will see at close range how companies in many sectors operate.",
      environmentTitle: "The firm",
      environmentText: "With more than 40 years of experience, Santos & Saucedo advises companies on employment matters from San Pedro Garza García.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Semillero S&S is the firm’s internship program.",
      positionsTitle: "Openings",
      positionsEmpty: "There are no openings at the moment. You can leave your details with the Semillero S&S.",
      positions: [] as Position[],
      applyTitle: "How to apply",
      applyInstructions: "Send your CV as a PDF to:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "In the email, include your name, your phone number with area code, your level (student, intern, lawyer or administrative staff) and the practice you are interested in: labor, corporate, immigration or litigation.",
      sendApplication: "Send application",
    },
    es: {
      heroTitle: "Carreras",
      heroSubtitle: "Tu carrera en Santos\u00a0&\u00a0Saucedo.",
      introText: "En Santos\u00a0&\u00a0Saucedo, los pasantes y asociados trabajan desde el principio en asuntos reales, junto a los socios: auditorías en planta, revisiones de contratos colectivos, audiencias de conciliación y juicios.",
      whyJoinSubtitle: "Buscamos estudiantes y abogados interesados en el derecho laboral de empresa, y personal administrativo que quiera crecer en una firma de socios. Valoramos el rigor, la discreción y el interés por entender cómo funciona una empresa por dentro.",
      cultureTitle: "Lo que aprenderás",
      cultureText: "En una firma de nuestro tamaño, tu trabajo lo revisa directamente un socio. Aprenderás a preparar un expediente, a negociar y a sostener una postura frente a la autoridad, y conocerás de cerca la operación de empresas de muchos sectores.",
      environmentTitle: "La firma",
      environmentText: "Con más de 40 años de experiencia, Santos & Saucedo asesora a empresas en materia laboral desde San Pedro Garza García.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "El Semillero S&S es el programa de pasantes de la firma.",
      positionsTitle: "Vacantes",
      positionsEmpty: "Por ahora no hay vacantes abiertas. Puedes dejar tus datos en el Semillero S&S.",
      positions: [] as Position[],
      applyTitle: "Cómo postularse",
      applyInstructions: "Envía tu CV en PDF a:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "En el correo, indica tu nombre, tu teléfono con lada, tu nivel (estudiante, pasante, abogado o administrativo) y la práctica de interés: laboral, corporativo, migratorio o litigio.",
      sendApplication: "Enviar solicitud",
    },
    de: {
      heroTitle: "Karriere",
      heroSubtitle: "Ihre Karriere bei Santos\u00a0&\u00a0Saucedo.",
      introText: "Bei Santos\u00a0&\u00a0Saucedo arbeiten Praktikanten und Associates von Anfang an an echten Mandaten, an der Seite der Partner: Audits vor Ort, Prüfung von Tarifverträgen, Schlichtungsverhandlungen und Gerichtsverfahren.",
      whyJoinSubtitle: "Wir suchen Studierende und Juristen mit Interesse am Arbeitsrecht auf Unternehmensseite sowie Verwaltungspersonal, das sich in einer partnergeführten Kanzlei weiterentwickeln möchte. Wir schätzen Sorgfalt, Diskretion und das Interesse daran, wie ein Unternehmen von innen funktioniert.",
      cultureTitle: "Was Sie lernen",
      cultureText: "In einer Kanzlei unserer Größe prüft ein Partner Ihre Arbeit direkt. Sie lernen, eine Akte vorzubereiten, zu verhandeln und eine Position gegenüber den Behörden zu vertreten, und Sie lernen den Betrieb von Unternehmen aus vielen Branchen aus der Nähe kennen.",
      environmentTitle: "Die Kanzlei",
      environmentText: "Mit mehr als 40 Jahren Erfahrung berät Santos & Saucedo Unternehmen von San Pedro Garza García aus in arbeitsrechtlichen Fragen.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Das Semillero S&S ist das Praktikantenprogramm der Kanzlei.",
      positionsTitle: "Offene Stellen",
      positionsEmpty: "Derzeit gibt es keine offenen Stellen. Sie können Ihre Daten im Semillero S&S hinterlegen.",
      positions: [] as Position[],
      applyTitle: "So bewerben Sie sich",
      applyInstructions: "Senden Sie Ihren Lebenslauf als PDF an:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Nennen Sie in der E-Mail Ihren Namen, Ihre Telefonnummer mit Vorwahl, Ihre Stufe (Studium, Praktikum, Jurist/in oder Verwaltung) und den gewünschten Bereich: Arbeitsrecht, Gesellschaftsrecht, Migrationsrecht oder Prozessführung.",
      sendApplication: "Bewerbung senden",
    },
    zh: {
      heroTitle: "职业发展",
      heroSubtitle: "在 Santos\u00a0&\u00a0Saucedo 的职业发展。",
      introText: "在 Santos\u00a0&\u00a0Saucedo，实习生和律师从一开始就与合伙人一起处理真实案件：现场审计、集体合同审查、调解听证和诉讼。",
      whyJoinSubtitle: "我们寻找对企业方劳动法感兴趣的学生和律师，以及希望在合伙制律所中成长的行政人员。我们看重严谨、审慎，以及深入了解企业内部运作的兴趣。",
      cultureTitle: "您将学到什么",
      cultureText: "在我们这样规模的律所，您的工作由合伙人直接审阅。您将学习如何准备案卷、进行谈判、在主管机关面前坚持立场，并近距离了解众多行业企业的运营。",
      environmentTitle: "关于律所",
      environmentText: "凭借超过40年的专业经验，Santos & Saucedo 在圣佩德罗-加尔萨-加西亚为企业提供劳动法律咨询。",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Semillero S&S 是本所的实习生项目。",
      positionsTitle: "职位空缺",
      positionsEmpty: "目前没有空缺职位。您可以将资料留在 Semillero S&S。",
      positions: [] as Position[],
      applyTitle: "如何申请",
      applyInstructions: "请将 PDF 格式的简历发送至：",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "请在邮件中注明您的姓名、带区号的电话、您的身份（学生、实习生、律师或行政人员）以及感兴趣的业务领域：劳动、公司、移民或诉讼。",
      sendApplication: "发送申请",
    },
    ko: {
      heroTitle: "채용",
      heroSubtitle: "Santos\u00a0&\u00a0Saucedo에서의 경력.",
      introText: "Santos\u00a0&\u00a0Saucedo에서는 인턴과 어소시에이트가 처음부터 파트너와 함께 실제 사건을 담당합니다. 현장 감사, 단체협약 검토, 조정 심리와 소송 등입니다.",
      whyJoinSubtitle: "기업 측 노동법에 관심 있는 학생과 변호사, 그리고 파트너 중심의 법인에서 성장하고자 하는 행정 직원을 찾습니다. 엄격함과 신중함, 그리고 기업이 내부에서 어떻게 움직이는지 이해하려는 관심을 중시합니다.",
      cultureTitle: "배우게 될 것",
      cultureText: "우리 규모의 법인에서는 파트너가 여러분의 업무를 직접 검토합니다. 사건 기록을 준비하고, 협상하고, 당국 앞에서 입장을 지키는 법을 배우며, 여러 업종 기업의 운영을 가까이에서 알게 됩니다.",
      environmentTitle: "법인 소개",
      environmentText: "40년 이상의 전문 경험을 바탕으로, Santos & Saucedo는 산페드로 가르사 가르시아에서 기업에 노동 문제를 자문합니다.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Semillero S&S는 법인의 인턴십 프로그램입니다.",
      positionsTitle: "채용 공고",
      positionsEmpty: "현재 채용 중인 자리가 없습니다. Semillero S&S에 정보를 남길 수 있습니다.",
      positions: [] as Position[],
      applyTitle: "지원 방법",
      applyInstructions: "PDF 형식의 이력서를 다음 주소로 보내 주세요:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "이메일에 이름, 지역번호를 포함한 전화번호, 구분(학생, 인턴, 변호사 또는 행정직)과 관심 업무 분야(노동, 기업, 이민 또는 소송)를 적어 주세요.",
      sendApplication: "지원서 보내기",
    },
    ja: {
      heroTitle: "採用情報",
      heroSubtitle: "Santos\u00a0&\u00a0Saucedo でのキャリア。",
      introText: "Santos\u00a0&\u00a0Saucedo では、インターンとアソシエイトが最初からパートナーとともに実際の案件に携わります。現場での監査、労働協約の見直し、調停期日、訴訟などです。",
      whyJoinSubtitle: "企業側の労働法に関心のある学生と弁護士、そしてパートナー主導の事務所で成長したい事務職員を求めています。厳密さ、慎重さ、そして企業が内側からどう動いているかを理解しようとする姿勢を大切にしています。",
      cultureTitle: "学べること",
      cultureText: "当事務所の規模では、あなたの仕事はパートナーが直接確認します。記録の準備、交渉、当局に対して立場を貫くことを学び、さまざまな業種の企業の業務を間近で知ることができます。",
      environmentTitle: "事務所について",
      environmentText: "40年以上の専門的な実績を持ち、Santos & Saucedo はサン・ペドロ・ガルサ・ガルシアを拠点に企業の労働問題について助言しています。",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Semillero S&S は当事務所のインターンシップ・プログラムです。",
      positionsTitle: "募集職種",
      positionsEmpty: "現在、募集中の職種はありません。Semillero S&S に情報を登録できます。",
      positions: [] as Position[],
      applyTitle: "応募方法",
      applyInstructions: "PDF形式の履歴書を次のアドレスにお送りください：",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "メールには、氏名、市外局番付きの電話番号、区分（学生、インターン、弁護士、事務職）、希望する業務分野（労働、企業法務、移民、訴訟）をご記入ください。",
      sendApplication: "応募書類を送信",
    },
    ar: {
      heroTitle: "الوظائف",
      heroSubtitle: "مسيرتك المهنية في Santos\u00a0&\u00a0Saucedo.",
      introText: "في Santos\u00a0&\u00a0Saucedo، يعمل المتدربون والمحامون المساعدون منذ البداية على قضايا حقيقية إلى جانب الشركاء: عمليات تدقيق في المصانع، ومراجعة عقود العمل الجماعية، وجلسات التوفيق، والدعاوى القضائية.",
      whyJoinSubtitle: "نبحث عن طلاب ومحامين مهتمين بقانون العمل من جانب أصحاب العمل، وعن موظفين إداريين يرغبون في النمو داخل مكتب يقوده الشركاء. نقدّر الدقة والتكتم والاهتمام بفهم كيفية عمل المؤسسة من الداخل.",
      cultureTitle: "ما ستتعلمه",
      cultureText: "في مكتب بحجمنا، يراجع أحد الشركاء عملك مباشرة. ستتعلم إعداد الملف والتفاوض والدفاع عن موقف أمام السلطات، وستتعرف عن قرب على طريقة عمل شركات من قطاعات كثيرة.",
      environmentTitle: "المكتب",
      environmentText: "مع أكثر من 40 عامًا من الخبرة، يقدّم Santos & Saucedo المشورة للشركات في مسائل العمل من San Pedro Garza García.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "يُعدّ Semillero S&S برنامج المتدربين في المكتب.",
      positionsTitle: "الوظائف الشاغرة",
      positionsEmpty: "لا توجد حاليًا وظائف شاغرة. يمكنك ترك بياناتك في Semillero S&S.",
      positions: [] as Position[],
      applyTitle: "كيفية التقديم",
      applyInstructions: "أرسل سيرتك الذاتية بصيغة PDF إلى:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "اذكر في رسالتك اسمك ورقم هاتفك مع رمز المنطقة ومستواك (طالب أو متدرب أو محامٍ أو موظف إداري) ومجال الممارسة الذي يهمك: العمل أو الشركات أو الهجرة أو التقاضي.",
      sendApplication: "إرسال الطلب",
    },
    ru: {
      heroTitle: "Карьера",
      heroSubtitle: "Карьера в Santos\u00a0&\u00a0Saucedo.",
      introText: "В Santos\u00a0&\u00a0Saucedo стажёры и юристы с первого дня работают над реальными делами вместе с партнёрами: проверки на предприятиях, анализ коллективных договоров, примирительные слушания и судебные процессы.",
      whyJoinSubtitle: "Мы ищем студентов и юристов, интересующихся трудовым правом на стороне работодателя, а также административных сотрудников, которые хотят расти в партнёрской фирме. Мы ценим тщательность, сдержанность и стремление понять, как компания устроена изнутри.",
      cultureTitle: "Чему вы научитесь",
      cultureText: "В фирме нашего размера вашу работу напрямую проверяет партнёр. Вы научитесь готовить дело, вести переговоры и отстаивать позицию перед органами власти, а также близко познакомитесь с работой компаний из многих отраслей.",
      environmentTitle: "О фирме",
      environmentText: "С более чем 40-летним опытом Santos & Saucedo консультирует компании по вопросам трудового права из своего офиса в Сан-Педро-Гарса-Гарсия.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Semillero S&S — программа стажировки фирмы.",
      positionsTitle: "Вакансии",
      positionsEmpty: "Сейчас открытых вакансий нет. Вы можете оставить свои данные в Semillero S&S.",
      positions: [] as Position[],
      applyTitle: "Как подать заявку",
      applyInstructions: "Отправьте резюме в формате PDF на адрес:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "В письме укажите имя, телефон с кодом города, ваш уровень (студент, стажёр, юрист или административный сотрудник) и интересующую практику: трудовое право, корпоративное право, миграционное право или судебные споры.",
      sendApplication: "Отправить заявку",
    },
    fr: {
      heroTitle: "Carrières",
      heroSubtitle: "Votre carrière chez Santos\u00a0&\u00a0Saucedo.",
      introText: "Chez Santos\u00a0&\u00a0Saucedo, les stagiaires et les collaborateurs travaillent dès le départ sur de vrais dossiers, aux côtés des associés : audits sur site, révision de conventions collectives, audiences de conciliation et procès.",
      whyJoinSubtitle: "Nous recherchons des étudiants et des juristes intéressés par le droit du travail côté employeur, ainsi que du personnel administratif souhaitant évoluer dans un cabinet d’associés. Nous apprécions la rigueur, la discrétion et l’envie de comprendre le fonctionnement d’une entreprise de l’intérieur.",
      cultureTitle: "Ce que vous apprendrez",
      cultureText: "Dans un cabinet de notre taille, votre travail est relu directement par un associé. Vous apprendrez à préparer un dossier, à négocier et à défendre une position face à l’administration, et vous découvrirez de près le fonctionnement d’entreprises de nombreux secteurs.",
      environmentTitle: "Le cabinet",
      environmentText: "Avec plus de 40 ans d'expérience, Santos & Saucedo conseille les entreprises en droit du travail depuis San Pedro Garza García.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Le Semillero S&S est le programme de stage du cabinet.",
      positionsTitle: "Postes à pourvoir",
      positionsEmpty: "Il n’y a pas de poste à pourvoir pour le moment. Vous pouvez laisser vos coordonnées au Semillero S&S.",
      positions: [] as Position[],
      applyTitle: "Comment postuler",
      applyInstructions: "Envoyez votre CV au format PDF à :",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Dans l’e-mail, indiquez votre nom, votre téléphone avec l’indicatif, votre niveau (étudiant, stagiaire, avocat ou personnel administratif) et le domaine qui vous intéresse : travail, sociétés, immigration ou contentieux.",
      sendApplication: "Envoyer la candidature",
    },
    it: {
      heroTitle: "Carriere",
      heroSubtitle: "La tua carriera in Santos\u00a0&\u00a0Saucedo.",
      introText: "In Santos\u00a0&\u00a0Saucedo, tirocinanti e collaboratori lavorano fin dall’inizio su incarichi reali, al fianco dei soci: audit negli stabilimenti, revisione dei contratti collettivi, udienze di conciliazione e giudizi.",
      whyJoinSubtitle: "Cerchiamo studenti e avvocati interessati al diritto del lavoro dal lato dell’impresa, e personale amministrativo che voglia crescere in uno studio di soci. Apprezziamo il rigore, la discrezione e l’interesse a capire come funziona un’impresa dall’interno.",
      cultureTitle: "Cosa imparerai",
      cultureText: "In uno studio delle nostre dimensioni, il tuo lavoro viene rivisto direttamente da un socio. Imparerai a preparare un fascicolo, a negoziare e a sostenere una posizione davanti all’autorità, e conoscerai da vicino l’attività di imprese di molti settori.",
      environmentTitle: "Lo studio",
      environmentText: "Con oltre 40 anni di esperienza, Santos & Saucedo assiste le imprese in materia di lavoro da San Pedro Garza García.",
      internshipTitle: "Semillero S&S",
      internshipSubtitle: "Il Semillero S&S è il programma di tirocinio dello studio.",
      positionsTitle: "Posizioni aperte",
      positionsEmpty: "Al momento non ci sono posizioni aperte. Puoi lasciare i tuoi dati nel Semillero S&S.",
      positions: [] as Position[],
      applyTitle: "Come candidarsi",
      applyInstructions: "Invia il tuo CV in PDF a:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Nell’e-mail indica il tuo nome, il telefono con prefisso, il tuo livello (studente, tirocinante, avvocato o personale amministrativo) e l’area di interesse: lavoro, societario, immigrazione o contenzioso.",
      sendApplication: "Invia candidatura",
    },
  };

  const editableContent = useCmsContent("careers", content);
  const baseT = editableContent[language as keyof typeof content] || editableContent.en;
  const { data: jobs = [], isError: jobsError } = useQuery<JobOpening[]>({ queryKey: ["/api/jobs"] });
  const positions = jobs.map(j => ({ ...j, title: language === "es" ? j.titleEs : j.title, department: (language === "es" ? j.departmentEs : j.department) || "", location: (language === "es" ? j.locationEs : j.location) || "", description: language === "es" ? j.descriptionEs : j.description, type: jobTypes.find(type => type.value === j.type)?.[language === "es" ? "es" : "en"] || j.type }));
  const t = { ...baseT, applyEmail: siteDetails.recruitmentEmail, positions };

  // Enlace de texto con el aspecto de TextLink (etiqueta, subrayado, flecha y área táctil
  // ampliada); propio porque es mailto y conserva su data-testid
  const textLinkClass = "ss-label group relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3";
  // Correo de reclutamiento en dos piezas: se parte tras la arroba si la columna es estrecha
  const [emailUser, emailDomain] = t.applyEmail.split("@");
  // Filas abiertas, como "Cómo trabajamos" en /about: filete superior, titular en romana,
  // texto en la sans. Sin tarjeta, píldora, icono ni sombra.
  const rowClass = "border-t border-ss-rule pt-6";
  // Texto de las cuatro filas (el mismo cuerpo en las cuatro: solo la entrada va en romana)
  const rowTextClass = "text-[18px] text-ss-tinta leading-[1.65]";

  return (
    <div className="min-h-screen bg-background" data-testid="page-careers">
      <SEOHead page="careers" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie.
          Sin entrada al aparecer (G3): todo se ve completo desde el inicio. */}
      <main id="main-content">
      <section className="editorial-page-hero ss-photo-page-hero" data-testid="section-careers-hero">
        <PhotoPageHeader photo="espaciosAbiertos" position="50% 46%" />
        <div className="ss-container">
          <div className="max-w-3xl">
            <Eyebrow num="05" tone="navy" className="mb-6" />
            <h1 
              className="mb-5"
              data-testid="text-careers-title"
            >
              {t.heroTitle}
            </h1>
            <p data-testid="text-careers-subtitle">
              {t.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          
          {/* Fotografías y contenido comparten una sola composición, sin una fila vacía. */}
          <section className="mb-20 lg:mb-24" data-testid="section-why-join">
            <SplitSection
              asideClassName="order-last lg:order-none"
              aside={
                <figure className="max-w-[44rem] lg:max-w-none" data-testid="figure-careers-workspace">
                  <div className="overflow-hidden rounded-xl bg-ss-rule">
                    <img
                      src={photos.areaTrabajo.url}
                      srcSet={photos.areaTrabajo.smallUrl && photos.areaTrabajo.smallUrl !== photos.areaTrabajo.url ? `${photos.areaTrabajo.smallUrl} 768w, ${photos.areaTrabajo.url} 1536w` : undefined}
                      sizes="(min-width: 1024px) min(424px, 28vw), 90vw"
                      alt={keepFirmName(workAreaAlt[language as LanguageCode] ?? workAreaAlt.en)}
                      loading="lazy"
                      decoding="async"
                      width={1536}
                      height={1024}
                      className="ss-photo block h-auto w-full"
                      data-testid="img-careers-workspace"
                    />
                  </div>
                  <OfficePhotography photo="mesaTrabajo" className="mt-5" />
                </figure>
              }
            >
              <div className="max-w-[44rem]">
                <p className={leadClass} data-testid="text-careers-intro">
                  {t.introText}
                </p>
                <p className="mt-6 text-[17px] md:text-[18px] text-ss-tinta leading-[1.65] [text-wrap:pretty]">
                  {t.whyJoinSubtitle}
                </p>
              </div>
              <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
                <div className={rowClass} data-testid="card-culture">
                  <h2 className="ss-h2-sm mb-3">
                    {t.cultureTitle}
                  </h2>
                  <p className={rowTextClass}>
                    {t.cultureText}
                  </p>
                </div>

                <div className={rowClass} data-testid="card-environment">
                  <h2 className="ss-h2-sm mb-3">
                    {t.environmentTitle}
                  </h2>
                  <p className={rowTextClass}>
                    {keepFirmName(t.environmentText)}
                  </p>
                </div>

                {/* Semillero S&S (el programa de pasantes), antes que las vacantes como en la
                    redacción: la frase de las vacantes remite a él. Su frase y el enlace a su
                    página (/careers/interns), que trae lo demás. */}
                <div className={rowClass} data-testid="section-internship">
                  <h2 
                    className="ss-h2-sm mb-3"
                    data-testid="text-internship-title"
                  >
                    {t.internshipTitle}
                  </h2>
                  <p className={rowTextClass} data-testid="card-internship-overview">
                    {keepProgramName(t.internshipSubtitle)}
                  </p>
                  <div className="mt-6" data-testid="card-internship-cta">
                    <TextLink href="/careers/interns">{t.internshipTitle}</TextLink>
                  </div>
                </div>

                <div className={rowClass} data-testid="section-positions">
                  <h2 
                    className="ss-h2-sm mb-3"
                    data-testid="text-positions-title"
                  >
                    {t.positionsTitle}
                  </h2>
                  {!jobsError && t.positions.length === 0 && (
                    <p className={rowTextClass} data-testid="text-positions-empty">
                      {keepProgramName(t.positionsEmpty)}
                    </p>
                  )}

                  {/* Vacantes en filas abiertas: tipo, área y ciudad en etiqueta (sin píldora ni
                      iconos) y titular en romana. Solo si hay alguna; la solicitud se envía desde
                      "Cómo postularse" (un solo "Enviar solicitud" en la página). */}
                  {jobsError && <p role="status">{language === "es" ? "No se pudieron cargar las vacantes. Puede postularse por correo." : "Openings could not be loaded. You can apply by email."}</p>}
                  {t.positions.length > 0 && (
                    <div className="mt-6 border-b border-ss-rule">
                      {t.positions.map((position, index) => (
                        <article
                          key={index}
                          className="border-t border-ss-rule py-6"
                          data-testid={`card-position-${index}`}
                        >
                          <p className="ss-label text-ss-medio mb-3">
                            {position.type} · {position.department} · {position.location}
                          </p>
                          <h3 className="ss-h3 mb-3">
                            {position.title}
                          </h3>
                          <p className={rowTextClass}>
                            {position.description}
                          </p>
                          {(position.applicationEmail || position.applicationUrl) && <a className="underline text-ss-marino mt-4 inline-block" href={position.applicationUrl || `mailto:${position.applicationEmail}`}>{t.sendApplication}</a>}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SplitSection>
          </section>

          <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6" data-testid="section-apply">
            <div className="lg:col-span-5">
              <h2 className="ss-h2 mb-6" data-testid="text-apply-title">{t.applyTitle}</h2>
              <div className="max-w-[44rem]" data-testid="card-apply-instructions">
                <p className="text-base text-ss-tinta leading-[1.55] max-w-2xl mb-3">
                  {t.applyInstructions}
                </p>
                {/* El correo como enlace de texto, no dentro de un botón. A 320 px no cabía en la
                    columna: corte tras la arroba (<wbr>) y, por si acaso, overflow-wrap:anywhere */}
                <a 
                  href={`mailto:${t.applyEmail}`}
                  className="inline-block max-w-full text-[19px] text-ss-marino underline decoration-ss-input underline-offset-4 [overflow-wrap:anywhere] hover:decoration-ss-marino mb-4"
                  data-testid="link-apply-email"
                >
                  {emailUser}@<wbr />{emailDomain}
                </a>
                <p className="text-base text-ss-medio leading-[1.55] max-w-2xl">
                  {t.applyNote}
                </p>
                <a
                  href={`mailto:${t.applyEmail}`}
                  className={`${textLinkClass} mt-8`}
                  data-testid="button-send-application"
                >
                  <span className="ss-link">{t.sendApplication}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    →
                  </span>
                </a>
              </div>
            </div>
            <CareerForm source="careers" className="lg:col-span-6 lg:col-start-7"/>
          </section>

        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
