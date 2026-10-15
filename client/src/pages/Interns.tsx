import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Eyebrow } from "@/components/editorial";

// "Clásica": titulares en romana 400, Azul Marino, caja de oración y al inicio;
// entradillas en romana 400 Gris Tinta; texto en sans 400 Gris Tinta.
const h2Class = "font-heading font-normal text-ss-marino text-[clamp(28px,2.6vw,38px)] leading-[1.12] tracking-[-0.012em] [text-wrap:balance]";
const leadClass = "font-serif font-normal text-ss-tinta text-[clamp(19px,0.6vw_+_14px,22px)] leading-[1.55] tracking-[-0.003em] [text-wrap:pretty]";

export default function Interns() {
  const { language } = useLanguage();

  // Textos de la redacción aprobada (sección "Carreras", Semillero S&S; página en tú). Sin
  // modalidades, duraciones, requisitos, beca ni pasos de selección que la firma no haya
  // confirmado; la frase [CONFIRMAR] del Semillero no se publica.
  const content = {
    en: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S is the firm's internship program.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "The program",
      programOverviewSubtitle: "Interns work on real matters from the start, alongside the partners: on-site audits, reviews of collective bargaining agreements, conciliation hearings and trials.",
      whatYouLearnTitle: "What you will learn",
      whatYouLearnSubtitle: "In a firm of our size, your work is reviewed directly by a partner. You will learn to prepare a case file, to negotiate and to hold a position before the authorities, and you will see at close range how companies in many sectors operate.",
      requirementsTitle: "Who we are looking for",
      requirementsSubtitle: "We look for students interested in employer-side labor law. We value rigor, discretion and an interest in understanding how a business works from the inside.",
      ctaTitle: "How to apply",
      ctaIntro: "If there is no vacancy for your profile today, you can leave your details with the Semillero. We review the profiles every time a position opens.",
      ctaInstructions: "Send your CV as a PDF to:",
      ctaNote: "In the e-mail, include your name, your phone number with area code and the practice you are interested in: labor, corporate, immigration or litigation.",
      sendApplication: "Send application",
      viewCareers: "Careers",
    },
    es: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "El Semillero S&S es el programa de pasantes de la firma.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "El programa",
      programOverviewSubtitle: "Los pasantes trabajan desde el principio en asuntos reales, junto a los socios: auditorías en planta, revisiones de contratos colectivos, audiencias de conciliación y juicios.",
      whatYouLearnTitle: "Lo que aprenderás",
      whatYouLearnSubtitle: "En una firma de nuestro tamaño, tu trabajo lo revisa directamente un socio. Aprenderás a preparar un expediente, a negociar y a sostener una postura frente a la autoridad, y conocerás de cerca la operación de empresas de muchos sectores.",
      requirementsTitle: "A quién buscamos",
      requirementsSubtitle: "Buscamos estudiantes interesados en el derecho laboral de empresa. Valoramos el rigor, la discreción y el interés por entender cómo funciona una empresa por dentro.",
      ctaTitle: "Cómo enviar tu solicitud",
      ctaIntro: "Si hoy no hay una vacante para tu perfil, puedes dejar tus datos en el Semillero. Revisamos los perfiles cada vez que se abre una posición.",
      ctaInstructions: "Envía tu CV en PDF a:",
      ctaNote: "En el correo, indica tu nombre, tu teléfono con lada y la práctica de interés: laboral, corporativo, migratorio o litigio.",
      sendApplication: "Enviar solicitud",
      viewCareers: "Carreras",
    },
    de: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Das Semillero S&S ist das Praktikantenprogramm der Kanzlei.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "Das Programm",
      programOverviewSubtitle: "Praktikanten arbeiten von Anfang an an echten Mandaten, an der Seite der Partner: Audits vor Ort, Prüfung von Tarifverträgen, Schlichtungsverhandlungen und Gerichtsverfahren.",
      whatYouLearnTitle: "Was Sie lernen",
      whatYouLearnSubtitle: "In einer Kanzlei unserer Größe prüft ein Partner Ihre Arbeit direkt. Sie lernen, eine Akte vorzubereiten, zu verhandeln und eine Position gegenüber den Behörden zu vertreten, und Sie lernen den Betrieb von Unternehmen aus vielen Branchen aus der Nähe kennen.",
      requirementsTitle: "Wen wir suchen",
      requirementsSubtitle: "Wir suchen Studierende mit Interesse am Arbeitsrecht auf Unternehmensseite. Wir schätzen Sorgfalt, Diskretion und das Interesse daran, wie ein Unternehmen von innen funktioniert.",
      ctaTitle: "So bewerben Sie sich",
      ctaIntro: "Wenn es heute keine passende Stelle für Ihr Profil gibt, können Sie Ihre Daten im Semillero hinterlegen. Wir sehen die Profile jedes Mal durch, wenn eine Stelle frei wird.",
      ctaInstructions: "Senden Sie Ihren Lebenslauf als PDF an:",
      ctaNote: "Nennen Sie in der E-Mail Ihren Namen, Ihre Telefonnummer mit Vorwahl und den gewünschten Bereich: Arbeitsrecht, Gesellschaftsrecht, Migrationsrecht oder Prozessführung.",
      sendApplication: "Bewerbung senden",
      viewCareers: "Karriere",
    },
    zh: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S 是本所的实习生项目。",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "项目介绍",
      programOverviewSubtitle: "实习生从一开始就与合伙人一起处理真实案件：现场审计、集体合同审查、调解听证和诉讼。",
      whatYouLearnTitle: "您将学到什么",
      whatYouLearnSubtitle: "在我们这样规模的律所，您的工作由合伙人直接审阅。您将学习如何准备案卷、进行谈判、在主管机关面前坚持立场，并近距离了解众多行业企业的运营。",
      requirementsTitle: "我们寻找的人",
      requirementsSubtitle: "我们寻找对企业方劳动法感兴趣的学生。我们看重严谨、审慎，以及深入了解企业内部运作的兴趣。",
      ctaTitle: "如何申请",
      ctaIntro: "如果目前没有适合您的职位，您可以将资料留在 Semillero。每当有职位空缺时，我们都会审阅这些资料。",
      ctaInstructions: "请将 PDF 格式的简历发送至：",
      ctaNote: "请在邮件中注明您的姓名、带区号的电话以及感兴趣的业务领域：劳动、公司、移民或诉讼。",
      sendApplication: "发送申请",
      viewCareers: "职业发展",
    },
    ko: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S는 법인의 인턴십 프로그램입니다.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "프로그램",
      programOverviewSubtitle: "인턴은 처음부터 파트너와 함께 실제 사건을 담당합니다. 현장 감사, 단체협약 검토, 조정 심리와 소송 등입니다.",
      whatYouLearnTitle: "배우게 될 내용",
      whatYouLearnSubtitle: "우리 규모의 법인에서는 파트너가 여러분의 업무를 직접 검토합니다. 사건 기록을 준비하고, 협상하고, 당국 앞에서 입장을 지키는 법을 배우며, 여러 업종 기업의 운영을 가까이에서 알게 됩니다.",
      requirementsTitle: "이런 분을 찾습니다",
      requirementsSubtitle: "기업 측 노동법에 관심 있는 학생을 찾습니다. 엄격함과 신중함, 그리고 기업이 내부에서 어떻게 움직이는지 이해하려는 관심을 중시합니다.",
      ctaTitle: "지원 방법",
      ctaIntro: "지금 여러분의 프로필에 맞는 자리가 없다면 Semillero에 정보를 남길 수 있습니다. 자리가 날 때마다 프로필을 검토합니다.",
      ctaInstructions: "PDF 형식의 이력서를 다음 주소로 보내 주세요:",
      ctaNote: "이메일에 이름, 지역번호를 포함한 전화번호, 관심 업무 분야(노동, 기업, 출입국 또는 소송)를 적어 주세요.",
      sendApplication: "지원서 보내기",
      viewCareers: "채용",
    },
    ja: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S は当事務所のインターンシップ・プログラムです。",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "プログラム",
      programOverviewSubtitle: "インターンは最初からパートナーとともに実際の案件に携わります。現場での監査、労働協約の見直し、調停期日、訴訟などです。",
      whatYouLearnTitle: "学べること",
      whatYouLearnSubtitle: "当事務所の規模では、あなたの仕事はパートナーが直接確認します。記録の準備、交渉、当局に対して立場を貫くことを学び、さまざまな業種の企業の業務を間近で知ることができます。",
      requirementsTitle: "求める人物",
      requirementsSubtitle: "企業側の労働法に関心のある学生を求めています。厳密さ、慎重さ、そして企業が内側からどう動いているかを理解しようとする姿勢を大切にしています。",
      ctaTitle: "応募方法",
      ctaIntro: "現在、あなたのプロフィールに合う募集がない場合は、Semillero に情報を登録できます。募集が出るたびに登録されたプロフィールを確認します。",
      ctaInstructions: "PDF形式の履歴書を次のアドレスにお送りください：",
      ctaNote: "メールには、氏名、市外局番付きの電話番号、希望する業務分野（労働、企業法務、出入国管理、訴訟）をご記入ください。",
      sendApplication: "応募書類を送る",
      viewCareers: "採用情報",
    },
    ar: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "يُعدّ Semillero S&S برنامج المتدربين في المكتب.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "البرنامج",
      programOverviewSubtitle: "يعمل المتدربون منذ البداية على قضايا حقيقية إلى جانب الشركاء: عمليات تدقيق في المصانع، ومراجعة عقود العمل الجماعية، وجلسات التوفيق، والدعاوى القضائية.",
      whatYouLearnTitle: "ما ستتعلمه",
      whatYouLearnSubtitle: "في مكتب بحجمنا، يراجع أحد الشركاء عملك مباشرة. ستتعلم إعداد الملف والتفاوض والدفاع عن موقف أمام السلطات، وستتعرف عن قرب على طريقة عمل شركات من قطاعات كثيرة.",
      requirementsTitle: "من نبحث عنه",
      requirementsSubtitle: "نبحث عن طلاب مهتمين بقانون العمل من جانب أصحاب العمل. نقدّر الدقة والتكتم والاهتمام بفهم كيفية عمل المؤسسة من الداخل.",
      ctaTitle: "كيفية التقديم",
      ctaIntro: "إذا لم تكن هناك اليوم وظيفة شاغرة تناسب ملفك، يمكنك ترك بياناتك في Semillero. نراجع الملفات كلما أُتيحت وظيفة.",
      ctaInstructions: "أرسل سيرتك الذاتية بصيغة PDF إلى:",
      ctaNote: "اذكر في رسالتك اسمك ورقم هاتفك مع رمز المنطقة ومجال الممارسة الذي يهمك: العمل أو الشركات أو الهجرة أو التقاضي.",
      sendApplication: "إرسال الطلب",
      viewCareers: "الوظائف",
    },
    ru: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S — программа стажировки фирмы.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "Программа",
      programOverviewSubtitle: "Стажёры с первого дня работают над реальными делами вместе с партнёрами: проверки на предприятиях, анализ коллективных договоров, примирительные слушания и судебные процессы.",
      whatYouLearnTitle: "Чему вы научитесь",
      whatYouLearnSubtitle: "В фирме нашего размера вашу работу напрямую проверяет партнёр. Вы научитесь готовить дело, вести переговоры и отстаивать позицию перед органами власти, а также близко познакомитесь с работой компаний из многих отраслей.",
      requirementsTitle: "Кого мы ищем",
      requirementsSubtitle: "Мы ищем студентов, интересующихся трудовым правом на стороне работодателя. Мы ценим тщательность, сдержанность и стремление понять, как компания устроена изнутри.",
      ctaTitle: "Как подать заявку",
      ctaIntro: "Если сейчас нет вакансии для вашего профиля, вы можете оставить свои данные в Semillero. Мы просматриваем профили каждый раз, когда открывается позиция.",
      ctaInstructions: "Отправьте резюме в формате PDF на адрес:",
      ctaNote: "В письме укажите имя, телефон с кодом города и интересующую практику: трудовое право, корпоративное право, миграционное право или судебные споры.",
      sendApplication: "Отправить заявку",
      viewCareers: "Карьера",
    },
    fr: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Le Semillero S&S est le programme de stage du cabinet.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "Le programme",
      programOverviewSubtitle: "Les stagiaires travaillent dès le départ sur de vrais dossiers, aux côtés des associés : audits sur site, révision de conventions collectives, audiences de conciliation et procès.",
      whatYouLearnTitle: "Ce que vous apprendrez",
      whatYouLearnSubtitle: "Dans un cabinet de notre taille, votre travail est relu directement par un associé. Vous apprendrez à préparer un dossier, à négocier et à défendre une position face à l'administration, et vous découvrirez de près le fonctionnement d'entreprises de nombreux secteurs.",
      requirementsTitle: "Qui nous recherchons",
      requirementsSubtitle: "Nous recherchons des étudiants intéressés par le droit du travail côté employeur. Nous apprécions la rigueur, la discrétion et l'envie de comprendre le fonctionnement d'une entreprise de l'intérieur.",
      ctaTitle: "Comment postuler",
      ctaIntro: "S'il n'y a pas aujourd'hui de poste pour votre profil, vous pouvez laisser vos coordonnées au Semillero. Nous examinons les profils chaque fois qu'un poste s'ouvre.",
      ctaInstructions: "Envoyez votre CV au format PDF à :",
      ctaNote: "Dans l'e-mail, indiquez votre nom, votre téléphone avec l'indicatif et le domaine qui vous intéresse : travail, sociétés, immigration ou contentieux.",
      sendApplication: "Envoyer la candidature",
      viewCareers: "Carrières",
    },
    it: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Il Semillero S&S è il programma di tirocinio dello studio.",
      applyEmail: "reclutamiento@santossaucedo.com",
      programOverviewTitle: "Il programma",
      programOverviewSubtitle: "I tirocinanti lavorano fin dall'inizio su incarichi reali, al fianco dei soci: audit negli stabilimenti, revisione dei contratti collettivi, udienze di conciliazione e giudizi.",
      whatYouLearnTitle: "Cosa imparerai",
      whatYouLearnSubtitle: "In uno studio delle nostre dimensioni, il tuo lavoro viene rivisto direttamente da un socio. Imparerai a preparare un fascicolo, a negoziare e a sostenere una posizione davanti all'autorità, e conoscerai da vicino l'attività di imprese di molti settori.",
      requirementsTitle: "Chi cerchiamo",
      requirementsSubtitle: "Cerchiamo studenti interessati al diritto del lavoro dal lato dell'impresa. Apprezziamo il rigore, la discrezione e l'interesse a capire come funziona un'impresa dall'interno.",
      ctaTitle: "Come candidarsi",
      ctaIntro: "Se oggi non c'è una posizione per il tuo profilo, puoi lasciare i tuoi dati nel Semillero. Esaminiamo i profili ogni volta che si apre una posizione.",
      ctaInstructions: "Invia il tuo CV in PDF a:",
      ctaNote: "Nell'e-mail indica il tuo nome, il telefono con prefisso e l'area di interesse: lavoro, societario, immigrazione o contenzioso.",
      sendApplication: "Invia candidatura",
      viewCareers: "Carriere",
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  // Enlace de texto de la marca (etiqueta, subrayado al pasar, flecha), sin botón con caja
  const textLinkClass = "ss-label group inline-flex min-h-[44px] items-center gap-3 text-ss-marino";
  // Apartados de texto corrido separados por un filete (sin tarjeta, píldora, icono ni sombra)
  const sectionClass = "max-w-3xl border-t border-ss-rule pt-8";
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
          
          {/* Texto corrido en tres apartados (el programa, lo que se aprende, a quién se busca):
              titular en romana y entradilla, separados por un filete. Sin tarjetas, pasos
              numerados ni listas de requisitos sin confirmar. */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16 lg:mb-20 max-w-3xl"
            data-testid="section-program-overview"
          >
            <h2 
              className={`${h2Class} mb-4`}
              data-testid="text-program-overview-title"
            >
              {t.programOverviewTitle}
            </h2>
            <p className={leadClass}>
              {t.programOverviewSubtitle}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${sectionClass} mb-16 lg:mb-20`}
            data-testid="section-what-you-learn"
          >
            <h2 
              className={`${h2Class} mb-4`}
              data-testid="text-what-you-learn-title"
            >
              {t.whatYouLearnTitle}
            </h2>
            <p className={leadClass}>
              {t.whatYouLearnSubtitle}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${sectionClass} mb-16 lg:mb-20`}
            data-testid="section-requirements"
          >
            <h2 
              className={`${h2Class} mb-4`}
              data-testid="text-requirements-title"
            >
              {t.requirementsTitle}
            </h2>
            <p className={leadClass}>
              {t.requirementsSubtitle}
            </p>
          </motion.section>

          {/* Solicitud: la frase del Semillero, el correo como enlace de texto y dos enlaces.
              Sin tarjeta ni la llamada "¿Listo para iniciar tu carrera legal?" */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-testid="section-cta"
          >
            <div className={sectionClass}>
              <h2 
                className={`${h2Class} mb-5`}
                data-testid="text-cta-title"
              >
                {t.ctaTitle}
              </h2>
              <p className="text-base text-ss-tinta leading-[1.55] max-w-2xl mb-6">
                {t.ctaIntro}
              </p>
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

        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
