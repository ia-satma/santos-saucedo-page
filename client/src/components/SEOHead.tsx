import { useEffect } from "react";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/schema";

const BASE_URL = "https://www.santossaucedo.com";
const DEFAULT_IMAGE = "https://santossaucedo.com/images/santossaucedo_2025.png";

const HREFLANG_CODES: Record<LanguageCode, string> = {
  en: "en",
  es: "es-MX",
  de: "de",
  zh: "zh-CN",
  ko: "ko",
  ja: "ja",
  ar: "ar",
  ru: "ru",
  fr: "fr",
  it: "it",
};

const OG_LOCALE_CODES: Record<LanguageCode, string> = {
  en: "en_US",
  es: "es_MX",
  de: "de_DE",
  zh: "zh_CN",
  ko: "ko_KR",
  ja: "ja_JP",
  ar: "ar_SA",
  ru: "ru_RU",
  fr: "fr_FR",
  it: "it_IT",
};

interface SEOConfig {
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  path: string;
}

const seoConfig: Record<string, SEOConfig> = {
  home: {
    title: {
      en: "Santos & Saucedo | Law Firm for Companies in Mexico",
      es: "Santos & Saucedo | Abogados para Empresas — Laboral, Corporativo, Migratorio y Litigio",
      de: "Santos & Saucedo | Kanzlei für Arbeitsrecht in Mexiko",
      zh: "Santos & Saucedo | 墨西哥劳动法律师事务所",
      ko: "Santos & Saucedo | 멕시코 노동법 전문 로펌",
      ja: "Santos & Saucedo | メキシコの労働法専門法律事務所",
      ar: "Santos & Saucedo | شركة محاماة متخصصة في قانون العمل في المكسيك",
      ru: "Santos & Saucedo | Юридическая фирма по трудовому праву в Мексике",
      fr: "Santos & Saucedo | Cabinet d'Avocats en Droit du Travail au Mexique",
      it: "Santos & Saucedo | Studio Legale di Diritto del Lavoro in Messico",
    },
    description: {
      en: "Santos & Saucedo is a law firm for companies in San Pedro Garza García, Nuevo León — labor, corporate, immigration and litigation — rooted in labor law, with over 35 years of experience and a national alliance in more than 72 Mexican cities.",
      es: "Santos & Saucedo es una firma legal para empresas en San Pedro Garza García, Nuevo León —laboral, corporativo, migratorio y litigio—, con raíz en el derecho laboral, más de 35 años de experiencia y una alianza nacional en más de 72 ciudades de México.",
      de: "Santos & Saucedo ist eine auf Arbeitsrecht spezialisierte Kanzlei in San Pedro Garza García, Nuevo León, mit über 35 Jahren Erfahrung in der Beratung von Unternehmen bei Arbeitskonflikten, Compliance und Arbeitsbeziehungen.",
      zh: "Santos & Saucedo是一家位于新莱昂州圣佩德罗加尔萨加西亚的劳动法专业律师事务所，拥有超过35年为企业提供劳动纠纷、合规及劳动关系咨询的经验。",
      ko: "Santos & Saucedo는 누에보레온주 산 페드로 가르사 가르시아에 위치한 노동법 전문 로펌으로, 35년 이상 기업에 노동 분쟁, 규정 준수 및 노사 관계에 관한 자문을 제공해 왔습니다.",
      ja: "Santos & Saucedoは、ヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアに拠点を置く労働法専門の法律事務所であり、35年以上にわたり企業に労働紛争、コンプライアンス、労使関係に関する助言を提供しています。",
      ar: "Santos & Saucedo هي شركة محاماة متخصصة في قانون العمل مقرها في سان بيدرو غارثا غارسيا، نويفو ليون، بخبرة تزيد عن 35 عامًا في تقديم الاستشارات للشركات بشأن النزاعات العمالية والامتثال وعلاقات العمل.",
      ru: "Santos & Saucedo — специализирующаяся на трудовом праве фирма в Сан-Педро-Гарса-Гарсия, Нуэво-Леон, с более чем 35-летним опытом консультирования компаний по трудовым спорам, комплаенсу и трудовым отношениям.",
      fr: "Santos & Saucedo est un cabinet spécialisé en droit du travail à San Pedro Garza García, Nuevo León, avec plus de 35 ans d'expérience dans le conseil aux entreprises sur les conflits du travail, la conformité et les relations de travail.",
      it: "Santos & Saucedo è uno studio legale specializzato in diritto del lavoro a San Pedro Garza García, Nuevo León, con oltre 35 anni di esperienza nella consulenza alle aziende su conflitti di lavoro, conformità e relazioni di lavoro.",
    },
    path: "/",
  },
  about: {
    title: {
      en: "About Us | Santos & Saucedo",
      es: "Acerca de Nosotros | Santos & Saucedo",
      de: "Über Uns | Santos & Saucedo",
      zh: "关于我们 | Santos & Saucedo",
      ko: "회사 소개 | Santos & Saucedo",
      ja: "私たちについて | Santos & Saucedo",
      ar: "معلومات عنا | Santos & Saucedo",
      ru: "О Нас | Santos & Saucedo",
      fr: "À Propos de Nous | Santos & Saucedo",
      it: "Chi Siamo | Santos & Saucedo",
    },
    description: {
      en: "Learn about Santos & Saucedo's history, values, and approach — human-capital administration and legal defense for companies, rooted in labor law, with more than 35 years advising national and multinational companies.",
      es: "Conozca la historia, los valores y el enfoque de Santos & Saucedo — administración del capital humano y defensa legal para empresas, con raíz en el derecho laboral, más de 35 años asesorando empresas nacionales y multinacionales.",
      de: "Erfahren Sie mehr über die Geschichte, Werte und den präventiven Ansatz von Santos & Saucedo im Arbeitsrecht. Eine auf Arbeitsrecht spezialisierte Kanzlei mit über 35 Jahren Erfahrung in der Beratung nationaler und internationaler Unternehmen.",
      zh: "了解Santos & Saucedo的历史、价值观以及在劳动法领域的预防性理念。一家专注于劳动法的律师事务所，拥有超过35年为国内外企业提供咨询的经验。",
      ko: "Santos & Saucedo의 역사, 가치, 그리고 노동법에 대한 예방적 접근을 알아보세요. 35년 이상 국내외 기업에 자문을 제공해 온 노동법 전문 로펌입니다.",
      ja: "Santos & Saucedoの歴史、価値観、そして労働法における予防的アプローチをご紹介します。35年以上にわたり国内外の企業に助言してきた労働法専門の法律事務所です。",
      ar: "تعرف على تاريخ Santos & Saucedo وقيمها ونهجها الوقائي في قانون العمل. شركة متخصصة في قانون العمل بخبرة تزيد عن 35 عامًا في تقديم الاستشارات للشركات الوطنية والدولية.",
      ru: "Узнайте об истории, ценностях и превентивном подходе Santos & Saucedo к трудовому праву. Фирма, специализирующаяся на трудовом праве, с более чем 35-летним опытом консультирования национальных и международных компаний.",
      fr: "Découvrez l'histoire, les valeurs et l'approche préventive de Santos & Saucedo en droit du travail. Un cabinet spécialisé en droit du travail avec plus de 35 ans d'expérience auprès d'entreprises nationales et internationales.",
      it: "Scopri la storia, i valori e l'approccio preventivo di Santos & Saucedo al diritto del lavoro. Uno studio specializzato in diritto del lavoro con oltre 35 anni di esperienza al servizio di aziende nazionali e internazionali.",
    },
    path: "/about",
  },
  team: {
    title: {
      en: "Our Team | Santos & Saucedo",
      es: "Nuestro Equipo | Santos & Saucedo",
      de: "Unser Team | Santos & Saucedo",
      zh: "我们的团队 | Santos & Saucedo",
      ko: "우리 팀 | Santos & Saucedo",
      ja: "私たちのチーム | Santos & Saucedo",
      ar: "فريقنا | Santos & Saucedo",
      ru: "Наша Команда | Santos & Saucedo",
      fr: "Notre Équipe | Santos & Saucedo",
      it: "Il Nostro Team | Santos & Saucedo",
    },
    description: {
      en: "Meet our team of experienced attorneys at Santos & Saucedo. Our partners and associates are recognized leaders in their respective practice areas across Mexico.",
      es: "Conozca a nuestro equipo de abogados experimentados en Santos & Saucedo. Nuestros socios y asociados son líderes reconocidos en sus respectivas áreas de práctica.",
      de: "Lernen Sie unser erfahrenes Anwaltsteam bei Santos & Saucedo kennen. Unsere Partner und Mitarbeiter sind anerkannte Führungskräfte in ihren jeweiligen Praxisbereichen.",
      zh: "认识Santos & Saucedo经验丰富的律师团队。我们的合伙人和律师在各自的业务领域都是公认的领导者。",
      ko: "Santos & Saucedo의 경험 많은 변호사 팀을 만나보세요. 파트너와 어소시에이트는 각 분야에서 인정받는 리더입니다.",
      ja: "Santos & Saucedoの経験豊富な弁護士チームをご紹介します。当事務所のパートナーとアソシエイトは各分野で認められたリーダーです。",
      ar: "تعرف على فريقنا من المحامين ذوي الخبرة في Santos & Saucedo. شركاؤنا ومحامونا هم قادة معترف بهم في مجالات ممارستهم.",
      ru: "Познакомьтесь с нашей командой опытных юристов в Santos & Saucedo. Наши партнеры и сотрудники являются признанными лидерами в своих областях практики.",
      fr: "Rencontrez notre équipe d'avocats expérimentés chez Santos & Saucedo. Nos associés sont des leaders reconnus dans leurs domaines de pratique respectifs.",
      it: "Incontra il nostro team di avvocati esperti presso Santos & Saucedo. I nostri partner e associati sono leader riconosciuti nelle rispettive aree di pratica.",
    },
    path: "/team",
  },
  practiceGroups: {
    title: {
      en: "Practice Areas | Santos & Saucedo",
      es: "Áreas de Práctica | Santos & Saucedo",
      de: "Praxisbereiche | Santos & Saucedo",
      zh: "业务领域 | Santos & Saucedo",
      ko: "업무 분야 | Santos & Saucedo",
      ja: "業務分野 | Santos & Saucedo",
      ar: "مجالات الممارسة | Santos & Saucedo",
      ru: "Области Практики | Santos & Saucedo",
      fr: "Domaines de Pratique | Santos & Saucedo",
      it: "Aree di Pratica | Santos & Saucedo",
    },
    description: {
      en: "Four areas of specialty for companies, rooted in labor law: Labor & Social Security, Corporate & Contractual, Immigration, and Contentious Litigation (civil, commercial and criminal).",
      es: "Cuatro áreas de especialidad para empresas, con raíz en el derecho laboral: Laboral y Seguridad Social, Corporativo y Contractual, Migratorio, y Litigio Contencioso (civil, mercantil y penal).",
      de: "Arbeitsrechtliche Leistungen für Unternehmen: individuelle und kollektive Konflikte vor Schlichtungsstellen, Prüfung der Personalverwaltung, Diagnose der Arbeitsbeziehungen, Verbesserungspläne, arbeitsrechtliche Audits sowie strategische Planung, Kurse und Workshops.",
      zh: "为企业提供的劳动法服务：向调解委员会提起的个人与集体争议、劳动管理审查、劳动关系诊断、改进计划、劳动法律审计，以及战略规划、课程与研讨会。",
      ko: "기업을 위한 노동법 서비스: 조정위원회에 제기하는 개별 및 집단 분쟁, 노무 관리 검토, 노사 관계 진단, 개선 계획, 노동 법률 감사, 전략 기획, 강좌 및 워크숍.",
      ja: "企業向けの労働法サービス：調停委員会への個別・集団紛争、労務管理の見直し、労使関係の診断、改善計画、労働法務監査、戦略的立案、講座・ワークショップ。",
      ar: "خدمات قانون العمل للشركات: النزاعات الفردية والجماعية أمام لجان التوفيق، ومراجعة الإدارة العمالية، وتشخيص علاقات العمل، وخطط التحسين، والتدقيق القانوني العمالي، والتخطيط الاستراتيجي والدورات وورش العمل.",
      ru: "Услуги в области трудового права для компаний: индивидуальные и коллективные споры в согласительных комиссиях, проверка кадрового администрирования, диагностика трудовых отношений, планы улучшений, юридико-трудовой аудит, стратегическое планирование, курсы и семинары.",
      fr: "Services en droit du travail pour les entreprises : conflits individuels et collectifs devant les commissions de conciliation, révision de l'administration du personnel, diagnostic des relations de travail, plans d'amélioration, audit juridique du travail, planification stratégique, cours et ateliers.",
      it: "Servizi di diritto del lavoro per le aziende: conflitti individuali e collettivi dinanzi alle commissioni di conciliazione, revisione dell'amministrazione del lavoro, diagnosi delle relazioni di lavoro, piani di miglioramento, audit giuridico-lavorativo, pianificazione strategica, corsi e workshop.",
    },
    path: "/practice-groups",
  },
  industryGroups: {
    title: {
      en: "Industry Groups | Santos & Saucedo",
      es: "Grupos Industriales | Santos & Saucedo",
      de: "Branchengruppen | Santos & Saucedo",
      zh: "行业组 | Santos & Saucedo",
      ko: "산업 그룹 | Santos & Saucedo",
      ja: "業界グループ | Santos & Saucedo",
      ar: "مجموعات الصناعة | Santos & Saucedo",
      ru: "Отраслевые Группы | Santos & Saucedo",
      fr: "Groupes Industriels | Santos & Saucedo",
      it: "Gruppi Industriali | Santos & Saucedo",
    },
    description: {
      en: "Labor-law experience applied to companies across a range of industries. We advise national and international employers on prevention, audits, training, and labor disputes tailored to each sector.",
      es: "Experiencia en derecho laboral aplicada a empresas de diversas industrias. Asesoramos a empleadores nacionales e internacionales en prevención, auditoría, capacitación y conflictos laborales según cada sector.",
      de: "Arbeitsrechtliche Erfahrung für Unternehmen aus unterschiedlichen Branchen. Wir beraten nationale und internationale Arbeitgeber bei Prävention, Audits, Schulungen und Arbeitskonflikten – abgestimmt auf den jeweiligen Sektor.",
      zh: "将劳动法经验应用于各行业的企业。我们为国内外雇主提供针对各自行业的预防、审计、培训及劳动争议咨询。",
      ko: "다양한 산업의 기업에 적용되는 노동법 경험. 국내외 고용주에게 각 부문에 맞춘 예방, 감사, 교육 및 노동 분쟁 자문을 제공합니다.",
      ja: "さまざまな業界の企業に応用する労働法の経験。国内外の雇用主に対し、各業界に合わせた予防、監査、研修、労働紛争の助言を提供します。",
      ar: "خبرة في قانون العمل مطبَّقة على الشركات في مختلف الصناعات. نقدم الاستشارة لأصحاب العمل الوطنيين والدوليين في الوقاية والتدقيق والتدريب ونزاعات العمل بما يتناسب مع كل قطاع.",
      ru: "Опыт в области трудового права применительно к компаниям различных отраслей. Мы консультируем национальных и международных работодателей по вопросам профилактики, аудита, обучения и трудовых споров с учётом специфики каждого сектора.",
      fr: "Expérience en droit du travail appliquée aux entreprises de divers secteurs. Nous conseillons les employeurs nationaux et internationaux en matière de prévention, d'audit, de formation et de conflits du travail, adaptés à chaque secteur.",
      it: "Esperienza in diritto del lavoro applicata alle aziende di diversi settori. Assistiamo datori di lavoro nazionali e internazionali in prevenzione, audit, formazione e conflitti di lavoro su misura per ciascun settore.",
    },
    path: "/industry-groups",
  },
  news: {
    title: {
      en: "News & Insights | Santos & Saucedo",
      es: "Noticias e Insights | Santos & Saucedo",
      de: "Nachrichten & Einblicke | Santos & Saucedo",
      zh: "新闻与洞察 | Santos & Saucedo",
      ko: "뉴스 & 인사이트 | Santos & Saucedo",
      ja: "ニュース＆インサイト | Santos & Saucedo",
      ar: "الأخبار والرؤى | Santos & Saucedo",
      ru: "Новости и Аналитика | Santos & Saucedo",
      fr: "Actualités & Perspectives | Santos & Saucedo",
      it: "Notizie & Approfondimenti | Santos & Saucedo",
    },
    description: {
      en: "Stay informed with the latest legal news, insights, and updates from Santos & Saucedo. Explore our publications, press releases, and thought leadership.",
      es: "Manténgase informado con las últimas noticias legales, insights y actualizaciones de Santos & Saucedo. Explore nuestras publicaciones y liderazgo de pensamiento.",
      de: "Bleiben Sie informiert mit den neuesten Rechtsnachrichten, Einblicken und Updates von Santos & Saucedo. Entdecken Sie unsere Publikationen und Thought Leadership.",
      zh: "获取Santos & Saucedo最新的法律新闻、洞察和动态。探索我们的出版物和思想领导力。",
      ko: "Santos & Saucedo의 최신 법률 뉴스, 인사이트 및 업데이트를 확인하세요. 간행물과 사고 리더십을 탐색하세요.",
      ja: "Santos & Saucedoの最新の法律ニュース、インサイト、アップデートをご覧ください。出版物とソートリーダーシップを探索してください。",
      ar: "ابق على اطلاع بأحدث الأخبار القانونية والرؤى والتحديثات من Santos & Saucedo. استكشف منشوراتنا وقيادتنا الفكرية.",
      ru: "Будьте в курсе последних юридических новостей, аналитики и обновлений от Santos & Saucedo. Изучите наши публикации и экспертные материалы.",
      fr: "Restez informé des dernières actualités juridiques et perspectives de Santos & Saucedo. Explorez nos publications et leadership éclairé.",
      it: "Rimani informato con le ultime notizie legali, approfondimenti e aggiornamenti da Santos & Saucedo. Esplora le nostre pubblicazioni.",
    },
    path: "/news",
  },
  contact: {
    title: {
      en: "Contact Us | Santos & Saucedo",
      es: "Contáctenos | Santos & Saucedo",
      de: "Kontakt | Santos & Saucedo",
      zh: "联系我们 | Santos & Saucedo",
      ko: "연락처 | Santos & Saucedo",
      ja: "お問い合わせ | Santos & Saucedo",
      ar: "اتصل بنا | Santos & Saucedo",
      ru: "Контакты | Santos & Saucedo",
      fr: "Contactez-Nous | Santos & Saucedo",
      it: "Contattaci | Santos & Saucedo",
    },
    description: {
      en: "Get in touch with Santos & Saucedo. Visit our offices in San Pedro Garza García or contact our team for legal consultation and inquiries.",
      es: "Póngase en contacto con Santos & Saucedo. Visite nuestras oficinas en San Pedro Garza García o contacte a nuestro equipo para consultas legales.",
      de: "Nehmen Sie Kontakt mit Santos & Saucedo auf. Besuchen Sie unsere Büros in San Pedro Garza García oder kontaktieren Sie unser Team für rechtliche Beratung.",
      zh: "联系Santos & Saucedo。访问我们在圣佩德罗加尔萨加西亚的办公室，或联系我们的团队进行法律咨询。",
      ko: "Santos & Saucedo에 연락하세요. 산 페드로 가르사 가르시아 사무실을 방문하거나 법률 상담을 위해 저희 팀에 연락하세요.",
      ja: "Santos & Saucedoにお問い合わせください。サン・ペドロ・ガルサ・ガルシアのオフィスをご訪問いただくか、法的相談についてチームにご連絡ください。",
      ar: "تواصل مع Santos & Saucedo. قم بزيارة مكاتبنا في سان بيدرو غارثا غارسيا أو اتصل بفريقنا للاستشارات القانونية.",
      ru: "Свяжитесь с Santos & Saucedo. Посетите наши офисы в Сан-Педро-Гарса-Гарсия или обратитесь к нашей команде за юридической консультацией.",
      fr: "Contactez Santos & Saucedo. Visitez nos bureaux à San Pedro Garza García ou contactez notre équipe pour des consultations juridiques.",
      it: "Contatta Santos & Saucedo. Visita i nostri uffici a San Pedro Garza García o contatta il nostro team per consulenze legali.",
    },
    path: "/contact",
  },
  careers: {
    title: {
      en: "Careers | Santos & Saucedo",
      es: "Carreras | Santos & Saucedo",
      de: "Karriere | Santos & Saucedo",
      zh: "职业机会 | Santos & Saucedo",
      ko: "채용 | Santos & Saucedo",
      ja: "採用情報 | Santos & Saucedo",
      ar: "الوظائف | Santos & Saucedo",
      ru: "Карьера | Santos & Saucedo",
      fr: "Carrières | Santos & Saucedo",
      it: "Carriere | Santos & Saucedo",
    },
    description: {
      en: "Join a law firm for companies, rooted in labor law. Explore career opportunities, internship programs, and professional development at Santos & Saucedo.",
      es: "Únase a una firma legal para empresas, con raíz en el derecho laboral. Explore oportunidades de carrera, programas de pasantías y desarrollo profesional en Santos & Saucedo.",
      de: "Werden Sie Teil einer Kanzlei für Arbeitsrecht. Entdecken Sie Karrieremöglichkeiten und Praktikumsprogramme bei Santos & Saucedo.",
      zh: "加入一家劳动法律师事务所。探索Santos & Saucedo的职业机会、实习项目和专业发展。",
      ko: "노동법 전문 로펌에 합류하세요. Santos & Saucedo의 채용 기회, 인턴십 프로그램 및 전문 개발을 살펴보세요.",
      ja: "労働法専門の法律事務所に参加しませんか。Santos & Saucedoでのキャリア機会、インターンシッププログラム、専門的成長を探索してください。",
      ar: "انضم إلى شركة متخصصة في قانون العمل. استكشف فرص العمل وبرامج التدريب والتطوير المهني في Santos & Saucedo.",
      ru: "Присоединяйтесь к фирме, специализирующейся на трудовом праве. Изучите карьерные возможности, стажировки и профессиональное развитие в Santos & Saucedo.",
      fr: "Rejoignez un cabinet spécialisé en droit du travail. Explorez les opportunités de carrière et les programmes de stage chez Santos & Saucedo.",
      it: "Unisciti a uno studio specializzato in diritto del lavoro. Esplora le opportunità di carriera, i programmi di tirocinio e lo sviluppo professionale presso Santos & Saucedo.",
    },
    path: "/careers",
  },
  rankings: {
    title: {
      en: "Rankings & Recognition | Santos & Saucedo",
      es: "Rankings y Reconocimientos | Santos & Saucedo",
      de: "Rankings & Auszeichnungen | Santos & Saucedo",
      zh: "排名与认可 | Santos & Saucedo",
      ko: "순위 & 인정 | Santos & Saucedo",
      ja: "ランキング＆評価 | Santos & Saucedo",
      ar: "التصنيفات والتقدير | Santos & Saucedo",
      ru: "Рейтинги и Признание | Santos & Saucedo",
      fr: "Classements & Reconnaissance | Santos & Saucedo",
      it: "Classifiche & Riconoscimenti | Santos & Saucedo",
    },
    description: {
      en: "For more than 35 years, Santos & Saucedo has earned the trust of national and multinational companies through its labor-rooted, multi-area practice and consistent results.",
      es: "Durante más de 35 años, Santos & Saucedo ha ganado la confianza de empresas nacionales y multinacionales gracias a su práctica multi-área con raíz laboral y a resultados consistentes.",
      de: "Seit über 35 Jahren genießt Santos & Saucedo das Vertrauen nationaler und internationaler Unternehmen dank seiner spezialisierten arbeitsrechtlichen Praxis und konsistenter Ergebnisse.",
      zh: "35年多来，Santos & Saucedo凭借专注的劳动法业务和稳定的成果，赢得了国内外企业的信任。",
      ko: "35년 이상 Santos & Saucedo는 노동법에 특화된 업무와 일관된 성과로 국내외 기업의 신뢰를 얻어 왔습니다.",
      ja: "35年以上にわたり、Santos & Saucedoは労働法に特化した実務と一貫した成果により、国内外の企業から信頼を得てきました。",
      ar: "على مدى أكثر من 35 عامًا، نالت Santos & Saucedo ثقة الشركات الوطنية والدولية بفضل ممارستها المتخصصة في قانون العمل ونتائجها المتسقة.",
      ru: "На протяжении более 35 лет Santos & Saucedo завоёвывает доверие национальных и международных компаний благодаря специализированной практике в области трудового права и стабильным результатам.",
      fr: "Depuis plus de 35 ans, Santos & Saucedo gagne la confiance d'entreprises nationales et internationales grâce à sa pratique spécialisée en droit du travail et à des résultats constants.",
      it: "Da oltre 35 anni, Santos & Saucedo ha conquistato la fiducia di aziende nazionali e internazionali grazie alla sua pratica specializzata in diritto del lavoro e a risultati costanti.",
    },
    path: "/rankings",
  },
  experience: {
    title: {
      en: "Our Experience | Santos & Saucedo",
      es: "Nuestra Experiencia | Santos & Saucedo",
      de: "Unsere Erfahrung | Santos & Saucedo",
      zh: "我们的经验 | Santos & Saucedo",
      ko: "우리의 경험 | Santos & Saucedo",
      ja: "私たちの実績 | Santos & Saucedo",
      ar: "خبرتنا | Santos & Saucedo",
      ru: "Наш Опыт | Santos & Saucedo",
      fr: "Notre Expérience | Santos & Saucedo",
      it: "La Nostra Esperienza | Santos & Saucedo",
    },
    description: {
      en: "Representative experience in individual and collective labor matters: disputes before conciliation boards, labor audits, prevention, and advisory for national and international companies.",
      es: "Experiencia representativa en asuntos laborales individuales y colectivos: conflictos ante juntas de conciliación, auditorías laborales, prevención y asesoría para empresas nacionales e internacionales.",
      de: "Repräsentative Erfahrung in individuellen und kollektiven Arbeitsrechtsangelegenheiten: Konflikte vor Schlichtungsstellen, arbeitsrechtliche Audits, Prävention und Beratung für nationale und internationale Unternehmen.",
      zh: "在个人与集体劳动事务方面的代表性经验：调解委员会争议、劳动审计、预防，以及为国内外企业提供咨询。",
      ko: "개별 및 집단 노동 사안에 대한 대표적 경험: 조정위원회 분쟁, 노동 감사, 예방 및 국내외 기업 자문.",
      ja: "個別・集団の労働案件における代表的な実績：調停委員会での紛争、労働監査、予防、国内外企業への助言。",
      ar: "خبرة تمثيلية في القضايا العمالية الفردية والجماعية: النزاعات أمام لجان التوفيق، والتدقيق العمالي، والوقاية، وتقديم الاستشارة للشركات الوطنية والدولية.",
      ru: "Показательный опыт в индивидуальных и коллективных трудовых делах: споры в согласительных комиссиях, трудовой аудит, профилактика и консультирование национальных и международных компаний.",
      fr: "Expérience représentative dans les affaires de travail individuelles et collectives : litiges devant les commissions de conciliation, audits du travail, prévention et conseil aux entreprises nationales et internationales.",
      it: "Esperienza rappresentativa in questioni di lavoro individuali e collettive: controversie dinanzi alle commissioni di conciliazione, audit del lavoro, prevenzione e consulenza per aziende nazionali e internazionali.",
    },
    path: "/experience",
  },
  offices: {
    title: {
      en: "Our Offices | Santos & Saucedo",
      es: "Nuestras Oficinas | Santos & Saucedo",
      de: "Unsere Büros | Santos & Saucedo",
      zh: "我们的办公室 | Santos & Saucedo",
      ko: "사무소 안내 | Santos & Saucedo",
      ja: "オフィス案内 | Santos & Saucedo",
      ar: "مكاتبنا | Santos & Saucedo",
      ru: "Наши Офисы | Santos & Saucedo",
      fr: "Nos Bureaux | Santos & Saucedo",
      it: "I Nostri Uffici | Santos & Saucedo",
    },
    description: {
      en: "Visit Santos & Saucedo at Río Tamazunchale 205 Norte in Nuevo León, San Pedro Garza García. Modern facilities with state-of-the-art amenities for clients and team members.",
      es: "Visite Santos & Saucedo en Río Tamazunchale 205 Norte en Nuevo León, San Pedro Garza García. Instalaciones modernas con amenidades de primera clase.",
      de: "Besuchen Sie Santos & Saucedo im Río Tamazunchale 205 Norte in Nuevo León, San Pedro Garza García. Moderne Einrichtungen mit erstklassiger Ausstattung.",
      zh: "访问位于新莱昂州圣佩德罗加尔萨加西亚Río Tamazunchale 205 Norte的Santos & Saucedo。为客户和团队成员提供配备先进设施的现代化办公环境。",
      ko: "누에보레온주 산 페드로 가르사 가르시아 Río Tamazunchale 205 Norte에 위치한 Santos & Saucedo를 방문하세요. 고객과 팀원을 위한 최신 시설을 갖춘 현대적인 사무실입니다.",
      ja: "ヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアのRío Tamazunchale 205 NorteにあるSantos & Saucedoをご訪問ください。お客様とチームのための最新設備を備えた近代的なオフィスです。",
      ar: "قم بزيارة Santos & Saucedo في Río Tamazunchale 205 Norte في سان بيدرو غارثا غارسيا، نويفو ليون. مرافق حديثة بوسائل راحة متطورة للعملاء وأعضاء الفريق.",
      ru: "Посетите Santos & Saucedo по адресу Río Tamazunchale 205 Norte в Сан-Педро-Гарса-Гарсия, Нуэво-Леон. Современные помещения с первоклассным оснащением для клиентов и команды.",
      fr: "Visitez Santos & Saucedo au Río Tamazunchale 205 Norte à San Pedro Garza García, Nuevo León. Installations modernes avec des équipements de pointe pour les clients et l'équipe.",
      it: "Visita Santos & Saucedo presso Río Tamazunchale 205 Norte a San Pedro Garza García, Nuevo León. Strutture moderne con servizi all'avanguardia per clienti e team.",
    },
    path: "/offices",
  },
  privacyPolicy: {
    title: {
      en: "Privacy Policy | Santos & Saucedo",
      es: "Política de Privacidad | Santos & Saucedo",
      de: "Datenschutzrichtlinie | Santos & Saucedo",
      zh: "隐私政策 | Santos & Saucedo",
      ko: "개인정보 처리방침 | Santos & Saucedo",
      ja: "プライバシーポリシー | Santos & Saucedo",
      ar: "سياسة الخصوصية | Santos & Saucedo",
      ru: "Политика Конфиденциальности | Santos & Saucedo",
      fr: "Politique de Confidentialité | Santos & Saucedo",
      it: "Privacy Policy | Santos & Saucedo",
    },
    description: {
      en: "Read Santos & Saucedo's Privacy Policy regarding the collection, use, and protection of personal data under Mexican law (LFPDPPP).",
      es: "Lea la Política de Privacidad de Santos & Saucedo sobre la recolección, uso y protección de datos personales bajo la ley mexicana (LFPDPPP).",
      de: "Lesen Sie die Datenschutzrichtlinie von Santos & Saucedo bezüglich der Erhebung, Nutzung und des Schutzes personenbezogener Daten.",
      zh: "阅读Santos & Saucedo关于根据墨西哥法律收集、使用和保护个人数据的隐私政策。",
      ko: "멕시코 법률에 따른 개인정보 수집, 사용 및 보호에 관한 Santos & Saucedo의 개인정보 처리방침을 읽어보세요.",
      ja: "メキシコ法に基づく個人データの収集、使用、保護に関するSantos & Saucedoのプライバシーポリシーをお読みください。",
      ar: "اقرأ سياسة الخصوصية الخاصة بـ Santos & Saucedo فيما يتعلق بجمع واستخدام وحماية البيانات الشخصية.",
      ru: "Ознакомьтесь с Политикой конфиденциальности Santos & Saucedo о сборе, использовании и защите персональных данных.",
      fr: "Lisez la Politique de Confidentialité de Santos & Saucedo concernant la collecte, l'utilisation et la protection des données personnelles.",
      it: "Leggi la Privacy Policy di Santos & Saucedo riguardante la raccolta, l'uso e la protezione dei dati personali.",
    },
    path: "/privacy-policy",
  },
  terms: {
    title: {
      en: "Terms and Conditions | Santos & Saucedo",
      es: "Términos y Condiciones | Santos & Saucedo",
      de: "Allgemeine Geschäftsbedingungen | Santos & Saucedo",
      zh: "条款与条件 | Santos & Saucedo",
      ko: "이용약관 | Santos & Saucedo",
      ja: "利用規約 | Santos & Saucedo",
      ar: "الشروط والأحكام | Santos & Saucedo",
      ru: "Условия Использования | Santos & Saucedo",
      fr: "Conditions Générales | Santos & Saucedo",
      it: "Termini e Condizioni | Santos & Saucedo",
    },
    description: {
      en: "Review the Terms and Conditions for using the Santos & Saucedo website. Please read these terms carefully before using our services.",
      es: "Revise los Términos y Condiciones para el uso del sitio web de Santos & Saucedo. Por favor lea estos términos cuidadosamente.",
      de: "Lesen Sie die Allgemeinen Geschäftsbedingungen für die Nutzung der Website von Santos & Saucedo.",
      zh: "查看使用Santos & Saucedo网站的条款与条件。请在使用我们的服务之前仔细阅读这些条款。",
      ko: "Santos & Saucedo 웹사이트 이용에 관한 이용약관을 검토하세요. 서비스 이용 전 약관을 주의 깊게 읽어주세요.",
      ja: "Santos & Saucedoウェブサイトの利用規約をご確認ください。サービスをご利用の前に必ずお読みください。",
      ar: "راجع الشروط والأحكام لاستخدام موقع Santos & Saucedo. يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا.",
      ru: "Ознакомьтесь с Условиями использования сайта Santos & Saucedo. Пожалуйста, внимательно прочитайте их перед использованием наших услуг.",
      fr: "Consultez les Conditions Générales d'utilisation du site Santos & Saucedo. Veuillez lire attentivement ces conditions.",
      it: "Consulta i Termini e Condizioni per l'utilizzo del sito Santos & Saucedo. Si prega di leggere attentamente questi termini.",
    },
    path: "/terms",
  },
  diversityInclusion: {
    title: {
      en: "Diversity & Inclusion | Santos & Saucedo",
      es: "Diversidad e Inclusión | Santos & Saucedo",
      de: "Vielfalt & Inklusion | Santos & Saucedo",
      zh: "多元与包容 | Santos & Saucedo",
      ko: "다양성 & 포용성 | Santos & Saucedo",
      ja: "ダイバーシティ＆インクルージョン | Santos & Saucedo",
      ar: "التنوع والشمول | Santos & Saucedo",
      ru: "Разнообразие и Инклюзия | Santos & Saucedo",
      fr: "Diversité & Inclusion | Santos & Saucedo",
      it: "Diversità & Inclusione | Santos & Saucedo",
    },
    description: {
      en: "Santos & Saucedo has been committed to diversity and inclusion for more than 35 years. Learn about our initiatives for gender equality, inclusive hiring, and equal opportunities.",
      es: "Santos & Saucedo está comprometido con la diversidad e inclusión desde hace más de 35 años. Conozca nuestras iniciativas de igualdad de género, contratación inclusiva e igualdad de oportunidades.",
      de: "Santos & Saucedo setzt sich seit über 35 Jahren für Vielfalt und Inklusion ein. Erfahren Sie mehr über unsere Initiativen für Geschlechtergleichstellung.",
      zh: "Santos & Saucedo三十五年多来致力于多元化和包容性。了解我们在性别平等、包容性招聘和机会平等方面的举措。",
      ko: "Santos & Saucedo는 35년 넘게 다양성과 포용성에 전념해 왔습니다. 성평등, 포용적 채용, 기회 균등에 대한 이니셔티브를 알아보세요.",
      ja: "Santos & Saucedoは35年以上にわたり、多様性と包摂に取り組んでいます。ジェンダー平等、インクルーシブな採用、機会均等への取り組みをご紹介します。",
      ar: "Santos & Saucedo ملتزمة بالتنوع والشمول منذ أكثر من 35 عامًا. تعرف على مبادراتنا للمساواة بين الجنسين والتوظيف الشامل وتكافؤ الفرص.",
      ru: "Santos & Saucedo привержена принципам разнообразия и инклюзии более 35 лет. Узнайте о наших инициативах по гендерному равенству.",
      fr: "Santos & Saucedo est engagé pour la diversité et l'inclusion depuis plus de 35 ans. Découvrez nos initiatives pour l'égalité des sexes et l'embauche inclusive.",
      it: "Santos & Saucedo è impegnata per la diversità e l'inclusione da oltre 35 anni. Scopri le nostre iniziative per la parità di genere e le pari opportunità.",
    },
    path: "/diversity-inclusion",
  },
  proBono: {
    title: {
      en: "Pro Bono | Santos & Saucedo",
      es: "Pro Bono | Santos & Saucedo",
      de: "Pro Bono | Santos & Saucedo",
      zh: "公益法律服务 | Santos & Saucedo",
      ko: "프로보노 | Santos & Saucedo",
      ja: "プロボノ | Santos & Saucedo",
      ar: "خدمات قانونية مجانية | Santos & Saucedo",
      ru: "Pro Bono | Santos & Saucedo",
      fr: "Pro Bono | Santos & Saucedo",
      it: "Pro Bono | Santos & Saucedo",
    },
    description: {
      en: "Santos & Saucedo has been committed to pro bono legal services for over 35 years. We support NGOs, human rights causes, and access to justice initiatives.",
      es: "Santos & Saucedo está comprometido con servicios legales pro bono por más de 35 años. Apoyamos ONGs, causas de derechos humanos e iniciativas de acceso a la justicia.",
      de: "Santos & Saucedo engagiert sich seit über 35 Jahren für Pro-Bono-Rechtsdienstleistungen. Wir unterstützen NGOs und Menschenrechtsinitiativen.",
      zh: "Santos & Saucedo致力于公益法律服务超过35年。我们支持非政府组织、人权事业和司法公正倡议。",
      ko: "Santos & Saucedo는 35년 이상 프로보노 법률 서비스에 헌신해 왔습니다. NGO, 인권 활동 및 사법 접근성 이니셔티브를 지원합니다.",
      ja: "Santos & Saucedoは35年以上にわたりプロボノ法律サービスに取り組んでいます。NGO、人権、司法アクセスイニシアチブを支援しています。",
      ar: "Santos & Saucedo ملتزمة بتقديم الخدمات القانونية المجانية لأكثر من 35 عامًا. ندعم المنظمات غير الحكومية وقضايا حقوق الإنسان.",
      ru: "Santos & Saucedo более 35 лет оказывает юридические услуги pro bono. Мы поддерживаем НКО, правозащитные инициативы и доступ к правосудию.",
      fr: "Santos & Saucedo s'engage dans les services juridiques pro bono depuis plus de 35 ans. Nous soutenons les ONG et les causes des droits de l'homme.",
      it: "Santos & Saucedo è impegnata nei servizi legali pro bono da oltre 35 anni. Supportiamo ONG, cause per i diritti umani e accesso alla giustizia.",
    },
    path: "/pro-bono",
  },  articles: {
    title: {
      en: "Articles | Santos & Saucedo",
      es: "Artículos | Santos & Saucedo",
      de: "Artikel | Santos & Saucedo",
      zh: "文章 | Santos & Saucedo",
      ko: "아티클 | Santos & Saucedo",
      ja: "記事 | Santos & Saucedo",
      ar: "المقالات | Santos & Saucedo",
      ru: "Статьи | Santos & Saucedo",
      fr: "Articles | Santos & Saucedo",
      it: "Articoli | Santos & Saucedo",
    },
    description: {
      en: "Read legal articles and publications from Santos & Saucedo. Expert insights on Mexican law, regulatory changes, and industry developments.",
      es: "Lea artículos y publicaciones legales de Santos & Saucedo. Insights expertos sobre la ley mexicana, cambios regulatorios y desarrollos de la industria.",
      de: "Lesen Sie juristische Artikel und Publikationen von Santos & Saucedo. Experteneinblicke zu mexikanischem Recht und regulatorischen Änderungen.",
      zh: "阅读Santos & Saucedo的法律文章和出版物。关于墨西哥法律、监管变化和行业发展的专家见解。",
      ko: "Santos & Saucedo의 법률 기사 및 출판물을 읽어보세요. 멕시코 법률, 규제 변경 및 산업 동향에 대한 전문 인사이트.",
      ja: "Santos & Saucedoの法律記事と出版物をご覧ください。メキシコ法、規制変更、業界動向に関する専門的な見解。",
      ar: "اقرأ المقالات والمنشورات القانونية من Santos & Saucedo. رؤى الخبراء حول القانون المكسيكي والتغييرات التنظيمية.",
      ru: "Читайте юридические статьи и публикации Santos & Saucedo. Экспертные материалы о мексиканском праве и регуляторных изменениях.",
      fr: "Lisez les articles et publications juridiques de Santos & Saucedo. Perspectives d'experts sur le droit mexicain et les évolutions réglementaires.",
      it: "Leggi gli articoli e le pubblicazioni legali di Santos & Saucedo. Approfondimenti esperti sul diritto messicano e le evoluzioni normative.",
    },
    path: "/articles",
  },
  newsletter: {
    title: {
      en: "Newsletter | Santos & Saucedo",
      es: "Boletín Informativo | Santos & Saucedo",
      de: "Newsletter | Santos & Saucedo",
      zh: "通讯 | Santos & Saucedo",
      ko: "뉴스레터 | Santos & Saucedo",
      ja: "ニュースレター | Santos & Saucedo",
      ar: "النشرة الإخبارية | Santos & Saucedo",
      ru: "Рассылка | Santos & Saucedo",
      fr: "Newsletter | Santos & Saucedo",
      it: "Newsletter | Santos & Saucedo",
    },
    description: {
      en: "Subscribe to Santos & Saucedo's newsletter for legal updates, industry insights, and firm news. Stay informed about Mexican law and regulatory developments.",
      es: "Suscríbase al boletín de Santos & Saucedo para actualizaciones legales, insights de la industria y noticias de la firma. Manténgase informado sobre la ley mexicana.",
      de: "Abonnieren Sie den Newsletter von Santos & Saucedo für rechtliche Updates, Brancheneinblicke und Kanzleinachrichten.",
      zh: "订阅Santos & Saucedo的通讯，获取法律更新、行业见解和事务所新闻。了解墨西哥法律和监管动态。",
      ko: "Santos & Saucedo 뉴스레터를 구독하여 법률 업데이트, 산업 인사이트 및 회사 뉴스를 받아보세요.",
      ja: "Santos & Saucedoのニュースレターを購読して、法律の最新情報、業界インサイト、事務所ニュースを受け取りましょう。",
      ar: "اشترك في النشرة الإخبارية لـ Santos & Saucedo للحصول على التحديثات القانونية ورؤى الصناعة وأخبار الشركة.",
      ru: "Подпишитесь на рассылку Santos & Saucedo для получения юридических обновлений, отраслевых инсайтов и новостей фирмы.",
      fr: "Abonnez-vous à la newsletter de Santos & Saucedo pour les mises à jour juridiques, les perspectives du secteur et les nouvelles du cabinet.",
      it: "Iscriviti alla newsletter di Santos & Saucedo per aggiornamenti legali, approfondimenti del settore e notizie dello studio.",
    },
    path: "/newsletter",
  },
  events: {
    title: {
      en: "Events | Santos & Saucedo",
      es: "Eventos | Santos & Saucedo",
      de: "Veranstaltungen | Santos & Saucedo",
      zh: "活动 | Santos & Saucedo",
      ko: "이벤트 | Santos & Saucedo",
      ja: "イベント | Santos & Saucedo",
      ar: "الفعاليات | Santos & Saucedo",
      ru: "Мероприятия | Santos & Saucedo",
      fr: "Événements | Santos & Saucedo",
      it: "Eventi | Santos & Saucedo",
    },
    description: {
      en: "Join Santos & Saucedo at conferences, webinars, speaking engagements, and networking events. Stay connected with our firm.",
      es: "Únase a Santos & Saucedo en conferencias, webinars, ponencias y eventos de networking. Manténgase conectado con nuestra firma.",
      de: "Nehmen Sie an Konferenzen, Webinaren, Vorträgen und Networking-Events von Santos & Saucedo teil.",
      zh: "加入Santos & Saucedo的会议、网络研讨会、演讲和社交活动。与我们的劳动法律师事务所保持联系。",
      ko: "Santos & Saucedo의 컨퍼런스, 웨비나, 강연 및 네트워킹 이벤트에 참여하세요. 노동법 전문 로펌과 연결되세요.",
      ja: "Santos & Saucedoのカンファレンス、ウェビナー、講演、ネットワーキングイベントにご参加ください。",
      ar: "انضم إلى Santos & Saucedo في المؤتمرات والندوات عبر الإنترنت والمحاضرات وفعاليات التواصل.",
      ru: "Присоединяйтесь к Santos & Saucedo на конференциях, вебинарах, выступлениях и нетворкинг-мероприятиях.",
      fr: "Rejoignez Santos & Saucedo lors de conférences, webinaires, interventions et événements de networking.",
      it: "Partecipa con Santos & Saucedo a conferenze, webinar, interventi e eventi di networking.",
    },
    path: "/events",
  },
  interns: {
    title: {
      en: "Internship Program | Santos & Saucedo",
      es: "Programa de Pasantes | Santos & Saucedo",
      de: "Praktikumsprogramm | Santos & Saucedo",
      zh: "实习项目 | Santos & Saucedo",
      ko: "인턴십 프로그램 | Santos & Saucedo",
      ja: "インターンシッププログラム | Santos & Saucedo",
      ar: "برنامج التدريب | Santos & Saucedo",
      ru: "Программа Стажировок | Santos & Saucedo",
      fr: "Programme de Stage | Santos & Saucedo",
      it: "Programma Tirocini | Santos & Saucedo",
    },
    description: {
      en: "Launch your legal career with Santos & Saucedo's internship program. Summer and permanent internships available for law students. Gain hands-on experience at a multi-area firm rooted in labor law.",
      es: "Inicia tu carrera legal con el programa de pasantías de Santos & Saucedo. Pasantías de verano y permanentes disponibles para estudiantes de derecho. Obtén experiencia práctica en una firma multi-área con raíz en el derecho laboral.",
      de: "Starten Sie Ihre juristische Karriere mit dem Praktikumsprogramm von Santos & Saucedo. Sommer- und Dauerpraktika für Jurastudenten verfügbar.",
      zh: "通过Santos & Saucedo的实习项目开启您的法律职业生涯。为法学院学生提供暑期和长期实习机会。在一家劳动法律师事务所获得实践经验。",
      ko: "Santos & Saucedo의 인턴십 프로그램으로 법률 커리어를 시작하세요. 법대생을 위한 여름 및 정규 인턴십이 있습니다.",
      ja: "Santos & Saucedoのインターンシッププログラムで法律キャリアをスタートしましょう。法学部生向けのサマーインターンシップと常時採用のインターンシップがあります。",
      ar: "ابدأ مسيرتك القانونية مع برنامج التدريب في Santos & Saucedo. تتوفر فرص تدريب صيفية ودائمة لطلاب القانون.",
      ru: "Начните юридическую карьеру с программы стажировок Santos & Saucedo. Летние и постоянные стажировки для студентов-юристов.",
      fr: "Lancez votre carrière juridique avec le programme de stage de Santos & Saucedo. Stages d'été et permanents disponibles pour les étudiants en droit.",
      it: "Avvia la tua carriera legale con il programma di tirocinio di Santos & Saucedo. Tirocini estivi e permanenti disponibili per studenti di giurisprudenza.",
    },
    path: "/careers/interns",
  },
};

interface SEOHeadProps {
  page: keyof typeof seoConfig;
  language: LanguageCode;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  customPath?: string;
}

export default function SEOHead({
  page,
  language,
  customTitle,
  customDescription,
  customImage,
  customPath,
}: SEOHeadProps) {
  useEffect(() => {
    const config = seoConfig[page];
    if (!config) return;

    const safeSeo: Partial<Record<keyof typeof seoConfig, { title: string; description: string }>> = {
      home: {
        title: language === "es"
          ? "Santos & Saucedo | Abogados para Empresas en San Pedro Garza García"
          : "Santos & Saucedo | Law Firm for Companies in San Pedro Garza García",
        description: language === "es"
          ? "Administración del capital humano y defensa legal para empresas, con raíz en el derecho laboral. Más de 35 años de experiencia y alianza nacional en más de 72 ciudades de México."
          : "Human-capital administration and legal defense for companies, rooted in labor law. More than 35 years of experience and a national alliance across more than 72 Mexican cities.",
      },
      about: {
        title: language === "es" ? "La Firma | Santos & Saucedo" : "The Firm | Santos & Saucedo",
        description: language === "es"
          ? "Santos & Saucedo es una firma legal para empresas —laboral, corporativo, migratorio y litigio— con raíz en el derecho laboral y más de 35 años de experiencia asesorando empresas nacionales y multinacionales."
          : "Santos & Saucedo is a law firm for companies —labor, corporate, immigration and litigation— rooted in labor law, with more than 35 years of experience advising national and multinational companies.",
      },
      practiceGroups: {
        title: language === "es" ? "Áreas de Práctica | Santos & Saucedo" : "Practice Areas | Santos & Saucedo",
        description: language === "es"
          ? "Cuatro áreas de especialidad para empresas, con raíz en el derecho laboral: Laboral y Seguridad Social, Corporativo y Contractual, Migratorio, y Litigio Contencioso."
          : "Four areas of specialty for companies, rooted in labor law: Labor & Social Security, Corporate & Contractual, Immigration, and Contentious Litigation.",
      },
      contact: {
        title: language === "es" ? "Contacto | Santos & Saucedo" : "Contact | Santos & Saucedo",
        description: language === "es"
          ? "Contacte a Santos & Saucedo en Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, Nuevo León."
          : "Contact Santos & Saucedo at Rio Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza Garcia, Nuevo Leon.",
      },
      offices: {
        title: language === "es" ? "Oficina | Santos & Saucedo" : "Office | Santos & Saucedo",
        description: language === "es"
          ? "Oficina de Santos & Saucedo en San Pedro Garza García, Nuevo León."
          : "Santos & Saucedo office in San Pedro Garza Garcia, Nuevo Leon.",
      },
    };

    const title = customTitle || safeSeo[page]?.title || config.title[language];
    const description = customDescription || safeSeo[page]?.description || config.description[language];
    const path = customPath || config.path;
    const image = customImage || DEFAULT_IMAGE;
    const url = `${BASE_URL}${path}`;

    document.title = title;

    const updateOrCreateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const updateOrCreateLink = (rel: string, href: string, attributes?: Record<string, string>) => {
      const extraSelector = attributes 
        ? Object.entries(attributes).map(([k, v]) => `[${k}="${v}"]`).join("")
        : "";
      const selector = `link[rel="${rel}"]${extraSelector}`;
      let link = document.querySelector(selector) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            link!.setAttribute(key, value);
          });
        }
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    updateOrCreateMeta("description", description);

    updateOrCreateMeta("og:title", title, true);
    updateOrCreateMeta("og:description", description, true);
    updateOrCreateMeta("og:url", url, true);
    updateOrCreateMeta("og:image", image, true);
    updateOrCreateMeta("og:type", "website", true);
    updateOrCreateMeta("og:site_name", "Santos & Saucedo", true);
    
    updateOrCreateMeta("og:locale", OG_LOCALE_CODES[language], true);

    const removeExistingOgLocaleAlternates = () => {
      const existingAlternates = document.querySelectorAll('meta[property="og:locale:alternate"]');
      existingAlternates.forEach(el => el.remove());
    };
    removeExistingOgLocaleAlternates();

    SUPPORTED_LANGUAGES.forEach((lang) => {
      if (lang.code !== language) {
        const alternateMeta = document.createElement("meta");
        alternateMeta.setAttribute("property", "og:locale:alternate");
        alternateMeta.setAttribute("content", OG_LOCALE_CODES[lang.code]);
        document.head.appendChild(alternateMeta);
      }
    });

    updateOrCreateMeta("twitter:card", "summary_large_image");
    updateOrCreateMeta("twitter:title", title);
    updateOrCreateMeta("twitter:description", description);
    updateOrCreateMeta("twitter:image", image);

    updateOrCreateLink("canonical", url);

    const removeExistingHreflangLinks = () => {
      const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
      existingLinks.forEach(el => el.remove());
    };
    removeExistingHreflangLinks();

    SUPPORTED_LANGUAGES.forEach((lang) => {
      const hreflangLink = document.createElement("link");
      hreflangLink.setAttribute("rel", "alternate");
      hreflangLink.setAttribute("hreflang", HREFLANG_CODES[lang.code]);
      hreflangLink.setAttribute("href", url);
      document.head.appendChild(hreflangLink);
    });

    const xDefaultLink = document.createElement("link");
    xDefaultLink.setAttribute("rel", "alternate");
    xDefaultLink.setAttribute("hreflang", "x-default");
    xDefaultLink.setAttribute("href", `${BASE_URL}${path}`);
    document.head.appendChild(xDefaultLink);

    return () => {
    };
  }, [page, language, customTitle, customDescription, customImage, customPath]);

  return null;
}

export { seoConfig };
