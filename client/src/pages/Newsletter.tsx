/* Suscripción al Monitor Laboral (/newsletter) con el diseño de la demo v3 (aprobada el 5-11-2026): como
   Contacto en la demo, el título y la frase a la izquierda y el formulario en el panel azul (sh-form) a la
   derecha; al final, la página siguiente (el Monitor Laboral). El formulario es el de siempre: el correo,
   la casilla del aviso de privacidad y el campo trampa, POST /api/newsletter (en el build estático, el
   programa de correo), con los avisos de éxito, error y límite de envíos. Textos: panel «newsletter»
   (10 idiomas) y «forms» (activar o desactivar el formulario). */
import cmsDefaults from "@shared/cms-defaults.json";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, isStaticSite } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead, { detailTitle } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { chrome26 } from "@/components/home26/chrome26";
import type { LanguageCode, News } from "@shared/schema";
import { V3Main, V3NextPage } from "@/v3/shared";
import { MONITOR_RELATED, etiquetaSiguiente, useMonitorIntro } from "@/v3/paginas-sitio/textos";
import { MonitorNotas } from "@/v3/paginas-sitio/Monitor";
import "@/v3/paginas-sitio/paginas.css";

// Boletín (redacción, "Al pie del Monitor"): una frase, el correo, la casilla del aviso de
// privacidad y "Suscribirme". Sin beneficios, frecuencia ni "nunca será compartida", y sin
// marcadores que repitan la etiqueta. La publicación se nombra como en el menú de cada idioma
// (Monitor Laboral, Labor Monitor; en los demás, las noticias de la firma).

interface NewsletterFormData {
  email: string;
  consent: boolean;
  /** Campo trampa (J4): oculto; una persona lo deja vacío */
  website?: string;
}

interface NewsletterStrings {
  /** h1 y título de la pestaña (la misma cadena): la suscripción, con el nombre de la
      publicación del menú de cada idioma (nav[3]: Monitor Laboral, Labor Monitor, Nachrichten…) */
  title: string;
  /** Frase única, sobre el formulario en el cuerpo (con su punto; "。" en chino y japonés) */
  subtitle: string;
  emailLabel: string;
  /** Casilla: texto antes del enlace, el enlace (nombre del aviso en el pie) y el cierre */
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  submit: string;
  submitting: string;
  emailRequired: string;
  emailInvalid: string;
  consentRequired: string;
  successTitle: string;
  errorTitle: string;
  errorDescription: string;
  /** Respuesta 429 del servidor (J4): demasiados envíos desde la misma conexión */
  rateLimitedDescription: string;
  /** Build estático (sin servidor): se abre el programa de correo del visitante con la
      solicitud, como en Contacto; aviso neutro, no de error */
  staticTitle: string;
  staticDescription: string;
}

const content: Record<LanguageCode, NewsletterStrings> = {
  es: {
    title: "Suscripción al Monitor Laboral",
    subtitle: "Recibir el Monitor Laboral por correo.",
    emailLabel: "Correo electrónico",
    consentBefore: "He leído y acepto el ",
    consentLink: "aviso de privacidad",
    consentAfter: ".",
    submit: "Suscribirme",
    submitting: "Enviando…",
    emailRequired: "Escriba un correo válido.",
    emailInvalid: "Escriba un correo válido.",
    consentRequired: "Acepte el aviso de privacidad para enviar.",
    successTitle: "Suscripción registrada",
    errorTitle: "Error",
    errorDescription: "No fue posible completar la suscripción. Intente de nuevo más tarde.",
    rateLimitedDescription: "Demasiados envíos. Inténtelo más tarde.",
    staticTitle: "Enviar por correo",
    staticDescription: "Se abrió su programa de correo para enviar la solicitud de suscripción.",
  },
  en: {
    title: "Labor Monitor subscription",
    subtitle: "Receive the Labor Monitor by email.",
    emailLabel: "Email address",
    consentBefore: "I have read and accept the ",
    consentLink: "privacy notice",
    consentAfter: ".",
    submit: "Subscribe",
    submitting: "Sending…",
    emailRequired: "Enter a valid email address.",
    emailInvalid: "Enter a valid email address.",
    consentRequired: "Accept the privacy notice to submit.",
    successTitle: "Subscription registered",
    errorTitle: "Error",
    errorDescription: "The subscription could not be completed. Please try again later.",
    rateLimitedDescription: "Too many submissions. Please try again later.",
    staticTitle: "Send by email",
    staticDescription: "Your email program was opened to send the subscription request.",
  },
  de: {
    title: "Nachrichten abonnieren",
    subtitle: "Die Nachrichten der Kanzlei per E-Mail erhalten.",
    emailLabel: "E-Mail-Adresse",
    consentBefore: "Ich habe den ",
    consentLink: "Datenschutzhinweis",
    consentAfter: " gelesen und akzeptiere ihn.",
    submit: "Abonnieren",
    submitting: "Wird gesendet…",
    emailRequired: "Geben Sie eine gültige E-Mail-Adresse ein.",
    emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
    consentRequired: "Akzeptieren Sie den Datenschutzhinweis, um das Formular zu senden.",
    successTitle: "Anmeldung gespeichert",
    errorTitle: "Fehler",
    errorDescription: "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.",
    rateLimitedDescription: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
    staticTitle: "Per E-Mail senden",
    staticDescription: "Ihr E-Mail-Programm wurde geöffnet, um die Anmeldung zu senden.",
  },
  zh: {
    title: "订阅新闻",
    subtitle: "通过电子邮件接收本所新闻。",
    emailLabel: "电子邮件地址",
    consentBefore: "我已阅读并接受",
    consentLink: "隐私声明",
    consentAfter: "。",
    submit: "订阅",
    submitting: "发送中…",
    emailRequired: "请填写有效的电子邮件地址。",
    emailInvalid: "请填写有效的电子邮件地址。",
    consentRequired: "请接受隐私声明后再发送。",
    successTitle: "订阅已登记",
    errorTitle: "错误",
    errorDescription: "无法完成订阅。请稍后再试。",
    rateLimitedDescription: "提交次数过多。请稍后再试。",
    staticTitle: "通过电子邮件发送",
    staticDescription: "已打开您的电子邮件程序以发送订阅申请。",
  },
  ko: {
    title: "뉴스 구독",
    subtitle: "법인의 뉴스를 이메일로 받아 보실 수 있습니다.",
    emailLabel: "이메일 주소",
    consentBefore: "",
    consentLink: "개인정보 처리방침",
    consentAfter: "을 읽었으며 이에 동의합니다.",
    submit: "구독",
    submitting: "전송 중…",
    emailRequired: "올바른 이메일 주소를 입력해 주세요.",
    emailInvalid: "올바른 이메일 주소를 입력해 주세요.",
    consentRequired: "보내려면 개인정보 처리방침에 동의해 주세요.",
    successTitle: "구독이 등록되었습니다",
    errorTitle: "오류",
    errorDescription: "구독을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    rateLimitedDescription: "전송 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    staticTitle: "이메일로 보내기",
    staticDescription: "구독 신청을 보낼 수 있도록 이메일 프로그램을 열었습니다.",
  },
  ja: {
    title: "ニュースの購読",
    subtitle: "事務所のニュースをメールでお受け取りいただけます。",
    emailLabel: "メールアドレス",
    consentBefore: "",
    consentLink: "プライバシーポリシー",
    consentAfter: "を読み、同意します。",
    submit: "購読",
    submitting: "送信中…",
    emailRequired: "有効なメールアドレスを入力してください。",
    emailInvalid: "有効なメールアドレスを入力してください。",
    consentRequired: "送信するには、プライバシーポリシーに同意してください。",
    successTitle: "購読を登録しました",
    errorTitle: "エラー",
    errorDescription: "購読を完了できませんでした。しばらくしてからもう一度お試しください。",
    rateLimitedDescription: "送信回数が多すぎます。しばらくしてからもう一度お試しください。",
    staticTitle: "メールで送信",
    staticDescription: "購読の申し込みを送信するため、メールソフトを開きました。",
  },
  ar: {
    title: "الاشتراك في الأخبار",
    subtitle: "تلقّي أخبار المكتب عبر البريد الإلكتروني.",
    emailLabel: "عنوان البريد الإلكتروني",
    consentBefore: "قرأتُ ",
    consentLink: "إشعار الخصوصية",
    consentAfter: " وأوافق عليه.",
    submit: "اشترك",
    submitting: "جارٍ الإرسال…",
    emailRequired: "اكتب عنوان بريد إلكتروني صالحًا.",
    emailInvalid: "اكتب عنوان بريد إلكتروني صالحًا.",
    consentRequired: "وافق على إشعار الخصوصية لإرسال النموذج.",
    successTitle: "تم تسجيل الاشتراك",
    errorTitle: "خطأ",
    errorDescription: "تعذّر إتمام الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.",
    rateLimitedDescription: "عدد مرات الإرسال كبير جدًا. يرجى المحاولة مرة أخرى لاحقًا.",
    staticTitle: "الإرسال بالبريد الإلكتروني",
    staticDescription: "فُتح برنامج البريد الإلكتروني لديك لإرسال طلب الاشتراك.",
  },
  ru: {
    title: "Подписка на новости",
    subtitle: "Получать новости фирмы по электронной почте.",
    emailLabel: "Адрес электронной почты",
    consentBefore: "Я прочитал(а) ",
    consentLink: "политику конфиденциальности",
    consentAfter: " и принимаю её.",
    submit: "Подписаться",
    submitting: "Отправка…",
    emailRequired: "Укажите действительный адрес эл. почты.",
    emailInvalid: "Укажите действительный адрес эл. почты.",
    consentRequired: "Примите политику конфиденциальности, чтобы отправить форму.",
    successTitle: "Подписка оформлена",
    errorTitle: "Ошибка",
    errorDescription: "Не удалось оформить подписку. Попробуйте позже.",
    rateLimitedDescription: "Слишком много отправок. Попробуйте позже.",
    staticTitle: "Отправка по эл. почте",
    staticDescription: "Открылась ваша почтовая программа для отправки заявки на подписку.",
  },
  fr: {
    title: "Abonnement aux actualités",
    subtitle: "Recevoir les actualités du cabinet par e-mail.",
    emailLabel: "Adresse e-mail",
    consentBefore: "J’ai lu et j’accepte la ",
    consentLink: "politique de confidentialité",
    consentAfter: ".",
    submit: "S’abonner",
    submitting: "Envoi en cours…",
    emailRequired: "Saisissez une adresse e-mail valide.",
    emailInvalid: "Saisissez une adresse e-mail valide.",
    consentRequired: "Acceptez la politique de confidentialité pour envoyer le formulaire.",
    successTitle: "Abonnement enregistré",
    errorTitle: "Erreur",
    errorDescription: "L’abonnement n’a pas pu être enregistré. Veuillez réessayer plus tard.",
    rateLimitedDescription: "Trop d’envois. Veuillez réessayer plus tard.",
    staticTitle: "Envoyer par e-mail",
    staticDescription: "Votre messagerie s’est ouverte pour envoyer la demande d’abonnement.",
  },
  it: {
    title: "Iscrizione alle notizie",
    subtitle: "Ricevere le notizie dello studio via e-mail.",
    emailLabel: "Indirizzo e-mail",
    consentBefore: "Ho letto e accetto l’",
    consentLink: "informativa sulla privacy",
    consentAfter: ".",
    submit: "Iscriversi",
    submitting: "Invio in corso…",
    emailRequired: "Inserisca un indirizzo e-mail valido.",
    emailInvalid: "Inserisca un indirizzo e-mail valido.",
    consentRequired: "Accetti l’informativa sulla privacy per inviare il modulo.",
    successTitle: "Iscrizione registrata",
    errorTitle: "Errore",
    errorDescription: "Non è stato possibile completare l’iscrizione. Riprovi più tardi.",
    rateLimitedDescription: "Troppi invii. Riprovi più tardi.",
    staticTitle: "Invio per e-mail",
    staticDescription: "Si è aperto il suo programma di posta per inviare la richiesta di iscrizione.",
  },
};

const getNewsletterFormSchema = (t: NewsletterStrings) =>
  z.object({
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    consent: z.boolean().refine((value) => value, { message: t.consentRequired }),
    website: z.string().optional(),
  });

export default function Newsletter() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const editableContent = useCmsContent("newsletter", content);
  const t = editableContent[language] || editableContent.en;
  const formSchema = getNewsletterFormSchema(t);
  // Correo de la firma (/api/site-content, el mismo del pie y de Contacto) para el respaldo del
  // build estático
  const firmEmail = useSiteContact(language === "en" ? "en" : "es").email;
  // Página siguiente: el Monitor Laboral, con la etiqueta del menú (nav[3]) en cada idioma
  const liveChrome = useCmsContent("chrome", chrome26);
  const nav = (liveChrome[language as keyof typeof chrome26] ?? liveChrome.en).nav;
  const nextLabel = etiquetaSiguiente(language);
  // La entrada: la frase con que el sitio presenta el Monitor (la de /news y la portada)
  const intro = useMonitorIntro(language);
  // Al pie, las tres notas más recientes (si hay alguna publicada), como al pie de cada nota
  const related = useCmsContent("news-detail", MONITOR_RELATED);
  const relatedTitle = (related[language] ?? related.en).relatedNews;
  const { data: allNews } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const hasNews = !!allNews?.some((item) => item.published !== false);

  const formSettings = useCmsContent("forms",cmsDefaults.forms).newsletter;
  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      consent: false,
      website: "",
    },
  });
  const { errors, submitCount } = form.formState;

  const newsletterMutation = useMutation({
    // El correo y el idioma de la interfaz (preferredLanguage: el servidor guarda solo los
    // códigos admitidos), la aceptación del aviso (el servidor exige consent: true; no se
    // guarda) y el campo trampa (J4). Sin nombre ni apellido: el formulario solo pide el correo (D13)
    mutationFn: async (data: NewsletterFormData) => {
      const response = await apiRequest("POST", "/api/newsletter", {
        email: data.email,
        preferredLanguage: language,
        consent: data.consent,
        website: data.website ?? "",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: t.successTitle });
      form.reset();
    },
    onError: (error: Error) => {
      // apiRequest lanza "429: …" cuando el servidor limita los envíos (J4)
      const rateLimited = error.message.startsWith("429");
      toast({
        title: t.errorTitle,
        description: rateLimited ? t.rateLimitedDescription : t.errorDescription,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterFormData) => {
    // Sitio estático (sin servidor): el mismo respaldo que Contacto. La solicitud sale por el
    // programa de correo del visitante hacia la firma, con el correo y el idioma de la interfaz
    // (el preferredLanguage que guardaría el servidor); el aviso es neutro, no de error.
    if (isStaticSite) {
      const subject = encodeURIComponent("Suscripción al Monitor Laboral");
      const body = encodeURIComponent([`Email: ${data.email}`, `Idioma: ${language}`].join("\n"));
      window.location.href = `mailto:${firmEmail}?subject=${subject}&body=${body}`;
      toast({
        title: t.staticTitle,
        description: t.staticDescription,
      });
      return;
    }

    newsletterMutation.mutate(data);
  };

  const emailError = errors.email?.message;
  const consentError = submitCount > 0 ? errors.consent?.message : undefined;

  return (
    <div className="ss26 min-h-screen" data-testid="page-newsletter">
      {/* Título de la pestaña = h1 (E5) */}
      <SEOHead page="newsletter" language={language} customTitle={detailTitle(t.title)} />
      <Header />

      <V3Main vista="boletin">
        <div className="ps">
          <section className="sh-contacto ps-bol" aria-labelledby="newsletter-title">
            <div className="sh-wrap sh-contacto__grid">
              {/* El título (h1) y la frase que presenta el Monitor, como los datos de Contacto en la demo */}
              <div className="sh-contacto__datos" data-testid="section-newsletter-hero">
                <h1 id="newsletter-title" className="sh-h2" tabIndex={-1} data-testid="text-newsletter-title">{t.title}</h1>
                {intro ? <p className="sh-lead">{intro}</p> : null}
              </div>

              {/* El formulario en el panel azul. Sin entrada al aparecer (G3). */}
              <div data-testid="section-newsletter-form">
                {!formSettings.enabled ? (
                  <div className="sh-form">
                    <h2 className="sh-form__h" data-testid="text-newsletter-subtitle">{t.subtitle}</h2>
                    <p role="status" className="ps-bol__p">
                      {formSettings.disabledMessage[language as "es" | "en"] || formSettings.disabledMessage.en}
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="sh-form"
                    noValidate
                    aria-labelledby="newsletter-form-h"
                    data-testid="form-newsletter"
                  >
                    {/* La frase del panel (con su punto), como «Escríbanos» en el formulario de la demo */}
                    <h2 id="newsletter-form-h" className="sh-form__h" data-testid="text-newsletter-subtitle">{t.subtitle}</h2>
                    <div className="sh-campo">
                      <label htmlFor="bol-correo" data-testid="label-email">{t.emailLabel}</label>
                      <input
                        id="bol-correo"
                        type="email"
                        autoComplete="email"
                        aria-invalid={emailError ? true : undefined}
                        aria-describedby={emailError ? "bol-correo-error" : undefined}
                        {...form.register("email")}
                        data-testid="input-email"
                      />
                      {emailError ? (
                        <p id="bol-correo-error" className="sh-error" data-testid="error-email">{emailError}</p>
                      ) : null}
                    </div>

                    {/* La casilla del aviso de privacidad: la etiqueta entera la marca (el enlace no:
                        navega). El aviso de error, solo después del primer envío. */}
                    <div className="ps-bol__campo-check">
                      <label className="sh-check" data-testid="label-consent">
                        <input
                          type="checkbox"
                          aria-invalid={consentError ? true : undefined}
                          aria-describedby={consentError ? "bol-aviso-error" : undefined}
                          {...form.register("consent")}
                          data-testid="checkbox-consent"
                        />
                        <span>
                          {t.consentBefore}
                          <Link href="/privacy-policy" data-testid="link-consent-privacy">{t.consentLink}</Link>
                          {t.consentAfter}
                        </span>
                      </label>
                      {consentError ? (
                        <p id="bol-aviso-error" className="sh-error" data-testid="error-consent">{consentError}</p>
                      ) : null}
                    </div>

                    {/* Campo trampa (J4): fuera de la vista (sr-only, sin desbordar en árabe) y de
                        los lectores de pantalla (aria-hidden), fuera del orden del teclado y sin
                        autocompletar. Solo un programa lo rellena. */}
                    <div className="sr-only" aria-hidden="true">
                      <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} data-testid="input-website" />
                    </div>

                    <button type="submit" className="sh-btn" disabled={newsletterMutation.isPending} data-testid="button-subscribe">
                      {newsletterMutation.isPending ? t.submitting : t.submit}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {hasNews ? (
            <section className="ps-rel ps-rel--bol" aria-labelledby="bol-rel-h" data-testid="section-newsletter-news">
              <div className="sh-wrap">
                <div className="ps-rel__cab">
                  <h2 id="bol-rel-h" className="sh-h2">{relatedTitle}</h2>
                </div>
                <MonitorNotas
                  limit={3}
                  headingLevel="h3"
                  testIds={{
                    row: (item) => `card-newsletter-news-${item.id}`,
                    title: (item) => `text-newsletter-news-title-${item.id}`,
                  }}
                />
              </div>
            </section>
          ) : null}

          <V3NextPage href="/news" label={nextLabel} title={nav[3].label} ariaLabel={nextLabel} />
        </div>
      </V3Main>

      <Footer />
    </div>
  );
}
