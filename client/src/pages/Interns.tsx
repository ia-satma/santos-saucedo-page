// Pasantías S&S (/careers/interns) con el lenguaje de la demo v3 aprobada (5-11-2026), que no tenía esta página:
// cabecera con la foto del mezanine, «Cómo postularse» con el correo junto al formulario azul de la demo (como
// Contacto) y, al final, la vuelta a Carreras. Textos de siempre (10 idiomas, panel: "interns"); el formulario y su
// envío (CV en PDF, consentimiento, panel "forms") están en v3/paginas-extra/Candidatura.tsx.
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { useCmsContent } from "@/hooks/useCmsContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LanguageCode } from "@shared/schema";
import { V3Main, V3NextPage, V3PageHeader, useV3Lang } from "@/v3/shared";
import { nextLabel, useFotoOficina } from "@/v3/paginas-extra/piezas";
import { Candidatura } from "@/v3/paginas-extra/Candidatura";
import { PX } from "@/v3/paginas-extra/textos";

// "Pasantías S&S" con espacio duro al pintarlo: el nombre del programa no se parte entre líneas
const keepProgramName = (text: string) => text.replace(/Pasantías S&S/g, "Pasantías\u00a0S&S").replace(/S&S Internships/g, "S&S\u00a0Internships");

export default function Interns() {
  const siteDetails = useSiteDetails();
  const { language } = useLanguage();

  // Textos de la redacción aprobada (sección "Carreras", Pasantías S&S; página en tú). Sin
  // modalidades, duraciones, requisitos, beca ni pasos de selección que la firma no haya
  // confirmado; la frase [CONFIRMAR] del Pasantías S&S no se publica. Solo lo propio del
  // Pasantías S&S: el programa, lo que se aprende, a quién se busca y qué indicar en el correo ya
  // están en /careers, que enlaza aquí. Aquí: la frase del Pasantías S&S, un solo mailto (el
  // correo) y el enlace de vuelta a Carreras.
  const content = {
    en: {
      heroTitle: "S&S Internships",
      heroSubtitle: "S&S Internships is the firm’s internship program.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "How to apply",
      ctaIntro: "If there is no vacancy for your profile today, you can leave your details with S&S Internships. We review the profiles every time a position opens.",
      ctaInstructions: "Send your CV as a PDF to:",
      viewCareers: "Careers",
    },
    es: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S es el programa de pasantes de la firma.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Cómo postularse",
      ctaIntro: "Si hoy no hay una vacante para tu perfil, puedes dejar tus datos en Pasantías S&S. Revisamos los perfiles cada vez que se abre una posición.",
      ctaInstructions: "Envía tu CV en PDF a:",
      viewCareers: "Carreras",
    },
    de: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S ist das Praktikantenprogramm der Kanzlei.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "So bewerben Sie sich",
      ctaIntro: "Wenn es heute keine passende Stelle für Ihr Profil gibt, können Sie Ihre Daten bei Pasantías S&S hinterlegen. Wir sehen die Profile jedes Mal durch, wenn eine Stelle frei wird.",
      ctaInstructions: "Senden Sie Ihren Lebenslauf als PDF an:",
      viewCareers: "Karriere",
    },
    zh: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S 是本所的实习生项目。",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "如何申请",
      ctaIntro: "如果目前没有适合您的职位，您可以将资料留在 Pasantías S&S。每当有职位空缺时，我们都会审阅这些资料。",
      ctaInstructions: "请将 PDF 格式的简历发送至：",
      viewCareers: "职业发展",
    },
    ko: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S는 법인의 인턴십 프로그램입니다.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "지원 방법",
      ctaIntro: "지금 여러분의 프로필에 맞는 자리가 없다면 Pasantías S&S에 정보를 남길 수 있습니다. 자리가 날 때마다 프로필을 검토합니다.",
      ctaInstructions: "PDF 형식의 이력서를 다음 주소로 보내 주세요:",
      viewCareers: "채용",
    },
    ja: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S は当事務所のインターンシップ・プログラムです。",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "応募方法",
      ctaIntro: "現在、あなたのプロフィールに合う募集がない場合は、Pasantías S&S に情報を登録できます。募集が出るたびに登録されたプロフィールを確認します。",
      ctaInstructions: "PDF形式の履歴書を次のアドレスにお送りください：",
      viewCareers: "採用情報",
    },
    ar: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "يُعدّ Pasantías S&S برنامج المتدربين في المكتب.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "كيفية التقديم",
      ctaIntro: "إذا لم تكن هناك اليوم وظيفة شاغرة تناسب ملفك، يمكنك ترك بياناتك في Pasantías S&S. نراجع الملفات كلما أُتيحت وظيفة.",
      ctaInstructions: "أرسل سيرتك الذاتية بصيغة PDF إلى:",
      viewCareers: "الوظائف",
    },
    ru: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S — программа стажировки фирмы.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Как подать заявку",
      ctaIntro: "Если сейчас нет вакансии для вашего профиля, вы можете оставить свои данные в Pasantías S&S. Мы просматриваем профили каждый раз, когда открывается позиция.",
      ctaInstructions: "Отправьте резюме в формате PDF на адрес:",
      viewCareers: "Карьера",
    },
    fr: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S est le programme de stage du cabinet.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Comment postuler",
      ctaIntro: "S’il n’y a pas aujourd’hui de poste pour votre profil, vous pouvez laisser vos coordonnées à Pasantías S&S. Nous examinons les profils chaque fois qu’un poste s’ouvre.",
      ctaInstructions: "Envoyez votre CV au format PDF à :",
      viewCareers: "Carrières",
    },
    it: {
      heroTitle: "Pasantías S&S",
      heroSubtitle: "Pasantías S&S è il programma di tirocinio dello studio.",
      applyEmail: "reclutamiento@santossaucedo.com",
      ctaTitle: "Come candidarsi",
      ctaIntro: "Se oggi non c’è una posizione per il tuo profilo, puoi lasciare i tuoi dati in Pasantías S&S. Esaminiamo i profili ogni volta che si apre una posizione.",
      ctaInstructions: "Invia il tuo CV in PDF a:",
      viewCareers: "Carriere",
    },
  };

  const editableContent = useCmsContent("interns", content);
  const baseT = editableContent[language as keyof typeof content] || editableContent.en;
  const t = { ...baseT, applyEmail: siteDetails.recruitmentEmail };

  const { lang } = useV3Lang();
  const foto = useFotoOficina();
  const mezanine = foto("mezanine", language as LanguageCode, PX[lang].mezanineAlt);
  const applyHref = `mailto:${t.applyEmail}?subject=${encodeURIComponent(t.heroTitle)}`;
  // Correo de reclutamiento en dos piezas: se parte tras la arroba si la columna es estrecha
  const [emailUser, emailDomain] = t.applyEmail.split("@");

  return (
    <div className="ss26 min-h-[100dvh]" data-testid="page-interns">
      <SEOHead page="interns" language={language} />
      <Header />

      <V3Main vista="pasantias" className="px">
        <div data-testid="section-interns-hero">
          <V3PageHeader
            id="px-pasantias-h"
            img={mezanine.src}
            alt={mezanine.alt}
            width={1536}
            height={1024}
            position="50% 52%"
            title={<span data-testid="text-interns-title">{keepProgramName(t.heroTitle)}</span>}
            lead={<span data-testid="text-interns-subtitle">{keepProgramName(t.heroSubtitle)}</span>}
          />
        </div>

        {/* Cómo postularse: la frase de Pasantías S&S y el correo (el único mailto), junto al formulario azul */}
        <section className="sh-contacto px-post" aria-labelledby="px-postular-h" data-testid="section-cta">
          <div className="sh-wrap">
            <div className="sh-contacto__grid px-filete">
              <div className="px-post__datos">
                <h2 id="px-postular-h" className="sh-h2" data-testid="text-cta-title">{t.ctaTitle}</h2>
                <p className="px-post__p">{keepProgramName(t.ctaIntro)}</p>
                <div className="px-post__correo">
                  <p className="px-post__p">{t.ctaInstructions}</p>
                  {/* A 320 px el correo no cabía: corte tras la arroba y overflow-wrap:anywhere */}
                  <a href={applyHref} className="px-correo" data-testid="link-cta-email">
                    {emailUser}@<wbr />{emailDomain}
                  </a>
                </div>
              </div>
              <Candidatura source="interns" idPrefix="px-cand" />
            </div>
          </div>
        </section>

        {/* La vuelta a Carreras: la página siguiente de la demo */}
        <div data-testid="button-view-careers">
          <V3NextPage href="/careers" title={t.viewCareers} label={nextLabel(language as LanguageCode)} ariaLabel={keepProgramName(t.heroTitle)} />
        </div>
      </V3Main>

      <Footer />
    </div>
  );
}
