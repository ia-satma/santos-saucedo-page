import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, isStaticSite } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead, { detailTitle } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { SplitSection } from "@/components/home26/primitives";
import type { LanguageCode } from "@shared/schema";

// Boletín (redacción, "Al pie del Monitor"): una frase, el correo, la casilla del aviso de
// privacidad y "Suscribirme". Sin beneficios, frecuencia ni "nunca será compartida", y sin
// marcadores que repitan la etiqueta. La publicación se nombra como en el menú de cada idioma
// (Monitor Laboral, Labor Monitor; en los demás, las noticias de la firma).

interface NewsletterFormData {
  email: string;
  consent: boolean;
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
  unavailableTitle: string;
  unavailableDescription: string;
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
    unavailableTitle: "Suscripción no disponible",
    unavailableDescription: "Por ahora no es posible suscribirse desde este sitio.",
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
    unavailableTitle: "Subscription unavailable",
    unavailableDescription: "Subscribing from this site is not available for now.",
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
    unavailableTitle: "Anmeldung nicht verfügbar",
    unavailableDescription: "Eine Anmeldung über diese Website ist derzeit nicht möglich.",
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
    unavailableTitle: "暂不提供订阅",
    unavailableDescription: "目前无法通过本网站订阅。",
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
    unavailableTitle: "구독 불가",
    unavailableDescription: "현재 이 사이트에서는 구독할 수 없습니다.",
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
    unavailableTitle: "購読はご利用いただけません",
    unavailableDescription: "現在、このサイトから購読することはできません。",
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
    unavailableTitle: "الاشتراك غير متاح",
    unavailableDescription: "لا يمكن الاشتراك من هذا الموقع حاليًا.",
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
    unavailableTitle: "Подписка недоступна",
    unavailableDescription: "Сейчас оформить подписку на этом сайте нельзя.",
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
    unavailableTitle: "Abonnement indisponible",
    unavailableDescription: "Il n’est pas possible de s’abonner depuis ce site pour le moment.",
  },
  it: {
    title: "Iscrizione alle notizie",
    subtitle: "Ricevere le notizie dello studio via e-mail.",
    emailLabel: "Indirizzo e-mail",
    consentBefore: "Ho letto e accetto l’",
    consentLink: "informativa sulla privacy",
    consentAfter: ".",
    submit: "Iscriviti",
    submitting: "Invio in corso…",
    emailRequired: "Inserisca un indirizzo e-mail valido.",
    emailInvalid: "Inserisca un indirizzo e-mail valido.",
    consentRequired: "Accetti l’informativa sulla privacy per inviare il modulo.",
    successTitle: "Iscrizione registrata",
    errorTitle: "Errore",
    errorDescription: "Non è stato possibile completare l’iscrizione. Riprovi più tardi.",
    unavailableTitle: "Iscrizione non disponibile",
    unavailableDescription: "Al momento non è possibile iscriversi da questo sito.",
  },
};

const getNewsletterFormSchema = (t: NewsletterStrings) =>
  z.object({
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    consent: z.boolean().refine((value) => value, { message: t.consentRequired }),
  });

export default function Newsletter() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const t = content[language] || content.en;
  const formSchema = getNewsletterFormSchema(t);

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      consent: false,
    },
  });

  const newsletterMutation = useMutation({
    // El correo y el idioma de la interfaz (preferredLanguage: el servidor guarda solo los
    // códigos admitidos). La aceptación del aviso es requisito del formulario, no un dato que se guarde
    mutationFn: async (data: NewsletterFormData) => {
      const response = await apiRequest("POST", "/api/newsletter", {
        email: data.email,
        preferredLanguage: language,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: t.successTitle });
      form.reset();
    },
    onError: () => {
      toast({
        title: t.errorTitle,
        description: t.errorDescription,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterFormData) => {
    if (isStaticSite) {
      toast({
        title: t.unavailableTitle,
        description: t.unavailableDescription,
        variant: "destructive",
      });
      return;
    }

    newsletterMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-newsletter">
      {/* Título de la pestaña = h1 (E5) */}
      <SEOHead page="newsletter" language={language} customTitle={detailTitle(t.title)} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-newsletter-hero">
        <div className="ss-container">
          <div className="max-w-3xl">
            <Eyebrow num="04" tone="navy" className="mb-6" />
            {/* Sin subtítulo en el héroe: la frase va en el cuerpo, sobre el formulario (G1) */}
            <h1
              id="newsletter-title"
              data-testid="text-newsletter-title"
            >
              {t.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          {/* Rejilla editorial de la portada (SplitSection, G1): la frase y el formulario en el
              cuerpo, desde la columna 5; el aside queda vacío (y no ocupa sitio bajo lg). Sin
              entrada al aparecer (G3). */}
          <section aria-labelledby="newsletter-title" data-testid="section-newsletter-form">
            <SplitSection asideClassName="hidden lg:block">
              <div className="max-w-xl">
                <p className="ss-lead mb-8" data-testid="text-newsletter-subtitle">
                  {t.subtitle}
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-newsletter">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-email">{t.emailLabel}</FormLabel>
                          <FormControl>
                            {/* 44 px: el objetivo táctil del sitio. En px y no h-11 (rem): bajo 360 px
                                el html baja a 14 px y h-11 quedaba en 38,5 px */}
                            <Input
                              className="h-[44px]"
                              type="email"
                              autoComplete="email"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage data-testid="error-email" />
                        </FormItem>
                      )}
                    />

                    {/* Casilla del aviso de privacidad: el ::before amplía el área táctil a 44 px
                        (min-h-0: en teléfono, index.css da 44 px de alto a todo botón y la casilla
                        salía estirada); la etiqueta entera también la marca (el enlace no: navega).
                        inline-link: el enlace sigue en la línea, sin el alto mínimo de los enlaces. */}
                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                className="relative mt-[3px] h-5 min-h-0 w-5 border-ss-input data-[state=checked]:border-primary before:absolute before:-inset-3"
                                data-testid="checkbox-consent"
                              />
                            </FormControl>
                            <FormLabel
                              className="text-[16px] font-normal leading-[1.5] text-ss-tinta"
                              data-testid="label-consent"
                            >
                              {t.consentBefore}
                              <Link
                                href="/privacy-policy"
                                className="inline-link text-ss-marino underline decoration-ss-input underline-offset-4 hover:decoration-ss-marino"
                                data-testid="link-consent-privacy"
                              >
                                {t.consentLink}
                              </Link>
                              {t.consentAfter}
                            </FormLabel>
                          </div>
                          <FormMessage data-testid="error-consent" />
                        </FormItem>
                      )}
                    />

                    {/* Enviar: el único botón Azul Marino lleno, 44 px de alto */}
                    <Button
                      type="submit"
                      className="min-h-[44px] w-full px-6 sm:w-auto"
                      disabled={newsletterMutation.isPending}
                      data-testid="button-subscribe"
                    >
                      {newsletterMutation.isPending ? t.submitting : t.submit}
                    </Button>
                  </form>
                </Form>
              </div>
            </SplitSection>
          </section>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
