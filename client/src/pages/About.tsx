import { motion } from "framer-motion";
import { 
  Building2, 
  Sparkles,
  UserCheck,
  Target,
  TrendingUp,
  Handshake,
  GraduationCap,
  Coffee,
  Lightbulb,
  Shield,
  BarChart3,
  UsersRound,
  HeartHandshake
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow, NumberedCard } from "@/components/editorial";
import { TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { keepFirmName } from "@/lib/firmName";
import type { LanguageCode } from "@shared/schema";

// Cifras de /about: "35+" (sin tocar) y "72+" ciudades con presencia, la forma en cifras de
// "más de 72" (redacción aprobada de la portada: "Ciudades con presencia"). Fuera el conteo de
// integrantes, el número de prácticas y "1 oficina".
const citiesLabel: Record<LanguageCode, string> = {
  es: "Ciudades con presencia",
  en: "Cities with presence",
  de: "Städte mit Präsenz",
  zh: "覆盖城市",
  ko: "진출 도시",
  ja: "展開都市",
  ar: "مدينة نتواجد فيها",
  ru: "Городов присутствия",
  fr: "Villes de présence",
  it: "Città con presenza",
};

export default function About() {
  const { language } = useLanguage();

  const content: Record<LanguageCode, {
    title: string;
    subtitle: string;
    historyTitle: string;
    historyText1: string;
    historyText2: string;
    valuesTitle: string;
    /** "Cómo trabajamos" de la redacción aprobada (Nuestra firma): cuatro principios */
    values: { title: string; text: string }[];
    cultureTitle: string;
    cultureSubtitle: string;
    cultureIntro: string;
    cultureAspects: { icon: typeof Building2; title: string; text: string }[];
    diversityTitle: string;
    diversitySubtitle: string;
    diversityIntro: string;
    diversityStats: { value: string; label: string; icon: typeof UsersRound }[];
    diversityInitiatives: { icon: typeof UserCheck; title: string; text: string }[];
    diversityCommitment: string;
    statsTitle: string;
    stats: { value: string; label: string }[];
    rankingsTitle: string;
    rankingsText: string;
    rankings: string[];
    proBonoTitle: string;
    proBonoText: string;
    careersTitle: string;
    careersText: string;
    learnMore: string;
    viewTeam: string;
    viewPractices: string;
  }> = {
    en: {
      title: "About the Firm",
      subtitle: "More than 35 years of experience in corporate labor law",
      historyTitle: "Our History",
      historyText1: "Santos & Saucedo is a boutique firm specialized in Labor Law, with more than 35 years advising national and international companies. From San Pedro Garza García, Nuevo León, we counsel our clients' management, human resources, and in-house legal teams.",
      historyText2: "A company’s decisions about its personnel are rarely only a labor matter: they affect the corporation, its contracts with third parties and, increasingly, people who come from other countries. Out of respect for the confidentiality of its clients’ matters, the firm does not publish their names.",
      valuesTitle: "How we work",
      values: [
        { title: "Prevention", text: "We review before the authorities do. A timely audit costs less than a lawsuit and often makes one unnecessary." },
        { title: "Accountability", text: "Every matter is handled by a partner who knows the client and answers for the work from start to finish." },
        { title: "Candor", text: "We say what we see, even when it is not what is expected. Sometimes the best advice is not to litigate." },
        { title: "Consistency", text: "The same judgment across all of a client's workplaces, in any city in the country." },
      ],
      cultureTitle: "Our Culture",
      cultureSubtitle: "A workplace where talent thrives and excellence is the standard",
      cultureIntro: "At Santos & Saucedo, we have cultivated a unique culture that blends professional rigor with a supportive and collaborative environment. Our attorneys work alongside some of the most talented legal professionals in Mexico, fostering an atmosphere of continuous learning and mutual respect.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "Modern Work Environment", 
          text: "State-of-the-art facilities designed to promote collaboration, creativity, and well-being. Our offices feature open spaces, meeting rooms with cutting-edge technology, and areas for relaxation and informal gatherings."
        },
        { 
          icon: Handshake, 
          title: "Team Collaboration", 
          text: "We believe the best legal solutions come from diverse perspectives. Our practice groups work seamlessly together, combining specialized expertise to deliver comprehensive counsel to our clients."
        },
        { 
          icon: GraduationCap, 
          title: "Professional Development", 
          text: "Continuous education is fundamental to our firm. We invest in training programs, mentorship opportunities, and support for advanced degrees and certifications to help our attorneys reach their full potential."
        },
        { 
          icon: HeartHandshake, 
          title: "Community Involvement", 
          text: "We are committed to giving back. Through pro bono work, partnerships with NGOs, and support for legal education initiatives, we strive to make a positive impact beyond our practice."
        },
        { 
          icon: Coffee, 
          title: "Work-Life Balance", 
          text: "We recognize that sustainable success requires balance. Our firm promotes flexible arrangements and wellness initiatives to support our team members both professionally and personally."
        },
        { 
          icon: Lightbulb, 
          title: "Innovation Mindset", 
          text: "We encourage creative thinking and embrace technology to deliver more efficient and effective legal services. Our culture rewards initiative and values new ideas from every level of the organization."
        },
      ],
      diversityTitle: "Diversity & Inclusion",
      diversitySubtitle: "Building a more inclusive legal profession",
      diversityIntro: "Santos & Saucedo is committed to fostering a diverse and inclusive workplace where every individual is valued, respected, and empowered to succeed. We believe that diversity of thought, background, and experience strengthens our firm and enhances the quality of service we provide to our clients.",
      diversityStats: [
        { value: "45%", label: "Women in the Firm", icon: UsersRound },
        { value: "35%", label: "Women Partners", icon: TrendingUp },
        { value: "50%", label: "Women in Leadership Roles", icon: Target },
        { value: "100%", label: "Equal Opportunity Commitment", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "Inclusive Hiring", 
          text: "Our recruitment practices are designed to attract and evaluate candidates based solely on their skills, experience, and potential, ensuring equal opportunities for all regardless of gender, background, or personal circumstances."
        },
        { 
          icon: BarChart3, 
          title: "Gender Equality", 
          text: "We actively promote gender equality at all levels of the organization. Our programs support the advancement of women in leadership positions and ensure equitable compensation and growth opportunities."
        },
        { 
          icon: Sparkles, 
          title: "Equal Opportunities", 
          text: "Every team member has access to the same development resources, challenging assignments, and career advancement paths. We are committed to removing barriers and creating pathways for success for all."
        },
        { 
          icon: Shield, 
          title: "Inclusive Workplace", 
          text: "We foster an environment where differences are celebrated and all voices are heard. Our policies and practices ensure that every individual feels safe, respected, and able to bring their authentic self to work."
        },
      ],
      diversityCommitment: "Our commitment to diversity and inclusion is not just a policy—it's a core value that shapes how we work, grow, and serve our clients. We continuously evaluate and improve our practices to ensure we remain at the forefront of creating a more equitable legal profession.",
      statsTitle: "Our Firm in Numbers",
      stats: [
        { value: "35+", label: "Years of Experience" },
      ],
      rankingsTitle: "Rankings & Recognition",
      rankingsText: "Santos & Saucedo is consistently recognized as one of the leading law firms in Mexico by the most prestigious legal directories worldwide.",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "Pro Bono",
      proBonoText: "We are deeply committed to providing pro bono legal services to those in need. Our attorneys dedicate significant time to supporting charitable organizations, human rights causes, and access to justice initiatives.",
      careersTitle: "Careers",
      careersText: "Join one of Mexico's leading law firms and build your career with the best. We offer exceptional opportunities for growth and development.",
      learnMore: "Learn More",
      viewTeam: "View Our Team",
      viewPractices: "View Practice Areas",
    },
    es: {
      title: "Acerca de la firma",
      subtitle: "Más de 35 años de experiencia en derecho laboral empresarial",
      historyTitle: "Nuestra historia",
      historyText1: "Santos & Saucedo es un despacho boutique especializado en derecho laboral, con más de 35 años acompañando a empresas nacionales e internacionales. Desde San Pedro Garza García, Nuevo León, asesoramos a la dirección, a recursos humanos y a los equipos legales internos de nuestros clientes.",
      historyText2: "Las decisiones de una empresa sobre su personal rara vez son solo laborales: tocan a la sociedad, a los contratos con terceros y, cada vez más, a personas que llegan de otros países. Por respeto a la confidencialidad de sus asuntos, la firma no publica los nombres de sus clientes.",
      valuesTitle: "Cómo trabajamos",
      values: [
        { title: "Prevención", text: "Revisamos antes de que lo haga la autoridad. Una auditoría a tiempo cuesta menos que un juicio y con frecuencia lo hace innecesario." },
        { title: "Responsabilidad", text: "Cada asunto lo atiende un socio que conoce al cliente y responde por el trabajo de principio a fin." },
        { title: "Franqueza", text: "Decimos lo que vemos, aunque no sea lo que se espera. A veces el mejor consejo es no litigar." },
        { title: "Consistencia", text: "El mismo criterio en todos los centros de trabajo de un cliente, en cualquier ciudad del país." },
      ],
      cultureTitle: "Nuestra cultura",
      cultureSubtitle: "Un lugar de trabajo donde el talento prospera y la excelencia es el estándar",
      cultureIntro: "En Santos & Saucedo, hemos cultivado una cultura única que combina el rigor profesional con un ambiente de apoyo y colaboración. Nuestros abogados trabajan junto a algunos de los profesionales legales más talentosos de México, fomentando una atmósfera de aprendizaje continuo y respeto mutuo.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "Ambiente de trabajo moderno", 
          text: "Instalaciones de vanguardia diseñadas para promover la colaboración, la creatividad y el bienestar. Nuestras oficinas cuentan con espacios abiertos, salas de reuniones con tecnología de punta y áreas para relajación y reuniones informales."
        },
        { 
          icon: Handshake, 
          title: "Colaboración en equipo", 
          text: "Creemos que las mejores soluciones legales provienen de perspectivas diversas. Nuestros grupos de práctica trabajan de manera integrada, combinando experiencia especializada para brindar asesoría integral a nuestros clientes."
        },
        { 
          icon: GraduationCap, 
          title: "Desarrollo profesional", 
          text: "La educación continua es fundamental para nuestra firma. Invertimos en programas de capacitación, oportunidades de mentoría y apoyo para estudios avanzados y certificaciones para ayudar a nuestros abogados a alcanzar su máximo potencial."
        },
        { 
          icon: HeartHandshake, 
          title: "Participación comunitaria", 
          text: "Estamos comprometidos con retribuir a la sociedad. A través del trabajo pro bono, asociaciones con ONGs y apoyo a iniciativas de educación legal, nos esforzamos por generar un impacto positivo más allá de nuestra práctica."
        },
        { 
          icon: Coffee, 
          title: "Equilibrio vida-trabajo", 
          text: "Reconocemos que el éxito sostenible requiere equilibrio. Nuestra firma promueve arreglos flexibles e iniciativas de bienestar para apoyar a los miembros de nuestro equipo tanto profesional como personalmente."
        },
        { 
          icon: Lightbulb, 
          title: "Mentalidad de innovación", 
          text: "Fomentamos el pensamiento creativo y adoptamos tecnología para brindar servicios legales más eficientes y efectivos. Nuestra cultura recompensa la iniciativa y valora las nuevas ideas de todos los niveles de la organización."
        },
      ],
      diversityTitle: "Diversidad e inclusión",
      diversitySubtitle: "Construyendo una profesión legal más inclusiva",
      diversityIntro: "Santos & Saucedo está comprometido con fomentar un lugar de trabajo diverso e inclusivo donde cada individuo sea valorado, respetado y empoderado para triunfar. Creemos que la diversidad de pensamiento, antecedentes y experiencia fortalece nuestra firma y mejora la calidad del servicio que brindamos a nuestros clientes.",
      diversityStats: [
        { value: "45%", label: "Mujeres en la firma", icon: UsersRound },
        { value: "35%", label: "Mujeres socias", icon: TrendingUp },
        { value: "50%", label: "Mujeres en roles de liderazgo", icon: Target },
        { value: "100%", label: "Compromiso con igualdad de oportunidades", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "Contratación inclusiva", 
          text: "Nuestras prácticas de reclutamiento están diseñadas para atraer y evaluar candidatos basándose únicamente en sus habilidades, experiencia y potencial, asegurando igualdad de oportunidades para todos sin importar género, antecedentes o circunstancias personales."
        },
        { 
          icon: BarChart3, 
          title: "Igualdad de género", 
          text: "Promovemos activamente la igualdad de género en todos los niveles de la organización. Nuestros programas apoyan el avance de mujeres en posiciones de liderazgo y aseguran compensación equitativa y oportunidades de crecimiento."
        },
        { 
          icon: Sparkles, 
          title: "Igualdad de oportunidades", 
          text: "Cada miembro del equipo tiene acceso a los mismos recursos de desarrollo, asignaciones desafiantes y caminos de avance profesional. Estamos comprometidos a remover barreras y crear caminos hacia el éxito para todos."
        },
        { 
          icon: Shield, 
          title: "Ambiente inclusivo", 
          text: "Fomentamos un entorno donde las diferencias se celebran y todas las voces son escuchadas. Nuestras políticas y prácticas aseguran que cada individuo se sienta seguro, respetado y capaz de ser auténtico en el trabajo."
        },
      ],
      diversityCommitment: "Nuestro compromiso con la diversidad e inclusión no es solo una política—es un valor fundamental que moldea cómo trabajamos, crecemos y servimos a nuestros clientes. Continuamente evaluamos y mejoramos nuestras prácticas para asegurar que estemos a la vanguardia en la creación de una profesión legal más equitativa.",
      statsTitle: "Nuestra firma en números",
      stats: [
        { value: "35+", label: "Años de experiencia" },
      ],
      rankingsTitle: "Rankings y reconocimientos",
      rankingsText: "Santos & Saucedo es consistentemente reconocido como uno de los principales despachos de abogados en México por los directorios legales más prestigiosos del mundo.",
      rankings: [
        "Chambers and Partners Global - Banda 1",
        "Chambers and Partners Latin America - Banda 1",
        "Legal 500 Latin America - Nivel 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Nivel 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "Pro bono",
      proBonoText: "Estamos profundamente comprometidos con brindar servicios legales pro bono a quienes más lo necesitan. Nuestros abogados dedican tiempo significativo a apoyar organizaciones benéficas, causas de derechos humanos e iniciativas de acceso a la justicia.",
      careersTitle: "Carreras",
      careersText: "Únase a uno de los principales despachos de abogados de México y construya su carrera con los mejores. Ofrecemos oportunidades excepcionales de crecimiento y desarrollo.",
      learnMore: "Conocer más",
      viewTeam: "Ver nuestro equipo",
      viewPractices: "Ver prácticas",
    },
    de: {
      title: "Über die Kanzlei",
      subtitle: "Mehr als 35 Jahre Erfahrung im Arbeitsrecht für Unternehmen",
      historyTitle: "Unsere Geschichte",
      historyText1: "Santos & Saucedo ist eine auf Arbeitsrecht spezialisierte Boutique-Kanzlei, die seit mehr als 35 Jahren nationale und internationale Unternehmen berät. Von San Pedro Garza García, Nuevo León aus beraten wir die Geschäftsführung, die Personalabteilung und die internen Rechtsteams unserer Mandanten.",
      historyText2: "Die Entscheidungen eines Unternehmens über sein Personal sind selten rein arbeitsrechtlich: Sie berühren die Gesellschaft, die Verträge mit Dritten und zunehmend Menschen, die aus anderen Ländern kommen. Aus Rücksicht auf die Vertraulichkeit ihrer Angelegenheiten veröffentlicht die Kanzlei die Namen ihrer Mandanten nicht.",
      valuesTitle: "Wie wir arbeiten",
      values: [
        { title: "Prävention", text: "Wir prüfen, bevor es die Behörde tut. Ein rechtzeitiges Audit kostet weniger als ein Prozess und macht ihn oft überflüssig." },
        { title: "Verantwortung", text: "Jedes Mandat betreut ein Partner, der den Mandanten kennt und von Anfang bis Ende für die Arbeit einsteht." },
        { title: "Offenheit", text: "Wir sagen, was wir sehen, auch wenn es nicht das ist, was man erwartet. Manchmal ist der beste Rat, keinen Prozess zu führen." },
        { title: "Beständigkeit", text: "Derselbe Maßstab an allen Arbeitsstätten eines Mandanten, in jeder Stadt des Landes." },
      ],
      cultureTitle: "Unsere Kultur",
      cultureSubtitle: "Ein Arbeitsplatz, an dem Talente gedeihen und Exzellenz der Standard ist",
      cultureIntro: "Bei Santos & Saucedo haben wir eine einzigartige Kultur entwickelt, die professionelle Strenge mit einer unterstützenden und kollegialen Umgebung verbindet. Unsere Anwälte arbeiten mit einigen der talentiertesten Juristen Mexikos zusammen und fördern eine Atmosphäre des kontinuierlichen Lernens und gegenseitigen Respekts.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "Moderne Arbeitsumgebung", 
          text: "Hochmoderne Einrichtungen, die Zusammenarbeit, Kreativität und Wohlbefinden fördern. Unsere Büros verfügen über offene Räume, Besprechungsräume mit modernster Technologie und Bereiche zur Entspannung und für informelle Treffen."
        },
        { 
          icon: Handshake, 
          title: "Teamzusammenarbeit", 
          text: "Wir glauben, dass die besten rechtlichen Lösungen aus verschiedenen Perspektiven entstehen. Unsere Praxisgruppen arbeiten nahtlos zusammen und kombinieren spezialisiertes Fachwissen, um unseren Mandanten umfassende Beratung zu bieten."
        },
        { 
          icon: GraduationCap, 
          title: "Berufliche Entwicklung", 
          text: "Kontinuierliche Weiterbildung ist für unsere Kanzlei von grundlegender Bedeutung. Wir investieren in Schulungsprogramme, Mentoring-Möglichkeiten und Unterstützung für weiterführende Abschlüsse und Zertifizierungen, um unseren Anwälten zu helfen, ihr volles Potenzial auszuschöpfen."
        },
        { 
          icon: HeartHandshake, 
          title: "Gesellschaftliches Engagement", 
          text: "Wir sind bestrebt, etwas zurückzugeben. Durch Pro-Bono-Arbeit, Partnerschaften mit NGOs und Unterstützung von Initiativen zur Rechtsbildung streben wir danach, über unsere Praxis hinaus eine positive Wirkung zu erzielen."
        },
        { 
          icon: Coffee, 
          title: "Work-Life-Balance", 
          text: "Wir erkennen an, dass nachhaltiger Erfolg ein Gleichgewicht erfordert. Unsere Kanzlei fördert flexible Arbeitsmodelle und Wellness-Initiativen, um unsere Teammitglieder sowohl beruflich als auch persönlich zu unterstützen."
        },
        { 
          icon: Lightbulb, 
          title: "Innovationsmentalität", 
          text: "Wir fördern kreatives Denken und nutzen Technologie, um effizientere und effektivere Rechtsdienstleistungen zu erbringen. Unsere Kultur belohnt Initiative und schätzt neue Ideen aus allen Ebenen der Organisation."
        },
      ],
      diversityTitle: "Vielfalt und Inklusion",
      diversitySubtitle: "Aufbau einer inklusiveren Rechtsbranche",
      diversityIntro: "Santos & Saucedo setzt sich für die Förderung eines vielfältigen und inklusiven Arbeitsplatzes ein, an dem jeder Einzelne geschätzt, respektiert und zum Erfolg befähigt wird. Wir glauben, dass Vielfalt in Gedanken, Hintergründen und Erfahrungen unsere Kanzlei stärkt und die Qualität der Dienstleistungen, die wir unseren Mandanten bieten, verbessert.",
      diversityStats: [
        { value: "45%", label: "Frauen in der Kanzlei", icon: UsersRound },
        { value: "35%", label: "Partnerinnen", icon: TrendingUp },
        { value: "50%", label: "Frauen in Führungspositionen", icon: Target },
        { value: "100%", label: "Engagement für Chancengleichheit", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "Inklusive Einstellung", 
          text: "Unsere Rekrutierungspraktiken sind darauf ausgerichtet, Kandidaten ausschließlich auf der Grundlage ihrer Fähigkeiten, Erfahrungen und ihres Potenzials anzuziehen und zu bewerten und Chancengleichheit für alle zu gewährleisten, unabhängig von Geschlecht, Herkunft oder persönlichen Umständen."
        },
        { 
          icon: BarChart3, 
          title: "Geschlechtergleichstellung", 
          text: "Wir fördern aktiv die Gleichstellung der Geschlechter auf allen Ebenen der Organisation. Unsere Programme unterstützen den Aufstieg von Frauen in Führungspositionen und gewährleisten eine faire Vergütung und Wachstumschancen."
        },
        { 
          icon: Sparkles, 
          title: "Chancengleichheit", 
          text: "Jedes Teammitglied hat Zugang zu denselben Entwicklungsressourcen, anspruchsvollen Aufgaben und Karrieremöglichkeiten. Wir sind bestrebt, Barrieren abzubauen und Wege zum Erfolg für alle zu schaffen."
        },
        { 
          icon: Shield, 
          title: "Inklusiver Arbeitsplatz", 
          text: "Wir fördern ein Umfeld, in dem Unterschiede gefeiert werden und alle Stimmen gehört werden. Unsere Richtlinien und Praktiken stellen sicher, dass sich jeder Einzelne sicher, respektiert und in der Lage fühlt, sein authentisches Selbst bei der Arbeit einzubringen."
        },
      ],
      diversityCommitment: "Unser Engagement für Vielfalt und Inklusion ist nicht nur eine Richtlinie – es ist ein Grundwert, der prägt, wie wir arbeiten, wachsen und unsere Mandanten betreuen. Wir evaluieren und verbessern unsere Praktiken kontinuierlich, um an der Spitze der Schaffung einer gerechteren Rechtsbranche zu bleiben.",
      statsTitle: "Unsere Kanzlei in Zahlen",
      stats: [
        { value: "35+", label: "Jahre Erfahrung" },
      ],
      rankingsTitle: "Rankings und Auszeichnungen",
      rankingsText: "Santos & Saucedo wird von den renommiertesten Rechtsverzeichnissen weltweit durchgehend als eine der führenden Anwaltskanzleien in Mexiko anerkannt.",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "Pro Bono",
      proBonoText: "Wir sind zutiefst dem Ziel verpflichtet, Pro-Bono-Rechtsdienstleistungen für Bedürftige zu erbringen. Unsere Anwälte widmen erhebliche Zeit der Unterstützung von Wohltätigkeitsorganisationen, Menschenrechtsanliegen und Initiativen für den Zugang zur Justiz.",
      careersTitle: "Karriere",
      careersText: "Werden Sie Teil einer der führenden Anwaltskanzleien Mexikos und bauen Sie Ihre Karriere mit den Besten auf. Wir bieten außergewöhnliche Möglichkeiten für Wachstum und Entwicklung.",
      learnMore: "Mehr erfahren",
      viewTeam: "Unser Team ansehen",
      viewPractices: "Praxisbereiche ansehen",
    },
    zh: {
      title: "关于律所",
      subtitle: "在企业劳动法领域拥有超过35年的经验",
      historyTitle: "我们的历史",
      historyText1: "Santos & Saucedo 是一家专注于劳动法的精品律师事务所，拥有超过35年为国内外企业提供服务的经验。我们立足于新莱昂州圣佩德罗-加尔萨-加西亚，为客户的管理层、人力资源部门和内部法务团队提供咨询。",
      historyText2: "企业关于员工的决定很少只是劳动问题：它们涉及公司本身、与第三方的合同，也越来越多地涉及来自其他国家的人员。出于对客户事务保密的尊重，本所不公开客户名称。",
      valuesTitle: "我们的工作方式",
      values: [
        { title: "预防", text: "我们赶在主管机关之前进行审查。及时的审计比诉讼成本更低，而且往往使诉讼不再必要。" },
        { title: "责任", text: "每一项事务都由一位了解客户的合伙人亲自负责，自始至终对工作承担责任。" },
        { title: "坦诚", text: "我们直言所见，即使那并非对方所期待的。有时，最好的建议是不打官司。" },
        { title: "一致", text: "客户在全国任何城市的每一个工作场所，都适用同一标准。" },
      ],
      cultureTitle: "我们的文化",
      cultureSubtitle: "人才蓬勃发展、卓越为标准的工作场所",
      cultureIntro: "在Santos & Saucedo，我们培养了一种独特的文化，将专业严谨与支持性和协作性的环境相结合。我们的律师与墨西哥一些最有才华的法律专业人士一起工作，营造持续学习和相互尊重的氛围。",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "现代化工作环境", 
          text: "先进的设施旨在促进协作、创造力和健康。我们的办公室设有开放空间、配备尖端技术的会议室以及用于放松和非正式聚会的区域。"
        },
        { 
          icon: Handshake, 
          title: "团队协作", 
          text: "我们相信最佳的法律解决方案来自多元化的视角。我们的业务组无缝协作，结合专业知识为客户提供全面的建议。"
        },
        { 
          icon: GraduationCap, 
          title: "职业发展", 
          text: "持续教育是我们事务所的基础。我们投资于培训项目、导师机会以及对高级学位和认证的支持，帮助我们的律师充分发挥潜力。"
        },
        { 
          icon: HeartHandshake, 
          title: "社区参与", 
          text: "我们致力于回馈社会。通过公益工作、与非政府组织的合作以及对法律教育倡议的支持，我们努力在业务之外产生积极影响。"
        },
        { 
          icon: Coffee, 
          title: "工作与生活平衡", 
          text: "我们认识到可持续的成功需要平衡。我们的事务所推行灵活的工作安排和健康倡议，在职业和个人方面支持我们的团队成员。"
        },
        { 
          icon: Lightbulb, 
          title: "创新思维", 
          text: "我们鼓励创造性思维并采用技术来提供更高效、更有效的法律服务。我们的文化奖励主动性，重视组织各级的新想法。"
        },
      ],
      diversityTitle: "多元化与包容性",
      diversitySubtitle: "建设更具包容性的法律行业",
      diversityIntro: "Santos & Saucedo致力于营造多元化和包容性的工作场所，让每个人都受到重视、尊重并获得成功的能力。我们相信，思想、背景和经验的多样性增强了我们事务所的实力，提高了我们为客户提供的服务质量。",
      diversityStats: [
        { value: "45%", label: "事务所女性比例", icon: UsersRound },
        { value: "35%", label: "女性合伙人", icon: TrendingUp },
        { value: "50%", label: "领导层女性比例", icon: Target },
        { value: "100%", label: "机会平等承诺", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "包容性招聘", 
          text: "我们的招聘实践旨在仅根据候选人的技能、经验和潜力来吸引和评估他们，确保所有人无论性别、背景或个人情况如何都享有平等机会。"
        },
        { 
          icon: BarChart3, 
          title: "性别平等", 
          text: "我们积极促进组织各级的性别平等。我们的项目支持女性晋升到领导职位，并确保公平的薪酬和成长机会。"
        },
        { 
          icon: Sparkles, 
          title: "平等机会", 
          text: "每位团队成员都可以获得相同的发展资源、具有挑战性的任务和职业晋升途径。我们致力于消除障碍，为所有人创造成功之路。"
        },
        { 
          icon: Shield, 
          title: "包容性工作场所", 
          text: "我们营造一个庆祝差异、倾听所有声音的环境。我们的政策和实践确保每个人都感到安全、受到尊重，并能够在工作中展现真实的自我。"
        },
      ],
      diversityCommitment: "我们对多元化和包容性的承诺不仅仅是一项政策——它是塑造我们如何工作、成长和服务客户的核心价值观。我们不断评估和改进我们的实践，以确保我们在创建更公平的法律行业方面保持领先地位。",
      statsTitle: "事务所数据",
      stats: [
        { value: "35+", label: "年经验" },
      ],
      rankingsTitle: "排名与认可",
      rankingsText: "Santos & Saucedo被全球最负盛名的法律目录持续评为墨西哥领先的律师事务所之一。",
      rankings: [
        "Chambers and Partners Global - 第一级",
        "Chambers and Partners Latin America - 第一级",
        "Legal 500 Latin America - 第一等级",
        "Latin Lawyer 250 - 精英",
        "IFLR1000 - 第一等级",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "公益服务",
      proBonoText: "我们深切致力于为有需要的人提供公益法律服务。我们的律师投入大量时间支持慈善组织、人权事业和司法公正倡议。",
      careersTitle: "职业机会",
      careersText: "加入墨西哥领先的律师事务所之一，与最优秀的人一起建立您的职业生涯。我们提供卓越的成长和发展机会。",
      learnMore: "了解更多",
      viewTeam: "查看我们的团队",
      viewPractices: "查看业务领域",
    },
    ko: {
      title: "회사 소개",
      subtitle: "기업 노동법 분야에서 35년 이상의 경험",
      historyTitle: "우리의 역사",
      historyText1: "Santos & Saucedo는 노동법을 전문으로 하는 부티크 로펌으로, 35년 이상 국내외 기업을 자문해 왔습니다. 누에보레온주 산페드로 가르사 가르시아에서 고객사의 경영진, 인사부서 및 사내 법무팀을 자문합니다.",
      historyText2: "인력에 관한 기업의 결정은 노동 문제에 그치는 경우가 드뭅니다. 회사 자체와 제3자와의 계약, 그리고 점점 더 다른 나라에서 오는 사람들과도 관련됩니다. 고객 사안의 기밀을 존중하여 법인은 고객의 이름을 공개하지 않습니다.",
      valuesTitle: "일하는 방식",
      values: [
        { title: "예방", text: "당국보다 먼저 검토합니다. 적시에 실시한 감사는 소송보다 비용이 적게 들고, 소송 자체를 불필요하게 만드는 경우가 많습니다." },
        { title: "책임", text: "모든 사안은 고객을 잘 아는 파트너가 맡아 처음부터 끝까지 책임집니다." },
        { title: "솔직함", text: "기대와 다르더라도 보이는 그대로 말씀드립니다. 때로는 소송하지 않는 것이 최선의 조언입니다." },
        { title: "일관성", text: "전국 어느 도시에서든 고객의 모든 사업장에 같은 기준을 적용합니다." },
      ],
      cultureTitle: "우리의 문화",
      cultureSubtitle: "재능이 번창하고 탁월함이 표준인 직장",
      cultureIntro: "Santos & Saucedo에서 우리는 전문적인 엄격함과 지원적이고 협력적인 환경을 조화시킨 독특한 문화를 발전시켜 왔습니다. 우리 변호사들은 멕시코에서 가장 재능 있는 법률 전문가들과 함께 일하며, 지속적인 학습과 상호 존중의 분위기를 조성합니다.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "현대적인 업무 환경", 
          text: "협업, 창의성 및 웰빙을 촉진하도록 설계된 최첨단 시설. 저희 사무실은 개방형 공간, 최첨단 기술을 갖춘 회의실, 휴식 및 비공식 모임을 위한 공간을 갖추고 있습니다."
        },
        { 
          icon: Handshake, 
          title: "팀 협력", 
          text: "우리는 최고의 법률 솔루션이 다양한 관점에서 나온다고 믿습니다. 저희 실무 그룹들은 원활하게 협력하여 전문 지식을 결합하고 고객에게 포괄적인 자문을 제공합니다."
        },
        { 
          icon: GraduationCap, 
          title: "전문성 개발", 
          text: "지속적인 교육은 저희 법인의 기본입니다. 우리는 교육 프로그램, 멘토링 기회, 고급 학위 및 자격증 취득 지원에 투자하여 변호사들이 최대한의 잠재력을 발휘할 수 있도록 돕습니다."
        },
        { 
          icon: HeartHandshake, 
          title: "지역사회 참여", 
          text: "우리는 사회에 환원하기 위해 노력합니다. 프로보노 활동, NGO와의 파트너십, 법률 교육 이니셔티브 지원을 통해 우리 업무 범위를 넘어 긍정적인 영향을 미치기 위해 노력합니다."
        },
        { 
          icon: Coffee, 
          title: "일과 삶의 균형", 
          text: "우리는 지속 가능한 성공에는 균형이 필요하다는 것을 인식합니다. 저희 법인은 유연한 근무 제도와 웰빙 이니셔티브를 통해 팀원들을 직업적으로나 개인적으로 지원합니다."
        },
        { 
          icon: Lightbulb, 
          title: "혁신 마인드", 
          text: "우리는 창의적 사고를 장려하고 기술을 활용하여 보다 효율적이고 효과적인 법률 서비스를 제공합니다. 우리의 문화는 주도성을 보상하고 조직의 모든 수준에서 새로운 아이디어를 가치 있게 여깁니다."
        },
      ],
      diversityTitle: "다양성 및 포용성",
      diversitySubtitle: "보다 포용적인 법률 전문직 구축",
      diversityIntro: "Santos & Saucedo는 모든 개인이 가치 있게 여겨지고, 존중받으며, 성공할 수 있는 힘을 부여받는 다양하고 포용적인 직장을 조성하기 위해 노력합니다. 우리는 생각, 배경 및 경험의 다양성이 우리 법인을 강화하고 고객에게 제공하는 서비스의 품질을 향상시킨다고 믿습니다.",
      diversityStats: [
        { value: "45%", label: "법인 내 여성 비율", icon: UsersRound },
        { value: "35%", label: "여성 파트너", icon: TrendingUp },
        { value: "50%", label: "리더십 역할의 여성", icon: Target },
        { value: "100%", label: "기회 균등 약속", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "포용적 채용", 
          text: "저희 채용 관행은 성별, 배경 또는 개인적 상황에 관계없이 모든 사람에게 동등한 기회를 보장하면서 기술, 경험 및 잠재력만을 기준으로 후보자를 유치하고 평가하도록 설계되었습니다."
        },
        { 
          icon: BarChart3, 
          title: "성평등", 
          text: "우리는 조직의 모든 수준에서 성평등을 적극적으로 촉진합니다. 저희 프로그램은 여성의 리더십 직위 승진을 지원하고 공정한 보상과 성장 기회를 보장합니다."
        },
        { 
          icon: Sparkles, 
          title: "평등한 기회", 
          text: "모든 팀원은 동일한 개발 자원, 도전적인 과제 및 경력 발전 경로에 접근할 수 있습니다. 우리는 장벽을 제거하고 모든 사람을 위한 성공의 길을 만들기 위해 노력합니다."
        },
        { 
          icon: Shield, 
          title: "포용적 직장", 
          text: "우리는 차이가 축하되고 모든 목소리가 경청되는 환경을 조성합니다. 저희 정책과 관행은 모든 개인이 안전하고 존중받으며 직장에서 진정한 자신을 표현할 수 있도록 보장합니다."
        },
      ],
      diversityCommitment: "다양성과 포용성에 대한 우리의 약속은 단순한 정책이 아닙니다. 이는 우리가 일하고, 성장하고, 고객에게 서비스를 제공하는 방식을 형성하는 핵심 가치입니다. 우리는 보다 공평한 법률 전문직을 만드는 데 앞장서기 위해 지속적으로 관행을 평가하고 개선합니다.",
      statsTitle: "숫자로 보는 우리 법인",
      stats: [
        { value: "35+", label: "년의 경험" },
      ],
      rankingsTitle: "순위 및 인정",
      rankingsText: "Santos & Saucedo는 전 세계에서 가장 권위 있는 법률 디렉토리에 의해 멕시코의 선도적인 로펌 중 하나로 지속적으로 인정받고 있습니다.",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "프로보노",
      proBonoText: "우리는 도움이 필요한 사람들에게 프로보노 법률 서비스를 제공하는 데 깊이 헌신하고 있습니다. 저희 변호사들은 자선 단체, 인권 활동 및 사법 접근성 이니셔티브를 지원하는 데 상당한 시간을 투자합니다.",
      careersTitle: "채용",
      careersText: "멕시코 최고의 로펌 중 하나에 합류하여 최고와 함께 경력을 쌓으세요. 우리는 성장과 발전을 위한 탁월한 기회를 제공합니다.",
      learnMore: "자세히 알아보기",
      viewTeam: "팀 보기",
      viewPractices: "업무 분야 보기",
    },
    ja: {
      title: "事務所について",
      subtitle: "企業労働法における35年以上の経験",
      historyTitle: "私たちの歴史",
      historyText1: "Santos & Saucedoは労働法に特化したブティック法律事務所であり、35年以上にわたり国内外の企業を支援してきました。ヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアを拠点に、クライアントの経営陣、人事部門、社内法務チームに助言を提供しています。",
      historyText2: "企業の人事に関する決定が労働の問題だけで終わることはまれです。会社そのもの、第三者との契約、そしてますます多くの場合、海外から来る人々にも関わります。クライアントの案件の秘密を尊重し、当事務所はクライアント名を公表していません。",
      valuesTitle: "私たちの仕事の進め方",
      values: [
        { title: "予防", text: "当局より先に確認します。適時の監査は訴訟よりも費用がかからず、多くの場合、訴訟そのものを不要にします。" },
        { title: "責任", text: "各案件は、クライアントをよく知るパートナーが担当し、最初から最後まで責任を持ちます。" },
        { title: "率直さ", text: "期待されている答えでなくても、見えたことをそのままお伝えします。訴訟をしないことが最善の助言である場合もあります。" },
        { title: "一貫性", text: "国内のどの都市にあっても、クライアントのすべての事業所で同じ基準を適用します。" },
      ],
      cultureTitle: "私たちの文化",
      cultureSubtitle: "才能が開花し、卓越が基準となる職場",
      cultureIntro: "Santos & Saucedoでは、プロフェッショナルな厳格さと支援的で協力的な環境を融合させた独自の文化を育んできました。当事務所の弁護士たちはメキシコで最も才能ある法律専門家と共に働き、継続的な学習と相互尊重の雰囲気を醸成しています。",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "現代的な職場環境", 
          text: "協力、創造性、ウェルビーイングを促進するよう設計された最先端の施設。当事務所のオフィスには、オープンスペース、最先端技術を備えた会議室、リラックスやカジュアルな集まりのための空間があります。"
        },
        { 
          icon: Handshake, 
          title: "チーム協力", 
          text: "最高の法的ソリューションは多様な視点から生まれると信じています。当事務所のプラクティスグループはシームレスに連携し、専門知識を組み合わせてクライアントに包括的な助言を提供します。"
        },
        { 
          icon: GraduationCap, 
          title: "専門能力開発", 
          text: "継続的な教育は当事務所の基本です。弁護士が最大限の可能性を発揮できるよう、研修プログラム、メンタリングの機会、高度な学位や資格取得のサポートに投資しています。"
        },
        { 
          icon: HeartHandshake, 
          title: "社会貢献", 
          text: "社会への還元に取り組んでいます。プロボノ活動、NGOとのパートナーシップ、法教育イニシアチブの支援を通じて、業務を超えたポジティブな影響を与えるよう努めています。"
        },
        { 
          icon: Coffee, 
          title: "ワークライフバランス", 
          text: "持続可能な成功にはバランスが必要であることを認識しています。当事務所は柔軟な勤務形態とウェルネスイニシアチブを推進し、チームメンバーを職業的にも個人的にもサポートしています。"
        },
        { 
          icon: Lightbulb, 
          title: "イノベーション志向", 
          text: "創造的思考を奨励し、より効率的で効果的な法的サービスを提供するためにテクノロジーを活用しています。当事務所の文化は主導性を評価し、組織のあらゆるレベルからの新しいアイデアを尊重します。"
        },
      ],
      diversityTitle: "ダイバーシティ＆インクルージョン",
      diversitySubtitle: "より包括的な法律専門職の構築",
      diversityIntro: "Santos & Saucedoは、すべての個人が尊重され、価値を認められ、成功するための力を与えられる多様で包括的な職場環境の促進に取り組んでいます。思考、背景、経験の多様性が当事務所を強化し、クライアントに提供するサービスの質を高めると信じています。",
      diversityStats: [
        { value: "45%", label: "事務所の女性比率", icon: UsersRound },
        { value: "35%", label: "女性パートナー", icon: TrendingUp },
        { value: "50%", label: "リーダーシップ職の女性", icon: Target },
        { value: "100%", label: "機会均等へのコミットメント", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "インクルーシブな採用", 
          text: "当事務所の採用慣行は、性別、背景、個人的状況に関係なく、スキル、経験、潜在能力のみに基づいて候補者を惹きつけ評価し、すべての人に平等な機会を確保するよう設計されています。"
        },
        { 
          icon: BarChart3, 
          title: "ジェンダー平等", 
          text: "組織のあらゆるレベルでジェンダー平等を積極的に推進しています。当事務所のプログラムは女性のリーダーシップ職への昇進を支援し、公平な報酬と成長機会を確保しています。"
        },
        { 
          icon: Sparkles, 
          title: "機会均等", 
          text: "すべてのチームメンバーが同じ能力開発リソース、挑戦的な課題、キャリア昇進の道にアクセスできます。障壁を取り除き、すべての人のための成功への道を作ることに取り組んでいます。"
        },
        { 
          icon: Shield, 
          title: "インクルーシブな職場", 
          text: "違いが称えられ、すべての声が聞かれる環境を育んでいます。当事務所のポリシーと慣行は、すべての個人が安全で、尊重され、職場で本当の自分でいられるよう保証しています。"
        },
      ],
      diversityCommitment: "ダイバーシティとインクルージョンへの私たちのコミットメントは、単なるポリシーではありません。それは私たちの働き方、成長の仕方、クライアントへのサービス提供の仕方を形作る核心的な価値観です。より公平な法律専門職の創造において最前線に立ち続けるため、継続的に慣行を評価し改善しています。",
      statsTitle: "数字で見る当事務所",
      stats: [
        { value: "35+", label: "年の経験" },
      ],
      rankingsTitle: "ランキングと評価",
      rankingsText: "Santos & Saucedoは、世界で最も権威ある法律ディレクトリによってメキシコの主要な法律事務所の一つとして一貫して認められています。",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "プロボノ",
      proBonoText: "支援を必要とする人々にプロボノ法的サービスを提供することに深くコミットしています。当事務所の弁護士たちは、慈善団体、人権活動、司法へのアクセスイニシアチブの支援に多大な時間を捧げています。",
      careersTitle: "採用情報",
      careersText: "メキシコを代表する法律事務所の一つに参加し、最高の仲間と共にキャリアを築きましょう。成長と発展のための優れた機会を提供しています。",
      learnMore: "詳細を見る",
      viewTeam: "チームを見る",
      viewPractices: "プラクティス分野を見る",
    },
    ar: {
      title: "عن الشركة",
      subtitle: "أكثر من 35 عامًا من الخبرة في قانون العمل للشركات",
      historyTitle: "تاريخنا",
      historyText1: "Santos & Saucedo هي شركة محاماة متخصصة (بوتيك) في قانون العمل، بخبرة تزيد عن 35 عامًا في تقديم المشورة للشركات المحلية والدولية. من سان بيدرو غارزا غارسيا، نويفو ليون، نقدم المشورة لإدارة عملائنا وأقسام الموارد البشرية والفرق القانونية الداخلية.",
      historyText2: "نادرًا ما تكون قرارات الشركة بشأن موظفيها مسألة عمالية فحسب: فهي تمسّ الشركة ذاتها، والعقود مع الغير، وبشكل متزايد أشخاصًا قادمين من بلدان أخرى. واحترامًا لسرية شؤون عملائه، لا ينشر المكتب أسماءهم.",
      valuesTitle: "كيف نعمل",
      values: [
        { title: "الوقاية", text: "نراجع قبل أن تفعل السلطات ذلك. فالتدقيق في الوقت المناسب أقل كلفة من الدعوى القضائية، وكثيرًا ما يجعلها غير ضرورية." },
        { title: "المسؤولية", text: "يتولى كل قضية شريك يعرف العميل ويتحمل مسؤولية العمل من بدايته إلى نهايته." },
        { title: "الصراحة", text: "نقول ما نراه، حتى وإن لم يكن ما يُنتظر. وأحيانًا تكون أفضل نصيحة هي عدم اللجوء إلى التقاضي." },
        { title: "الاتساق", text: "المعيار نفسه في جميع مراكز عمل العميل، في أي مدينة من مدن البلاد." },
      ],
      cultureTitle: "ثقافتنا",
      cultureSubtitle: "مكان عمل يزدهر فيه الموهوبون والتميز هو المعيار",
      cultureIntro: "في Santos & Saucedo، قمنا بتنمية ثقافة فريدة تمزج بين الصرامة المهنية والبيئة الداعمة والتعاونية. يعمل محامونا جنبًا إلى جنب مع بعض أكثر المهنيين القانونيين موهبة في المكسيك، مما يعزز جوًا من التعلم المستمر والاحترام المتبادل.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "بيئة عمل حديثة", 
          text: "مرافق متطورة مصممة لتعزيز التعاون والإبداع والرفاهية. تتميز مكاتبنا بمساحات مفتوحة وغرف اجتماعات بتقنية متطورة ومناطق للاسترخاء والتجمعات غير الرسمية."
        },
        { 
          icon: Handshake, 
          title: "التعاون الجماعي", 
          text: "نؤمن بأن أفضل الحلول القانونية تأتي من وجهات نظر متنوعة. تعمل مجموعات الممارسة لدينا بسلاسة معًا، حيث تجمع بين الخبرة المتخصصة لتقديم استشارات شاملة لعملائنا."
        },
        { 
          icon: GraduationCap, 
          title: "التطوير المهني", 
          text: "التعليم المستمر أساسي لشركتنا. نستثمر في برامج التدريب وفرص الإرشاد والدعم للدرجات العلمية المتقدمة والشهادات لمساعدة محامينا على تحقيق إمكاناتهم الكاملة."
        },
        { 
          icon: HeartHandshake, 
          title: "المشاركة المجتمعية", 
          text: "نحن ملتزمون بالعطاء. من خلال العمل الخيري والشراكات مع المنظمات غير الحكومية ودعم مبادرات التعليم القانوني، نسعى جاهدين لإحداث تأثير إيجابي يتجاوز ممارستنا."
        },
        { 
          icon: Coffee, 
          title: "التوازن بين العمل والحياة", 
          text: "ندرك أن النجاح المستدام يتطلب التوازن. تعزز شركتنا الترتيبات المرنة ومبادرات الرفاهية لدعم أعضاء فريقنا مهنيًا وشخصيًا."
        },
        { 
          icon: Lightbulb, 
          title: "عقلية الابتكار", 
          text: "نشجع التفكير الإبداعي ونتبنى التكنولوجيا لتقديم خدمات قانونية أكثر كفاءة وفعالية. ثقافتنا تكافئ المبادرة وتقدر الأفكار الجديدة من جميع مستويات المنظمة."
        },
      ],
      diversityTitle: "التنوع والشمول",
      diversitySubtitle: "بناء مهنة قانونية أكثر شمولاً",
      diversityIntro: "تلتزم Santos & Saucedo بتعزيز مكان عمل متنوع وشامل حيث يتم تقدير كل فرد واحترامه وتمكينه من النجاح. نؤمن بأن تنوع الفكر والخلفية والخبرة يعزز شركتنا ويحسن جودة الخدمة التي نقدمها لعملائنا.",
      diversityStats: [
        { value: "45%", label: "نساء في الشركة", icon: UsersRound },
        { value: "35%", label: "شريكات", icon: TrendingUp },
        { value: "50%", label: "نساء في أدوار قيادية", icon: Target },
        { value: "100%", label: "الالتزام بتكافؤ الفرص", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "التوظيف الشامل", 
          text: "ممارسات التوظيف لدينا مصممة لجذب وتقييم المرشحين بناءً على مهاراتهم وخبراتهم وإمكاناتهم فقط، مما يضمن فرصًا متساوية للجميع بغض النظر عن الجنس أو الخلفية أو الظروف الشخصية."
        },
        { 
          icon: BarChart3, 
          title: "المساواة بين الجنسين", 
          text: "نعزز بنشاط المساواة بين الجنسين على جميع مستويات المنظمة. برامجنا تدعم تقدم المرأة في المناصب القيادية وتضمن تعويضات عادلة وفرص نمو."
        },
        { 
          icon: Sparkles, 
          title: "فرص متساوية", 
          text: "كل عضو في الفريق لديه وصول إلى نفس موارد التطوير والمهام الصعبة ومسارات التقدم الوظيفي. نحن ملتزمون بإزالة الحواجز وإنشاء مسارات للنجاح للجميع."
        },
        { 
          icon: Shield, 
          title: "مكان عمل شامل", 
          text: "نعزز بيئة يُحتفى فيها بالاختلافات وتُسمع فيها جميع الأصوات. سياساتنا وممارساتنا تضمن أن كل فرد يشعر بالأمان والاحترام والقدرة على أن يكون على طبيعته في العمل."
        },
      ],
      diversityCommitment: "التزامنا بالتنوع والشمول ليس مجرد سياسة - إنه قيمة أساسية تشكل طريقة عملنا ونمونا وخدمة عملائنا. نقوم باستمرار بتقييم وتحسين ممارساتنا لضمان بقائنا في طليعة إنشاء مهنة قانونية أكثر إنصافًا.",
      statsTitle: "شركتنا بالأرقام",
      stats: [
        { value: "35+", label: "سنوات من الخبرة" },
      ],
      rankingsTitle: "التصنيفات والتقدير",
      rankingsText: "يتم الاعتراف بـ Santos & Saucedo باستمرار كواحدة من مكاتب المحاماة الرائدة في المكسيك من قبل أعرق الأدلة القانونية في العالم.",
      rankings: [
        "Chambers and Partners Global - الفئة 1",
        "Chambers and Partners Latin America - الفئة 1",
        "Legal 500 Latin America - المستوى 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - المستوى 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "العمل الخيري",
      proBonoText: "نحن ملتزمون بعمق بتقديم خدمات قانونية مجانية لمن هم في حاجة. يخصص محامونا وقتًا كبيرًا لدعم المنظمات الخيرية وقضايا حقوق الإنسان ومبادرات الوصول إلى العدالة.",
      careersTitle: "الوظائف",
      careersText: "انضم إلى واحدة من مكاتب المحاماة الرائدة في المكسيك وابنِ مسيرتك المهنية مع الأفضل. نقدم فرصًا استثنائية للنمو والتطور.",
      learnMore: "اعرف المزيد",
      viewTeam: "عرض فريقنا",
      viewPractices: "عرض مجالات الممارسة",
    },
    ru: {
      title: "О фирме",
      subtitle: "Более 35 лет опыта в корпоративном трудовом праве",
      historyTitle: "Наша история",
      historyText1: "Santos & Saucedo — это бутиковая фирма, специализирующаяся на трудовом праве, с более чем 35-летним опытом консультирования национальных и международных компаний. Из Сан-Педро-Гарса-Гарсия, Нуэво-Леон, мы консультируем руководство, кадровые службы и внутренние юридические команды наших клиентов.",
      historyText2: "Решения компании о персонале редко касаются только трудового права: они затрагивают корпоративные вопросы, договоры с третьими лицами и всё чаще — людей, приезжающих из других стран. Из уважения к конфиденциальности дел своих клиентов фирма не публикует их имена.",
      valuesTitle: "Как мы работаем",
      values: [
        { title: "Профилактика", text: "Мы проводим проверку раньше, чем это сделают органы власти. Своевременный аудит обходится дешевле судебного разбирательства и часто делает его ненужным." },
        { title: "Ответственность", text: "Каждое дело ведёт партнёр, который знает клиента и отвечает за работу от начала до конца." },
        { title: "Прямота", text: "Мы говорим то, что видим, даже если этого не ждут. Иногда лучший совет — не судиться." },
        { title: "Последовательность", text: "Единый подход на всех предприятиях клиента, в любом городе страны." },
      ],
      cultureTitle: "Наша культура",
      cultureSubtitle: "Рабочее место, где процветают таланты и превосходство является стандартом",
      cultureIntro: "В Santos & Saucedo мы развили уникальную культуру, сочетающую профессиональную строгость с поддерживающей и коллаборативной средой. Наши юристы работают вместе с одними из самых талантливых юридических специалистов Мексики, создавая атмосферу непрерывного обучения и взаимного уважения.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "Современная рабочая среда", 
          text: "Современные объекты, спроектированные для развития сотрудничества, креативности и благополучия. Наши офисы оснащены открытыми пространствами, конференц-залами с передовыми технологиями и зонами для отдыха и неформальных встреч."
        },
        { 
          icon: Handshake, 
          title: "Командная работа", 
          text: "Мы верим, что лучшие правовые решения рождаются из разнообразных перспектив. Наши практические группы работают слаженно, объединяя специализированный опыт для предоставления комплексных консультаций нашим клиентам."
        },
        { 
          icon: GraduationCap, 
          title: "Профессиональное развитие", 
          text: "Непрерывное образование является основой нашей фирмы. Мы инвестируем в программы обучения, возможности наставничества и поддержку получения продвинутых степеней и сертификатов, чтобы помочь нашим юристам раскрыть свой потенциал."
        },
        { 
          icon: HeartHandshake, 
          title: "Общественная вовлеченность", 
          text: "Мы стремимся отдавать обществу. Через pro bono работу, партнерство с НКО и поддержку инициатив в области юридического образования мы стремимся оказывать позитивное влияние за пределами нашей практики."
        },
        { 
          icon: Coffee, 
          title: "Баланс работы и жизни", 
          text: "Мы признаем, что устойчивый успех требует баланса. Наша фирма продвигает гибкие условия работы и инициативы по благополучию для поддержки членов нашей команды как профессионально, так и лично."
        },
        { 
          icon: Lightbulb, 
          title: "Инновационное мышление", 
          text: "Мы поощряем творческое мышление и внедряем технологии для предоставления более эффективных юридических услуг. Наша культура вознаграждает инициативу и ценит новые идеи со всех уровней организации."
        },
      ],
      diversityTitle: "Разнообразие и инклюзивность",
      diversitySubtitle: "Создание более инклюзивной юридической профессии",
      diversityIntro: "Santos & Saucedo стремится развивать разнообразное и инклюзивное рабочее место, где каждый человек ценится, уважается и получает возможности для успеха. Мы верим, что разнообразие мыслей, происхождения и опыта укрепляет нашу фирму и повышает качество услуг, которые мы предоставляем клиентам.",
      diversityStats: [
        { value: "45%", label: "Женщины в фирме", icon: UsersRound },
        { value: "35%", label: "Женщины-партнеры", icon: TrendingUp },
        { value: "50%", label: "Женщины на руководящих должностях", icon: Target },
        { value: "100%", label: "Приверженность равным возможностям", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "Инклюзивный найм", 
          text: "Наши практики найма направлены на привлечение и оценку кандидатов исключительно на основе их навыков, опыта и потенциала, обеспечивая равные возможности для всех независимо от пола, происхождения или личных обстоятельств."
        },
        { 
          icon: BarChart3, 
          title: "Гендерное равенство", 
          text: "Мы активно продвигаем гендерное равенство на всех уровнях организации. Наши программы поддерживают продвижение женщин на руководящие должности и обеспечивают справедливую оплату труда и возможности роста."
        },
        { 
          icon: Sparkles, 
          title: "Равные возможности", 
          text: "Каждый член команды имеет доступ к одинаковым ресурсам развития, сложным заданиям и путям карьерного роста. Мы стремимся устранять барьеры и создавать пути к успеху для всех."
        },
        { 
          icon: Shield, 
          title: "Инклюзивное рабочее место", 
          text: "Мы создаем среду, в которой различия приветствуются и все голоса слышны. Наши политики и практики обеспечивают, чтобы каждый чувствовал себя в безопасности, уважаемым и способным быть собой на работе."
        },
      ],
      diversityCommitment: "Наша приверженность разнообразию и инклюзивности — это не просто политика, это основная ценность, которая формирует то, как мы работаем, растем и обслуживаем наших клиентов. Мы постоянно оцениваем и совершенствуем наши практики, чтобы оставаться в авангарде создания более справедливой юридической профессии.",
      statsTitle: "Наша фирма в цифрах",
      stats: [
        { value: "35+", label: "Лет опыта" },
      ],
      rankingsTitle: "Рейтинги и признание",
      rankingsText: "Santos & Saucedo неизменно признается одной из ведущих юридических фирм Мексики самыми престижными юридическими справочниками мира.",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "Pro Bono",
      proBonoText: "Мы глубоко привержены предоставлению бесплатных юридических услуг нуждающимся. Наши юристы уделяют значительное время поддержке благотворительных организаций, правозащитных дел и инициатив по доступу к правосудию.",
      careersTitle: "Карьера",
      careersText: "Присоединяйтесь к одной из ведущих юридических фирм Мексики и стройте карьеру с лучшими. Мы предлагаем исключительные возможности для роста и развития.",
      learnMore: "Узнать больше",
      viewTeam: "Посмотреть команду",
      viewPractices: "Посмотреть практики",
    },
    fr: {
      title: "Le cabinet",
      subtitle: "Plus de 35 ans d'expérience en droit du travail des entreprises",
      historyTitle: "Notre histoire",
      historyText1: "Santos & Saucedo est un cabinet boutique spécialisé en droit du travail, fort de plus de 35 ans d'expérience au service d'entreprises nationales et internationales. Depuis San Pedro Garza García, Nuevo León, nous conseillons la direction, les ressources humaines et les équipes juridiques internes de nos clients.",
      historyText2: "Les décisions d’une entreprise concernant son personnel relèvent rarement du seul droit du travail : elles touchent la société, les contrats avec des tiers et, de plus en plus, des personnes venues d’autres pays. Par respect pour la confidentialité de leurs dossiers, le cabinet ne publie pas les noms de ses clients.",
      valuesTitle: "Notre façon de travailler",
      values: [
        { title: "Prévention", text: "Nous examinons avant que l'autorité ne le fasse. Un audit réalisé à temps coûte moins cher qu'un procès et le rend souvent inutile." },
        { title: "Responsabilité", text: "Chaque dossier est suivi par un associé qui connaît le client et répond du travail du début à la fin." },
        { title: "Franchise", text: "Nous disons ce que nous voyons, même si ce n'est pas ce que l'on attend. Parfois, le meilleur conseil est de ne pas aller en justice." },
        { title: "Cohérence", text: "Le même critère dans tous les établissements d'un client, dans toutes les villes du pays." },
      ],
      cultureTitle: "Notre culture",
      cultureSubtitle: "Un lieu de travail où les talents s'épanouissent et l'excellence est la norme",
      cultureIntro: "Chez Santos & Saucedo, nous avons cultivé une culture unique qui allie rigueur professionnelle et environnement de soutien et de collaboration. Nos avocats travaillent aux côtés de certains des professionnels juridiques les plus talentueux du Mexique, favorisant une atmosphère d'apprentissage continu et de respect mutuel.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "Environnement de travail moderne", 
          text: "Des installations à la pointe de la technologie conçues pour promouvoir la collaboration, la créativité et le bien-être. Nos bureaux disposent d'espaces ouverts, de salles de réunion équipées de technologies de pointe et d'espaces de détente et de rassemblements informels."
        },
        { 
          icon: Handshake, 
          title: "Collaboration en équipe", 
          text: "Nous croyons que les meilleures solutions juridiques proviennent de perspectives diverses. Nos groupes de pratique travaillent ensemble de manière transparente, combinant une expertise spécialisée pour fournir des conseils complets à nos clients."
        },
        { 
          icon: GraduationCap, 
          title: "Développement professionnel", 
          text: "La formation continue est fondamentale pour notre cabinet. Nous investissons dans des programmes de formation, des opportunités de mentorat et le soutien pour les diplômes avancés et les certifications afin d'aider nos avocats à atteindre leur plein potentiel."
        },
        { 
          icon: HeartHandshake, 
          title: "Engagement communautaire", 
          text: "Nous nous engageons à redonner à la communauté. Par le travail pro bono, les partenariats avec des ONG et le soutien aux initiatives d'éducation juridique, nous nous efforçons d'avoir un impact positif au-delà de notre pratique."
        },
        { 
          icon: Coffee, 
          title: "Équilibre vie professionnelle-vie privée", 
          text: "Nous reconnaissons qu'un succès durable nécessite un équilibre. Notre cabinet promeut des arrangements flexibles et des initiatives de bien-être pour soutenir les membres de notre équipe tant sur le plan professionnel que personnel."
        },
        { 
          icon: Lightbulb, 
          title: "Esprit d'innovation", 
          text: "Nous encourageons la pensée créative et adoptons la technologie pour fournir des services juridiques plus efficaces. Notre culture récompense l'initiative et valorise les nouvelles idées à tous les niveaux de l'organisation."
        },
      ],
      diversityTitle: "Diversité et inclusion",
      diversitySubtitle: "Construire une profession juridique plus inclusive",
      diversityIntro: "Santos & Saucedo s'engage à favoriser un lieu de travail diversifié et inclusif où chaque individu est valorisé, respecté et habilité à réussir. Nous croyons que la diversité de pensée, d'origine et d'expérience renforce notre cabinet et améliore la qualité du service que nous fournissons à nos clients.",
      diversityStats: [
        { value: "45%", label: "Femmes dans le cabinet", icon: UsersRound },
        { value: "35%", label: "Femmes associées", icon: TrendingUp },
        { value: "50%", label: "Femmes aux postes de direction", icon: Target },
        { value: "100%", label: "Engagement pour l'égalité des chances", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "Recrutement inclusif", 
          text: "Nos pratiques de recrutement sont conçues pour attirer et évaluer les candidats uniquement sur la base de leurs compétences, de leur expérience et de leur potentiel, garantissant l'égalité des chances pour tous, indépendamment du genre, de l'origine ou des circonstances personnelles."
        },
        { 
          icon: BarChart3, 
          title: "Égalité des genres", 
          text: "Nous promouvons activement l'égalité des genres à tous les niveaux de l'organisation. Nos programmes soutiennent l'avancement des femmes aux postes de direction et assurent une rémunération équitable et des opportunités de croissance."
        },
        { 
          icon: Sparkles, 
          title: "Égalité des chances", 
          text: "Chaque membre de l'équipe a accès aux mêmes ressources de développement, aux missions stimulantes et aux parcours d'avancement de carrière. Nous nous engageons à éliminer les obstacles et à créer des voies vers le succès pour tous."
        },
        { 
          icon: Shield, 
          title: "Lieu de travail inclusif", 
          text: "Nous favorisons un environnement où les différences sont célébrées et toutes les voix sont entendues. Nos politiques et pratiques garantissent que chaque individu se sent en sécurité, respecté et capable d'être authentique au travail."
        },
      ],
      diversityCommitment: "Notre engagement envers la diversité et l'inclusion n'est pas seulement une politique — c'est une valeur fondamentale qui façonne notre façon de travailler, de grandir et de servir nos clients. Nous évaluons et améliorons continuellement nos pratiques pour rester à l'avant-garde de la création d'une profession juridique plus équitable.",
      statsTitle: "Notre cabinet en chiffres",
      stats: [
        { value: "35+", label: "Années d'expérience" },
      ],
      rankingsTitle: "Classements et reconnaissance",
      rankingsText: "Santos & Saucedo est constamment reconnu comme l'un des principaux cabinets d'avocats au Mexique par les annuaires juridiques les plus prestigieux du monde.",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "Pro Bono",
      proBonoText: "Nous sommes profondément engagés à fournir des services juridiques pro bono à ceux qui en ont besoin. Nos avocats consacrent un temps considérable au soutien d'organisations caritatives, de causes de droits de l'homme et d'initiatives d'accès à la justice.",
      careersTitle: "Carrières",
      careersText: "Rejoignez l'un des principaux cabinets d'avocats du Mexique et construisez votre carrière avec les meilleurs. Nous offrons des opportunités exceptionnelles de croissance et de développement.",
      learnMore: "En savoir plus",
      viewTeam: "Voir notre équipe",
      viewPractices: "Voir les domaines de pratique",
    },
    it: {
      title: "Chi siamo",
      subtitle: "Oltre 35 anni di esperienza nel diritto del lavoro aziendale",
      historyTitle: "La nostra storia",
      historyText1: "Santos & Saucedo è uno studio boutique specializzato in diritto del lavoro, con oltre 35 anni di esperienza nella consulenza a imprese nazionali e internazionali. Da San Pedro Garza García, Nuevo León, assistiamo la direzione, le risorse umane e i team legali interni dei nostri clienti.",
      historyText2: "Le decisioni di un'impresa sul proprio personale raramente riguardano solo il diritto del lavoro: toccano la società, i contratti con terzi e, sempre più spesso, persone che arrivano da altri paesi. Per rispetto della riservatezza delle loro questioni, lo studio non pubblica i nomi dei propri clienti.",
      valuesTitle: "Come lavoriamo",
      values: [
        { title: "Prevenzione", text: "Verifichiamo prima che lo faccia l'autorità. Un audit tempestivo costa meno di una causa e spesso la rende superflua." },
        { title: "Responsabilità", text: "Ogni pratica è seguita da un socio che conosce il cliente e risponde del lavoro dall'inizio alla fine." },
        { title: "Franchezza", text: "Diciamo ciò che vediamo, anche quando non è ciò che ci si aspetta. A volte il miglior consiglio è non fare causa." },
        { title: "Coerenza", text: "Lo stesso criterio in tutte le sedi di lavoro di un cliente, in qualsiasi città del Paese." },
      ],
      cultureTitle: "La nostra cultura",
      cultureSubtitle: "Un ambiente di lavoro dove i talenti prosperano e l'eccellenza è lo standard",
      cultureIntro: "In Santos & Saucedo, abbiamo coltivato una cultura unica che unisce rigore professionale e un ambiente di supporto e collaborazione. I nostri avvocati lavorano insieme ad alcuni dei professionisti legali più talentuosi del Messico, promuovendo un'atmosfera di apprendimento continuo e rispetto reciproco.",
      cultureAspects: [
        { 
          icon: Building2, 
          title: "Ambiente di lavoro moderno", 
          text: "Strutture all'avanguardia progettate per promuovere la collaborazione, la creatività e il benessere. I nostri uffici dispongono di spazi aperti, sale riunioni con tecnologia all'avanguardia e aree per il relax e gli incontri informali."
        },
        { 
          icon: Handshake, 
          title: "Collaborazione di squadra", 
          text: "Crediamo che le migliori soluzioni legali nascano da prospettive diverse. I nostri gruppi di pratica lavorano insieme in modo fluido, combinando competenze specializzate per fornire consulenza completa ai nostri clienti."
        },
        { 
          icon: GraduationCap, 
          title: "Sviluppo professionale", 
          text: "La formazione continua è fondamentale per il nostro studio. Investiamo in programmi di formazione, opportunità di mentoring e supporto per lauree avanzate e certificazioni per aiutare i nostri avvocati a raggiungere il loro pieno potenziale."
        },
        { 
          icon: HeartHandshake, 
          title: "Coinvolgimento nella comunità", 
          text: "Ci impegniamo a restituire alla comunità. Attraverso il lavoro pro bono, le partnership con ONG e il supporto a iniziative di educazione legale, ci sforziamo di avere un impatto positivo oltre la nostra pratica."
        },
        { 
          icon: Coffee, 
          title: "Equilibrio vita-lavoro", 
          text: "Riconosciamo che il successo sostenibile richiede equilibrio. Il nostro studio promuove accordi flessibili e iniziative di benessere per supportare i membri del nostro team sia professionalmente che personalmente."
        },
        { 
          icon: Lightbulb, 
          title: "Mentalità innovativa", 
          text: "Incoraggiamo il pensiero creativo e adottiamo la tecnologia per fornire servizi legali più efficienti ed efficaci. La nostra cultura premia l'iniziativa e valorizza le nuove idee da ogni livello dell'organizzazione."
        },
      ],
      diversityTitle: "Diversità e inclusione",
      diversitySubtitle: "Costruire una professione legale più inclusiva",
      diversityIntro: "Santos & Saucedo si impegna a promuovere un ambiente di lavoro diversificato e inclusivo dove ogni individuo è valorizzato, rispettato e messo nelle condizioni di avere successo. Crediamo che la diversità di pensiero, background ed esperienza rafforzi il nostro studio e migliori la qualità del servizio che forniamo ai nostri clienti.",
      diversityStats: [
        { value: "45%", label: "Donne nello studio", icon: UsersRound },
        { value: "35%", label: "Donne partner", icon: TrendingUp },
        { value: "50%", label: "Donne in ruoli di leadership", icon: Target },
        { value: "100%", label: "Impegno per le pari opportunità", icon: Shield },
      ],
      diversityInitiatives: [
        { 
          icon: UserCheck, 
          title: "Assunzioni inclusive", 
          text: "Le nostre pratiche di reclutamento sono progettate per attrarre e valutare i candidati basandosi esclusivamente sulle loro competenze, esperienza e potenziale, garantendo pari opportunità per tutti indipendentemente dal genere, background o circostanze personali."
        },
        { 
          icon: BarChart3, 
          title: "Parità di genere", 
          text: "Promuoviamo attivamente la parità di genere a tutti i livelli dell'organizzazione. I nostri programmi supportano l'avanzamento delle donne in posizioni di leadership e garantiscono una retribuzione equa e opportunità di crescita."
        },
        { 
          icon: Sparkles, 
          title: "Pari opportunità", 
          text: "Ogni membro del team ha accesso alle stesse risorse di sviluppo, incarichi stimolanti e percorsi di avanzamento di carriera. Ci impegniamo a rimuovere le barriere e creare percorsi verso il successo per tutti."
        },
        { 
          icon: Shield, 
          title: "Ambiente di lavoro inclusivo", 
          text: "Promuoviamo un ambiente in cui le differenze sono celebrate e tutte le voci sono ascoltate. Le nostre politiche e pratiche garantiscono che ogni individuo si senta sicuro, rispettato e capace di essere se stesso al lavoro."
        },
      ],
      diversityCommitment: "Il nostro impegno per la diversità e l'inclusione non è solo una politica: è un valore fondamentale che plasma il modo in cui lavoriamo, cresciamo e serviamo i nostri clienti. Valutiamo e miglioriamo continuamente le nostre pratiche per assicurarci di rimanere all'avanguardia nella creazione di una professione legale più equa.",
      statsTitle: "Il nostro studio in numeri",
      stats: [
        { value: "35+", label: "Anni di esperienza" },
      ],
      rankingsTitle: "Classifiche e riconoscimenti",
      rankingsText: "Santos & Saucedo è costantemente riconosciuto come uno dei principali studi legali in Messico dalle directory legali più prestigiose del mondo.",
      rankings: [
        "Chambers and Partners Global - Band 1",
        "Chambers and Partners Latin America - Band 1",
        "Legal 500 Latin America - Tier 1",
        "Latin Lawyer 250 - Elite",
        "IFLR1000 - Tier 1",
        "Global Investigations Review 100",
      ],
      proBonoTitle: "Pro Bono",
      proBonoText: "Siamo profondamente impegnati a fornire servizi legali pro bono a chi ne ha bisogno. I nostri avvocati dedicano tempo significativo al supporto di organizzazioni benefiche, cause per i diritti umani e iniziative per l'accesso alla giustizia.",
      careersTitle: "Carriere",
      careersText: "Unisciti a uno dei principali studi legali del Messico e costruisci la tua carriera con i migliori. Offriamo opportunità eccezionali di crescita e sviluppo.",
      learnMore: "Scopri di più",
      viewTeam: "Vedi il nostro team",
      viewPractices: "Vedi le aree di pratica",
    },
  };

  const baseT = content[language] || content.en;
  const isSpanish = language === "es";
  // ES/EN: textos del reposicionamiento laboral
  const labor: typeof baseT = {
    ...baseT,
    // h1 como el rótulo del menú (chrome26.ts). Subtítulo: el h2 de la redacción aprobada
    title: isSpanish ? "Nuestra firma" : "The firm",
    subtitle: isSpanish
      ? "Una firma de socios con alcance nacional."
      : "A partner-led firm with national reach.",
    historyTitle: isSpanish ? "Santos & Saucedo Abogados" : "Santos & Saucedo Abogados",
    historyText1: isSpanish
      ? "Santos & Saucedo es una firma especializada en derecho laboral con más de 35 años de experiencia asesorando a empresas nacionales e internacionales."
      : "Santos & Saucedo is a labor-law boutique firm with more than 35 years of experience advising national and international companies.",
    // Redacción aprobada (Nuestra firma, En breve) y la frase de Nuestros clientes
    historyText2: isSpanish
      ? "Las decisiones de una empresa sobre su personal rara vez son solo laborales: tocan a la sociedad, a los contratos con terceros y, cada vez más, a personas que llegan de otros países. Por respeto a la confidencialidad de sus asuntos, la firma no publica los nombres de sus clientes."
      : "A company’s decisions about its personnel are rarely only a labor matter: they affect the corporation, its contracts with third parties and, increasingly, people who come from other countries. Out of respect for the confidentiality of its clients’ matters, the firm does not publish their names.",
    valuesTitle: isSpanish ? "Cómo trabajamos" : "How we work",
    cultureTitle: isSpanish ? "Metodología laboral" : "Labor Methodology",
    cultureSubtitle: isSpanish
      ? "Prevención, administración y defensa laboral"
      : "Prevention, administration, and labor defense",
    cultureIntro: isSpanish
      ? "El trabajo del despacho se concentra en proteger la operación diaria de las empresas: revisar riesgos, ordenar procesos internos, fortalecer a los equipos responsables y responder con estrategia cuando surge un conflicto."
      : "The firm's work focuses on protecting companies' daily operations: reviewing risk, organizing internal processes, strengthening responsible teams, and responding strategically when conflicts arise.",
    cultureAspects: isSpanish
      ? [
          { icon: Shield, title: "Prevención", text: "Identificamos riesgos laborales antes de que escalen a contingencias." },
          { icon: BarChart3, title: "Diagnóstico", text: "Revisamos administración laboral, documentación y relaciones de trabajo." },
          { icon: GraduationCap, title: "Capacitación", text: "Preparamos a mandos y equipos de recursos humanos para actuar con criterio jurídico." },
        ]
      : [
          { icon: Shield, title: "Prevention", text: "We identify labor risks before they escalate into contingencies." },
          { icon: BarChart3, title: "Diagnosis", text: "We review labor administration, documentation, and workplace relations." },
          { icon: GraduationCap, title: "Training", text: "We prepare management and HR teams to act with sound legal judgment." },
        ],
    statsTitle: isSpanish ? "La firma en números" : "The firm in numbers",
    stats: [
      { value: "35+", label: isSpanish ? "Años de experiencia" : "Years of Experience" },
      { value: "72+", label: citiesLabel[language] },
    ],
    viewTeam: isSpanish ? "Ver equipo" : "View team",
    viewPractices: isSpanish ? "Ver prácticas" : "View practices",
  };

  // Los otros 8 idiomas: título, subtítulo, historia y valores de content[lang] (el h1
  // coincide con el menú y el pie, chrome26.ts); las cifras, las mismas de ES/EN.
  // Enlaces finales (redacción aprobada: "Socios → Prácticas → Monitor Laboral →") y h1, con
  // los rótulos del menú en cada idioma
  const nav = (chrome26[language] ?? chrome26.en).nav;
  const t: typeof baseT = isSpanish || language === "en"
    ? labor
    : { ...baseT, title: nav[0].label, stats: [baseT.stats[0], { value: "72+", label: citiesLabel[language] }] };

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
    <div className="min-h-screen bg-background" data-testid="page-about">
      <SEOHead page="about" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-about-hero">
          <div className="ss-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <Eyebrow num="01" tone="navy" className="mb-6" />
              <h1 className="mb-5" data-testid="text-about-title">
                {t.title}
              </h1>
              <p data-testid="text-about-subtitle">
                {t.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="py-16 lg:py-24">
          <div className="ss-container">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-20 lg:mb-24"
              data-testid="section-history"
            >
              {/* Una sola columna: el primer párrafo como entrada (.ss-lead) y el segundo en texto */}
              <div className="max-w-[44rem] space-y-6">
                <p className="ss-lead" data-testid="text-about-lead">
                  {keepFirmName(t.historyText1)}
                </p>
                <p className="ss-prose text-ss-tinta text-[17px] md:text-[18px]">
                  {t.historyText2}
                </p>
              </div>

              {/* Cifras bajo la introducción, sin h2: estilo de cifra de la portada, filetes de
                  1 px y sin panel */}
              <dl className="mt-12 grid max-w-[36rem] grid-cols-2 gap-x-8 gap-y-10 lg:mt-16" data-testid="section-stats">
                {t.stats.map((stat, index) => (
                  <div key={index} className="flex flex-col border-t border-ss-rule pt-6" data-testid={`stat-${index}`}>
                    {/* Etiquetas equilibradas (sin huérfanas en teléfono) y, como red, corte de
                        compuestos largos (alemán) dentro de su media columna */}
                    <dt className="ss-label text-ss-medio order-2 mt-3 text-balance hyphens-auto [overflow-wrap:anywhere]">
                      {stat.label}
                    </dt>
                    <dd className="ss-figure order-1">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.section>

            <motion.section
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-20 lg:mb-24"
              data-testid="section-values"
            >
              <h2 className="ss-h2 mb-8">
                {t.valuesTitle}
              </h2>
              {/* Principios sin orden: sin numerales, en rejilla de 2 × 2 con filete superior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {t.values.map((value, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <NumberedCard
                      index={index}
                      showIndex={false}
                      title={value.title}
                      body={value.text}
                      dataTestid={`card-value-${index}`}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Navegación como enlaces de texto (sin botones): Socios, Prácticas y Monitor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-x-10 gap-y-6"
            >
              <span data-testid="button-view-team">
                <TextLink href="/team">{nav[2].label}</TextLink>
              </span>
              <span data-testid="button-view-practices">
                <TextLink href="/practice-groups">{nav[1].label}</TextLink>
              </span>
              <span data-testid="link-view-news">
                <TextLink href="/news">{nav[3].label}</TextLink>
              </span>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
