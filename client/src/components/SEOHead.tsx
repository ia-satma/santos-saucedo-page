import { useEffect } from "react";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/schema";

const BASE_URL = "https://www.santossaucedo.com";
const DEFAULT_IMAGE = "https://santossaucedo.com/images/santossaucedo_2025_.png";

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
      en: "Santos & Saucedo | Labor Law Firm in Mexico",
      es: "Santos & Saucedo | Abogados Especialistas en Derecho Laboral",
      de: "Santos & Saucedo | Führende Anwaltskanzlei in Mexiko",
      zh: "Santos & Saucedo | 墨西哥领先律师事务所",
      ko: "Santos & Saucedo | 멕시코 최고의 로펌",
      ja: "Santos & Saucedo | メキシコの主要法律事務所",
      ar: "Santos & Saucedo | شركة المحاماة الرائدة في المكسيك",
      ru: "Santos & Saucedo | Ведущая юридическая фирма в Мексике",
      fr: "Santos & Saucedo | Cabinet d'Avocats Leader au Mexique",
      it: "Santos & Saucedo | Studio Legale Leader in Messico",
    },
    description: {
      en: "Santos & Saucedo is a labor-law boutique firm in San Pedro Garza García, Nuevo León, with over 35 years of experience advising companies on labor conflicts, compliance, and workplace relations.",
      es: "Santos & Saucedo es una firma especializada en derecho laboral en San Pedro Garza García, Nuevo León, con más de 35 años de experiencia asesorando empresas en conflictos laborales, cumplimiento normativo y relaciones de trabajo.",
      de: "Santos & Saucedo ist eine der renommiertesten Anwaltskanzleien Mexikos mit über 70 Jahren Erfahrung. Wir bieten umfassende Rechtsdienstleistungen im Gesellschaftsrecht, Prozessführung, M&A und mehr.",
      zh: "Santos & Saucedo是墨西哥最负盛名的律师事务所之一，拥有70多年的经验。我们提供公司法、诉讼、并购等全面法律服务。",
      ko: "Santos & Saucedo는 70년 이상의 경험을 가진 멕시코에서 가장 명망 있는 로펌 중 하나입니다. 기업법, 소송, M&A 등 종합 법률 서비스를 제공합니다.",
      ja: "Santos & Saucedoは70年以上の経験を持つメキシコで最も権威ある法律事務所の一つです。会社法、訴訟、M&Aなどの包括的な法律サービスを提供しています。",
      ar: "Santos & Saucedo هي واحدة من أعرق شركات المحاماة في المكسيك بخبرة تزيد عن 70 عامًا. نقدم خدمات قانونية شاملة في قانون الشركات والتقاضي والاندماج والاستحواذ.",
      ru: "Santos & Saucedo — одна из самых престижных юридических фирм Мексики с более чем 70-летним опытом. Мы предоставляем комплексные юридические услуги в области корпоративного права, судебных разбирательств, M&A и многого другого.",
      fr: "Santos & Saucedo est l'un des cabinets d'avocats les plus prestigieux du Mexique avec plus de 70 ans d'expérience. Nous fournissons des services juridiques complets en droit des sociétés, contentieux, M&A et plus encore.",
      it: "Santos & Saucedo è uno degli studi legali più prestigiosi del Messico con oltre 70 anni di esperienza. Forniamo servizi legali completi in diritto societario, contenzioso, M&A e altro.",
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
      en: "Learn about Santos & Saucedo's history, values, and commitment to legal excellence. Founded in 1952, we are one of Mexico's leading law firms with a proven track record.",
      es: "Conozca la historia, valores y compromiso con la excelencia legal de Santos & Saucedo. Fundado en 1952, somos una de las firmas de abogados líderes en México.",
      de: "Erfahren Sie mehr über die Geschichte, Werte und das Engagement für rechtliche Exzellenz von Santos & Saucedo. Gegründet 1952, sind wir eine der führenden Kanzleien Mexikos.",
      zh: "了解Santos & Saucedo的历史、价值观和对法律卓越的承诺。我们成立于1952年，是墨西哥领先的律师事务所之一。",
      ko: "Santos & Saucedo의 역사, 가치 및 법률 우수성에 대한 헌신을 알아보세요. 1952년 설립된 멕시코 최고의 로펌입니다.",
      ja: "Santos & Saucedoの歴史、価値観、法的卓越性への取り組みについてご紹介します。1952年設立、メキシコを代表する法律事務所です。",
      ar: "تعرف على تاريخ Santos & Saucedo وقيمها والتزامها بالتميز القانوني. تأسست عام 1952، نحن من أبرز شركات المحاماة في المكسيك.",
      ru: "Узнайте об истории, ценностях и приверженности Santos & Saucedo юридическому совершенству. Основанная в 1952 году, мы являемся одной из ведущих юридических фирм Мексики.",
      fr: "Découvrez l'histoire, les valeurs et l'engagement de Santos & Saucedo envers l'excellence juridique. Fondé en 1952, nous sommes l'un des principaux cabinets du Mexique.",
      it: "Scopri la storia, i valori e l'impegno di Santos & Saucedo per l'eccellenza legale. Fondato nel 1952, siamo uno dei principali studi legali del Messico.",
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
      en: "Explore our comprehensive practice areas including Corporate Law, M&A, Litigation, Antitrust, Banking & Finance, and more. Expert legal services tailored to your needs.",
      es: "Explore nuestras áreas de práctica integrales incluyendo Derecho Corporativo, M&A, Litigio, Competencia Económica, Banca y Finanzas, y más. Servicios legales especializados.",
      de: "Entdecken Sie unsere umfassenden Praxisbereiche: Gesellschaftsrecht, M&A, Prozessführung, Kartellrecht, Banken & Finanzen und mehr. Maßgeschneiderte Rechtsdienstleistungen.",
      zh: "探索我们全面的业务领域，包括公司法、并购、诉讼、反垄断、银行与金融等。量身定制的专业法律服务。",
      ko: "기업법, M&A, 소송, 독점금지, 금융 등 종합 업무 분야를 살펴보세요. 맞춤형 전문 법률 서비스를 제공합니다.",
      ja: "会社法、M&A、訴訟、独占禁止法、銀行・金融など、包括的な業務分野をご覧ください。ニーズに合わせた専門的な法律サービス。",
      ar: "استكشف مجالات ممارستنا الشاملة بما في ذلك قانون الشركات والاندماج والاستحواذ والتقاضي ومكافحة الاحتكار والخدمات المصرفية والمالية والمزيد.",
      ru: "Изучите наши комплексные области практики: корпоративное право, M&A, судебные споры, антимонопольное право, банковское дело и финансы и многое другое.",
      fr: "Explorez nos domaines de pratique complets: droit des sociétés, M&A, contentieux, droit de la concurrence, banque et finance, et plus encore.",
      it: "Esplora le nostre aree di pratica complete: diritto societario, M&A, contenzioso, antitrust, banche e finanza e altro ancora. Servizi legali su misura.",
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
      en: "Specialized legal expertise across key industry sectors including Energy, Real Estate, Technology, Financial Services, and more. Industry-focused solutions for your business.",
      es: "Experiencia legal especializada en sectores industriales clave incluyendo Energía, Bienes Raíces, Tecnología, Servicios Financieros, y más. Soluciones enfocadas en su industria.",
      de: "Spezialisierte Rechtsexpertise in Schlüsselbranchen: Energie, Immobilien, Technologie, Finanzdienstleistungen und mehr. Branchenspezifische Lösungen.",
      zh: "在能源、房地产、科技、金融服务等关键行业领域提供专业法律服务。行业导向的商业解决方案。",
      ko: "에너지, 부동산, 기술, 금융 서비스 등 주요 산업 분야에 대한 전문 법률 서비스. 산업 맞춤형 비즈니스 솔루션.",
      ja: "エネルギー、不動産、テクノロジー、金融サービスなど主要業界における専門的な法律サービス。業界に特化したソリューション。",
      ar: "خبرة قانونية متخصصة في القطاعات الصناعية الرئيسية بما في ذلك الطاقة والعقارات والتكنولوجيا والخدمات المالية والمزيد.",
      ru: "Специализированная юридическая экспертиза в ключевых отраслях: энергетика, недвижимость, технологии, финансовые услуги и другие. Отраслевые решения для вашего бизнеса.",
      fr: "Expertise juridique spécialisée dans les secteurs clés: énergie, immobilier, technologie, services financiers et plus. Solutions adaptées à votre industrie.",
      it: "Competenza legale specializzata nei settori industriali chiave: energia, immobiliare, tecnologia, servizi finanziari e altro. Soluzioni mirate per il tuo business.",
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
      zh: "联系Santos & Saucedo。访问我们在墨西哥城的办公室或联系我们的团队进行法律咨询。",
      ko: "Santos & Saucedo에 연락하세요. 멕시코시티 사무실을 방문하거나 법률 상담을 위해 저희 팀에 연락하세요.",
      ja: "Santos & Saucedoにお問い合わせください。メキシコシティのオフィスをご訪問いただくか、法的相談についてチームにご連絡ください。",
      ar: "تواصل مع Santos & Saucedo. قم بزيارة مكاتبنا في مكسيكو سيتي أو اتصل بفريقنا للاستشارات القانونية.",
      ru: "Свяжитесь с Santos & Saucedo. Посетите наши офисы в Мехико или обратитесь к нашей команде за юридической консультацией.",
      fr: "Contactez Santos & Saucedo. Visitez nos bureaux à Mexico ou contactez notre équipe pour des consultations juridiques.",
      it: "Contatta Santos & Saucedo. Visita i nostri uffici a Città del Messico o contatta il nostro team per consulenze legali.",
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
      en: "Join one of Mexico's leading law firms. Explore career opportunities, internship programs, and professional development at Santos & Saucedo.",
      es: "Únase a una de las firmas de abogados líderes de México. Explore oportunidades de carrera, programas de pasantías y desarrollo profesional en Santos & Saucedo.",
      de: "Werden Sie Teil einer der führenden Kanzleien Mexikos. Entdecken Sie Karrieremöglichkeiten und Praktikumsprogramme bei Santos & Saucedo.",
      zh: "加入墨西哥领先的律师事务所之一。探索Santos & Saucedo的职业机会、实习项目和专业发展。",
      ko: "멕시코 최고의 로펌에 합류하세요. Santos & Saucedo의 채용 기회, 인턴십 프로그램 및 전문 개발을 살펴보세요.",
      ja: "メキシコを代表する法律事務所に参加しませんか。Santos & Saucedoでのキャリア機会、インターンシッププログラム、専門的成長を探索してください。",
      ar: "انضم إلى واحدة من شركات المحاماة الرائدة في المكسيك. استكشف فرص العمل وبرامج التدريب والتطوير المهني في Santos & Saucedo.",
      ru: "Присоединяйтесь к одной из ведущих юридических фирм Мексики. Изучите карьерные возможности, стажировки и профессиональное развитие в Santos & Saucedo.",
      fr: "Rejoignez l'un des principaux cabinets d'avocats du Mexique. Explorez les opportunités de carrière et les programmes de stage chez Santos & Saucedo.",
      it: "Unisciti a uno dei principali studi legali del Messico. Esplora le opportunità di carriera, i programmi di tirocinio e lo sviluppo professionale presso Santos & Saucedo.",
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
      en: "Santos & Saucedo is consistently ranked among Mexico's top law firms by Chambers, Legal 500, Latin Lawyer 250, and other prestigious legal directories.",
      es: "Santos & Saucedo es consistentemente clasificada entre las principales firmas de México por Chambers, Legal 500, Latin Lawyer 250 y otros directorios legales.",
      de: "Santos & Saucedo wird von Chambers, Legal 500, Latin Lawyer 250 und anderen renommierten Verzeichnissen unter Mexikos Top-Kanzleien geführt.",
      zh: "Santos & Saucedo被Chambers、Legal 500、Latin Lawyer 250等权威法律目录持续评为墨西哥顶级律所。",
      ko: "Santos & Saucedo는 Chambers, Legal 500, Latin Lawyer 250 등 권위 있는 법률 디렉토리에서 멕시코 최고의 로펌으로 지속적으로 선정되고 있습니다.",
      ja: "Santos & Saucedoは、Chambers、Legal 500、Latin Lawyer 250などの権威ある法律ディレクトリでメキシコのトップファームとして評価されています。",
      ar: "يتم تصنيف Santos & Saucedo باستمرار من بين أفضل شركات المحاماة في المكسيك من قبل Chambers و Legal 500 و Latin Lawyer 250.",
      ru: "Santos & Saucedo стабильно входит в число лучших юридических фирм Мексики по версии Chambers, Legal 500, Latin Lawyer 250.",
      fr: "Santos & Saucedo est régulièrement classé parmi les meilleurs cabinets du Mexique par Chambers, Legal 500, Latin Lawyer 250.",
      it: "Santos & Saucedo è costantemente classificato tra i migliori studi legali del Messico da Chambers, Legal 500, Latin Lawyer 250.",
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
      en: "Explore our track record of landmark transactions, complex disputes, and strategic advisory matters. Representative experience across all practice areas.",
      es: "Explore nuestra trayectoria de transacciones históricas, disputas complejas y asuntos de asesoría estratégica. Experiencia representativa en todas las áreas de práctica.",
      de: "Entdecken Sie unsere Erfolgsbilanz bei wegweisenden Transaktionen, komplexen Streitigkeiten und strategischer Beratung.",
      zh: "探索我们在标志性交易、复杂争议和战略咨询方面的业绩记录。涵盖所有业务领域的代表性经验。",
      ko: "획기적인 거래, 복잡한 분쟁 및 전략적 자문 사례에 대한 당사의 실적을 살펴보세요.",
      ja: "画期的な取引、複雑な紛争、戦略的アドバイザリー案件における実績をご覧ください。",
      ar: "استكشف سجلنا الحافل بالمعاملات التاريخية والنزاعات المعقدة والمسائل الاستشارية الاستراتيجية.",
      ru: "Ознакомьтесь с нашим опытом знаковых сделок, сложных споров и стратегического консультирования.",
      fr: "Explorez notre bilan de transactions majeures, litiges complexes et conseils stratégiques.",
      it: "Esplora il nostro track record di transazioni storiche, controversie complesse e consulenza strategica.",
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
      zh: "访问位于墨西哥城波朗科区Río Tamazunchale 205 Norte的Santos & Saucedo。配备一流设施的现代化办公环境。",
      ko: "멕시코시티 폴랑코의 Río Tamazunchale 205 Norte에 위치한 Santos & Saucedo를 방문하세요. 최신 시설을 갖춘 현대적인 사무실.",
      ja: "メキシコシティ・ポランコのRío Tamazunchale 205 Norteにあるオフィスをご訪問ください。最新設備を備えた近代的な施設。",
      ar: "قم بزيارة Santos & Saucedo في Río Tamazunchale 205 Norte في San Pedro Garza García، مكسيكو سيتي. مرافق حديثة مع وسائل راحة متطورة.",
      ru: "Посетите Santos & Saucedo в Río Tamazunchale 205 Norte в San Pedro Garza García, Мехико. Современные помещения с первоклассным оснащением.",
      fr: "Visitez Santos & Saucedo à Río Tamazunchale 205 Norte à Nuevo León, Mexico. Installations modernes avec des équipements de pointe.",
      it: "Visita Santos & Saucedo presso Río Tamazunchale 205 Norte a Nuevo León, Città del Messico. Strutture moderne con servizi all'avanguardia.",
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
      en: "Santos & Saucedo is committed to diversity and inclusion since 1986. Learn about our initiatives for gender equality, inclusive hiring, and equal opportunities.",
      es: "Santos & Saucedo está comprometido con la diversidad e inclusión desde 1986. Conozca nuestras iniciativas de igualdad de género, contratación inclusiva e igualdad de oportunidades.",
      de: "Santos & Saucedo setzt sich seit 1986 für Vielfalt und Inklusion ein. Erfahren Sie mehr über unsere Initiativen für Geschlechtergleichstellung.",
      zh: "Santos & Saucedo自1986年以来致力于多元化和包容性。了解我们在性别平等、包容性招聘和机会平等方面的举措。",
      ko: "Santos & Saucedo는 1986년부터 다양성과 포용성에 전념하고 있습니다. 성평등, 포용적 채용, 기회 균등에 대한 이니셔티브를 알아보세요.",
      ja: "Santos & Saucedoは1986年以来、多様性と包摂に取り組んでいます。ジェンダー平等、インクルーシブな採用、機会均等への取り組みをご紹介します。",
      ar: "Santos & Saucedo ملتزمة بالتنوع والشمول منذ عام 1986. تعرف على مبادراتنا للمساواة بين الجنسين والتوظيف الشامل وتكافؤ الفرص.",
      ru: "Santos & Saucedo привержена принципам разнообразия и инклюзии с 1986 года. Узнайте о наших инициативах по гендерному равенству.",
      fr: "Santos & Saucedo est engagé pour la diversité et l'inclusion depuis 1986. Découvrez nos initiatives pour l'égalité des sexes et l'embauche inclusive.",
      it: "Santos & Saucedo è impegnata per la diversità e l'inclusione dal 1986. Scopri le nostre iniziative per la parità di genere e le pari opportunità.",
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
  },
  germanDesk: {
    title: {
      en: "German Desk | Santos & Saucedo",
      es: "German Desk | Santos & Saucedo",
      de: "German Desk | Santos & Saucedo",
      zh: "德国服务台 | Santos & Saucedo",
      ko: "German Desk | Santos & Saucedo",
      ja: "ジャーマンデスク | Santos & Saucedo",
      ar: "المكتب الألماني | Santos & Saucedo",
      ru: "German Desk | Santos & Saucedo",
      fr: "German Desk | Santos & Saucedo",
      it: "German Desk | Santos & Saucedo",
    },
    description: {
      en: "Over 34 years serving German and Austrian companies in Mexico. Our German Desk provides specialized legal services with attorneys educated in Germany and Austria.",
      es: "Más de 34 años sirviendo a empresas alemanas y austriacas en México. Nuestro German Desk ofrece servicios legales especializados con abogados educados en Alemania y Austria.",
      de: "Seit über 34 Jahren betreuen wir deutsche und österreichische Unternehmen in Mexiko. Unser German Desk bietet spezialisierte Rechtsdienstleistungen mit in Deutschland und Österreich ausgebildeten Anwälten.",
      zh: "为在墨西哥的德国和奥地利公司服务超过34年。我们的德国服务台提供由德国和奥地利培训的律师提供的专业法律服务。",
      ko: "34년 이상 멕시코에서 독일 및 오스트리아 기업에 서비스를 제공하고 있습니다. German Desk는 독일과 오스트리아에서 교육받은 변호사들이 전문 법률 서비스를 제공합니다.",
      ja: "メキシコでドイツ・オーストリア企業に34年以上のサービスを提供。ジャーマンデスクでは、ドイツ・オーストリアで教育を受けた弁護士が専門的な法律サービスを提供します。",
      ar: "أكثر من 34 عامًا في خدمة الشركات الألمانية والنمساوية في المكسيك. يقدم المكتب الألماني خدمات قانونية متخصصة مع محامين متعلمين في ألمانيا والنمسا.",
      ru: "Более 34 лет обслуживаем немецкие и австрийские компании в Мексике. Наш German Desk предоставляет специализированные юридические услуги с юристами, получившими образование в Германии и Австрии.",
      fr: "Plus de 34 ans au service des entreprises allemandes et autrichiennes au Mexique. Notre German Desk offre des services juridiques spécialisés avec des avocats formés en Allemagne et en Autriche.",
      it: "Oltre 34 anni al servizio di aziende tedesche e austriache in Messico. Il nostro German Desk offre servizi legali specializzati con avvocati formati in Germania e Austria.",
    },
    path: "/german-desk",
  },
  articles: {
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
      en: "Join Santos & Saucedo at conferences, webinars, speaking engagements, and networking events. Stay connected with Mexico's leading law firm.",
      es: "Únase a Santos & Saucedo en conferencias, webinars, ponencias y eventos de networking. Manténgase conectado con la firma de abogados líder de México.",
      de: "Nehmen Sie an Konferenzen, Webinaren, Vorträgen und Networking-Events von Santos & Saucedo teil.",
      zh: "加入Santos & Saucedo的会议、网络研讨会、演讲和社交活动。与墨西哥领先的律师事务所保持联系。",
      ko: "Santos & Saucedo의 컨퍼런스, 웨비나, 강연 및 네트워킹 이벤트에 참여하세요. 멕시코 최고의 로펌과 연결되세요.",
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
      en: "Launch your legal career with Santos & Saucedo's internship program. Summer and permanent internships available for law students. Gain hands-on experience at one of Mexico's leading law firms.",
      es: "Inicia tu carrera legal con el programa de pasantías de Santos & Saucedo. Pasantías de verano y permanentes disponibles para estudiantes de derecho. Obtén experiencia práctica en una de las firmas líderes de México.",
      de: "Starten Sie Ihre juristische Karriere mit dem Praktikumsprogramm von Santos & Saucedo. Sommer- und Dauerpraktika für Jurastudenten verfügbar.",
      zh: "通过Santos & Saucedo的实习项目开启您的法律职业生涯。为法学院学生提供暑期和长期实习机会。在墨西哥领先的律所获得实践经验。",
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

    const title = customTitle || config.title[language];
    const description = customDescription || config.description[language];
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
