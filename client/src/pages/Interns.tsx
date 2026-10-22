import { CareerForm } from "@/features/public-forms/CareerForm";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { useCmsContent } from "@/hooks/useCmsContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Eyebrow } from "@/components/editorial";
import { SplitSection } from "@/components/home26/primitives";

// "Clásica": titular de sección .ss-h2 (escala única de index.css); texto en sans 400 Gris Tinta.

export default function Interns() {
  const siteDetails = useSiteDetails();
  const { language } = useLanguage();

  // Textos de la redacción aprobada (sección "Carreras", Semillero S&S; página en tú). Sin
  // modalidades, duraciones, requisitos, beca ni pasos de selección que la firma no haya
  // confirmado; la frase [CONFIRMAR] del Semillero no se publica. Solo lo propio del
  // Semillero: el programa, lo que se aprende, a quién se busca y qué indicar en el correo ya
  // están en /careers, que enlaza aquí. Aquí: la frase del Semillero, un solo mailto (el
  // correo) y el enlace de vuelta a Carreras.
  const content = {
    en: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S is the firm’s internship program.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "How to apply",
      ctaIntro: "If there is no vacancy for your profile today, you can leave your details with the Semillero. We review the profiles every time a position opens.",
      ctaInstructions: "Send your CV as a PDF to:",
      viewCareers: "Careers",
    },
    es: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "El Semillero S&S es el programa de pasantes de la firma.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Cómo postularse",
      ctaIntro: "Si hoy no hay una vacante para tu perfil, puedes dejar tus datos en el Semillero. Revisamos los perfiles cada vez que se abre una posición.",
      ctaInstructions: "Envía tu CV en PDF a:",
      viewCareers: "Carreras",
    },
    de: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Das Semillero S&S ist das Praktikantenprogramm der Kanzlei.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "So bewerben Sie sich",
      ctaIntro: "Wenn es heute keine passende Stelle für Ihr Profil gibt, können Sie Ihre Daten im Semillero hinterlegen. Wir sehen die Profile jedes Mal durch, wenn eine Stelle frei wird.",
      ctaInstructions: "Senden Sie Ihren Lebenslauf als PDF an:",
      viewCareers: "Karriere",
    },
    zh: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S 是本所的实习生项目。",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "如何申请",
      ctaIntro: "如果目前没有适合您的职位，您可以将资料留在 Semillero。每当有职位空缺时，我们都会审阅这些资料。",
      ctaInstructions: "请将 PDF 格式的简历发送至：",
      viewCareers: "职业发展",
    },
    ko: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S는 법인의 인턴십 프로그램입니다.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "지원 방법",
      ctaIntro: "지금 여러분의 프로필에 맞는 자리가 없다면 Semillero에 정보를 남길 수 있습니다. 자리가 날 때마다 프로필을 검토합니다.",
      ctaInstructions: "PDF 형식의 이력서를 다음 주소로 보내 주세요:",
      viewCareers: "채용",
    },
    ja: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S は当事務所のインターンシップ・プログラムです。",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "応募方法",
      ctaIntro: "現在、あなたのプロフィールに合う募集がない場合は、Semillero に情報を登録できます。募集が出るたびに登録されたプロフィールを確認します。",
      ctaInstructions: "PDF形式の履歴書を次のアドレスにお送りください：",
      viewCareers: "採用情報",
    },
    ar: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "يُعدّ Semillero S&S برنامج المتدربين في المكتب.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "كيفية التقديم",
      ctaIntro: "إذا لم تكن هناك اليوم وظيفة شاغرة تناسب ملفك، يمكنك ترك بياناتك في Semillero. نراجع الملفات كلما أُتيحت وظيفة.",
      ctaInstructions: "أرسل سيرتك الذاتية بصيغة PDF إلى:",
      viewCareers: "الوظائف",
    },
    ru: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Semillero S&S — программа стажировки фирмы.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Как подать заявку",
      ctaIntro: "Если сейчас нет вакансии для вашего профиля, вы можете оставить свои данные в Semillero. Мы просматриваем профили каждый раз, когда открывается позиция.",
      ctaInstructions: "Отправьте резюме в формате PDF на адрес:",
      viewCareers: "Карьера",
    },
    fr: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Le Semillero S&S est le programme de stage du cabinet.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Comment postuler",
      ctaIntro: "S’il n’y a pas aujourd’hui de poste pour votre profil, vous pouvez laisser vos coordonnées au Semillero. Nous examinons les profils chaque fois qu’un poste s’ouvre.",
      ctaInstructions: "Envoyez votre CV au format PDF à :",
      viewCareers: "Carrières",
    },
    it: {
      heroTitle: "Semillero S&S",
      heroSubtitle: "Il Semillero S&S è il programma di tirocinio dello studio.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Come candidarsi",
      ctaIntro: "Se oggi non c’è una posizione per il tuo profilo, puoi lasciare i tuoi dati nel Semillero. Esaminiamo i profili ogni volta che si apre una posizione.",
      ctaInstructions: "Invia il tuo CV in PDF a:",
      viewCareers: "Carriere",
    },
  };

  const editableContent = useCmsContent("interns", content);
  const baseT = editableContent[language as keyof typeof content] || editableContent.en;
  const t = { ...baseT, applyEmail: siteDetails.recruitmentEmail };

  // Enlace de texto con el aspecto de TextLink (etiqueta, subrayado, flecha y área táctil
  // ampliada); propio para conservar su data-testid
  const textLinkClass = "ss-label group relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3";
  const applyHref = `mailto:${t.applyEmail}?subject=${encodeURIComponent(t.heroTitle)}`;
  // Correo de reclutamiento en dos piezas: se parte tras la arroba si la columna es estrecha
  const [emailUser, emailDomain] = t.applyEmail.split("@");

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
          <div className="max-w-3xl">
            <Eyebrow num="05" tone="navy" className="mb-6" />
            <h1 
              className="mb-5"
              data-testid="text-interns-title"
            >
              {t.heroTitle}
            </h1>
            <p data-testid="text-interns-subtitle">
              {t.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          
          {/* Solicitud, en la rejilla editorial de la portada (SplitSection, G1): el h2 en el
              aside y, en el cuerpo, la frase del Semillero, el correo como enlace de texto (el
              único mailto) y el enlace a Carreras. Sin tarjeta, sin un segundo "Enviar solicitud"
              ni la llamada "¿Listo para iniciar tu carrera legal?". Sin entrada al aparecer (G3). */}
          <section data-testid="section-cta">
            <SplitSection
              aside={
                <h2 
                  className="ss-h2"
                  data-testid="text-cta-title"
                >
                  {t.ctaTitle}
                </h2>
              }
            >
              <div className="max-w-[44rem]">
                <p className="text-[19px] md:text-[20px] text-ss-tinta leading-[1.65] max-w-2xl mb-6 [text-wrap:pretty]">
                  {t.ctaIntro}
                </p>
                <p className="text-base text-ss-tinta leading-[1.55] mb-2">
                  {t.ctaInstructions}
                </p>
                {/* A 320 px el correo no cabía: corte tras la arroba y overflow-wrap:anywhere */}
                <a
                  href={applyHref}
                  className="inline-block max-w-full text-[21px] text-ss-marino underline decoration-ss-input underline-offset-4 [overflow-wrap:anywhere] hover:decoration-ss-marino"
                  data-testid="link-cta-email"
                >
                  {emailUser}@<wbr />{emailDomain}
                </a>
                <div className="mt-10">
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
            </SplitSection>
            <CareerForm source="interns"/>
          </section>

        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
