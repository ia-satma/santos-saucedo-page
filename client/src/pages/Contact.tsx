import cmsDefaults from "@shared/cms-defaults.json";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, isStaticSite } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { anyPartnerHasDirectContact } from "@/lib/partnerContact";
import { PRACTICE_SLUGS, practiceShortName, usePracticeNames } from "@/lib/practiceNames";
// El recorte de la portada (sin el letrero ni el estacionamiento), no el original
import { TextLink } from "@/components/home26/primitives";
import { useOfficeLabel } from "@/lib/officeLabel";
// La fachada de la oficina (oficina/fachada, sin el estacionamiento): la misma de la portada y de /offices
import fachada768 from "@assets/ss26/oficina/fachada-768.webp";
import fachada1536 from "@assets/ss26/oficina/fachada-1536.webp";
import type { SiteContent, ContactFormData, LanguageCode, TeamMember } from "@shared/schema";

// Perfil de LinkedIn del despacho. Sin URL confirmada el botón "Síguenos en LinkedIn"
// no se muestra (antes enlazaba a /contact en otra pestaña). Para activarlo, poner aquí
// la URL externa (https://www.linkedin.com/company/…).
const FIRM_LINKEDIN_URL: string | null = null;

// Prácticas de la firma y "Otro". Los valores no cambian: son los slugs que guarda /api/contact.
// Etiquetas: las cortas de lib/practiceNames (en español, las del documento de redacción:
// Laboral · Corporativo · Migratorio · Litigio; en cada idioma, el mismo término que usa el
// resto del sitio para esa práctica). Antes el formulario usaba la lista heredada de
// @shared/schema (fusiones, competencia, energía…), que no son prácticas de Santos & Saucedo.
const OTHER_VALUE = "otro";
const OTHER_LABEL: Record<LanguageCode, string> = {
  es: "Otro", en: "Other", de: "Sonstiges", zh: "其他", ko: "기타", ja: "その他", ar: "أخرى", ru: "Другое", fr: "Autre", it: "Altro",
};
const PRACTICE_OPTIONS: string[] = [...PRACTICE_SLUGS, OTHER_VALUE];



// Lista de datos de la oficina: filas con filete superior; etiqueta (dt) en la sans
// versal espaciada, Gris Medio; dato (dd) en la sans de 17 px, Gris Tinta. Etiqueta al lado
// del dato solo con la ficha a todo el ancho (sm–md); en la columna de 5/12 del escritorio,
// encima (a 1024 px la dirección se partía en seis líneas y el correo salía del filete).
const rowClass = "grid grid-cols-1 gap-y-1 border-t border-ss-rule py-4 sm:grid-cols-[11rem,1fr] sm:gap-x-6 lg:grid-cols-1";
const dtClass = "ss-label text-ss-medio sm:pt-1 lg:pt-0";
const ddClass = "text-[17px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";

// Titulares: .ss-h2 (index.css), la escala única de las secciones de página.

// Mensajes de validación en registro sobrio (G9): qué escribir, sin "es requerido" ni "Por
// favor"; el formato del correo y el campo vacío dicen lo mismo
const validationMessages: Record<LanguageCode, {
  fullNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
  consentRequired: string;
}> = {
  en: {
    fullNameRequired: "Enter your name.",
    emailRequired: "Enter a valid email address.",
    emailInvalid: "Enter a valid email address.",
    messageRequired: "Enter your message.",
    consentRequired: "Accept the privacy notice to submit.",
  },
  es: {
    fullNameRequired: "Escriba su nombre.",
    emailRequired: "Escriba un correo válido.",
    emailInvalid: "Escriba un correo válido.",
    messageRequired: "Escriba su mensaje.",
    consentRequired: "Acepte el aviso de privacidad para enviar.",
  },
  de: {
    fullNameRequired: "Geben Sie Ihren Namen ein.",
    emailRequired: "Geben Sie eine gültige E-Mail-Adresse ein.",
    emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
    messageRequired: "Geben Sie Ihre Nachricht ein.",
    consentRequired: "Akzeptieren Sie den Datenschutzhinweis, um das Formular zu senden.",
  },
  zh: {
    fullNameRequired: "请填写姓名。",
    emailRequired: "请填写有效的电子邮件地址。",
    emailInvalid: "请填写有效的电子邮件地址。",
    messageRequired: "请填写留言。",
    consentRequired: "请接受隐私声明后再发送。",
  },
  ko: {
    fullNameRequired: "이름을 입력해 주세요.",
    emailRequired: "올바른 이메일 주소를 입력해 주세요.",
    emailInvalid: "올바른 이메일 주소를 입력해 주세요.",
    messageRequired: "메시지를 입력해 주세요.",
    consentRequired: "보내려면 개인정보 처리방침에 동의해 주세요.",
  },
  ja: {
    fullNameRequired: "氏名を入力してください。",
    emailRequired: "有効なメールアドレスを入力してください。",
    emailInvalid: "有効なメールアドレスを入力してください。",
    messageRequired: "メッセージを入力してください。",
    consentRequired: "送信するには、プライバシーポリシーに同意してください。",
  },
  ar: {
    fullNameRequired: "اكتب اسمك.",
    emailRequired: "اكتب عنوان بريد إلكتروني صالحًا.",
    emailInvalid: "اكتب عنوان بريد إلكتروني صالحًا.",
    messageRequired: "اكتب رسالتك.",
    consentRequired: "وافق على إشعار الخصوصية لإرسال النموذج.",
  },
  ru: {
    fullNameRequired: "Укажите имя.",
    emailRequired: "Укажите действительный адрес эл. почты.",
    emailInvalid: "Укажите действительный адрес эл. почты.",
    messageRequired: "Напишите сообщение.",
    consentRequired: "Примите политику конфиденциальности, чтобы отправить форму.",
  },
  fr: {
    fullNameRequired: "Saisissez votre nom.",
    emailRequired: "Saisissez une adresse e-mail valide.",
    emailInvalid: "Saisissez une adresse e-mail valide.",
    messageRequired: "Saisissez votre message.",
    consentRequired: "Acceptez la politique de confidentialité pour envoyer le formulaire.",
  },
  it: {
    fullNameRequired: "Inserisca il suo nome.",
    emailRequired: "Inserisca un indirizzo e-mail valido.",
    emailInvalid: "Inserisca un indirizzo e-mail valido.",
    messageRequired: "Inserisca il suo messaggio.",
    consentRequired: "Accetti l’informativa sulla privacy per inviare il modulo.",
  },
};

const getContactFormSchema = (language: LanguageCode) => {
  const t = validationMessages[language] || validationMessages.en;

  return z.object({
    fullName: z.string().min(1, t.fullNameRequired),
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    company: z.string().optional(),
    practiceArea: z.string().optional(),
    message: z.string().min(1, t.messageRequired),
    // Casilla del aviso de privacidad, obligatoria como en el boletín (el servidor también la exige)
    consent: z.boolean().refine((value) => value, { message: t.consentRequired }),
    // Campo trampa (J4): oculto; una persona lo deja vacío
    website: z.string().optional(),
  });
};

// Valores del formulario: los datos que recibe /api/contact (sin teléfono: el documento de
// redacción no lo pide), la aceptación del aviso (el servidor exige consent: true) y el campo
// trampa "website" (J4: si llega lleno, el servidor responde como si guardara y no guarda).
type ContactFormValues = Omit<ContactFormData, "phone"> & { consent: boolean; website?: string };

// Casilla del aviso de privacidad: los mismos textos que el boletín (Newsletter.tsx); el
// enlace lleva el nombre del aviso en el pie de cada idioma.
const consentText: Record<LanguageCode, { before: string; link: string; after: string }> = {
  es: { before: "He leído y acepto el ", link: "aviso de privacidad", after: "." },
  en: { before: "I have read and accept the ", link: "privacy notice", after: "." },
  de: { before: "Ich habe den ", link: "Datenschutzhinweis", after: " gelesen und akzeptiere ihn." },
  zh: { before: "我已阅读并接受", link: "隐私声明", after: "。" },
  ko: { before: "", link: "개인정보 처리방침", after: "을 읽었으며 이에 동의합니다." },
  ja: { before: "", link: "プライバシーポリシー", after: "を読み、同意します。" },
  ar: { before: "قرأتُ ", link: "إشعار الخصوصية", after: " وأوافق عليه." },
  ru: { before: "Я прочитал(а) ", link: "политику конфиденциальности", after: " и принимаю её." },
  fr: { before: "J’ai lu et j’accepte la ", link: "politique de confidentialité", after: "." },
  it: { before: "Ho letto e accetto l’", link: "informativa sulla privacy", after: "." },
};

// Avisos tras enviar. staticTitle/staticDescription: el build estático (sin servidor) abre el
// programa de correo del visitante con el mensaje; el aviso va en el idioma de la página.
const toastMessages: Record<LanguageCode, {
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
  /** Respuesta 429 del servidor (J4): demasiados envíos desde la misma conexión */
  rateLimitedDescription: string;
  staticTitle: string;
  staticDescription: string;
}> = {
  en: {
    successTitle: "Message sent",
    successDescription: "We have received your message.",
    errorTitle: "Error",
    errorDescription: "The message could not be sent. Please try again later.",
    rateLimitedDescription: "Too many submissions. Please try again later.",
    staticTitle: "Send by email",
    staticDescription: "Your email program was opened to send the message.",
  },
  es: {
    successTitle: "Mensaje enviado",
    successDescription: "Recibimos su mensaje.",
    errorTitle: "Error",
    errorDescription: "No fue posible enviar el mensaje. Intente de nuevo más tarde.",
    rateLimitedDescription: "Demasiados envíos. Inténtelo más tarde.",
    staticTitle: "Enviar por correo",
    staticDescription: "Se abrió su programa de correo para enviar el mensaje.",
  },
  de: {
    successTitle: "Nachricht gesendet",
    successDescription: "Wir haben Ihre Nachricht erhalten.",
    errorTitle: "Fehler",
    errorDescription: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
    rateLimitedDescription: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
    staticTitle: "Per E-Mail senden",
    staticDescription: "Ihr E-Mail-Programm wurde geöffnet, um die Nachricht zu senden.",
  },
  zh: {
    successTitle: "消息已发送",
    successDescription: "我们已收到您的消息。",
    errorTitle: "错误",
    errorDescription: "无法发送消息。请稍后再试。",
    rateLimitedDescription: "提交次数过多。请稍后再试。",
    staticTitle: "通过电子邮件发送",
    staticDescription: "已打开您的电子邮件程序以发送消息。",
  },
  ko: {
    successTitle: "메시지 전송 완료",
    successDescription: "메시지를 받았습니다.",
    errorTitle: "오류",
    errorDescription: "메시지를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
    rateLimitedDescription: "전송 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    staticTitle: "이메일로 보내기",
    staticDescription: "메시지를 보낼 수 있도록 이메일 프로그램을 열었습니다.",
  },
  ja: {
    successTitle: "メッセージを送信しました",
    successDescription: "メッセージを受け付けました。",
    errorTitle: "エラー",
    errorDescription: "メッセージを送信できませんでした。しばらくしてからもう一度お試しください。",
    rateLimitedDescription: "送信回数が多すぎます。しばらくしてからもう一度お試しください。",
    staticTitle: "メールで送信",
    staticDescription: "メッセージを送信するため、メールソフトを開きました。",
  },
  ar: {
    successTitle: "تم إرسال الرسالة",
    successDescription: "تلقّينا رسالتك.",
    errorTitle: "خطأ",
    errorDescription: "تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقًا.",
    rateLimitedDescription: "عدد مرات الإرسال كبير جدًا. يرجى المحاولة مرة أخرى لاحقًا.",
    staticTitle: "الإرسال بالبريد الإلكتروني",
    staticDescription: "فُتح برنامج البريد الإلكتروني لديك لإرسال الرسالة.",
  },
  ru: {
    successTitle: "Сообщение отправлено",
    successDescription: "Мы получили ваше сообщение.",
    errorTitle: "Ошибка",
    errorDescription: "Не удалось отправить сообщение. Попробуйте позже.",
    rateLimitedDescription: "Слишком много отправок. Попробуйте позже.",
    staticTitle: "Отправка по эл. почте",
    staticDescription: "Открылась ваша почтовая программа для отправки сообщения.",
  },
  fr: {
    successTitle: "Message envoyé",
    successDescription: "Nous avons bien reçu votre message.",
    errorTitle: "Erreur",
    errorDescription: "Le message n’a pas pu être envoyé. Veuillez réessayer plus tard.",
    rateLimitedDescription: "Trop d’envois. Veuillez réessayer plus tard.",
    staticTitle: "Envoyer par e-mail",
    staticDescription: "Votre messagerie s’est ouverte pour envoyer le message.",
  },
  it: {
    successTitle: "Messaggio inviato",
    successDescription: "Abbiamo ricevuto il suo messaggio.",
    errorTitle: "Errore",
    errorDescription: "Non è stato possibile inviare il messaggio. Riprovi più tardi.",
    rateLimitedDescription: "Troppi invii. Riprovi più tardi.",
    staticTitle: "Invio per e-mail",
    staticDescription: "Si è aperto il suo programma di posta per inviare il messaggio.",
  },
};

export default function Contact() {
  const siteDetails = useSiteDetails();
  const { shortName: practiceShortName } = usePracticeNames();
  const { data: contactPractices = [] } = useQuery<import("@shared/schema").PracticeGroup[]>({queryKey:["/api/practice-groups"]});
  const practiceOptions = [...contactPractices.map(p=>p.slug), OTHER_VALUE];

  function practiceOptionLabel(value: string, language: LanguageCode): string {
  return (language === "es" ? contactPractices.find(p=>p.slug===value)?.nameEs : language === "en" ? contactPractices.find(p=>p.slug===value)?.name : practiceShortName(value, language)) ?? OTHER_LABEL[language] ?? OTHER_LABEL.en;
}
  const { photos } = useCmsMedia();
  const officeNameFor = useOfficeLabel();
  const { language } = useLanguage();
  const { toast } = useToast();

  const { data: siteContent, isLoading } = useQuery<SiteContent>({
    queryKey: ["/api/site-content"],
  });

  // La frase "Los datos de contacto de cada socio aparecen en su ficha." solo es verdad si algún
  // socio nombrado tiene correo o teléfono propios (distintos de los generales de la firma, la
  // misma regla que la ficha: lib/partnerContact). Hoy ninguno los tiene y la frase no sale (G6).
  const firmContact = useSiteContact(language === "en" ? "en" : "es");
  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });
  const showPartnersNote = anyPartnerHasDirectContact(teamMembers, firmContact);

  const formSchema = getContactFormSchema(language);

  const formSettings = useCmsContent("forms",cmsDefaults.forms).contact;
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      practiceArea: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  const livetoastMessages = useCmsContent("contact-feedback", toastMessages);
  const toastT = livetoastMessages[language] || livetoastMessages.en;
  const liveconsentText = useCmsContent("contact-consent", consentText);
  const consentT = liveconsentText[language] || liveconsentText.en;

  const contactMutation = useMutation({
    // Con consent (el servidor exige true) y el campo trampa
    mutationFn: async (data: ContactFormValues) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: toastT.successTitle,
        description: toastT.successDescription,
      });
      form.reset();
    },
    onError: (error: Error) => {
      // apiRequest lanza "429: …" cuando el servidor limita los envíos (J4)
      const rateLimited = error.message.startsWith("429");
      toast({
        title: toastT.errorTitle,
        description: rateLimited ? toastT.rateLimitedDescription : toastT.errorDescription,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    if (isStaticSite) {
      const subject = encodeURIComponent(`Contacto web - ${data.fullName}`);
      const body = encodeURIComponent(
        [
          `Nombre: ${data.fullName}`,
          `Email: ${data.email}`,
          data.company ? `Empresa: ${data.company}` : "",
          data.practiceArea
            ? `Área: ${practiceOptionLabel(data.practiceArea, "es")}`
            : "",
          "",
          data.message,
        ].filter(Boolean).join("\n"),
      );

      window.location.href = `mailto:${siteContent?.email || "info@santossaucedo.com"}?subject=${subject}&body=${body}`;
      // Sitio estático (sin servidor): el mensaje sale por el programa de correo del visitante
      toast({
        title: toastT.staticTitle,
        description: toastT.staticDescription,
      });
      return;
    }

    contactMutation.mutate(data);
  };

  const content: Record<LanguageCode, {
    title: string;
    /** Bajo los datos de la oficina, antes de "Cómo llegar" (como en el documento de redacción) */
    partnersNote: string;
    officesTitle: string;
    building: string;
    floor: string;
    street: string;
    colony: string;
    city: string;
    phone: string;
    fax: string;
    email: string;
    hours: string;
    hoursDetails: string;
    getDirections: string;
    photoAlt: string;
    newTab: string;
    addressLabel: string;
    telLabel: string;
    formTitle: string;
    formSubtitle: string;
    fullName: string;
    emailLabel: string;
    companyLabel: string;
    practiceAreaLabel: string;
    messageLabel: string;
    submit: string;
    submitting: string;
  }> = {
    en: {
      title: "Contact",
      partnersNote: "Each partner’s contact details appear on their profile.",
      officesTitle: "Office",
      building: "Río Tamazunchale 205 Norte",
      floor: "",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Office hours",
      hoursDetails: "Monday to Friday, 9:00–19:00",
      getDirections: "Get directions",
      photoAlt: "Glass facade of the Santos & Saucedo offices reflecting the Cerro de la Silla",
      newTab: "(opens in a new tab)",
      telLabel: "Telephone",
      addressLabel: "Address",
      formTitle: "Message",
      formSubtitle: "Submitting this form does not create an attorney-client relationship.",
      fullName: "Full name",
      emailLabel: "Email",
      companyLabel: "Company (optional)",
      practiceAreaLabel: "Practice (optional)",
      messageLabel: "Message",
      submit: "Send message",
      submitting: "Sending…",
    },
    es: {
      title: "Contacto",
      partnersNote: "Los datos de contacto de cada socio aparecen en su ficha.",
      officesTitle: "Oficina",
      building: "Río Tamazunchale 205 Norte",
      floor: "",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Horario de oficina",
      hoursDetails: "Lunes a viernes, 9:00–19:00 h",
      getDirections: "Cómo llegar",
      photoAlt: "Fachada de cristal de las oficinas de Santos & Saucedo con el Cerro de la Silla reflejado",
      newTab: "(se abre en otra pestaña)",
      telLabel: "Teléfono",
      addressLabel: "Dirección",
      formTitle: "Mensaje",
      formSubtitle: "El envío de este formulario no crea una relación abogado-cliente.",
      fullName: "Nombre completo",
      emailLabel: "Correo electrónico",
      companyLabel: "Empresa (opcional)",
      practiceAreaLabel: "Práctica (opcional)",
      messageLabel: "Mensaje",
      submit: "Enviar mensaje",
      submitting: "Enviando…",
    },
    de: {
      title: "Kontakt",
      partnersNote: "Die Kontaktdaten der einzelnen Partner stehen in ihrem jeweiligen Profil.",
      officesTitle: "Büro",
      building: "Río Tamazunchale 205 Norte",
      floor: "18. Stock",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Öffnungszeiten",
      hoursDetails: "Montag bis Freitag, 9:00–19:00 Uhr",
      getDirections: "Anfahrt",
      photoAlt: "Glasfassade des Büros von Santos & Saucedo, in der sich der Cerro de la Silla spiegelt",
      newTab: "(öffnet in einem neuen Tab)",
      telLabel: "Telefon",
      addressLabel: "Adresse",
      formTitle: "Nachricht",
      formSubtitle: "Die Übermittlung dieses Formulars begründet kein Mandatsverhältnis.",
      fullName: "Name",
      emailLabel: "E-Mail",
      companyLabel: "Unternehmen (optional)",
      practiceAreaLabel: "Praxisbereich (optional)",
      messageLabel: "Nachricht",
      submit: "Nachricht senden",
      submitting: "Wird gesendet…",
    },
    zh: {
      title: "联系我们",
      partnersNote: "各合伙人的联系方式见其个人页面。",
      officesTitle: "办公地址",
      building: "Río Tamazunchale 205 Norte",
      floor: "18层",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "办公时间",
      hoursDetails: "周一至周五 9:00–19:00",
      getDirections: "获取路线",
      photoAlt: "Santos & Saucedo 办公室的玻璃外墙，映出 Cerro de la Silla",
      newTab: "（在新标签页中打开）",
      telLabel: "电话",
      addressLabel: "地址",
      formTitle: "留言",
      formSubtitle: "提交本表格并不构成律师与客户之间的委托关系。",
      fullName: "姓名",
      emailLabel: "电子邮件",
      companyLabel: "公司 (可选)",
      practiceAreaLabel: "业务领域 (可选)",
      messageLabel: "留言",
      submit: "发送消息",
      submitting: "发送中…",
    },
    ko: {
      title: "문의하기",
      partnersNote: "각 파트너의 연락처는 해당 프로필에 있습니다.",
      officesTitle: "사무소",
      building: "Río Tamazunchale 205 Norte",
      floor: "18층",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "업무 시간",
      hoursDetails: "월요일–금요일 9:00–19:00",
      getDirections: "길찾기",
      photoAlt: "Cerro de la Silla가 비치는 Santos & Saucedo 사무소의 유리 외벽",
      newTab: "(새 탭에서 열림)",
      telLabel: "전화",
      addressLabel: "주소",
      formTitle: "메시지",
      formSubtitle: "이 양식을 제출하는 것만으로 변호사와 의뢰인 관계가 성립하지는 않습니다.",
      fullName: "이름",
      emailLabel: "이메일",
      companyLabel: "회사명 (선택사항)",
      practiceAreaLabel: "업무 분야 (선택사항)",
      messageLabel: "메시지",
      submit: "메시지 전송",
      submitting: "전송 중…",
    },
    ja: {
      title: "お問い合わせ",
      partnersNote: "各パートナーの連絡先は、それぞれのプロフィールに掲載しています。",
      officesTitle: "事務所",
      building: "Río Tamazunchale 205 Norte",
      floor: "18階",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "営業時間",
      hoursDetails: "月曜日〜金曜日 9:00–19:00",
      getDirections: "アクセス",
      photoAlt: "Cerro de la Silla が映る Santos & Saucedo のオフィスのガラス張りの外観",
      newTab: "（新しいタブで開きます）",
      telLabel: "電話",
      addressLabel: "所在地",
      formTitle: "メッセージ",
      formSubtitle: "本フォームの送信によって、弁護士と依頼者の関係が成立するものではありません。",
      fullName: "氏名",
      emailLabel: "メールアドレス",
      companyLabel: "会社名 (任意)",
      practiceAreaLabel: "業務分野 (任意)",
      messageLabel: "メッセージ",
      submit: "メッセージを送信",
      submitting: "送信中…",
    },
    ar: {
      title: "اتصل بنا",
      partnersNote: "تظهر بيانات الاتصال بكل شريك في صفحته الشخصية.",
      officesTitle: "المكتب",
      building: "Río Tamazunchale 205 Norte",
      floor: "الطابق 18",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "ساعات العمل",
      hoursDetails: "من الاثنين إلى الجمعة، \u20669:00–19:00\u2069", // horario aislado (LRI…PDI): sin él se leía "19:00–9:00"
      getDirections: "كيفية الوصول",
      photoAlt: "الواجهة الزجاجية لمكتب Santos & Saucedo وينعكس عليها جبل Cerro de la Silla",
      newTab: "(يُفتح في علامة تبويب جديدة)",
      telLabel: "الهاتف",
      addressLabel: "العنوان",
      formTitle: "الرسالة",
      formSubtitle: "إرسال هذا النموذج لا يُنشئ علاقة بين محامٍ وموكّل.",
      fullName: "الاسم الكامل",
      emailLabel: "البريد الإلكتروني",
      companyLabel: "الشركة (اختياري)",
      practiceAreaLabel: "مجال الممارسة (اختياري)",
      messageLabel: "الرسالة",
      submit: "إرسال الرسالة",
      submitting: "جاري الإرسال…",
    },
    ru: {
      title: "Контакты",
      partnersNote: "Контактные данные каждого партнёра указаны в его профиле.",
      officesTitle: "Офис",
      building: "Río Tamazunchale 205 Norte",
      floor: "18 этаж",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Часы работы",
      hoursDetails: "Понедельник — пятница, 9:00–19:00",
      getDirections: "Как добраться",
      photoAlt: "Стеклянный фасад офиса Santos & Saucedo, в котором отражается гора Серро-де-ла-Силья",
      newTab: "(откроется в новой вкладке)",
      telLabel: "Телефон",
      addressLabel: "Адрес",
      formTitle: "Сообщение",
      formSubtitle: "Отправка этой формы не устанавливает отношений адвоката и клиента.",
      fullName: "Имя",
      emailLabel: "Эл. почта",
      companyLabel: "Компания (необязательно)",
      practiceAreaLabel: "Практика (необязательно)",
      messageLabel: "Сообщение",
      submit: "Отправить сообщение",
      submitting: "Отправка…",
    },
    fr: {
      title: "Contact",
      partnersNote: "Les coordonnées de chaque associé figurent sur sa fiche.",
      officesTitle: "Bureau",
      building: "Río Tamazunchale 205 Norte",
      floor: "18ème étage",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, MéxicoMexique",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Heures d’ouverture",
      hoursDetails: "Du lundi au vendredi, de 9 h à 19 h",
      getDirections: "Itinéraire",
      photoAlt: "Façade vitrée des bureaux de Santos & Saucedo, où se reflète le Cerro de la Silla",
      newTab: "(s’ouvre dans un nouvel onglet)",
      telLabel: "Téléphone",
      addressLabel: "Adresse",
      formTitle: "Message",
      formSubtitle: "L’envoi de ce formulaire ne crée pas de relation avocat-client.",
      fullName: "Nom complet",
      emailLabel: "E-mail",
      companyLabel: "Entreprise (facultatif)",
      practiceAreaLabel: "Domaine de pratique (facultatif)",
      messageLabel: "Message",
      submit: "Envoyer le message",
      submitting: "Envoi en cours…",
    },
    it: {
      title: "Contatti",
      partnersNote: "I recapiti di ciascun socio sono indicati nella sua scheda.",
      officesTitle: "Sede",
      building: "Río Tamazunchale 205 Norte",
      floor: "18° piano",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, MéxicoMessico",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Orari di apertura",
      hoursDetails: "Dal lunedì al venerdì, 9:00–19:00",
      getDirections: "Indicazioni stradali",
      photoAlt: "Facciata in vetro degli uffici di Santos & Saucedo con il Cerro de la Silla riflesso",
      newTab: "(si apre in una nuova scheda)",
      telLabel: "Telefono",
      addressLabel: "Indirizzo",
      formTitle: "Messaggio",
      formSubtitle: "L’invio di questo modulo non costituisce un rapporto avvocato-cliente.",
      fullName: "Nome",
      emailLabel: "E-mail",
      companyLabel: "Azienda (opzionale)",
      practiceAreaLabel: "Area di pratica (opzionale)",
      messageLabel: "Messaggio",
      submit: "Inviare il messaggio",
      submitting: "Invio in corso…",
    },
  };

  const editableContent = useCmsContent("contact", content);
  const baseT = editableContent[language] || editableContent.en;
  const t = { ...baseT, phone: firmContact.phone, email: firmContact.email, street: firmContact.address[0] || "", colony: firmContact.address[1] || "", city: firmContact.address.slice(2).join(", ") };

  // "Cómo llegar": las indicaciones de Google Maps en otra pestaña. Sin mapa incrustado: al
  // cargarse, el iframe de Google podía fijar cookies y recibir la IP del visitante (el sitio
  // público ya no carga terceros).
  // "Col. del Valle", como la ficha, el pie y el documento de redacción
  const directionsUrl = "https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+Col.+del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220";

  return (
    <div className="min-h-screen bg-background" data-testid="page-contact">
      <SEOHead page="contact" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-contact-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="06" tone="navy" className="mb-6" />
              {/* Sin subtítulo: la frase de los socios va bajo los datos de la oficina */}
              <h1 data-testid="text-contact-title">
                {t.title}
              </h1>
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-20">
          {/* Ficha de la oficina a la izquierda y formulario a la derecha. En el teléfono, por
              orden del documento: ficha, formulario y, al final, la foto del edificio. En
              escritorio la foto va bajo la ficha (fila 2) y el formulario ocupa las dos filas. */}
          <div className="ss-container grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-12">
            {/* Oficina: lista de datos con filetes (sin tarjeta ni iconos) y el enlace "Cómo llegar" */}
            <section
              className="lg:col-span-5"
              data-testid="section-contact-office"
            >
              <h2 className="ss-h2 mb-8" data-testid="text-offices-title">
                {t.officesTitle}
              </h2>

              <div data-testid="card-main-office">
                <dl className="border-b border-ss-rule">
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.addressLabel}</dt>
                    {/* Líneas en <div> y teléfono con el tamaño del dd: la regla móvil de
                        index.css lleva los <span> a 16 px y la lista quedaba con dos tamaños */}
                    <dd className={ddClass} data-testid="text-office-address">
                      <div>{t.street}</div>
                      <div>{t.colony}</div>
                      <div>{t.city}</div>
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.telLabel}</dt>
                    <dd className={ddClass}>
                      <a
                        href={`tel:${t.phone.replace(/\s/g, '')}`}
                        className={ddLinkClass}
                        data-testid="link-office-phone"
                      >
                        <span dir="ltr" className="[font-size:inherit]">{t.phone}</span>
                      </a>
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.emailLabel}</dt>
                    <dd className={ddClass}>
                      <a
                        href={`mailto:${t.email}`}
                        className={ddLinkClass}
                        data-testid="link-office-email"
                      >
                        {t.email}
                      </a>
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.hours}</dt>
                    <dd className={ddClass} data-testid="text-office-hours">
                      {t.hoursDetails}
                    </dd>
                  </div>
                  {siteDetails.linkedinUrl && (
                    <div className={rowClass}>
                      <dt className={dtClass}>LinkedIn</dt>
                      <dd className={ddClass}>
                        <a
                          href={siteDetails.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={ddLinkClass}
                          data-testid="button-linkedin"
                        >
                          Santos&nbsp;&amp;&nbsp;Saucedo
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Como en el documento de redacción: bajo los datos de la oficina, en texto
                    pequeño, antes de "Cómo llegar" (antes era el subtítulo del encabezado). Solo
                    si algún socio tiene datos directos en su ficha (G6) */}
                {showPartnersNote && (
                  <p
                    className="mt-6 max-w-md text-[15px] leading-[1.5] text-ss-medio"
                    data-testid="text-contact-subtitle"
                  >
                    {t.partnersNote}
                  </p>
                )}

                {/* "Cómo llegar" y, junto a él, la página de la oficina (su nombre en officeLabel).
                    Uno al lado del otro; si no caben, uno debajo del otro */}
                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
                  {/* Mismo aspecto que TextLink (etiqueta, subrayado, flecha y área táctil ampliada);
                      <a> propio porque TextLink es un Link de wouter y este destino es externo */}
                  <a
                    href={siteDetails.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ss-label group relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3"
                    data-testid="button-get-directions"
                  >
                    <span className="ss-link">{t.getDirections}</span>
                    <span className="sr-only">{` ${t.newTab}`}</span>
                    <span aria-hidden="true" className="ss-arrow">
                      →
                    </span>
                  </a>
                  <TextLink href="/offices" data-testid="link-contact-offices">
                    {officeNameFor(language)}
                  </TextLink>
                </div>
              </div>
            </section>

            {/* Formulario: sin llamada en el título ni marcadores que repitan la etiqueta */}
            <section
              className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1"
              data-testid="section-contact-form"
            >
              <h2 className="ss-h2 mb-8" data-testid="text-form-title">
                {t.formTitle}
              </h2>

              {!formSettings.enabled?<p role="status" className="border-t border-ss-rule py-6">{formSettings.disabledMessage[language as "es"|"en"]||formSettings.disabledMessage.en}</p>:<Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-contact">
                  {/* Dos campos por fila solo en tableta (formulario a todo el ancho): Nombre | Correo y
                      Empresa | Práctica; en escritorio, columna de 6/12: un campo por fila. Campos y
                      select de 44 px, el objetivo táctil del sitio: en px y no h-11 (rem), que bajo
                      360 px (html a 14 px) quedaba en 38,5 px. Sin Teléfono: el documento de
                      redacción no lo pide. */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-fullname">{t.fullName}</FormLabel>
                          <FormControl>
                            <Input
                              className="h-[44px]"
                              autoComplete="name"
                              {...field}
                              data-testid="input-fullname"
                            />
                          </FormControl>
                          <FormMessage data-testid="error-fullname" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-email">{t.emailLabel}</FormLabel>
                          <FormControl>
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

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-company">{t.companyLabel}</FormLabel>
                          <FormControl>
                            <Input
                              className="h-[44px]"
                              autoComplete="organization"
                              {...field}
                              data-testid="input-company"
                            />
                          </FormControl>
                          <FormMessage data-testid="error-company" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="practiceArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-practice-area">{t.practiceAreaLabel}</FormLabel>
                          {/* Radix no hereda la dirección del documento: en árabe, valor a la
                              derecha y flecha a la izquierda, como los campos de texto vecinos */}
                          <Select
                            dir={language === "ar" ? "rtl" : "ltr"}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-[44px]" data-testid="select-practice-area">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent data-testid="select-practice-area-content">
                              {practiceOptions.map((value) => (
                                <SelectItem
                                  key={value}
                                  value={value}
                                  data-testid={`option-practice-area-${value}`}
                                >
                                  {practiceOptionLabel(value, language)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage data-testid="error-practice-area" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-message">{t.messageLabel}</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[160px]"
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-message" />
                      </FormItem>
                    )}
                  />

                  {/* Casilla del aviso de privacidad, obligatoria: el mismo componente y los mismos
                      textos que el boletín. El ::before amplía el área táctil a 44 px (min-h-0: en
                      teléfono, index.css da 44 px de alto a todo botón y la casilla salía estirada);
                      la etiqueta entera también la marca (el enlace no: navega). */}
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
                              className="relative mt-[3px] h-5 min-h-0 w-5 border-ss-medio data-[state=checked]:border-primary before:absolute before:-inset-3"
                              data-testid="checkbox-consent"
                            />
                          </FormControl>
                          <FormLabel
                            className="text-[16px] font-normal leading-[1.5] text-ss-tinta"
                            data-testid="label-consent"
                          >
                            {consentT.before}
                            <Link
                              href="/privacy-policy"
                              className="inline-link text-ss-marino underline decoration-ss-input underline-offset-4 hover:decoration-ss-marino"
                              data-testid="link-consent-privacy"
                            >
                              {consentT.link}
                            </Link>
                            {consentT.after}
                          </FormLabel>
                        </div>
                        {form.formState.submitCount>0&&<FormMessage data-testid="error-consent" />}
                      </FormItem>
                    )}
                  />

                  {/* Campo trampa (J4): fuera de la vista (sr-only, sin desbordar en árabe) y de los
                      lectores de pantalla (aria-hidden), fuera del orden del teclado y sin
                      autocompletar. Solo un programa lo rellena. */}
                  <div className="sr-only" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...form.register("website")}
                      data-testid="input-website"
                    />
                  </div>

                  {/* Enviar: el único botón Azul Marino lleno, 44 px de alto */}
                  <Button
                    type="submit"
                    className="min-h-[44px] w-full px-6 sm:w-auto"
                    disabled={contactMutation.isPending}
                    data-testid="button-submit-contact"
                  >
                    {contactMutation.isPending ? t.submitting : t.submit}
                  </Button>

                  {/* Aviso tras el botón, como en la redacción */}
                  <p
                    className="max-w-xl text-[15px] leading-[1.5] text-ss-medio"
                    data-testid="text-form-subtitle"
                  >
                    {t.formSubtitle}
                  </p>
                </form>
              </Form>}
            </section>

            {/* La fachada (oficina/fachada, 1159 × 900, sin el estacionamiento): la misma de la
                portada, a su proporción propia, sin reencuadre ni filtro. Hasta 26rem de ancho en
                tableta; desde lg, el ancho de su columna (5/12), como la lista de datos de arriba
                (K5): 356 px a 1024, 512 a 1440, 522 desde 1464 (37,5vw − 28px con el margen de
                5vw del contenedor). */}
            <figure className="sm:max-w-[26rem] lg:col-span-5 lg:row-start-2 lg:max-w-none lg:self-start" data-testid="figure-contact-building">
              <div className="overflow-hidden bg-ss-rule">
                <img
                  src={photos.fachada.url}
                  srcSet={photos.fachada.smallUrl && photos.fachada.smallUrl !== photos.fachada.url ? `${photos.fachada.smallUrl} 768w, ${photos.fachada.url} 1159w` : undefined}
                  sizes="(min-width: 1024px) min(522px, calc(37.5vw - 28px)), (min-width: 640px) 416px, calc(100vw - 40px)"
                  alt={t.photoAlt}
                  loading="lazy"
                  decoding="async"
                  width={1159}
                  height={900}
                  className="block h-auto w-full"
                  data-testid="img-contact-building"
                />
              </div>
            </figure>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
