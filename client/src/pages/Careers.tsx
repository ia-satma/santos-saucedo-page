import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow, NumberedCard } from "@/components/editorial";

// "Clásica": titulares en romana 400, Azul Marino, caja de oración y al inicio;
// entradillas en romana 400 Gris Tinta; texto en sans 400 Gris Tinta.
const h2Class = "font-heading font-normal text-ss-marino text-[clamp(28px,2.6vw,38px)] leading-[1.12] tracking-[-0.012em] [text-wrap:balance]";
const h3Class = "font-heading font-normal text-ss-marino text-[22px] leading-[1.25] tracking-[-0.01em]";
const leadClass = "font-serif font-normal text-ss-tinta text-[clamp(19px,0.6vw_+_14px,22px)] leading-[1.55] tracking-[-0.003em] [text-wrap:pretty]";

export default function Careers() {
  const { language } = useLanguage();

  const content = {
    en: {
      heroTitle: "Build Your Career With Us",
      heroSubtitle: "At Santos & Saucedo, interns and associates work on real matters from the start, alongside the partners: on-site audits, reviews of collective bargaining agreements, conciliation hearings and trials.",
      whyJoinTitle: "Why Join Santos & Saucedo",
      whyJoinSubtitle: "We look for students and lawyers interested in employer-side labor law, and administrative staff who want to grow in a partner-led firm. We value rigor, discretion and an interest in understanding how a business works from the inside.",
      cultureTitle: "Our Culture",
      cultureText: "At Santos & Saucedo, we foster a collaborative and inclusive environment where every team member can thrive. With more than 35 years of experience, we combine tradition with innovation to deliver exceptional legal services. Our culture emphasizes teamwork, mutual respect, and a commitment to the highest ethical standards.",
      valuesTitle: "Our Core Values",
      values: [
        { title: "Excellence", text: "We strive for the highest quality in everything we do" },
        { title: "Integrity", text: "Ethical conduct guides all our professional relationships" },
        { title: "Collaboration", text: "We work together as a unified team to achieve success" },
        { title: "Innovation", text: "We embrace new ideas and approaches to solve challenges" },
      ],
      environmentTitle: "Work Environment",
      environmentText: "Our modern offices in Río Tamazunchale 205 Norte offer a dynamic and inspiring workspace. We believe in work-life balance and provide flexible arrangements to support our team members' well-being. Join a firm where your voice matters and your contributions are recognized.",
      benefitsTitle: "Benefits & Perks",
      benefitsSubtitle: "We take care of our team",
      benefits: [
        { title: "Competitive Compensation", text: "Market-leading salaries and performance bonuses" },
        { title: "Professional Development", text: "Continuous learning opportunities and career advancement" },
        { title: "Work-Life Balance", text: "Flexible schedules and hybrid work options" },
        { title: "Health Benefits", text: "Comprehensive medical, dental, and vision coverage" },
        { title: "Training Programs", text: "In-house training and external certification support" },
        { title: "Mentorship", text: "Guidance from experienced partners and senior attorneys" },
      ],
      positionsTitle: "Open Positions",
      positionsSubtitle: "Explore current opportunities at our firm",
      positions: [
        {
          title: "Associate Attorney",
          department: "Labor Law",
          location: "San Pedro Garza García",
          type: "Full-time",
          description: "We are seeking talented attorneys with 2–5 years of experience in labor litigation and employment counseling, including individual and collective labor relations, to join our growing team.",
        },
        {
          title: "Legal Intern",
          department: "Labor Law",
          location: "San Pedro Garza García",
          type: "Internship",
          description: "Join our internship program and work on real matters from the start, alongside the partners.",
        },
        {
          title: "Paralegal",
          department: "Litigation",
          location: "San Pedro Garza García",
          type: "Full-time",
          description: "Support our litigation team with legal research, document preparation, and case management in a fast-paced environment.",
        },
      ],
      internshipTitle: "Internship Program",
      internshipSubtitle: "Launch your legal career with us",
      internshipOverviewTitle: "Program Overview",
      internshipOverviewText: "Our internship program is designed to provide law students with comprehensive, hands-on experience in a specialized labor-law firm. Interns work directly with partners and senior associates on real cases and transactions, gaining invaluable practical knowledge.",
      internshipDurationTitle: "Duration & Requirements",
      internshipDuration: [
        "Program duration: 6–12 months",
        "Law students in their final years or recent graduates",
        "Strong academic record from accredited law schools",
        "Excellent written and verbal communication skills",
        "Proficiency in Spanish and English preferred",
      ],
      internshipLearningTitle: "What You'll Learn",
      internshipLearning: [
        "Legal research and analysis techniques",
        "Document drafting and review",
        "Client communication and relationship management",
        "Courtroom and arbitration procedures",
        "Labor audits and regulatory compliance",
        "Professional ethics and best practices",
      ],
      applyTitle: "How to Apply",
      applyInstructions: "To apply for any position or our internship program, please send your CV, cover letter, and academic transcripts to:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Please include the position title in your email subject line. We review all applications carefully and will contact qualified candidates for interviews.",
      contactCardTitle: "Careers Contact",
      sendApplication: "Send Application",
    },
    es: {
      heroTitle: "Construye tu carrera con nosotros",
      heroSubtitle: "En Santos & Saucedo, los pasantes y asociados trabajan desde el principio en asuntos reales, junto a los socios: auditorías en planta, revisiones de contratos colectivos, audiencias de conciliación y juicios.",
      whyJoinTitle: "Por qué trabajar en Santos & Saucedo",
      whyJoinSubtitle: "Buscamos estudiantes y abogados interesados en el derecho laboral de empresa, y personal administrativo que quiera crecer en una firma de socios. Valoramos el rigor, la discreción y el interés por entender cómo funciona una empresa por dentro.",
      cultureTitle: "Nuestra cultura",
      cultureText: "En Santos & Saucedo, fomentamos un ambiente colaborativo e inclusivo donde cada miembro del equipo puede prosperar. Con más de 35 años de experiencia, combinamos tradición con innovación para brindar servicios legales excepcionales. Nuestra cultura enfatiza el trabajo en equipo, el respeto mutuo y el compromiso con los más altos estándares éticos.",
      valuesTitle: "Nuestros valores fundamentales",
      values: [
        { title: "Excelencia", text: "Nos esforzamos por la más alta calidad en todo lo que hacemos" },
        { title: "Integridad", text: "La conducta ética guía todas nuestras relaciones profesionales" },
        { title: "Colaboración", text: "Trabajamos juntos como un equipo unificado para lograr el éxito" },
        { title: "Innovación", text: "Adoptamos nuevas ideas y enfoques para resolver desafíos" },
      ],
      environmentTitle: "Ambiente de trabajo",
      environmentText: "Nuestras oficinas modernas en Río Tamazunchale 205 Norte ofrecen un espacio de trabajo dinámico e inspirador. Creemos en el equilibrio entre vida y trabajo y proporcionamos arreglos flexibles para apoyar el bienestar de nuestro equipo. Únete a una firma donde tu voz importa y tus contribuciones son reconocidas.",
      benefitsTitle: "Beneficios y prestaciones",
      benefitsSubtitle: "Cuidamos de nuestro equipo",
      benefits: [
        { title: "Compensación competitiva", text: "Salarios líderes en el mercado y bonos por desempeño" },
        { title: "Desarrollo profesional", text: "Oportunidades continuas de aprendizaje y avance profesional" },
        { title: "Balance vida-trabajo", text: "Horarios flexibles y opciones de trabajo híbrido" },
        { title: "Beneficios de salud", text: "Cobertura médica, dental y de visión completa" },
        { title: "Programas de capacitación", text: "Capacitación interna y apoyo para certificaciones externas" },
        { title: "Mentoría", text: "Guía de socios experimentados y abogados senior" },
      ],
      positionsTitle: "Posiciones abiertas",
      positionsSubtitle: "Explora las oportunidades actuales en nuestra firma",
      positions: [
        {
          title: "Abogado asociado",
          department: "Derecho laboral",
          location: "San Pedro Garza García",
          type: "Tiempo completo",
          description: "Buscamos abogados talentosos con 2–5 años de experiencia en litigio laboral y consultoría laboral, incluyendo relaciones individuales y colectivas, para unirse a nuestro equipo.",
        },
        {
          title: "Pasante de derecho",
          department: "Derecho laboral",
          location: "San Pedro Garza García",
          type: "Pasantía",
          description: "Únete a nuestro programa de pasantías y trabaja desde el principio en asuntos reales, junto a los socios.",
        },
        {
          title: "Paralegal",
          department: "Litigio",
          location: "San Pedro Garza García",
          type: "Tiempo completo",
          description: "Apoya a nuestro equipo de litigio con investigación legal, preparación de documentos y gestión de casos en un ambiente dinámico.",
        },
      ],
      internshipTitle: "Programa de pasantías",
      internshipSubtitle: "Inicia tu carrera legal con nosotros",
      internshipOverviewTitle: "Descripción del programa",
      internshipOverviewText: "Nuestro programa de pasantías está diseñado para proporcionar a los estudiantes de derecho una experiencia práctica integral en una firma especializada en derecho laboral. Los pasantes trabajan directamente con socios y asociados senior en casos y transacciones reales, obteniendo un conocimiento práctico invaluable.",
      internshipDurationTitle: "Duración y requisitos",
      internshipDuration: [
        "Duración del programa: 6–12 meses",
        "Estudiantes de derecho en sus últimos años o recién graduados",
        "Excelente expediente académico de escuelas de derecho acreditadas",
        "Excelentes habilidades de comunicación escrita y verbal",
        "Dominio del español e inglés preferido",
      ],
      internshipLearningTitle: "Lo que aprenderás",
      internshipLearning: [
        "Técnicas de investigación y análisis legal",
        "Redacción y revisión de documentos",
        "Comunicación con clientes y gestión de relaciones",
        "Procedimientos judiciales y de arbitraje",
        "Auditorías laborales y cumplimiento normativo",
        "Ética profesional y mejores prácticas",
      ],
      applyTitle: "Cómo postularse",
      applyInstructions: "Para postularte a cualquier posición o a nuestro programa de pasantías, envía tu CV, carta de presentación y expediente académico a:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Incluye el nombre del puesto en el asunto del correo. Revisamos todas las solicitudes y contactamos a los candidatos seleccionados para una entrevista.",
      contactCardTitle: "Contacto de carreras",
      sendApplication: "Enviar solicitud",
    },
    de: {
      heroTitle: "Gestalten Sie Ihre Karriere bei uns",
      heroSubtitle: "Bei Santos & Saucedo arbeiten Praktikanten und Associates von Anfang an an echten Mandaten, an der Seite der Partner: Audits vor Ort, Prüfung von Tarifverträgen, Schlichtungsverhandlungen und Gerichtsverfahren.",
      whyJoinTitle: "Warum bei uns arbeiten?",
      whyJoinSubtitle: "Wir suchen Studierende und Juristen mit Interesse am Arbeitsrecht auf Unternehmensseite sowie Verwaltungspersonal, das sich in einer partnergeführten Kanzlei weiterentwickeln möchte. Wir schätzen Sorgfalt, Diskretion und das Interesse daran, wie ein Unternehmen von innen funktioniert.",
      cultureTitle: "Unsere Kultur",
      cultureText: "Bei Santos & Saucedo fördern wir ein kollaboratives und inklusives Umfeld, in dem jedes Teammitglied gedeihen kann. Mit mehr als 35 Jahren Erfahrung verbinden wir Tradition mit Innovation, um außergewöhnliche Rechtsdienstleistungen zu erbringen. Unsere Kultur betont Teamarbeit, gegenseitigen Respekt und das Engagement für höchste ethische Standards.",
      valuesTitle: "Unsere Grundwerte",
      values: [
        { title: "Exzellenz", text: "Wir streben nach höchster Qualität in allem, was wir tun" },
        { title: "Integrität", text: "Ethisches Verhalten leitet alle unsere beruflichen Beziehungen" },
        { title: "Zusammenarbeit", text: "Wir arbeiten als vereintes Team zusammen, um Erfolg zu erzielen" },
        { title: "Innovation", text: "Wir begrüßen neue Ideen und Ansätze zur Lösung von Herausforderungen" },
      ],
      environmentTitle: "Arbeitsumgebung",
      environmentText: "Unsere modernen Büros im Río Tamazunchale 205 Norte bieten einen dynamischen und inspirierenden Arbeitsplatz. Wir glauben an Work-Life-Balance und bieten flexible Regelungen zur Unterstützung des Wohlbefindens unserer Teammitglieder. Treten Sie einer Kanzlei bei, in der Ihre Stimme zählt und Ihre Beiträge anerkannt werden.",
      benefitsTitle: "Vorteile",
      benefitsSubtitle: "Wir kümmern uns um unser Team",
      benefits: [
        { title: "Wettbewerbsfähige Vergütung", text: "Marktführende Gehälter und Leistungsprämien" },
        { title: "Berufliche Entwicklung", text: "Kontinuierliche Lernmöglichkeiten und Karriereförderung" },
        { title: "Work-Life-Balance", text: "Flexible Arbeitszeiten und hybride Arbeitsoptionen" },
        { title: "Gesundheitsleistungen", text: "Umfassende medizinische, zahnärztliche und Augenversorgung" },
        { title: "Schulungsprogramme", text: "Interne Schulungen und Unterstützung für externe Zertifizierungen" },
        { title: "Mentoring", text: "Begleitung durch erfahrene Partner und Senior-Anwälte" },
      ],
      positionsTitle: "Offene Stellen",
      positionsSubtitle: "Erkunden Sie aktuelle Möglichkeiten in unserer Kanzlei",
      positions: [
        {
          title: "Rechtsanwalt (Associate)",
          department: "Arbeitsrecht",
          location: "San Pedro Garza García",
          type: "Vollzeit",
          description: "Wir suchen talentierte Anwälte mit 2–5 Jahren Erfahrung in der arbeitsrechtlichen Prozessführung und Beratung, einschließlich individueller und kollektiver Arbeitsbeziehungen, für unser wachsendes Team.",
        },
        {
          title: "Rechtspraktikant/in",
          department: "Arbeitsrecht",
          location: "San Pedro Garza García",
          type: "Praktikum",
          description: "Nehmen Sie an unserem Praktikumsprogramm teil und arbeiten Sie von Anfang an an echten Mandaten, an der Seite der Partner.",
        },
        {
          title: "Paralegal",
          department: "Prozessführung",
          location: "San Pedro Garza García",
          type: "Vollzeit",
          description: "Unterstützen Sie unser Prozessteam bei Rechtsrecherchen, Dokumentenvorbereitung und Fallmanagement in einem dynamischen Umfeld.",
        },
      ],
      internshipTitle: "Praktikumsprogramm",
      internshipSubtitle: "Starten Sie Ihre juristische Karriere bei uns",
      internshipOverviewTitle: "Programmübersicht",
      internshipOverviewText: "Unser Praktikumsprogramm bietet Jurastudenten umfassende praktische Erfahrungen in einer auf Arbeitsrecht spezialisierten Kanzlei. Praktikanten arbeiten direkt mit Partnern und Senior Associates an echten Fällen und Transaktionen und gewinnen unschätzbare praktische Kenntnisse.",
      internshipDurationTitle: "Dauer & Anforderungen",
      internshipDuration: [
        "Programmdauer: 6–12 Monate",
        "Jurastudenten in den letzten Studienjahren oder Absolventen",
        "Ausgezeichnete akademische Leistungen von akkreditierten Rechtsfakultäten",
        "Hervorragende schriftliche und mündliche Kommunikationsfähigkeiten",
        "Spanisch- und Englischkenntnisse bevorzugt",
      ],
      internshipLearningTitle: "Was Sie lernen werden",
      internshipLearning: [
        "Rechtsrecherche- und Analysetechniken",
        "Dokumentenerstellung und -prüfung",
        "Kundenkommunikation und Beziehungsmanagement",
        "Gerichts- und Schiedsverfahren",
        "Arbeitsrechtliche Audits und Compliance",
        "Berufsethik und Best Practices",
      ],
      applyTitle: "So bewerben Sie sich",
      applyInstructions: "Um sich für eine Position oder unser Praktikumsprogramm zu bewerben, senden Sie bitte Ihren Lebenslauf, Ihr Anschreiben und Ihre akademischen Zeugnisse an:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Bitte geben Sie den Stellentitel in der Betreffzeile Ihrer E-Mail an. Wir prüfen alle Bewerbungen sorgfältig und kontaktieren qualifizierte Kandidaten für Vorstellungsgespräche.",
      contactCardTitle: "Karriere-Kontakt",
      sendApplication: "Bewerbung senden",
    },
    zh: {
      heroTitle: "与我们共创事业",
      heroSubtitle: "在 Santos & Saucedo，实习生和律师从一开始就与合伙人一起处理真实案件：现场审计、集体合同审查、调解听证和诉讼。",
      whyJoinTitle: "为什么加入我们？",
      whyJoinSubtitle: "我们寻找对企业方劳动法感兴趣的学生和律师，以及希望在合伙制律所中成长的行政人员。我们看重严谨、审慎，以及深入了解企业内部运作的兴趣。",
      cultureTitle: "我们的文化",
      cultureText: "在Santos & Saucedo，我们营造一个协作和包容的环境，让每位团队成员都能茁壮成长。凭借超过35年的专业经验，我们将传统与创新相结合，提供卓越的法律服务。我们的文化强调团队合作、相互尊重和对最高道德标准的承诺。",
      valuesTitle: "我们的核心价值观",
      values: [
        { title: "卓越", text: "我们在所做的一切中追求最高质量" },
        { title: "诚信", text: "道德行为指导我们所有的职业关系" },
        { title: "协作", text: "我们作为一个统一的团队共同努力取得成功" },
        { title: "创新", text: "我们拥抱新思想和新方法来解决挑战" },
      ],
      environmentTitle: "工作环境",
      environmentText: "我们位于Río Tamazunchale 205 Norte的现代化办公室提供充满活力和灵感的工作空间。我们相信工作与生活的平衡，并提供灵活的安排来支持团队成员的福祉。加入一家您的声音很重要、您的贡献得到认可的公司。",
      benefitsTitle: "福利待遇",
      benefitsSubtitle: "我们关心我们的团队",
      benefits: [
        { title: "有竞争力的薪酬", text: "市场领先的薪资和绩效奖金" },
        { title: "职业发展", text: "持续的学习机会和职业晋升" },
        { title: "工作生活平衡", text: "灵活的工作时间和混合工作选择" },
        { title: "健康福利", text: "全面的医疗、牙科和视力保险" },
        { title: "培训项目", text: "内部培训和外部认证支持" },
        { title: "导师制", text: "经验丰富的合伙人和高级律师的指导" },
      ],
      positionsTitle: "开放职位",
      positionsSubtitle: "探索我们公司目前的机会",
      positions: [
        {
          title: "律师",
          department: "劳动法",
          location: "San Pedro Garza García",
          type: "全职",
          description: "我们正在寻找在劳动诉讼和劳动法咨询方面（包括个人和集体劳动关系）拥有2–5年经验的优秀律师加入我们不断壮大的团队。",
        },
        {
          title: "法律实习生",
          department: "劳动法",
          location: "San Pedro Garza García",
          type: "实习",
          description: "加入我们的实习项目，从一开始就与合伙人一起处理真实案件。",
        },
        {
          title: "律师助理",
          department: "诉讼",
          location: "San Pedro Garza García",
          type: "全职",
          description: "在快节奏的环境中支持我们的诉讼团队进行法律研究、文件准备和案件管理。",
        },
      ],
      internshipTitle: "实习项目",
      internshipSubtitle: "与我们一起开启您的法律职业生涯",
      internshipOverviewTitle: "项目概述",
      internshipOverviewText: "我们的实习项目旨在为法学院学生提供在一家专注于劳动法的律师事务所获得全面实践经验的机会。实习生直接与合伙人和高级律师合作处理真实案件和交易，获得宝贵的实践知识。",
      internshipDurationTitle: "期限和要求",
      internshipDuration: [
        "项目期限：6–12个月",
        "法学院最后几年的学生或应届毕业生",
        "来自认可法学院的优秀学术成绩",
        "出色的书面和口头沟通能力",
        "精通西班牙语和英语者优先",
      ],
      internshipLearningTitle: "您将学到什么",
      internshipLearning: [
        "法律研究和分析技术",
        "文件起草和审查",
        "客户沟通和关系管理",
        "法庭和仲裁程序",
        "劳动审计与合规",
        "职业道德和最佳实践",
      ],
      applyTitle: "如何申请",
      applyInstructions: "如需申请任何职位或我们的实习项目，请将您的简历、求职信和成绩单发送至：",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "请在电子邮件主题行中注明职位名称。我们会仔细审核所有申请，并联系符合条件的候选人进行面试。",
      contactCardTitle: "招聘联系人",
      sendApplication: "发送申请",
    },
    ko: {
      heroTitle: "우리와 함께 경력을 쌓으세요",
      heroSubtitle: "Santos & Saucedo에서는 인턴과 어소시에이트가 처음부터 파트너와 함께 실제 사건을 담당합니다. 현장 감사, 단체협약 검토, 조정 심리와 소송 등입니다.",
      whyJoinTitle: "왜 우리와 함께해야 할까요?",
      whyJoinSubtitle: "기업 측 노동법에 관심 있는 학생과 변호사, 그리고 파트너 중심의 법인에서 성장하고자 하는 행정 직원을 찾습니다. 엄격함과 신중함, 그리고 기업이 내부에서 어떻게 움직이는지 이해하려는 관심을 중시합니다.",
      cultureTitle: "우리의 문화",
      cultureText: "Santos & Saucedo에서는 모든 팀원이 성장할 수 있는 협력적이고 포용적인 환경을 조성합니다. 35년 이상의 전문 경험을 바탕으로 전통과 혁신을 결합하여 탁월한 법률 서비스를 제공합니다. 우리의 문화는 팀워크, 상호 존중, 최고의 윤리적 기준에 대한 헌신을 강조합니다.",
      valuesTitle: "핵심 가치",
      values: [
        { title: "탁월함", text: "우리는 모든 일에서 최고의 품질을 추구합니다" },
        { title: "정직성", text: "윤리적 행동이 모든 전문적 관계를 이끕니다" },
        { title: "협력", text: "우리는 성공을 위해 하나의 팀으로 함께 일합니다" },
        { title: "혁신", text: "우리는 도전을 해결하기 위한 새로운 아이디어와 접근 방식을 수용합니다" },
      ],
      environmentTitle: "근무 환경",
      environmentText: "Río Tamazunchale 205 Norte에 위치한 우리의 현대적인 사무실은 역동적이고 영감을 주는 작업 공간을 제공합니다. 우리는 일과 삶의 균형을 믿으며 팀원들의 웰빙을 지원하기 위한 유연한 근무 방식을 제공합니다. 여러분의 목소리가 중요하고 기여가 인정받는 회사에 합류하세요.",
      benefitsTitle: "복리후생",
      benefitsSubtitle: "우리는 팀을 소중히 여깁니다",
      benefits: [
        { title: "경쟁력 있는 보상", text: "업계 최고 수준의 급여와 성과 보너스" },
        { title: "전문성 개발", text: "지속적인 학습 기회와 경력 발전" },
        { title: "워라밸", text: "유연한 일정과 하이브리드 근무 옵션" },
        { title: "건강 혜택", text: "종합적인 의료, 치과 및 안과 보험" },
        { title: "교육 프로그램", text: "사내 교육 및 외부 자격증 지원" },
        { title: "멘토링", text: "경험 많은 파트너와 선임 변호사의 지도" },
      ],
      positionsTitle: "채용 공고",
      positionsSubtitle: "우리 회사의 현재 기회를 살펴보세요",
      positions: [
        {
          title: "어소시에이트 변호사",
          department: "노동법",
          location: "San Pedro Garza García",
          type: "정규직",
          description: "노동 소송 및 노동법 자문 분야에서 개별 및 집단 노동관계를 포함해 2–5년 경력을 가진 유능한 변호사를 찾고 있습니다.",
        },
        {
          title: "법무 인턴",
          department: "노동법",
          location: "San Pedro Garza García",
          type: "인턴십",
          description: "인턴십 프로그램에 참여하여 처음부터 파트너와 함께 실제 사건을 담당하세요.",
        },
        {
          title: "패럴리걸",
          department: "소송",
          location: "San Pedro Garza García",
          type: "정규직",
          description: "빠르게 변화하는 환경에서 법률 연구, 문서 준비 및 사건 관리로 소송 팀을 지원합니다.",
        },
      ],
      internshipTitle: "인턴십 프로그램",
      internshipSubtitle: "우리와 함께 법률 경력을 시작하세요",
      internshipOverviewTitle: "프로그램 개요",
      internshipOverviewText: "우리의 인턴십 프로그램은 법학도들에게 노동법을 전문으로 하는 로펌에서 포괄적인 실무 경험을 제공하도록 설계되었습니다. 인턴들은 파트너 및 시니어 어소시에이트와 직접 협력하여 실제 사건과 거래를 처리하며 귀중한 실무 지식을 얻습니다.",
      internshipDurationTitle: "기간 및 요구사항",
      internshipDuration: [
        "프로그램 기간: 6–12개월",
        "법학과 마지막 학년 학생 또는 최근 졸업생",
        "인가된 로스쿨의 우수한 학업 성적",
        "뛰어난 서면 및 구두 의사소통 능력",
        "스페인어와 영어 능숙자 우대",
      ],
      internshipLearningTitle: "배우게 될 것들",
      internshipLearning: [
        "법률 연구 및 분석 기술",
        "문서 작성 및 검토",
        "고객 커뮤니케이션 및 관계 관리",
        "법정 및 중재 절차",
        "노동 감사 및 규정 준수",
        "직업 윤리 및 모범 사례",
      ],
      applyTitle: "지원 방법",
      applyInstructions: "모든 직위 또는 인턴십 프로그램에 지원하려면 이력서, 자기소개서 및 성적증명서를 다음 주소로 보내주세요:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "이메일 제목에 직위명을 포함해 주세요. 모든 지원서를 신중하게 검토하고 자격을 갖춘 후보자에게 면접을 위해 연락드리겠습니다.",
      contactCardTitle: "채용 문의",
      sendApplication: "지원서 보내기",
    },
    ja: {
      heroTitle: "私たちと一緒にキャリアを築きましょう",
      heroSubtitle: "Santos & Saucedo では、インターンとアソシエイトが最初からパートナーとともに実際の案件に携わります。現場での監査、労働協約の見直し、調停期日、訴訟などです。",
      whyJoinTitle: "なぜ私たちと働くべきか",
      whyJoinSubtitle: "企業側の労働法に関心のある学生と弁護士、そしてパートナー主導の事務所で成長したい事務職員を求めています。厳密さ、慎重さ、そして企業が内側からどう動いているかを理解しようとする姿勢を大切にしています。",
      cultureTitle: "私たちの文化",
      cultureText: "Santos & Saucedoでは、すべてのチームメンバーが成長できる協力的で包括的な環境を育んでいます。35年以上の専門的な実績を持ち、伝統と革新を組み合わせて卓越した法律サービスを提供しています。私たちの文化は、チームワーク、相互尊重、そして最高の倫理基準へのコミットメントを強調しています。",
      valuesTitle: "コアバリュー",
      values: [
        { title: "卓越性", text: "私たちは行うすべてのことにおいて最高の品質を追求します" },
        { title: "誠実さ", text: "倫理的な行動がすべての専門的な関係を導きます" },
        { title: "協力", text: "私たちは統一されたチームとして成功を達成するために協力します" },
        { title: "革新", text: "私たちは課題を解決するための新しいアイデアとアプローチを受け入れます" },
      ],
      environmentTitle: "職場環境",
      environmentText: "Río Tamazunchale 205 Norteにある私たちの近代的なオフィスは、ダイナミックでインスピレーションを与える職場を提供しています。私たちはワークライフバランスを信じており、チームメンバーの健康をサポートするための柔軟な勤務形態を提供しています。あなたの声が大切にされ、貢献が認められる事務所に参加してください。",
      benefitsTitle: "福利厚生",
      benefitsSubtitle: "私たちはチームを大切にします",
      benefits: [
        { title: "競争力のある報酬", text: "業界トップレベルの給与とパフォーマンスボーナス" },
        { title: "キャリア開発", text: "継続的な学習機会とキャリアアップ" },
        { title: "ワークライフバランス", text: "柔軟なスケジュールとハイブリッドワークオプション" },
        { title: "健康保険", text: "包括的な医療、歯科、眼科保険" },
        { title: "研修プログラム", text: "社内研修と外部資格取得支援" },
        { title: "メンターシップ", text: "経験豊富なパートナーとシニア弁護士による指導" },
      ],
      positionsTitle: "募集職種",
      positionsSubtitle: "当事務所の現在の求人をご覧ください",
      positions: [
        {
          title: "アソシエイト弁護士",
          department: "労働法",
          location: "San Pedro Garza García",
          type: "正社員",
          description: "労働訴訟および労働法務（個別および集団の労使関係を含む）において2〜5年の経験を持つ優秀な弁護士を募集しています。",
        },
        {
          title: "法務インターン",
          department: "労働法",
          location: "San Pedro Garza García",
          type: "インターンシップ",
          description: "インターンシップ・プログラムに参加し、最初からパートナーとともに実際の案件に携わってください。",
        },
        {
          title: "パラリーガル",
          department: "訴訟",
          location: "San Pedro Garza García",
          type: "正社員",
          description: "ダイナミックな環境で法的調査、文書作成、ケース管理を通じて訴訟チームをサポートしてください。",
        },
      ],
      internshipTitle: "インターンシッププログラム",
      internshipSubtitle: "私たちと一緒に法律キャリアをスタート",
      internshipOverviewTitle: "プログラム概要",
      internshipOverviewText: "当インターンシッププログラムは、労働法に特化した法律事務所で、法学生に包括的な実践経験を提供するよう設計されています。インターンはパートナーやシニアアソシエイトと直接協力して実際の案件や取引に携わり、貴重な実践的知識を得ることができます。",
      internshipDurationTitle: "期間と要件",
      internshipDuration: [
        "プログラム期間：6〜12ヶ月",
        "法学部最終学年の学生または新卒者",
        "認定ロースクールの優秀な学業成績",
        "優れた文書および口頭コミュニケーション能力",
        "スペイン語と英語の能力があれば尚可",
      ],
      internshipLearningTitle: "学べること",
      internshipLearning: [
        "法的調査と分析技術",
        "文書作成とレビュー",
        "クライアントコミュニケーションと関係管理",
        "法廷および仲裁手続き",
        "労務監査とコンプライアンス",
        "職業倫理とベストプラクティス",
      ],
      applyTitle: "応募方法",
      applyInstructions: "いずれかの職種またはインターンシッププログラムに応募するには、履歴書、カバーレター、成績証明書を以下のメールアドレスにお送りください：",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "メールの件名に職種名を記載してください。すべての応募書類を慎重に審査し、資格のある候補者には面接のご連絡をいたします。",
      contactCardTitle: "採用担当連絡先",
      sendApplication: "応募書類を送信",
    },
    ar: {
      heroTitle: "ابنِ مسيرتك المهنية معنا",
      heroSubtitle: "في Santos & Saucedo، يعمل المتدربون والمحامون المساعدون منذ البداية على قضايا حقيقية إلى جانب الشركاء: عمليات تدقيق في المصانع، ومراجعة عقود العمل الجماعية، وجلسات التوفيق، والدعاوى القضائية.",
      whyJoinTitle: "لماذا تعمل معنا؟",
      whyJoinSubtitle: "نبحث عن طلاب ومحامين مهتمين بقانون العمل من جانب أصحاب العمل، وعن موظفين إداريين يرغبون في النمو داخل مكتب يقوده الشركاء. نقدّر الدقة والتكتم والاهتمام بفهم كيفية عمل المؤسسة من الداخل.",
      cultureTitle: "ثقافتنا",
      cultureText: "في Santos & Saucedo، نعزز بيئة تعاونية وشاملة حيث يمكن لكل عضو في الفريق أن يزدهر. مع أكثر من 35 عامًا من الخبرة، نجمع بين التقاليد والابتكار لتقديم خدمات قانونية استثنائية. تؤكد ثقافتنا على العمل الجماعي والاحترام المتبادل والالتزام بأعلى المعايير الأخلاقية.",
      valuesTitle: "قيمنا الأساسية",
      values: [
        { title: "التميز", text: "نسعى لتحقيق أعلى جودة في كل ما نقوم به" },
        { title: "النزاهة", text: "السلوك الأخلاقي يوجه جميع علاقاتنا المهنية" },
        { title: "التعاون", text: "نعمل معًا كفريق موحد لتحقيق النجاح" },
        { title: "الابتكار", text: "نتبنى أفكارًا ومناهج جديدة لحل التحديات" },
      ],
      environmentTitle: "بيئة العمل",
      environmentText: "توفر مكاتبنا الحديثة في Río Tamazunchale 205 Norte مساحة عمل ديناميكية وملهمة. نؤمن بالتوازن بين العمل والحياة ونوفر ترتيبات مرنة لدعم رفاهية أعضاء فريقنا. انضم إلى شركة حيث صوتك مهم ومساهماتك معترف بها.",
      benefitsTitle: "المزايا والمكافآت",
      benefitsSubtitle: "نحن نهتم بفريقنا",
      benefits: [
        { title: "تعويضات تنافسية", text: "رواتب رائدة في السوق ومكافآت أداء" },
        { title: "التطوير المهني", text: "فرص تعلم مستمرة وتقدم وظيفي" },
        { title: "التوازن بين العمل والحياة", text: "جداول مرنة وخيارات عمل هجينة" },
        { title: "المزايا الصحية", text: "تغطية طبية وأسنان ورؤية شاملة" },
        { title: "برامج التدريب", text: "تدريب داخلي ودعم للشهادات الخارجية" },
        { title: "الإرشاد", text: "توجيه من شركاء ومحامين كبار ذوي خبرة" },
      ],
      positionsTitle: "الوظائف المتاحة",
      positionsSubtitle: "استكشف الفرص الحالية في شركتنا",
      positions: [
        {
          title: "محامٍ مساعد",
          department: "قانون العمل",
          location: "San Pedro Garza García",
          type: "دوام كامل",
          description: "نبحث عن محامين موهوبين لديهم 2–5 سنوات من الخبرة في التقاضي العمالي والاستشارات العمالية، بما في ذلك العلاقات العمالية الفردية والجماعية، للانضمام إلى فريقنا المتنامي.",
        },
        {
          title: "متدرب قانوني",
          department: "قانون العمل",
          location: "San Pedro Garza García",
          type: "تدريب",
          description: "انضم إلى برنامج التدريب لدينا واعمل منذ البداية على قضايا حقيقية إلى جانب الشركاء.",
        },
        {
          title: "مساعد قانوني",
          department: "التقاضي",
          location: "San Pedro Garza García",
          type: "دوام كامل",
          description: "دعم فريق التقاضي لدينا في البحث القانوني وإعداد المستندات وإدارة القضايا في بيئة سريعة الإيقاع.",
        },
      ],
      internshipTitle: "برنامج التدريب",
      internshipSubtitle: "ابدأ مسيرتك القانونية معنا",
      internshipOverviewTitle: "نظرة عامة على البرنامج",
      internshipOverviewText: "تم تصميم برنامج التدريب لدينا لتزويد طلاب القانون بخبرة عملية شاملة في شركة محاماة متخصصة في قانون العمل. يعمل المتدربون مباشرة مع الشركاء والمحامين الكبار على قضايا ومعاملات حقيقية، ويكتسبون معرفة عملية لا تقدر بثمن.",
      internshipDurationTitle: "المدة والمتطلبات",
      internshipDuration: [
        "مدة البرنامج: 6–12 شهرًا",
        "طلاب القانون في سنواتهم الأخيرة أو الخريجون الجدد",
        "سجل أكاديمي قوي من كليات القانون المعتمدة",
        "مهارات اتصال كتابية وشفوية ممتازة",
        "يفضل إجادة الإسبانية والإنجليزية",
      ],
      internshipLearningTitle: "ما ستتعلمه",
      internshipLearning: [
        "تقنيات البحث والتحليل القانوني",
        "صياغة ومراجعة المستندات",
        "التواصل مع العملاء وإدارة العلاقات",
        "إجراءات المحكمة والتحكيم",
        "التدقيق العمالي والامتثال التنظيمي",
        "الأخلاقيات المهنية وأفضل الممارسات",
      ],
      applyTitle: "كيفية التقديم",
      applyInstructions: "للتقدم لأي وظيفة أو برنامج التدريب لدينا، يرجى إرسال سيرتك الذاتية ورسالة التغطية والنصوص الأكاديمية إلى:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "يرجى تضمين عنوان الوظيفة في سطر موضوع بريدك الإلكتروني. نراجع جميع الطلبات بعناية وسنتواصل مع المرشحين المؤهلين للمقابلات.",
      contactCardTitle: "جهة اتصال التوظيف",
      sendApplication: "إرسال الطلب",
    },
    ru: {
      heroTitle: "Постройте свою карьеру вместе с нами",
      heroSubtitle: "В Santos & Saucedo стажёры и юристы с первого дня работают над реальными делами вместе с партнёрами: проверки на предприятиях, анализ коллективных договоров, примирительные слушания и судебные процессы.",
      whyJoinTitle: "Почему стоит работать у нас?",
      whyJoinSubtitle: "Мы ищем студентов и юристов, интересующихся трудовым правом на стороне работодателя, а также административных сотрудников, которые хотят расти в партнёрской фирме. Мы ценим тщательность, сдержанность и стремление понять, как компания устроена изнутри.",
      cultureTitle: "Наша культура",
      cultureText: "В Santos & Saucedo мы создаём совместную и инклюзивную среду, где каждый член команды может развиваться. С более чем 35-летним опытом мы сочетаем традиции с инновациями для предоставления исключительных юридических услуг. Наша культура подчёркивает командную работу, взаимное уважение и приверженность высочайшим этическим стандартам.",
      valuesTitle: "Наши основные ценности",
      values: [
        { title: "Совершенство", text: "Мы стремимся к высочайшему качеству во всём, что делаем" },
        { title: "Честность", text: "Этичное поведение направляет все наши профессиональные отношения" },
        { title: "Сотрудничество", text: "Мы работаем вместе как единая команда для достижения успеха" },
        { title: "Инновации", text: "Мы принимаем новые идеи и подходы для решения задач" },
      ],
      environmentTitle: "Рабочая среда",
      environmentText: "Наши современные офисы в Río Tamazunchale 205 Norte предлагают динамичное и вдохновляющее рабочее пространство. Мы верим в баланс между работой и личной жизнью и предоставляем гибкие условия для поддержки благополучия членов нашей команды. Присоединяйтесь к фирме, где ваш голос имеет значение, а ваш вклад признаётся.",
      benefitsTitle: "Преимущества и льготы",
      benefitsSubtitle: "Мы заботимся о нашей команде",
      benefits: [
        { title: "Конкурентная компенсация", text: "Лидирующие на рынке зарплаты и премии за результаты" },
        { title: "Профессиональное развитие", text: "Постоянные возможности обучения и карьерного роста" },
        { title: "Баланс работы и жизни", text: "Гибкий график и варианты гибридной работы" },
        { title: "Медицинское страхование", text: "Комплексное медицинское, стоматологическое и офтальмологическое покрытие" },
        { title: "Программы обучения", text: "Внутреннее обучение и поддержка внешней сертификации" },
        { title: "Наставничество", text: "Руководство от опытных партнёров и старших юристов" },
      ],
      positionsTitle: "Открытые вакансии",
      positionsSubtitle: "Изучите текущие возможности в нашей фирме",
      positions: [
        {
          title: "Юрист",
          department: "Трудовое право",
          location: "San Pedro Garza García",
          type: "Полная занятость",
          description: "Мы ищем талантливых юристов с 2–5 годами опыта в трудовых спорах и консультировании по трудовому праву, включая индивидуальные и коллективные трудовые отношения, для присоединения к нашей растущей команде.",
        },
        {
          title: "Стажёр-юрист",
          department: "Трудовое право",
          location: "San Pedro Garza García",
          type: "Стажировка",
          description: "Присоединяйтесь к нашей программе стажировки и с первого дня работайте над реальными делами вместе с партнёрами.",
        },
        {
          title: "Помощник юриста",
          department: "Судебные споры",
          location: "San Pedro Garza García",
          type: "Полная занятость",
          description: "Поддерживайте нашу команду судебных разбирательств в юридических исследованиях, подготовке документов и управлении делами в динамичной среде.",
        },
      ],
      internshipTitle: "Программа стажировки",
      internshipSubtitle: "Начните свою юридическую карьеру с нами",
      internshipOverviewTitle: "Обзор программы",
      internshipOverviewText: "Наша программа стажировки разработана для предоставления студентам-юристам комплексного практического опыта в специализированной фирме по трудовому праву. Стажёры работают непосредственно с партнёрами и старшими сотрудниками над реальными делами и сделками, получая бесценные практические знания.",
      internshipDurationTitle: "Продолжительность и требования",
      internshipDuration: [
        "Продолжительность программы: 6–12 месяцев",
        "Студенты юридических факультетов последних курсов или недавние выпускники",
        "Отличная академическая успеваемость в аккредитованных юридических школах",
        "Отличные письменные и устные коммуникативные навыки",
        "Владение испанским и английским языками приветствуется",
      ],
      internshipLearningTitle: "Чему вы научитесь",
      internshipLearning: [
        "Техники юридических исследований и анализа",
        "Составление и проверка документов",
        "Общение с клиентами и управление отношениями",
        "Судебные и арбитражные процедуры",
        "Трудовой аудит и нормативное соответствие",
        "Профессиональная этика и лучшие практики",
      ],
      applyTitle: "Как подать заявку",
      applyInstructions: "Чтобы подать заявку на любую должность или нашу программу стажировки, пожалуйста, отправьте ваше резюме, сопроводительное письмо и академические справки на:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Пожалуйста, укажите название должности в теме письма. Мы внимательно рассматриваем все заявки и свяжемся с квалифицированными кандидатами для собеседования.",
      contactCardTitle: "Контакт отдела кадров",
      sendApplication: "Отправить заявку",
    },
    fr: {
      heroTitle: "Construisez votre carrière avec nous",
      heroSubtitle: "Chez Santos & Saucedo, les stagiaires et les collaborateurs travaillent dès le départ sur de vrais dossiers, aux côtés des associés : audits sur site, révision de conventions collectives, audiences de conciliation et procès.",
      whyJoinTitle: "Pourquoi nous rejoindre ?",
      whyJoinSubtitle: "Nous recherchons des étudiants et des juristes intéressés par le droit du travail côté employeur, ainsi que du personnel administratif souhaitant évoluer dans un cabinet d'associés. Nous apprécions la rigueur, la discrétion et l'envie de comprendre le fonctionnement d'une entreprise de l'intérieur.",
      cultureTitle: "Notre culture",
      cultureText: "Chez Santos & Saucedo, nous favorisons un environnement collaboratif et inclusif où chaque membre de l'équipe peut s'épanouir. Avec plus de 35 ans d'expérience, nous combinons tradition et innovation pour fournir des services juridiques exceptionnels. Notre culture met l'accent sur le travail d'équipe, le respect mutuel et l'engagement envers les normes éthiques les plus élevées.",
      valuesTitle: "Nos valeurs fondamentales",
      values: [
        { title: "Excellence", text: "Nous visons la plus haute qualité dans tout ce que nous faisons" },
        { title: "Intégrité", text: "Une conduite éthique guide toutes nos relations professionnelles" },
        { title: "Collaboration", text: "Nous travaillons ensemble en équipe unie pour réussir" },
        { title: "Innovation", text: "Nous adoptons de nouvelles idées et approches pour résoudre les défis" },
      ],
      environmentTitle: "Environnement de travail",
      environmentText: "Nos bureaux modernes dans la Río Tamazunchale 205 Norte offrent un espace de travail dynamique et inspirant. Nous croyons à l'équilibre travail-vie personnelle et proposons des arrangements flexibles pour soutenir le bien-être de nos collaborateurs. Rejoignez un cabinet où votre voix compte et vos contributions sont reconnues.",
      benefitsTitle: "Avantages",
      benefitsSubtitle: "Nous prenons soin de notre équipe",
      benefits: [
        { title: "Rémunération compétitive", text: "Salaires leaders du marché et primes de performance" },
        { title: "Développement professionnel", text: "Opportunités d'apprentissage continu et avancement de carrière" },
        { title: "Équilibre vie-travail", text: "Horaires flexibles et options de travail hybride" },
        { title: "Avantages santé", text: "Couverture médicale, dentaire et optique complète" },
        { title: "Programmes de formation", text: "Formation interne et soutien aux certifications externes" },
        { title: "Mentorat", text: "Accompagnement par des associés expérimentés et des avocats seniors" },
      ],
      positionsTitle: "Postes ouverts",
      positionsSubtitle: "Explorez les opportunités actuelles dans notre cabinet",
      positions: [
        {
          title: "Avocat collaborateur",
          department: "Droit du travail",
          location: "San Pedro Garza García",
          type: "Temps plein",
          description: "Nous recherchons des avocats talentueux avec 2–5 ans d'expérience en contentieux du travail et en conseil en droit du travail, y compris les relations de travail individuelles et collectives, pour rejoindre notre équipe en croissance.",
        },
        {
          title: "Stagiaire juridique",
          department: "Droit du travail",
          location: "San Pedro Garza García",
          type: "Stage",
          description: "Rejoignez notre programme de stage et travaillez dès le départ sur de vrais dossiers, aux côtés des associés.",
        },
        {
          title: "Assistant juridique",
          department: "Contentieux",
          location: "San Pedro Garza García",
          type: "Temps plein",
          description: "Soutenez notre équipe contentieuse dans la recherche juridique, la préparation de documents et la gestion des dossiers dans un environnement dynamique.",
        },
      ],
      internshipTitle: "Programme de stage",
      internshipSubtitle: "Lancez votre carrière juridique avec nous",
      internshipOverviewTitle: "Aperçu du programme",
      internshipOverviewText: "Notre programme de stage est conçu pour offrir aux étudiants en droit une expérience pratique complète dans un cabinet spécialisé en droit du travail. Les stagiaires travaillent directement avec les associés et collaborateurs seniors sur des affaires et transactions réelles, acquérant des connaissances pratiques inestimables.",
      internshipDurationTitle: "Durée et exigences",
      internshipDuration: [
        "Durée du programme : 6–12 mois",
        "Étudiants en droit en dernières années ou jeunes diplômés",
        "Excellent dossier académique des facultés de droit accréditées",
        "Excellentes compétences en communication écrite et orale",
        "Maîtrise de l'espagnol et de l'anglais souhaitée",
      ],
      internshipLearningTitle: "Ce que vous apprendrez",
      internshipLearning: [
        "Techniques de recherche et d'analyse juridique",
        "Rédaction et révision de documents",
        "Communication client et gestion des relations",
        "Procédures judiciaires et d'arbitrage",
        "Audits du travail et conformité réglementaire",
        "Éthique professionnelle et meilleures pratiques",
      ],
      applyTitle: "Comment postuler",
      applyInstructions: "Pour postuler à tout poste ou à notre programme de stage, veuillez envoyer votre CV, lettre de motivation et relevés de notes à :",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Veuillez inclure le titre du poste dans l'objet de votre email. Nous examinons attentivement toutes les candidatures et contacterons les candidats qualifiés pour des entretiens.",
      contactCardTitle: "Contact carrières",
      sendApplication: "Envoyer la candidature",
    },
    it: {
      heroTitle: "Costruisci la tua carriera con noi",
      heroSubtitle: "In Santos & Saucedo, tirocinanti e collaboratori lavorano fin dall'inizio su incarichi reali, al fianco dei soci: audit negli stabilimenti, revisione dei contratti collettivi, udienze di conciliazione e giudizi.",
      whyJoinTitle: "Perché lavorare con noi?",
      whyJoinSubtitle: "Cerchiamo studenti e avvocati interessati al diritto del lavoro dal lato dell'impresa, e personale amministrativo che voglia crescere in uno studio di soci. Apprezziamo il rigore, la discrezione e l'interesse a capire come funziona un'impresa dall'interno.",
      cultureTitle: "La nostra cultura",
      cultureText: "In Santos & Saucedo, promuoviamo un ambiente collaborativo e inclusivo in cui ogni membro del team può prosperare. Con oltre 35 anni di esperienza, combiniamo tradizione e innovazione per fornire servizi legali eccezionali. La nostra cultura enfatizza il lavoro di squadra, il rispetto reciproco e l'impegno verso i più alti standard etici.",
      valuesTitle: "I nostri valori fondamentali",
      values: [
        { title: "Eccellenza", text: "Puntiamo alla massima qualità in tutto ciò che facciamo" },
        { title: "Integrità", text: "Una condotta etica guida tutte le nostre relazioni professionali" },
        { title: "Collaborazione", text: "Lavoriamo insieme come un team unito per raggiungere il successo" },
        { title: "Innovazione", text: "Accogliamo nuove idee e approcci per risolvere le sfide" },
      ],
      environmentTitle: "Ambiente di lavoro",
      environmentText: "I nostri moderni uffici nella Río Tamazunchale 205 Norte offrono uno spazio di lavoro dinamico e stimolante. Crediamo nell'equilibrio tra lavoro e vita privata e offriamo accordi flessibili per supportare il benessere dei membri del nostro team. Unisciti a uno studio dove la tua voce conta e i tuoi contributi sono riconosciuti.",
      benefitsTitle: "Benefit e vantaggi",
      benefitsSubtitle: "Ci prendiamo cura del nostro team",
      benefits: [
        { title: "Compensi competitivi", text: "Stipendi leader di mercato e bonus legati alle performance" },
        { title: "Sviluppo professionale", text: "Opportunità di apprendimento continuo e avanzamento di carriera" },
        { title: "Equilibrio vita-lavoro", text: "Orari flessibili e opzioni di lavoro ibrido" },
        { title: "Benefit sanitari", text: "Copertura medica, dentale e oculistica completa" },
        { title: "Programmi di formazione", text: "Formazione interna e supporto per certificazioni esterne" },
        { title: "Mentoring", text: "Guida da partner esperti e avvocati senior" },
      ],
      positionsTitle: "Posizioni aperte",
      positionsSubtitle: "Esplora le opportunità attuali nel nostro studio",
      positions: [
        {
          title: "Avvocato collaboratore",
          department: "Diritto del lavoro",
          location: "San Pedro Garza García",
          type: "Tempo pieno",
          description: "Cerchiamo avvocati di talento con 2–5 anni di esperienza in contenzioso del lavoro e consulenza in diritto del lavoro, comprese le relazioni di lavoro individuali e collettive, per unirsi al nostro team in crescita.",
        },
        {
          title: "Tirocinante legale",
          department: "Diritto del lavoro",
          location: "San Pedro Garza García",
          type: "Tirocinio",
          description: "Partecipa al nostro programma di tirocinio e lavora fin dall'inizio su incarichi reali, al fianco dei soci.",
        },
        {
          title: "Assistente legale",
          department: "Contenzioso",
          location: "San Pedro Garza García",
          type: "Tempo pieno",
          description: "Supporta il nostro team di contenzioso nella ricerca legale, preparazione documenti e gestione dei casi in un ambiente dinamico.",
        },
      ],
      internshipTitle: "Programma di tirocinio",
      internshipSubtitle: "Inizia la tua carriera legale con noi",
      internshipOverviewTitle: "Panoramica del programma",
      internshipOverviewText: "Il nostro programma di tirocinio è progettato per fornire agli studenti di giurisprudenza un'esperienza pratica completa in uno studio specializzato in diritto del lavoro. I tirocinanti lavorano direttamente con partner e collaboratori senior su casi e transazioni reali, acquisendo conoscenze pratiche inestimabili.",
      internshipDurationTitle: "Durata e requisiti",
      internshipDuration: [
        "Durata del programma: 6–12 mesi",
        "Studenti di giurisprudenza negli ultimi anni o neolaureati",
        "Eccellente curriculum accademico da facoltà di giurisprudenza accreditate",
        "Eccellenti capacità di comunicazione scritta e orale",
        "Padronanza dello spagnolo e dell'inglese preferita",
      ],
      internshipLearningTitle: "Cosa imparerai",
      internshipLearning: [
        "Tecniche di ricerca e analisi legale",
        "Redazione e revisione di documenti",
        "Comunicazione con i clienti e gestione delle relazioni",
        "Procedure giudiziarie e arbitrali",
        "Audit del lavoro e conformità normativa",
        "Etica professionale e best practice",
      ],
      applyTitle: "Come candidarsi",
      applyInstructions: "Per candidarsi a qualsiasi posizione o al nostro programma di tirocinio, invia il tuo CV, lettera di presentazione e certificati accademici a:",
      applyEmail: "reclutamiento@santossaucedo.com",
      applyNote: "Includi il titolo della posizione nell'oggetto della tua email. Esaminiamo attentamente tutte le candidature e contatteremo i candidati qualificati per i colloqui.",
      contactCardTitle: "Contatto carriere",
      sendApplication: "Invia candidatura",
    },
  };

  const t = content[language as keyof typeof content] || content.en;

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

  // Enlace de texto de la marca (etiqueta, subrayado al pasar, flecha), sin botón con caja
  const textLinkClass = "ss-label group inline-flex min-h-[44px] items-center gap-3 text-ss-marino";
  // Filas abiertas, como "Nuestro enfoque" en /about: filete superior, titular en romana,
  // texto en la sans. Sin tarjeta, píldora, icono ni sombra.
  const rowClass = "border-t border-ss-rule pt-6";
  const listTitleClass = "font-heading font-normal text-ss-marino text-[20px] leading-[1.25] tracking-[-0.01em] mb-3";

  return (
    <div className="min-h-screen bg-background" data-testid="page-careers">
      <SEOHead page="careers" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-careers-hero">
        <div className="ss-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Eyebrow num="05" tone="navy" className="mb-6" />
            <h1 
              className="mb-5"
              data-testid="text-careers-title"
            >
              {t.heroTitle}
            </h1>
            <p 
              className="mb-8"
              data-testid="text-careers-subtitle"
            >
              {t.heroSubtitle}
            </p>
            {/* Enlace de texto de la marca (etiqueta, subrayado al pasar, flecha), sin botón con caja */}
            <a
              href={`mailto:${t.applyEmail}`}
              className="ss-label group inline-flex min-h-[44px] items-center gap-3 text-white"
              data-testid="button-hero-apply"
            >
              <span className="ss-link">{t.sendApplication}</span>
              <span aria-hidden="true" className="ss-arrow">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20 lg:mb-24"
            data-testid="section-why-join"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-why-join-title"
              >
                {t.whyJoinTitle}
              </h2>
              <p className={leadClass}>
                {t.whyJoinSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mb-16">
              <div className={rowClass} data-testid="card-culture">
                <h3 className={`${h3Class} mb-3`}>
                  {t.cultureTitle}
                </h3>
                <p className="text-base text-ss-tinta leading-[1.55]">
                  {t.cultureText}
                </p>
              </div>

              <div className={rowClass} data-testid="card-environment">
                <h3 className={`${h3Class} mb-3`}>
                  {t.environmentTitle}
                </h3>
                <p className="text-base text-ss-tinta leading-[1.55]">
                  {t.environmentText}
                </p>
              </div>
            </div>

            {/* Valores sobre blanco (antes en una caja Hueso): el numeral Gris Claro solo va sobre blanco */}
            <div data-testid="card-values">
              <h3 className={`${h3Class} mb-8`}>
                {t.valuesTitle}
              </h3>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {t.values.map((value, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    data-testid={`card-value-${index}`}
                  >
                    <NumberedCard
                      index={index}
                      title={value.title}
                      body={value.text}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 lg:mb-24"
            data-testid="section-benefits"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-benefits-title"
              >
                {t.benefitsTitle}
              </h2>
              <p className={leadClass}>
                {t.benefitsSubtitle}
              </p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t.benefits.map((benefit, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <NumberedCard
                    index={index}
                    title={benefit.title}
                    body={benefit.text}
                    dataTestid={`card-benefit-${index}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 lg:mb-24"
            data-testid="section-positions"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-positions-title"
              >
                {t.positionsTitle}
              </h2>
              <p className={leadClass}>
                {t.positionsSubtitle}
              </p>
            </div>

            {/* Vacantes en filas abiertas: tipo, área y ciudad en etiqueta (sin píldora ni iconos),
                titular en romana y un enlace de texto por vacante */}
            <motion.div 
              className="border-b border-ss-rule"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t.positions.map((position, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <article
                    className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-x-12 gap-y-4 border-t border-ss-rule py-8"
                    data-testid={`card-position-${index}`}
                  >
                    <div>
                      <p className="ss-label text-ss-medio mb-3">
                        {position.type} · {position.department} · {position.location}
                      </p>
                      <h3 className={`${h3Class} mb-3`}>
                        {position.title}
                      </h3>
                      <p className="text-base text-ss-tinta leading-[1.55] max-w-[48rem]">
                        {position.description}
                      </p>
                    </div>
                    <div className="lg:pt-7">
                      <a
                        href={`mailto:reclutamiento@santossaucedo.com?subject=${encodeURIComponent(position.title)}`}
                        className={textLinkClass}
                        data-testid={`button-apply-position-${index}`}
                      >
                        <span className="ss-link">{t.sendApplication}</span>
                        <span aria-hidden="true" className="ss-arrow">
                          →
                        </span>
                      </a>
                    </div>
                  </article>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 lg:mb-24"
            data-testid="section-internship"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-internship-title"
              >
                {t.internshipTitle}
              </h2>
              <p className={leadClass}>
                {t.internshipSubtitle}
              </p>
            </div>

            {/* Tres columnas abiertas: descripción (con el enlace para enviar la solicitud),
                duración y requisitos, y lo que se aprende. Sin la tarjeta centrada
                "¿Listo para comenzar?" (texto fijo en inglés fuera del español). */}
            <div 
              className={`${rowClass} grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10`}
              data-testid="card-internship-overview"
            >
              <div>
                <h3 className={`${h3Class} mb-3`}>
                  {t.internshipOverviewTitle}
                </h3>
                <p className="text-base text-ss-tinta leading-[1.55]">
                  {t.internshipOverviewText}
                </p>
                <div className="mt-6" data-testid="card-internship-cta">
                  <a
                    href={`mailto:reclutamiento@santossaucedo.com?subject=${encodeURIComponent(t.internshipTitle)}`}
                    className={textLinkClass}
                    data-testid="button-internship-apply"
                  >
                    <span className="ss-link">{t.sendApplication}</span>
                    <span aria-hidden="true" className="ss-arrow">
                      →
                    </span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className={listTitleClass}>
                  {t.internshipDurationTitle}
                </h3>
                <ul className="space-y-2">
                  {t.internshipDuration.map((item, index) => (
                    <li 
                      key={index} 
                      className="text-base text-ss-tinta flex items-start gap-3"
                    >
                      <span className="mt-[0.75em] h-px w-2.5 flex-shrink-0 bg-ss-medio" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className={listTitleClass}>
                  {t.internshipLearningTitle}
                </h3>
                <ul className="space-y-2">
                  {t.internshipLearning.map((item, index) => (
                    <li 
                      key={index} 
                      className="text-base text-ss-tinta flex items-start gap-3"
                    >
                      <span className="mt-[0.75em] h-px w-2.5 flex-shrink-0 bg-ss-medio" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-testid="section-apply"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
              <div className="lg:col-span-2" data-testid="card-apply-instructions">
                <h2 
                  className={`${h2Class} mb-5`}
                  data-testid="text-apply-title"
                >
                  {t.applyTitle}
                </h2>
                <p className="text-base text-ss-tinta leading-[1.55] max-w-2xl mb-3">
                  {t.applyInstructions}
                </p>
                {/* El correo como enlace de texto, no dentro de un botón */}
                <a 
                  href={`mailto:${t.applyEmail}`}
                  className="inline-block text-[19px] text-ss-marino underline decoration-ss-input underline-offset-4 hover:decoration-ss-marino mb-4"
                  data-testid="link-apply-email"
                >
                  {t.applyEmail}
                </a>
                <p className="text-base text-ss-medio leading-[1.55] max-w-2xl">
                  {t.applyNote}
                </p>
              </div>

              <div className={rowClass} data-testid="card-careers-contact">
                <h3 className={`${h3Class} mb-4`}>
                  {t.contactCardTitle}
                </h3>
                <p className="text-base text-ss-tinta leading-[1.55]">
                  <a 
                    href={`mailto:${t.applyEmail}`}
                    className="hover:text-ss-marino hover:underline underline-offset-4 transition-colors"
                    data-testid="link-contact-email"
                  >
                    {t.applyEmail}
                  </a>
                </p>
                <p className="text-base text-ss-tinta leading-[1.55]">
                  San Pedro Garza García
                </p>
                <a
                  href={`mailto:${t.applyEmail}`}
                  className={`${textLinkClass} mt-4`}
                  data-testid="button-send-application"
                >
                  <span className="ss-link">{t.sendApplication}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    →
                  </span>
                </a>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
