import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Eyebrow, NumberedCard } from "@/components/editorial";

// "Clásica": titulares en romana 400, Azul Marino, caja de oración y al inicio;
// entradillas en romana 400 Gris Tinta; texto en sans 400 Gris Tinta.
const h2Class = "font-heading font-normal text-ss-marino text-[clamp(28px,2.6vw,38px)] leading-[1.12] tracking-[-0.012em] [text-wrap:balance]";
const h3Class = "font-heading font-normal text-ss-marino text-[22px] leading-[1.25] tracking-[-0.01em]";
const leadClass = "font-serif font-normal text-ss-tinta text-[clamp(19px,0.6vw_+_14px,22px)] leading-[1.55] tracking-[-0.003em] [text-wrap:pretty]";

export default function Interns() {
  const { language } = useLanguage();

  const content = {
    en: {
      heroTitle: "Internship Program",
      heroSubtitle: "Interns work on real matters from the start, alongside the partners: on-site audits, reviews of collective bargaining agreements, conciliation hearings and trials.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "Program Overview",
      programOverviewSubtitle: "Two pathways to start your legal career",
      summerProgramTitle: "Summer Internship",
      summerProgramDescription: "Our summer internship program runs from June to August, offering law students an intensive experience during their academic break. Summer interns participate in ongoing matters across multiple practice areas, attend training sessions, and gain exposure to various aspects of legal practice.",
      summerProgramDuration: "Duration: 10–12 weeks (June–August)",
      permanentProgramTitle: "Permanent Internship",
      permanentProgramDescription: "Our permanent internship program is designed for law students in their final years who can dedicate part-time or full-time hours throughout the academic year. Permanent interns develop deeper expertise in specific practice areas and may transition to full-time associate positions upon graduation.",
      permanentProgramDuration: "Duration: 6–12 months (flexible schedule)",

      whatYouLearnTitle: "What You'll Learn",
      whatYouLearnSubtitle: "Comprehensive development for aspiring legal professionals",
      learningAreas: [
        { title: "Work Dynamics", text: "Experience real-world legal work by supporting partners and associates on active matters." },
        { title: "Diversity & Inclusion", text: "Understand our commitment to diversity and inclusion through training sessions and participation in firm initiatives." },
        { title: "Legal Research", text: "Master legal research methodologies, case analysis, and the preparation of legal memoranda using specialized tools and databases." },
        { title: "Client Service", text: "Develop client-facing skills by participating in meetings, preparing client deliverables, and understanding relationship management." },
        { title: "Professional Ethics", text: "Learn the ethical standards and best practices that guide the legal profession in Mexico and internationally." },
        { title: "Firm Culture", text: "Immerse yourself in our collaborative culture, network with attorneys at all levels, and build lasting professional relationships." },
      ],

      requirementsTitle: "Requirements",
      requirementsSubtitle: "What we look for in our interns",
      requirements: [
        "Currently enrolled in a law program at an accredited university",
        "Students in their 3rd year or higher preferred",
        "Strong academic record (minimum 8.5 GPA or equivalent)",
        "Excellent written and verbal communication skills in Spanish",
        "Proficiency in English (intermediate to advanced level preferred)",
        "Demonstrated interest in corporate law, litigation, or related fields",
        "Strong analytical and problem-solving abilities",
        "Availability for minimum 20 hours per week (permanent program)",
      ],

      applicationProcessTitle: "Application Process",
      applicationProcessSubtitle: "How to join our internship program",
      applicationSteps: [
        { step: "1", title: "Submit Application", text: "Send your CV, cover letter, academic transcripts, and two professional or academic references to our recruitment team." },
        { step: "2", title: "Initial Review", text: "Our HR team reviews all applications and selects candidates for the next stage based on qualifications and fit." },
        { step: "3", title: "Interview Process", text: "Selected candidates participate in interviews with HR and attorneys from relevant practice areas." },
        { step: "4", title: "Offer & Onboarding", text: "Successful candidates receive an offer and begin our comprehensive onboarding program." },
      ],

      benefitsTitle: "Benefits of Interning at Santos & Saucedo",
      benefitsSubtitle: "Invest in your future with us",
      benefits: [
        { title: "Mentorship Program", text: "Receive guidance from experienced attorneys who invest in your professional development." },
        { title: "Career Growth", text: "Many of our associates started as interns. Outstanding performers may receive full-time offers." },
        { title: "Competitive Stipend", text: "Receive a competitive monthly stipend that recognizes the value of your contributions." },
        { title: "Professional Network", text: "Build connections with lawyers, clients and peers that last throughout your career." },
        { title: "Flexible Arrangements", text: "We work with you to balance your internship with academic commitments." },
      ],

      ctaTitle: "How to Apply",
      ctaInstructions: "Send your application materials to:",
      ctaNote: "Please include 'Internship Application - [Your Name]' in your email subject line. We review applications on a rolling basis and will contact qualified candidates for interviews.",
      sendApplication: "Send Application",
      viewCareers: "View All Careers",
      contactTitle: "Questions?",
      contactText: "Have questions about our internship program? Reach out to our recruitment team.",
    },
    es: {
      heroTitle: "Programa de pasantes",
      heroSubtitle: "Los pasantes trabajan desde el principio en asuntos reales, junto a los socios: auditorías en planta, revisiones de contratos colectivos, audiencias de conciliación y juicios.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "Descripción del programa",
      programOverviewSubtitle: "Dos caminos para iniciar tu carrera legal",
      summerProgramTitle: "Pasantía de verano",
      summerProgramDescription: "Nuestro programa de pasantías de verano se desarrolla de junio a agosto, ofreciendo a los estudiantes de derecho una experiencia intensiva durante su receso académico. Los pasantes de verano participan en asuntos activos en múltiples áreas de práctica, asisten a sesiones de capacitación y obtienen exposición a diversos aspectos de la práctica legal.",
      summerProgramDuration: "Duración: 10–12 semanas (junio–agosto)",
      permanentProgramTitle: "Pasantía permanente",
      permanentProgramDescription: "Nuestro programa de pasantías permanentes está diseñado para estudiantes de derecho en sus últimos años que pueden dedicar horas parciales o completas durante el año académico. Los pasantes permanentes desarrollan experiencia más profunda en áreas de práctica específicas y pueden transitar a posiciones de tiempo completo como asociados al graduarse.",
      permanentProgramDuration: "Duración: 6–12 meses (horario flexible)",

      whatYouLearnTitle: "Lo que aprenderás",
      whatYouLearnSubtitle: "Desarrollo integral para futuros profesionales legales",
      learningAreas: [
        { title: "Dinámica de trabajo", text: "Experimenta el trabajo legal real apoyando a socios y asociados en asuntos activos." },
        { title: "Diversidad e inclusión", text: "Comprende nuestro compromiso con la diversidad y la inclusión a través de sesiones de capacitación y de la participación en iniciativas de la firma." },
        { title: "Investigación legal", text: "Domina metodologías de investigación legal, análisis de casos y preparación de memorándums legales usando herramientas y bases de datos especializadas." },
        { title: "Servicio al cliente", text: "Desarrolla habilidades de cara al cliente participando en reuniones, preparando entregables y entendiendo la gestión de relaciones." },
        { title: "Ética profesional", text: "Aprende los estándares éticos y mejores prácticas que guían la profesión legal en México e internacionalmente." },
        { title: "Cultura de la firma", text: "Sumérgete en nuestra cultura colaborativa, establece contactos con abogados de todos los niveles y construye relaciones profesionales duraderas." },
      ],

      requirementsTitle: "Requisitos",
      requirementsSubtitle: "Lo que buscamos en nuestros pasantes",
      requirements: [
        "Actualmente inscrito en un programa de derecho en una universidad acreditada",
        "Se prefieren estudiantes de 3er año o superior",
        "Excelente expediente académico (mínimo 8.5 de promedio o equivalente)",
        "Excelentes habilidades de comunicación escrita y verbal en español",
        "Dominio del inglés (nivel intermedio a avanzado preferido)",
        "Interés demostrado en derecho corporativo, litigio o campos relacionados",
        "Fuertes habilidades analíticas y de resolución de problemas",
        "Disponibilidad mínima de 20 horas por semana (programa permanente)",
      ],

      applicationProcessTitle: "Proceso de solicitud",
      applicationProcessSubtitle: "Cómo unirte a nuestro programa de pasantías",
      applicationSteps: [
        { step: "1", title: "Enviar solicitud", text: "Envía tu CV, carta de presentación, expediente académico y dos referencias profesionales o académicas a nuestro equipo de reclutamiento." },
        { step: "2", title: "Revisión inicial", text: "Nuestro equipo de RH revisa todas las solicitudes y selecciona candidatos para la siguiente etapa basándose en calificaciones y compatibilidad." },
        { step: "3", title: "Proceso de entrevistas", text: "Los candidatos seleccionados participan en entrevistas con RH y abogados de las áreas de práctica relevantes." },
        { step: "4", title: "Oferta e inducción", text: "Los candidatos exitosos reciben una oferta y comienzan nuestro programa integral de inducción." },
      ],

      benefitsTitle: "Beneficios de una pasantía en Santos & Saucedo",
      benefitsSubtitle: "Invierte en tu futuro con nosotros",
      benefits: [
        { title: "Programa de mentoría", text: "Recibe orientación de abogados experimentados que invierten en tu desarrollo profesional." },
        { title: "Crecimiento profesional", text: "Muchos de nuestros asociados comenzaron como pasantes. Los mejores desempeños pueden recibir ofertas de tiempo completo." },
        { title: "Beca competitiva", text: "Recibe una beca mensual competitiva que reconoce el valor de tus contribuciones." },
        { title: "Red profesional", text: "Construye relaciones con abogados, clientes y colegas que duran toda tu carrera." },
        { title: "Arreglos flexibles", text: "Trabajamos contigo para equilibrar tu pasantía con compromisos académicos." },
      ],

      ctaTitle: "Cómo enviar tu solicitud",
      ctaInstructions: "Envía tus materiales de aplicación a:",
      ctaNote: "Por favor incluye 'Solicitud de pasantía - [Tu nombre]' en el asunto del correo. Revisamos solicitudes de manera continua y contactaremos a los candidatos calificados para entrevistas.",
      sendApplication: "Enviar solicitud",
      viewCareers: "Ver todas las carreras",
      contactTitle: "¿Preguntas?",
      contactText: "¿Tienes preguntas sobre nuestro programa de pasantías? Contacta a nuestro equipo de reclutamiento.",
    },
    de: {
      heroTitle: "Praktikantenprogramm",
      heroSubtitle: "Praktikanten arbeiten von Anfang an an echten Mandaten, an der Seite der Partner: Audits vor Ort, Prüfung von Tarifverträgen, Schlichtungsverhandlungen und Gerichtsverfahren.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "Programmübersicht",
      programOverviewSubtitle: "Zwei Wege, um Ihre juristische Karriere zu beginnen",
      summerProgramTitle: "Sommerpraktikum",
      summerProgramDescription: "Unser Sommerpraktikumsprogramm läuft von Juni bis August und bietet Jurastudenten eine intensive Erfahrung während ihrer akademischen Pause. Sommerpraktikanten arbeiten an laufenden Mandaten in verschiedenen Praxisbereichen, nehmen an Schulungen teil und erhalten Einblicke in verschiedene Aspekte der Rechtspraxis.",
      summerProgramDuration: "Dauer: 10–12 Wochen (Juni–August)",
      permanentProgramTitle: "Dauerpraktikum",
      permanentProgramDescription: "Unser Dauerpraktikumsprogramm richtet sich an Jurastudenten in ihren letzten Jahren, die während des akademischen Jahres Teilzeit- oder Vollzeitstunden widmen können. Dauerpraktikanten entwickeln tiefere Expertise in spezifischen Praxisbereichen und können nach dem Abschluss in Vollzeit-Associate-Positionen wechseln.",
      permanentProgramDuration: "Dauer: 6–12 Monate (flexibler Zeitplan)",

      whatYouLearnTitle: "Was Sie lernen werden",
      whatYouLearnSubtitle: "Umfassende Entwicklung für angehende Juristen",
      learningAreas: [
        { title: "Arbeitsdynamik", text: "Erleben Sie echte juristische Arbeit, indem Sie Partner und Associates bei aktiven Mandaten unterstützen." },
        { title: "Vielfalt & Inklusion", text: "Lernen Sie unser Engagement für Vielfalt und Inklusion in Schulungen und bei Initiativen der Kanzlei kennen." },
        { title: "Juristische Recherche", text: "Beherrschen Sie juristische Recherchemethoden, Fallanalysen und die Erstellung von Rechtsgutachten mit spezialisierten Tools und Datenbanken." },
        { title: "Mandantenservice", text: "Entwickeln Sie kundenorientierte Fähigkeiten durch Teilnahme an Meetings, Vorbereitung von Mandantenunterlagen und Verständnis des Beziehungsmanagements." },
        { title: "Berufsethik", text: "Lernen Sie die ethischen Standards und Best Practices, die den Rechtsberuf in Mexiko und international leiten." },
        { title: "Kanzleikultur", text: "Tauchen Sie ein in unsere kollaborative Kultur, vernetzen Sie sich mit Anwälten auf allen Ebenen und bauen Sie dauerhafte berufliche Beziehungen auf." },
      ],

      requirementsTitle: "Anforderungen",
      requirementsSubtitle: "Was wir bei unseren Praktikanten suchen",
      requirements: [
        "Derzeit in einem Jurastudium an einer akkreditierten Universität eingeschrieben",
        "Studenten im 3. Jahr oder höher bevorzugt",
        "Starke akademische Leistung (Mindestdurchschnitt 8,5 oder gleichwertig)",
        "Ausgezeichnete schriftliche und mündliche Kommunikationsfähigkeiten in Spanisch",
        "Englischkenntnisse (mittleres bis fortgeschrittenes Niveau bevorzugt)",
        "Nachgewiesenes Interesse an Unternehmensrecht, Prozessführung oder verwandten Bereichen",
        "Starke analytische Fähigkeiten und Problemlösungskompetenz",
        "Verfügbarkeit für mindestens 20 Stunden pro Woche (Dauerprogramm)",
      ],

      applicationProcessTitle: "Bewerbungsprozess",
      applicationProcessSubtitle: "So treten Sie unserem Praktikantenprogramm bei",
      applicationSteps: [
        { step: "1", title: "Bewerbung einreichen", text: "Senden Sie Ihren Lebenslauf, Anschreiben, akademische Zeugnisse und zwei berufliche oder akademische Referenzen an unser Rekrutierungsteam." },
        { step: "2", title: "Erstprüfung", text: "Unser HR-Team prüft alle Bewerbungen und wählt Kandidaten für die nächste Phase basierend auf Qualifikationen und Eignung aus." },
        { step: "3", title: "Interviewprozess", text: "Ausgewählte Kandidaten nehmen an Interviews mit HR und Anwälten aus relevanten Praxisbereichen teil." },
        { step: "4", title: "Angebot & Onboarding", text: "Erfolgreiche Kandidaten erhalten ein Angebot und beginnen unser umfassendes Onboarding-Programm." },
      ],

      benefitsTitle: "Vorteile eines Praktikums bei Santos & Saucedo",
      benefitsSubtitle: "Investieren Sie in Ihre Zukunft mit uns",
      benefits: [
        { title: "Mentorenprogramm", text: "Erhalten Sie Anleitung von erfahrenen Anwälten, die in Ihre berufliche Entwicklung investieren." },
        { title: "Karrierewachstum", text: "Viele unserer Associates begannen als Praktikanten. Herausragende Leistungsträger können Vollzeitangebote erhalten." },
        { title: "Wettbewerbsfähiges Stipendium", text: "Erhalten Sie ein wettbewerbsfähiges monatliches Stipendium, das den Wert Ihrer Beiträge anerkennt." },
        { title: "Berufliches Netzwerk", text: "Bauen Sie Verbindungen zu Juristen, Mandanten und Kollegen auf, die Ihre gesamte Karriere überdauern." },
        { title: "Flexible Regelungen", text: "Wir arbeiten mit Ihnen zusammen, um Ihr Praktikum mit akademischen Verpflichtungen in Einklang zu bringen." },
      ],

      ctaTitle: "So bewerben Sie sich",
      ctaInstructions: "Senden Sie Ihre Bewerbungsunterlagen an:",
      ctaNote: "Bitte geben Sie 'Praktikumsbewerbung - [Ihr Name]' in der E-Mail-Betreffzeile an. Wir prüfen Bewerbungen laufend und werden qualifizierte Kandidaten für Interviews kontaktieren.",
      sendApplication: "Bewerbung senden",
      viewCareers: "Alle Karrieren anzeigen",
      contactTitle: "Fragen?",
      contactText: "Haben Sie Fragen zu unserem Praktikantenprogramm? Wenden Sie sich an unser Rekrutierungsteam.",
    },
    zh: {
      heroTitle: "实习生计划",
      heroSubtitle: "实习生从一开始就与合伙人一起处理真实案件：现场审计、集体合同审查、调解听证和诉讼。",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "项目概述",
      programOverviewSubtitle: "开启法律职业生涯的两种途径",
      summerProgramTitle: "暑期实习",
      summerProgramDescription: "我们的暑期实习项目从六月至八月进行，为法学院学生在学术假期期间提供密集的体验。暑期实习生参与多个业务领域的正在进行的事务，参加培训课程，并接触法律实践的各个方面。",
      summerProgramDuration: "时长：10–12周（六月至八月）",
      permanentProgramTitle: "长期实习",
      permanentProgramDescription: "我们的长期实习项目专为能够在学年期间投入兼职或全职时间的高年级法学院学生设计。长期实习生在特定业务领域发展更深入的专业知识，毕业后可能转为全职律师职位。",
      permanentProgramDuration: "时长：6–12个月（灵活安排）",

      whatYouLearnTitle: "您将学到什么",
      whatYouLearnSubtitle: "为有志法律专业人士提供全面发展",
      learningAreas: [
        { title: "工作动态", text: "通过支持合伙人和律师处理正在进行的事务，体验真实的法律工作。" },
        { title: "多元化与包容", text: "通过培训课程和参与事务所活动，了解我们对多元化与包容的承诺。" },
        { title: "法律研究", text: "使用专业工具和数据库掌握法律研究方法论、案例分析和法律备忘录的准备。" },
        { title: "客户服务", text: "通过参与会议、准备客户交付物和理解关系管理来发展面向客户的技能。" },
        { title: "职业道德", text: "学习指导墨西哥和国际法律行业的道德标准和最佳实践。" },
        { title: "事务所文化", text: "沉浸在我们的协作文化中，与各级律师建立联系，建立持久的专业关系。" },
      ],

      requirementsTitle: "要求",
      requirementsSubtitle: "我们在实习生中寻找什么",
      requirements: [
        "目前就读于认可大学的法学专业",
        "优先考虑三年级或以上学生",
        "优秀的学业成绩（最低平均分8.5或同等水平）",
        "优秀的西班牙语书面和口头沟通能力",
        "英语熟练程度（优先考虑中高级水平）",
        "对公司法、诉讼或相关领域表现出浓厚兴趣",
        "强大的分析和解决问题能力",
        "每周至少20小时可用（长期项目）",
      ],

      applicationProcessTitle: "申请流程",
      applicationProcessSubtitle: "如何加入我们的实习生计划",
      applicationSteps: [
        { step: "1", title: "提交申请", text: "将您的简历、求职信、成绩单和两份专业或学术推荐信发送给我们的招聘团队。" },
        { step: "2", title: "初步审核", text: "我们的人力资源团队审核所有申请，并根据资质和匹配度选择进入下一阶段的候选人。" },
        { step: "3", title: "面试流程", text: "入选候选人将与人力资源部门和相关业务领域的律师进行面试。" },
        { step: "4", title: "录用与入职", text: "成功的候选人将收到录用通知并开始我们全面的入职培训计划。" },
      ],

      benefitsTitle: "在Santos & Saucedo实习的好处",
      benefitsSubtitle: "与我们一起投资您的未来",
      benefits: [
        { title: "导师计划", text: "获得经验丰富的律师的指导，他们投资于您的专业发展。" },
        { title: "职业成长", text: "我们的许多律师都是从实习生开始的。表现出色者可能会收到全职工作邀请。" },
        { title: "有竞争力的津贴", text: "获得有竞争力的月度津贴，以认可您贡献的价值。" },
        { title: "专业网络", text: "与法律专业人士、客户和同行建立持续整个职业生涯的联系。" },
        { title: "灵活安排", text: "我们与您合作，平衡实习与学业承诺。" },
      ],

      ctaTitle: "如何申请",
      ctaInstructions: "将您的申请材料发送至：",
      ctaNote: "请在电子邮件主题行中注明'实习申请 - [您的姓名]'。我们持续审核申请，并将联系符合条件的候选人进行面试。",
      sendApplication: "发送申请",
      viewCareers: "查看所有职位",
      contactTitle: "有问题？",
      contactText: "对我们的实习生计划有疑问？请联系我们的招聘团队。",
    },
    ko: {
      heroTitle: "인턴십 프로그램",
      heroSubtitle: "인턴은 처음부터 파트너와 함께 실제 사건을 담당합니다. 현장 감사, 단체협약 검토, 조정 심리와 소송 등입니다.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "프로그램 개요",
      programOverviewSubtitle: "법률 경력을 시작하는 두 가지 경로",
      summerProgramTitle: "여름 인턴십",
      summerProgramDescription: "여름 인턴십 프로그램은 6월부터 8월까지 진행되며, 법학과 학생들에게 학기 휴식 기간 동안 집중적인 경험을 제공합니다. 여름 인턴은 여러 업무 분야의 진행 중인 사건에 참여하고, 교육 세션에 참석하며, 법률 실무의 다양한 측면을 경험합니다.",
      summerProgramDuration: "기간: 10–12주 (6월–8월)",
      permanentProgramTitle: "정규 인턴십",
      permanentProgramDescription: "정규 인턴십 프로그램은 학년 동안 파트타임 또는 풀타임으로 근무할 수 있는 고학년 법학과 학생들을 위해 설계되었습니다. 정규 인턴은 특정 업무 분야에서 더 깊은 전문성을 개발하며, 졸업 후 정규직 어소시에이트 직위로 전환할 수 있습니다.",
      permanentProgramDuration: "기간: 6–12개월 (유연한 일정)",

      whatYouLearnTitle: "배우게 될 내용",
      whatYouLearnSubtitle: "미래 법률 전문가를 위한 종합적인 개발",
      learningAreas: [
        { title: "업무 역학", text: "파트너와 어소시에이트를 지원하며 진행 중인 사건에서 실제 법률 업무를 경험하세요." },
        { title: "다양성과 포용", text: "교육 세션과 법인 활동 참여를 통해 다양성과 포용에 대한 우리의 의지를 이해하세요." },
        { title: "법률 연구", text: "전문 도구와 데이터베이스를 사용하여 법률 연구 방법론, 사례 분석 및 법률 메모 작성을 마스터하세요." },
        { title: "고객 서비스", text: "회의 참여, 고객 결과물 준비 및 관계 관리 이해를 통해 고객 대면 기술을 개발하세요." },
        { title: "직업 윤리", text: "멕시코와 국제적으로 법률 직업을 안내하는 윤리 기준과 모범 사례를 배우세요." },
        { title: "회사 문화", text: "협력적인 문화에 몰입하고, 모든 수준의 변호사들과 네트워크를 형성하며, 지속적인 전문적 관계를 구축하세요." },
      ],

      requirementsTitle: "요건",
      requirementsSubtitle: "인턴에게 원하는 자질",
      requirements: [
        "공인 대학교 법학 프로그램에 현재 재학 중",
        "3학년 이상 학생 우대",
        "우수한 학업 성적 (최소 평점 8.5 또는 동등)",
        "스페인어 우수한 서면 및 구두 의사소통 능력",
        "영어 능숙도 (중급에서 고급 수준 우대)",
        "기업법, 소송 또는 관련 분야에 대한 입증된 관심",
        "강력한 분석 및 문제 해결 능력",
        "주당 최소 20시간 가능 (정규 프로그램)",
      ],

      applicationProcessTitle: "지원 절차",
      applicationProcessSubtitle: "인턴십 프로그램 참여 방법",
      applicationSteps: [
        { step: "1", title: "지원서 제출", text: "이력서, 자기소개서, 성적증명서 및 두 개의 전문적 또는 학술적 추천서를 채용팀에 보내주세요." },
        { step: "2", title: "초기 검토", text: "HR 팀이 모든 지원서를 검토하고 자격과 적합성에 따라 다음 단계 후보자를 선발합니다." },
        { step: "3", title: "면접 과정", text: "선발된 후보자는 HR 및 관련 업무 분야 변호사들과 면접에 참여합니다." },
        { step: "4", title: "제안 및 온보딩", text: "성공적인 후보자는 제안을 받고 종합적인 온보딩 프로그램을 시작합니다." },
      ],

      benefitsTitle: "Santos & Saucedo 인턴십의 혜택",
      benefitsSubtitle: "우리와 함께 미래에 투자하세요",
      benefits: [
        { title: "멘토십 프로그램", text: "전문적 발전에 투자하는 경험 많은 변호사들로부터 지도를 받으세요." },
        { title: "경력 성장", text: "우리 어소시에이트 중 많은 이들이 인턴으로 시작했습니다. 뛰어난 성과자는 정규직 제안을 받을 수 있습니다." },
        { title: "경쟁력 있는 수당", text: "귀하의 기여 가치를 인정하는 경쟁력 있는 월 수당을 받으세요." },
        { title: "전문 네트워크", text: "경력 전반에 걸쳐 지속되는 법률 전문가, 고객 및 동료들과의 연결을 구축하세요." },
        { title: "유연한 조정", text: "인턴십과 학업 의무의 균형을 맞출 수 있도록 함께 협력합니다." },
      ],

      ctaTitle: "지원 방법",
      ctaInstructions: "지원 자료를 다음으로 보내주세요:",
      ctaNote: "이메일 제목에 '인턴십 지원 - [귀하의 이름]'을 포함해 주세요. 지원서를 지속적으로 검토하며 자격을 갖춘 후보자에게 면접을 위해 연락드립니다.",
      sendApplication: "지원서 보내기",
      viewCareers: "모든 채용 보기",
      contactTitle: "질문이 있으신가요?",
      contactText: "인턴십 프로그램에 대해 궁금한 점이 있으시면 채용팀에 문의하세요.",
    },
    ja: {
      heroTitle: "インターンシッププログラム",
      heroSubtitle: "インターンは最初からパートナーとともに実際の案件に携わります。現場での監査、労働協約の見直し、調停期日、訴訟などです。",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "プログラム概要",
      programOverviewSubtitle: "法律キャリアを始める2つの道",
      summerProgramTitle: "サマーインターンシップ",
      summerProgramDescription: "サマーインターンシッププログラムは6月から8月まで実施され、法学部生に学期休暇中の集中的な経験を提供します。サマーインターンは複数の業務分野の進行中の案件に参加し、トレーニングセッションに出席し、法律実務の様々な側面を経験します。",
      summerProgramDuration: "期間：10〜12週間（6月〜8月）",
      permanentProgramTitle: "通年インターンシップ",
      permanentProgramDescription: "通年インターンシッププログラムは、学年を通じてパートタイムまたはフルタイムの時間を捧げることができる最終学年の法学部生を対象としています。通年インターンは特定の業務分野でより深い専門知識を身につけ、卒業後にフルタイムのアソシエイト職に移行する可能性があります。",
      permanentProgramDuration: "期間：6〜12ヶ月（フレキシブルスケジュール）",

      whatYouLearnTitle: "学べること",
      whatYouLearnSubtitle: "法律専門家を目指す方のための総合的な育成",
      learningAreas: [
        { title: "業務ダイナミクス", text: "パートナーやアソシエイトをサポートし、進行中の案件で実際の法律業務を経験してください。" },
        { title: "ダイバーシティ＆インクルージョン", text: "トレーニングや事務所の取り組みへの参加を通じて、ダイバーシティ＆インクルージョンへの姿勢を理解してください。" },
        { title: "リーガルリサーチ", text: "専門的なツールやデータベースを使用して、法律調査方法論、判例分析、法的意見書の作成をマスターしてください。" },
        { title: "クライアントサービス", text: "会議への参加、クライアント向け成果物の作成、関係管理の理解を通じて、クライアント対応スキルを身につけてください。" },
        { title: "職業倫理", text: "メキシコおよび国際的に法律専門家を導く倫理基準とベストプラクティスを学びましょう。" },
        { title: "事務所文化", text: "協力的な文化に浸り、あらゆるレベルの弁護士とネットワークを築き、永続的な専門的関係を構築してください。" },
      ],

      requirementsTitle: "要件",
      requirementsSubtitle: "インターンに求める資質",
      requirements: [
        "認定大学の法学プログラムに現在在籍中",
        "3年生以上の学生を優先",
        "優秀な学業成績（最低GPA 8.5または同等）",
        "スペイン語での優れた書面および口頭コミュニケーション能力",
        "英語能力（中級から上級レベル優先）",
        "企業法、訴訟、または関連分野への実証された関心",
        "優れた分析力と問題解決能力",
        "週最低20時間の対応可能（通年プログラム）",
      ],

      applicationProcessTitle: "応募プロセス",
      applicationProcessSubtitle: "インターンシッププログラムへの参加方法",
      applicationSteps: [
        { step: "1", title: "応募書類提出", text: "履歴書、カバーレター、成績証明書、2通の職業的または学術的推薦状を採用チームに送付してください。" },
        { step: "2", title: "初期審査", text: "人事チームがすべての応募書類を審査し、資格と適性に基づいて次の段階の候補者を選抜します。" },
        { step: "3", title: "面接プロセス", text: "選抜された候補者は、人事部門と関連業務分野の弁護士との面接に参加します。" },
        { step: "4", title: "オファー＆オンボーディング", text: "合格した候補者はオファーを受け取り、包括的なオンボーディングプログラムを開始します。" },
      ],

      benefitsTitle: "Santos & Saucedoでインターンする特典",
      benefitsSubtitle: "私たちと共に未来に投資しましょう",
      benefits: [
        { title: "メンターシッププログラム", text: "あなたの専門的成長に投資する経験豊富な弁護士からの指導を受けてください。" },
        { title: "キャリア成長", text: "私たちのアソシエイトの多くはインターンからスタートしました。優秀な成績者はフルタイムのオファーを受ける可能性があります。" },
        { title: "競争力のある報酬", text: "あなたの貢献の価値を認める競争力のある月額報酬を受け取れます。" },
        { title: "プロフェッショナルネットワーク", text: "キャリアを通じて続く、法律専門家、クライアント、同僚とのつながりを構築してください。" },
        { title: "柔軟な対応", text: "インターンシップと学業の両立をサポートするため、一緒に調整いたします。" },
      ],

      ctaTitle: "応募方法",
      ctaInstructions: "応募書類の送付先：",
      ctaNote: "メールの件名に「インターンシップ応募 - [お名前]」を含めてください。応募書類は随時審査し、資格のある候補者には面接のご連絡をいたします。",
      sendApplication: "応募書類を送る",
      viewCareers: "すべての採用情報を見る",
      contactTitle: "ご質問はありますか？",
      contactText: "インターンシッププログラムについてご質問がございましたら、採用チームまでお問い合わせください。",
    },
    ar: {
      heroTitle: "برنامج التدريب",
      heroSubtitle: "يعمل المتدربون منذ البداية على قضايا حقيقية إلى جانب الشركاء: عمليات تدقيق في المصانع، ومراجعة عقود العمل الجماعية، وجلسات التوفيق، والدعاوى القضائية.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "نظرة عامة على البرنامج",
      programOverviewSubtitle: "مساران لبدء مسيرتك القانونية",
      summerProgramTitle: "التدريب الصيفي",
      summerProgramDescription: "يمتد برنامج التدريب الصيفي لدينا من يونيو إلى أغسطس، مما يوفر لطلاب القانون تجربة مكثفة خلال عطلتهم الأكاديمية. يشارك المتدربون الصيفيون في القضايا الجارية عبر مجالات ممارسة متعددة، ويحضرون جلسات تدريبية، ويكتسبون خبرة في جوانب مختلفة من الممارسة القانونية.",
      summerProgramDuration: "المدة: 10–12 أسبوعاً (يونيو–أغسطس)",
      permanentProgramTitle: "التدريب الدائم",
      permanentProgramDescription: "تم تصميم برنامج التدريب الدائم لدينا لطلاب القانون في سنواتهم الأخيرة الذين يمكنهم تخصيص ساعات بدوام جزئي أو كامل طوال العام الأكاديمي. يطور المتدربون الدائمون خبرة أعمق في مجالات ممارسة محددة وقد ينتقلون إلى وظائف محامين بدوام كامل عند التخرج.",
      permanentProgramDuration: "المدة: 6–12 شهراً (جدول مرن)",

      whatYouLearnTitle: "ما ستتعلمه",
      whatYouLearnSubtitle: "تطوير شامل للمهنيين القانونيين الطموحين",
      learningAreas: [
        { title: "ديناميكيات العمل", text: "جرّب العمل القانوني الحقيقي من خلال دعم الشركاء والمحامين في القضايا الجارية." },
        { title: "التنوع والشمول", text: "افهم التزامنا بالتنوع والشمول من خلال جلسات التدريب والمشاركة في مبادرات المكتب." },
        { title: "البحث القانوني", text: "أتقن منهجيات البحث القانوني وتحليل القضايا وإعداد المذكرات القانونية باستخدام أدوات وقواعد بيانات متخصصة." },
        { title: "خدمة العملاء", text: "طوّر مهارات التعامل مع العملاء من خلال المشاركة في الاجتماعات وإعداد المخرجات للعملاء وفهم إدارة العلاقات." },
        { title: "الأخلاقيات المهنية", text: "تعلم المعايير الأخلاقية وأفضل الممارسات التي توجه المهنة القانونية في المكسيك ودولياً." },
        { title: "ثقافة المكتب", text: "انغمس في ثقافتنا التعاونية، وتواصل مع المحامين على جميع المستويات، وابنِ علاقات مهنية دائمة." },
      ],

      requirementsTitle: "المتطلبات",
      requirementsSubtitle: "ما نبحث عنه في متدربينا",
      requirements: [
        "مسجل حالياً في برنامج قانون في جامعة معتمدة",
        "يُفضل طلاب السنة الثالثة أو أعلى",
        "سجل أكاديمي قوي (الحد الأدنى 8.5 معدل تراكمي أو ما يعادله)",
        "مهارات ممتازة في التواصل الكتابي والشفهي بالإسبانية",
        "إتقان اللغة الإنجليزية (يُفضل المستوى المتوسط إلى المتقدم)",
        "اهتمام مُثبت بقانون الشركات أو التقاضي أو المجالات ذات الصلة",
        "قدرات تحليلية وحل مشكلات قوية",
        "التوفر لمدة 20 ساعة على الأقل أسبوعياً (البرنامج الدائم)",
      ],

      applicationProcessTitle: "عملية التقديم",
      applicationProcessSubtitle: "كيفية الانضمام إلى برنامج التدريب لدينا",
      applicationSteps: [
        { step: "1", title: "تقديم الطلب", text: "أرسل سيرتك الذاتية وخطاب التقديم والنصوص الأكاديمية ومرجعين مهنيين أو أكاديميين إلى فريق التوظيف لدينا." },
        { step: "2", title: "المراجعة الأولية", text: "يراجع فريق الموارد البشرية جميع الطلبات ويختار المرشحين للمرحلة التالية بناءً على المؤهلات والملاءمة." },
        { step: "3", title: "عملية المقابلة", text: "يشارك المرشحون المختارون في مقابلات مع الموارد البشرية ومحامين من مجالات الممارسة ذات الصلة." },
        { step: "4", title: "العرض والتأهيل", text: "يتلقى المرشحون الناجحون عرضاً ويبدأون برنامج التأهيل الشامل لدينا." },
      ],

      benefitsTitle: "فوائد التدريب في Santos & Saucedo",
      benefitsSubtitle: "استثمر في مستقبلك معنا",
      benefits: [
        { title: "برنامج الإرشاد", text: "احصل على توجيه من محامين ذوي خبرة يستثمرون في تطويرك المهني." },
        { title: "النمو المهني", text: "بدأ كثير من محامينا كمتدربين. قد يحصل المتميزون على عروض بدوام كامل." },
        { title: "مكافأة تنافسية", text: "احصل على مكافأة شهرية تنافسية تعترف بقيمة مساهماتك." },
        { title: "شبكة مهنية", text: "ابنِ علاقات مع محترفين قانونيين وعملاء وزملاء تستمر طوال حياتك المهنية." },
        { title: "ترتيبات مرنة", text: "نعمل معك لتحقيق التوازن بين تدريبك والتزاماتك الأكاديمية." },
      ],

      ctaTitle: "كيفية التقديم",
      ctaInstructions: "أرسل مواد طلبك إلى:",
      ctaNote: "يرجى تضمين 'طلب تدريب - [اسمك]' في سطر موضوع البريد الإلكتروني. نراجع الطلبات بشكل مستمر وسنتواصل مع المرشحين المؤهلين لإجراء المقابلات.",
      sendApplication: "إرسال الطلب",
      viewCareers: "عرض جميع الوظائف",
      contactTitle: "أسئلة؟",
      contactText: "هل لديك أسئلة حول برنامج التدريب لدينا؟ تواصل مع فريق التوظيف لدينا.",
    },
    ru: {
      heroTitle: "Программа стажировки",
      heroSubtitle: "Стажёры с первого дня работают над реальными делами вместе с партнёрами: проверки на предприятиях, анализ коллективных договоров, примирительные слушания и судебные процессы.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "Обзор программы",
      programOverviewSubtitle: "Два пути для начала вашей юридической карьеры",
      summerProgramTitle: "Летняя стажировка",
      summerProgramDescription: "Наша программа летней стажировки проходит с июня по август, предлагая студентам юридических факультетов интенсивный опыт во время академических каникул. Летние стажеры участвуют в текущих делах в различных практических областях, посещают учебные сессии и получают представление о различных аспектах юридической практики.",
      summerProgramDuration: "Продолжительность: 10–12 недель (июнь–август)",
      permanentProgramTitle: "Постоянная стажировка",
      permanentProgramDescription: "Наша программа постоянной стажировки предназначена для студентов юридических факультетов последних курсов, которые могут посвящать неполный или полный рабочий день в течение учебного года. Постоянные стажеры развивают более глубокую экспертизу в конкретных практических областях и могут перейти на полноценную должность юриста после окончания учебы.",
      permanentProgramDuration: "Продолжительность: 6–12 месяцев (гибкий график)",

      whatYouLearnTitle: "Чему вы научитесь",
      whatYouLearnSubtitle: "Всестороннее развитие для будущих юристов",
      learningAreas: [
        { title: "Рабочая динамика", text: "Получите опыт реальной юридической работы, помогая партнерам и юристам в текущих делах." },
        { title: "Разнообразие и инклюзивность", text: "Узнайте о нашей приверженности многообразию и инклюзивности на учебных занятиях и в инициативах фирмы." },
        { title: "Юридические исследования", text: "Освойте методологии юридических исследований, анализ дел и подготовку юридических меморандумов с использованием специализированных инструментов и баз данных." },
        { title: "Обслуживание клиентов", text: "Развивайте навыки работы с клиентами, участвуя во встречах, готовя материалы для клиентов и понимая управление отношениями." },
        { title: "Профессиональная этика", text: "Изучите этические стандарты и лучшие практики, которые направляют юридическую профессию в Мексике и на международном уровне." },
        { title: "Культура фирмы", text: "Погрузитесь в нашу культуру сотрудничества, налаживайте связи с юристами всех уровней и стройте прочные профессиональные отношения." },
      ],

      requirementsTitle: "Требования",
      requirementsSubtitle: "Что мы ищем в наших стажерах",
      requirements: [
        "В настоящее время обучается на юридической программе в аккредитованном университете",
        "Предпочтение отдается студентам 3 курса и старше",
        "Высокая академическая успеваемость (минимальный средний балл 8.5 или эквивалент)",
        "Отличные навыки письменного и устного общения на испанском языке",
        "Владение английским языком (предпочтительно средний или продвинутый уровень)",
        "Продемонстрированный интерес к корпоративному праву, судебным процессам или смежным областям",
        "Сильные аналитические способности и умение решать проблемы",
        "Доступность минимум 20 часов в неделю (постоянная программа)",
      ],

      applicationProcessTitle: "Процесс подачи заявки",
      applicationProcessSubtitle: "Как присоединиться к нашей программе стажировки",
      applicationSteps: [
        { step: "1", title: "Подать заявку", text: "Отправьте свое резюме, сопроводительное письмо, академические справки и две профессиональные или академические рекомендации нашей команде по подбору персонала." },
        { step: "2", title: "Первоначальный отбор", text: "Наша команда HR рассматривает все заявки и выбирает кандидатов для следующего этапа на основе квалификации и соответствия." },
        { step: "3", title: "Процесс собеседования", text: "Отобранные кандидаты участвуют в собеседованиях с HR и юристами из соответствующих практических областей." },
        { step: "4", title: "Предложение и адаптация", text: "Успешные кандидаты получают предложение и начинают нашу комплексную программу адаптации." },
      ],

      benefitsTitle: "Преимущества стажировки в Santos & Saucedo",
      benefitsSubtitle: "Инвестируйте в свое будущее вместе с нами",
      benefits: [
        { title: "Программа наставничества", text: "Получите руководство от опытных юристов, которые инвестируют в ваше профессиональное развитие." },
        { title: "Карьерный рост", text: "Многие из наших юристов начинали как стажеры. Выдающиеся сотрудники могут получить предложения о постоянной работе." },
        { title: "Конкурентная стипендия", text: "Получайте конкурентную ежемесячную стипендию, которая признает ценность вашего вклада." },
        { title: "Профессиональная сеть", text: "Стройте связи с юристами, клиентами и коллегами, которые будут длиться всю вашу карьеру." },
        { title: "Гибкие условия", text: "Мы работаем с вами, чтобы сбалансировать стажировку с академическими обязательствами." },
      ],

      ctaTitle: "Как подать заявку",
      ctaInstructions: "Отправьте материалы заявки на:",
      ctaNote: "Пожалуйста, укажите 'Заявка на стажировку - [Ваше имя]' в теме письма. Мы рассматриваем заявки на постоянной основе и свяжемся с квалифицированными кандидатами для собеседования.",
      sendApplication: "Отправить заявку",
      viewCareers: "Все вакансии",
      contactTitle: "Вопросы?",
      contactText: "Есть вопросы о нашей программе стажировки? Свяжитесь с нашей командой по подбору персонала.",
    },
    fr: {
      heroTitle: "Programme de stage",
      heroSubtitle: "Les stagiaires travaillent dès le départ sur de vrais dossiers, aux côtés des associés : audits sur site, révision de conventions collectives, audiences de conciliation et procès.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "Aperçu du programme",
      programOverviewSubtitle: "Deux voies pour démarrer votre carrière juridique",
      summerProgramTitle: "Stage d'été",
      summerProgramDescription: "Notre programme de stage d'été se déroule de juin à août, offrant aux étudiants en droit une expérience intensive pendant leurs vacances académiques. Les stagiaires d'été participent à des dossiers en cours dans plusieurs domaines de pratique, assistent à des sessions de formation et s'exposent à divers aspects de la pratique juridique.",
      summerProgramDuration: "Durée : 10–12 semaines (juin–août)",
      permanentProgramTitle: "Stage permanent",
      permanentProgramDescription: "Notre programme de stage permanent est conçu pour les étudiants en droit en dernière année qui peuvent consacrer des heures à temps partiel ou à temps plein tout au long de l'année académique. Les stagiaires permanents développent une expertise plus approfondie dans des domaines de pratique spécifiques et peuvent évoluer vers des postes d'associé à temps plein après l'obtention de leur diplôme.",
      permanentProgramDuration: "Durée : 6–12 mois (horaire flexible)",

      whatYouLearnTitle: "Ce que vous apprendrez",
      whatYouLearnSubtitle: "Développement complet pour les futurs professionnels du droit",
      learningAreas: [
        { title: "Dynamique de travail", text: "Vivez le travail juridique réel en soutenant les associés et les avocats sur des dossiers actifs." },
        { title: "Diversité et inclusion", text: "Découvrez notre engagement en faveur de la diversité et de l'inclusion à travers des sessions de formation et la participation aux initiatives du cabinet." },
        { title: "Recherche juridique", text: "Maîtrisez les méthodologies de recherche juridique, l'analyse de cas et la préparation de mémorandums juridiques en utilisant des outils et des bases de données spécialisés." },
        { title: "Service client", text: "Développez des compétences orientées client en participant aux réunions, en préparant les livrables clients et en comprenant la gestion des relations." },
        { title: "Éthique professionnelle", text: "Apprenez les normes éthiques et les meilleures pratiques qui guident la profession juridique au Mexique et à l'international." },
        { title: "Culture du cabinet", text: "Immergez-vous dans notre culture collaborative, réseautez avec des avocats à tous les niveaux et construisez des relations professionnelles durables." },
      ],

      requirementsTitle: "Exigences",
      requirementsSubtitle: "Ce que nous recherchons chez nos stagiaires",
      requirements: [
        "Actuellement inscrit dans un programme de droit dans une université accréditée",
        "Étudiants en 3e année ou plus préférés",
        "Excellent dossier académique (moyenne minimale de 8,5 ou équivalent)",
        "Excellentes compétences en communication écrite et orale en espagnol",
        "Maîtrise de l'anglais (niveau intermédiaire à avancé préféré)",
        "Intérêt démontré pour le droit des affaires, le contentieux ou les domaines connexes",
        "Fortes capacités analytiques et de résolution de problèmes",
        "Disponibilité minimum de 20 heures par semaine (programme permanent)",
      ],

      applicationProcessTitle: "Processus de candidature",
      applicationProcessSubtitle: "Comment rejoindre notre programme de stage",
      applicationSteps: [
        { step: "1", title: "Soumettre la candidature", text: "Envoyez votre CV, lettre de motivation, relevés de notes et deux références professionnelles ou académiques à notre équipe de recrutement." },
        { step: "2", title: "Examen initial", text: "Notre équipe RH examine toutes les candidatures et sélectionne les candidats pour l'étape suivante en fonction des qualifications et de l'adéquation." },
        { step: "3", title: "Processus d'entretien", text: "Les candidats sélectionnés participent à des entretiens avec les RH et des avocats des domaines de pratique pertinents." },
        { step: "4", title: "Offre et intégration", text: "Les candidats retenus reçoivent une offre et commencent notre programme d'intégration complet." },
      ],

      benefitsTitle: "Avantages d'un stage chez Santos & Saucedo",
      benefitsSubtitle: "Investissez dans votre avenir avec nous",
      benefits: [
        { title: "Programme de mentorat", text: "Recevez des conseils d'avocats expérimentés qui investissent dans votre développement professionnel." },
        { title: "Évolution de carrière", text: "Beaucoup de nos associés ont commencé comme stagiaires. Les performances exceptionnelles peuvent recevoir des offres à temps plein." },
        { title: "Indemnité compétitive", text: "Recevez une indemnité mensuelle compétitive qui reconnaît la valeur de vos contributions." },
        { title: "Réseau professionnel", text: "Construisez des connexions avec des professionnels du droit, des clients et des pairs qui durent tout au long de votre carrière." },
        { title: "Arrangements flexibles", text: "Nous travaillons avec vous pour équilibrer votre stage avec vos engagements académiques." },
      ],

      ctaTitle: "Comment postuler",
      ctaInstructions: "Envoyez vos documents de candidature à :",
      ctaNote: "Veuillez inclure 'Candidature de stage - [Votre nom]' dans l'objet de votre email. Nous examinons les candidatures en continu et contacterons les candidats qualifiés pour des entretiens.",
      sendApplication: "Envoyer la candidature",
      viewCareers: "Voir toutes les carrières",
      contactTitle: "Questions ?",
      contactText: "Vous avez des questions sur notre programme de stage ? Contactez notre équipe de recrutement.",
    },
    it: {
      heroTitle: "Programma di tirocinio",
      heroSubtitle: "I tirocinanti lavorano fin dall'inizio su incarichi reali, al fianco dei soci: audit negli stabilimenti, revisione dei contratti collettivi, udienze di conciliazione e giudizi.",
      applyEmail: "reclutamiento@santossaucedo.com",
      
      programOverviewTitle: "Panoramica del programma",
      programOverviewSubtitle: "Due percorsi per iniziare la tua carriera legale",
      summerProgramTitle: "Tirocinio estivo",
      summerProgramDescription: "Il nostro programma di tirocinio estivo si svolge da giugno ad agosto, offrendo agli studenti di giurisprudenza un'esperienza intensiva durante la pausa accademica. I tirocinanti estivi partecipano a casi in corso in diverse aree di pratica, frequentano sessioni di formazione e acquisiscono esposizione a vari aspetti della pratica legale.",
      summerProgramDuration: "Durata: 10–12 settimane (giugno–agosto)",
      permanentProgramTitle: "Tirocinio permanente",
      permanentProgramDescription: "Il nostro programma di tirocinio permanente è progettato per studenti di giurisprudenza negli ultimi anni che possono dedicare ore part-time o full-time durante l'anno accademico. I tirocinanti permanenti sviluppano competenze più approfondite in aree di pratica specifiche e possono passare a posizioni di associato a tempo pieno dopo la laurea.",
      permanentProgramDuration: "Durata: 6–12 mesi (orario flessibile)",

      whatYouLearnTitle: "Cosa imparerai",
      whatYouLearnSubtitle: "Sviluppo completo per aspiranti professionisti legali",
      learningAreas: [
        { title: "Dinamiche lavorative", text: "Sperimenta il lavoro legale reale supportando partner e associati in casi attivi." },
        { title: "Diversità e inclusione", text: "Scopri il nostro impegno per la diversità e l'inclusione attraverso sessioni di formazione e la partecipazione alle iniziative dello studio." },
        { title: "Ricerca legale", text: "Padroneggia le metodologie di ricerca legale, l'analisi dei casi e la preparazione di memorandum legali utilizzando strumenti e database specializzati." },
        { title: "Servizio clienti", text: "Sviluppa competenze orientate al cliente partecipando a riunioni, preparando deliverable per i clienti e comprendendo la gestione delle relazioni." },
        { title: "Etica professionale", text: "Impara gli standard etici e le migliori pratiche che guidano la professione legale in Messico e a livello internazionale." },
        { title: "Cultura dello studio", text: "Immergiti nella nostra cultura collaborativa, fai networking con avvocati a tutti i livelli e costruisci relazioni professionali durature." },
      ],

      requirementsTitle: "Requisiti",
      requirementsSubtitle: "Cosa cerchiamo nei nostri tirocinanti",
      requirements: [
        "Attualmente iscritto a un programma di giurisprudenza presso un'università accreditata",
        "Preferenza per studenti del 3° anno o superiore",
        "Ottimo curriculum accademico (media minima 8,5 o equivalente)",
        "Eccellenti capacità di comunicazione scritta e orale in spagnolo",
        "Conoscenza dell'inglese (livello intermedio-avanzato preferito)",
        "Interesse dimostrato per il diritto societario, il contenzioso o campi correlati",
        "Forti capacità analitiche e di problem-solving",
        "Disponibilità minima di 20 ore settimanali (programma permanente)",
      ],

      applicationProcessTitle: "Processo di candidatura",
      applicationProcessSubtitle: "Come partecipare al nostro programma di tirocinio",
      applicationSteps: [
        { step: "1", title: "Invia candidatura", text: "Invia il tuo CV, lettera di presentazione, trascrizioni accademiche e due referenze professionali o accademiche al nostro team di reclutamento." },
        { step: "2", title: "Revisione iniziale", text: "Il nostro team HR esamina tutte le candidature e seleziona i candidati per la fase successiva in base alle qualifiche e all'idoneità." },
        { step: "3", title: "Processo di colloquio", text: "I candidati selezionati partecipano a colloqui con HR e avvocati delle aree di pratica pertinenti." },
        { step: "4", title: "Offerta e onboarding", text: "I candidati idonei ricevono un'offerta e iniziano il nostro programma di onboarding completo." },
      ],

      benefitsTitle: "Vantaggi del tirocinio presso Santos & Saucedo",
      benefitsSubtitle: "Investi nel tuo futuro con noi",
      benefits: [
        { title: "Programma di mentoring", text: "Ricevi la guida di avvocati esperti che investono nel tuo sviluppo professionale." },
        { title: "Crescita professionale", text: "Molti dei nostri associati hanno iniziato come tirocinanti. Le performance eccezionali possono ricevere offerte a tempo pieno." },
        { title: "Compenso competitivo", text: "Ricevi un compenso mensile competitivo che riconosce il valore dei tuoi contributi." },
        { title: "Network professionale", text: "Costruisci connessioni con professionisti legali, clienti e colleghi che durano per tutta la carriera." },
        { title: "Accordi flessibili", text: "Lavoriamo con te per bilanciare il tirocinio con gli impegni accademici." },
      ],

      ctaTitle: "Come candidarsi",
      ctaInstructions: "Invia i tuoi materiali di candidatura a:",
      ctaNote: "Per favore includi 'Candidatura tirocinio - [Il tuo nome]' nell'oggetto dell'email. Esaminiamo le candidature su base continua e contatteremo i candidati qualificati per i colloqui.",
      sendApplication: "Invia candidatura",
      viewCareers: "Vedi tutte le carriere",
      contactTitle: "Domande?",
      contactText: "Hai domande sul nostro programma di tirocinio? Contatta il nostro team di reclutamento.",
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
  const rowClass = "h-full border-t border-ss-rule pt-6";
  const applyHref = `mailto:${t.applyEmail}?subject=${encodeURIComponent(t.heroTitle)}`;

  return (
    <div className="min-h-screen bg-background" data-testid="page-interns">
      <SEOHead page="interns" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-interns-hero">
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
              data-testid="text-interns-title"
            >
              {t.heroTitle}
            </h1>
            <p 
              className="mb-8"
              data-testid="text-interns-subtitle"
            >
              {t.heroSubtitle}
            </p>
            {/* Enlace de texto de la marca (etiqueta, subrayado al pasar, flecha), sin botón con caja */}
            <a
              href={applyHref}
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
            data-testid="section-program-overview"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-program-overview-title"
              >
                {t.programOverviewTitle}
              </h2>
              <p className={leadClass}>
                {t.programOverviewSubtitle}
              </p>
            </div>

            {/* Duración como etiqueta de texto, no como píldora */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              <div className={rowClass} data-testid="card-summer-program">
                <h3 className={`${h3Class} mb-3`}>
                  {t.summerProgramTitle}
                </h3>
                <p className="text-base text-ss-tinta leading-[1.55] mb-4">
                  {t.summerProgramDescription}
                </p>
                <p className="ss-label text-ss-medio">
                  {t.summerProgramDuration}
                </p>
              </div>

              <div className={rowClass} data-testid="card-permanent-program">
                <h3 className={`${h3Class} mb-3`}>
                  {t.permanentProgramTitle}
                </h3>
                <p className="text-base text-ss-tinta leading-[1.55] mb-4">
                  {t.permanentProgramDescription}
                </p>
                <p className="ss-label text-ss-medio">
                  {t.permanentProgramDuration}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 lg:mb-24"
            data-testid="section-what-you-learn"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-what-you-learn-title"
              >
                {t.whatYouLearnTitle}
              </h2>
              <p className={leadClass}>
                {t.whatYouLearnSubtitle}
              </p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t.learningAreas.map((area, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <div 
                    className={rowClass}
                    data-testid={`card-learning-${index}`}
                  >
                    <h3 className={`${h3Class} mb-2`}>
                      {area.title}
                    </h3>
                    <p className="text-base text-ss-tinta leading-[1.55]">
                      {area.text}
                    </p>
                  </div>
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
            data-testid="section-requirements"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-requirements-title"
              >
                {t.requirementsTitle}
              </h2>
              <p className={leadClass}>
                {t.requirementsSubtitle}
              </p>
            </div>

            {/* Lista abierta con filete superior (antes en una caja Hueso) */}
            <div className="border-t border-ss-rule pt-6" data-testid="card-requirements">
              <motion.ul 
                className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {t.requirements.map((requirement, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3"
                    variants={itemVariants}
                    data-testid={`requirement-${index}`}
                  >
                    <span className="mt-[0.75em] h-px w-2.5 flex-shrink-0 bg-ss-medio" aria-hidden="true" />
                    <span className="text-base text-ss-tinta">{requirement}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 lg:mb-24"
            data-testid="section-application-process"
          >
            <div className="max-w-3xl mb-12">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-application-process-title"
              >
                {t.applicationProcessTitle}
              </h2>
              <p className={leadClass}>
                {t.applicationProcessSubtitle}
              </p>
            </div>

            {/* Pasos numerados 01–04 en filas abiertas (numeral Gris Claro sobre blanco) */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t.applicationSteps.map((step, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <NumberedCard
                    index={index}
                    title={step.title}
                    body={step.text}
                    dataTestid={`card-step-${index}`}
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
                  <div 
                    className={rowClass}
                    data-testid={`card-benefit-${index}`}
                  >
                    <h3 className={`${h3Class} mb-2`}>
                      {benefit.title}
                    </h3>
                    <p className="text-base text-ss-tinta leading-[1.55]">
                      {benefit.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Solicitud: instrucciones, el correo como enlace de texto y dos enlaces. Sin tarjeta
              ni la llamada "¿Listo para iniciar tu carrera legal?" */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
            data-testid="section-cta"
          >
            <div className="border-t border-ss-rule pt-8">
              <h2 
                className={`${h2Class} mb-5`}
                data-testid="text-cta-title"
              >
                {t.ctaTitle}
              </h2>
              <p className="text-base text-ss-tinta leading-[1.55] mb-2">
                {t.ctaInstructions}
              </p>
              <a
                href={applyHref}
                className="inline-block text-[19px] text-ss-marino underline decoration-ss-input underline-offset-4 hover:decoration-ss-marino mb-4"
                data-testid="link-cta-email"
              >
                {t.applyEmail}
              </a>
              <p className="text-base text-ss-medio leading-[1.55] max-w-2xl mb-6">
                {t.ctaNote}
              </p>
              <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
                <a
                  href={applyHref}
                  className={textLinkClass}
                  data-testid="button-cta-apply"
                >
                  <span className="ss-link">{t.sendApplication}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    →
                  </span>
                </a>
                <Link
                  href="/careers"
                  className={textLinkClass}
                  data-testid="button-view-careers"
                >
                  <span className="ss-link">{t.viewCareers}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-testid="section-contact"
          >
            {/* Preguntas: una fila abierta con el correo como enlace de texto (antes dentro de un botón) */}
            <div className="border-t border-ss-rule pt-6" data-testid="card-contact">
              <h3 className={`${h3Class} mb-1`}>
                {t.contactTitle}
              </h3>
              <p className="text-base text-ss-tinta leading-[1.55]">
                {t.contactText}{" "}
                <a
                  href={`mailto:${t.applyEmail}`}
                  className="text-ss-marino underline decoration-ss-input underline-offset-4 hover:decoration-ss-marino"
                  data-testid="button-contact-email"
                >
                  {t.applyEmail}
                </a>
              </p>
            </div>
          </motion.section>

        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
