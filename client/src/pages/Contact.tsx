import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, isStaticSite } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import type { SiteContent, ContactFormData, LanguageCode } from "@shared/schema";
import { practiceAreas } from "@shared/schema";

// Perfil de LinkedIn del despacho. Sin URL confirmada el botón "Síguenos en LinkedIn"
// no se muestra (antes enlazaba a /contact en otra pestaña). Para activarlo, poner aquí
// la URL externa (https://www.linkedin.com/company/…).
const FIRM_LINKEDIN_URL: string | null = null;

// Ciudad de la oficina: nombre propio, igual en todos los idiomas (título de la ficha;
// "Oficina principal" va encima como etiqueta y el nombre ya no se parte tras un guion).
const OFFICE_CITY = "San Pedro Garza García";

// Lista de datos de la oficina: filas con filete superior; etiqueta (dt) en la sans
// versal espaciada, Gris Medio; dato (dd) en la sans de 17 px, Gris Tinta.
const rowClass = "grid grid-cols-1 gap-y-1 border-t border-ss-rule py-4 sm:grid-cols-[11rem,1fr] sm:gap-x-6";
const dtClass = "ss-label text-ss-medio sm:pt-1";
const ddClass = "text-[17px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";

// "Clásica": titulares en romana 400, Azul Marino, caja de oración y al inicio; texto en Gris Tinta.
const h2Class = "font-heading font-normal text-ss-marino text-[clamp(24px,2vw,30px)] leading-[1.18] tracking-[-0.012em] [text-wrap:balance]";
const h3Class = "font-heading font-normal text-ss-marino text-[22px] leading-[1.25] tracking-[-0.01em]";

const validationMessages: Record<LanguageCode, {
  fullNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
}> = {
  en: {
    fullNameRequired: "Full name is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    messageRequired: "Message is required",
  },
  es: {
    fullNameRequired: "El nombre completo es requerido",
    emailRequired: "El correo electrónico es requerido",
    emailInvalid: "Por favor ingrese una dirección de correo válida",
    messageRequired: "El mensaje es requerido",
  },
  de: {
    fullNameRequired: "Name ist erforderlich",
    emailRequired: "E-Mail ist erforderlich",
    emailInvalid: "Ungültige E-Mail-Adresse",
    messageRequired: "Nachricht ist erforderlich",
  },
  zh: {
    fullNameRequired: "姓名是必填项",
    emailRequired: "电子邮件是必填项",
    emailInvalid: "请输入有效的电子邮件地址",
    messageRequired: "留言是必填项",
  },
  ko: {
    fullNameRequired: "이름은 필수입니다",
    emailRequired: "이메일은 필수입니다",
    emailInvalid: "유효한 이메일 주소를 입력하세요",
    messageRequired: "메시지는 필수입니다",
  },
  ja: {
    fullNameRequired: "氏名は必須です",
    emailRequired: "メールアドレスは必須です",
    emailInvalid: "有効なメールアドレスを入力してください",
    messageRequired: "メッセージは必須です",
  },
  ar: {
    fullNameRequired: "الاسم الكامل مطلوب",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "يرجى إدخال عنوان بريد إلكتروني صالح",
    messageRequired: "الرسالة مطلوبة",
  },
  ru: {
    fullNameRequired: "Имя обязательно для заполнения",
    emailRequired: "Электронная почта обязательна",
    emailInvalid: "Пожалуйста, введите действительный адрес электронной почты",
    messageRequired: "Сообщение обязательно для заполнения",
  },
  fr: {
    fullNameRequired: "Le nom complet est requis",
    emailRequired: "L'e-mail est requis",
    emailInvalid: "Veuillez entrer une adresse e-mail valide",
    messageRequired: "Le message est requis",
  },
  it: {
    fullNameRequired: "Il nome completo è obbligatorio",
    emailRequired: "L'e-mail è obbligatoria",
    emailInvalid: "Inserisci un indirizzo e-mail valido",
    messageRequired: "Il messaggio è obbligatorio",
  },
};

const getContactFormSchema = (language: LanguageCode) => {
  const t = validationMessages[language] || validationMessages.en;

  return z.object({
    fullName: z.string().min(1, t.fullNameRequired),
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    phone: z.string().optional(),
    company: z.string().optional(),
    practiceArea: z.string().optional(),
    message: z.string().min(1, t.messageRequired),
  });
};

const toastMessages: Record<LanguageCode, {
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
}> = {
  en: {
    successTitle: "Message sent",
    successDescription: "We have received your message.",
    errorTitle: "Error",
    errorDescription: "The message could not be sent. Please try again later.",
  },
  es: {
    successTitle: "Mensaje enviado",
    successDescription: "Recibimos su mensaje.",
    errorTitle: "Error",
    errorDescription: "No fue posible enviar el mensaje. Intente de nuevo más tarde.",
  },
  de: {
    successTitle: "Nachricht erfolgreich gesendet!",
    successDescription: "Wir werden uns bald bei Ihnen melden.",
    errorTitle: "Fehler",
    errorDescription: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.",
  },
  zh: {
    successTitle: "消息发送成功！",
    successDescription: "我们会尽快与您联系。",
    errorTitle: "错误",
    errorDescription: "发送消息时出错。请重试。",
  },
  ko: {
    successTitle: "메시지가 전송되었습니다!",
    successDescription: "곧 연락드리겠습니다.",
    errorTitle: "오류",
    errorDescription: "메시지 전송에 실패했습니다. 다시 시도해 주세요.",
  },
  ja: {
    successTitle: "メッセージが送信されました！",
    successDescription: "まもなくご連絡いたします。",
    errorTitle: "エラー",
    errorDescription: "メッセージの送信に失敗しました。もう一度お試しください。",
  },
  ar: {
    successTitle: "تم إرسال الرسالة!",
    successDescription: "سنتواصل معك قريباً.",
    errorTitle: "خطأ",
    errorDescription: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
  },
  ru: {
    successTitle: "Сообщение успешно отправлено!",
    successDescription: "Мы свяжемся с вами в ближайшее время.",
    errorTitle: "Ошибка",
    errorDescription: "Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.",
  },
  fr: {
    successTitle: "Message envoyé !",
    successDescription: "Nous vous répondrons bientôt.",
    errorTitle: "Erreur",
    errorDescription: "Échec de l'envoi du message. Veuillez réessayer.",
  },
  it: {
    successTitle: "Messaggio inviato con successo!",
    successDescription: "Ti risponderemo al più presto.",
    errorTitle: "Errore",
    errorDescription: "Errore nell'invio del messaggio. Riprova.",
  },
};

export default function Contact() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const { data: siteContent, isLoading } = useQuery<SiteContent>({
    queryKey: ["/api/site-content"],
  });

  const formSchema = getContactFormSchema(language);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      practiceArea: "",
      message: "",
    },
  });

  const toastT = toastMessages[language] || toastMessages.en;

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
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
      toast({
        title: toastT.errorTitle,
        description: toastT.errorDescription,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    if (isStaticSite) {
      const subject = encodeURIComponent(`Contacto web - ${data.fullName}`);
      const body = encodeURIComponent(
        [
          `Nombre: ${data.fullName}`,
          `Email: ${data.email}`,
          data.phone ? `Teléfono: ${data.phone}` : "",
          data.company ? `Empresa: ${data.company}` : "",
          data.practiceArea ? `Área: ${data.practiceArea}` : "",
          "",
          data.message,
        ].filter(Boolean).join("\n"),
      );

      window.location.href = `mailto:${siteContent?.email || "info@santossaucedo.com"}?subject=${subject}&body=${body}`;
      toast({
        title: language === "es" ? "Enviar por correo" : "Send by email",
        description: language === "es"
          ? "GitHub Pages no tiene backend; se abrió su cliente de correo para enviar el mensaje."
          : "GitHub Pages has no backend; your email client was opened to send the message.",
      });
      return;
    }

    contactMutation.mutate(data);
  };

  const content: Record<LanguageCode, {
    title: string;
    subtitle: string;
    officesTitle: string;
    mainOffice: string;
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
    addressLabel: string;
    telLabel: string;
    mapTitle: string;
    formTitle: string;
    formSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    practiceAreaLabel: string;
    practiceAreaPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
  }> = {
    en: {
      title: "Contact",
      subtitle: "Each partner's contact details appear on their profile.",
      officesTitle: "Our Offices",
      mainOffice: "Main office",
      building: "Río Tamazunchale 205 Norte",
      floor: "",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Office Hours",
      hoursDetails: "Monday to Friday, 9:00–19:00",
      getDirections: "Get Directions",
      mapTitle: "Map of the Santos & Saucedo office in San Pedro Garza García",
      telLabel: "Telephone",
      addressLabel: "Address",
      formTitle: "Send Us a Message",
      formSubtitle: "Submitting this form does not create an attorney-client relationship.",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email address",
      phoneLabel: "Phone (optional)",
      phonePlaceholder: "Enter your phone number",
      companyLabel: "Company/Organization (optional)",
      companyPlaceholder: "Enter your company name",
      practiceAreaLabel: "Practice Area of Interest (optional)",
      practiceAreaPlaceholder: "Select a practice area",
      messageLabel: "Message",
      messagePlaceholder: "How can we help you?",
      submit: "Send Message",
      submitting: "Sending...",
    },
    es: {
      title: "Contacto",
      subtitle: "Los datos de contacto de cada socio aparecen en su ficha.",
      officesTitle: "Nuestras oficinas",
      mainOffice: "Oficina principal",
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
      mapTitle: "Mapa de la oficina de Santos & Saucedo en San Pedro Garza García",
      telLabel: "Teléfono",
      addressLabel: "Dirección",
      formTitle: "Envíenos un mensaje",
      formSubtitle: "El envío de este formulario no crea una relación abogado-cliente.",
      fullName: "Nombre completo",
      fullNamePlaceholder: "Ingrese su nombre completo",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "Ingrese su correo electrónico",
      phoneLabel: "Teléfono (opcional)",
      phonePlaceholder: "Ingrese su número de teléfono",
      companyLabel: "Empresa/Organización (opcional)",
      companyPlaceholder: "Ingrese el nombre de su empresa",
      practiceAreaLabel: "Área de práctica de interés (opcional)",
      practiceAreaPlaceholder: "Seleccione un área de práctica",
      messageLabel: "Mensaje",
      messagePlaceholder: "¿Cómo podemos ayudarle?",
      submit: "Enviar mensaje",
      submitting: "Enviando...",
    },
    de: {
      title: "Kontakt",
      subtitle: "Die Kontaktdaten der einzelnen Partner stehen in ihrem jeweiligen Profil.",
      officesTitle: "Unsere Büros",
      mainOffice: "Hauptsitz",
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
      mapTitle: "Karte des Büros von Santos & Saucedo in San Pedro Garza García",
      telLabel: "Telefon",
      addressLabel: "Adresse",
      formTitle: "Senden Sie uns eine Nachricht",
      formSubtitle: "Die Übermittlung dieses Formulars begründet kein Mandatsverhältnis.",
      fullName: "Name",
      fullNamePlaceholder: "Geben Sie Ihren vollständigen Namen ein",
      emailLabel: "E-Mail",
      emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
      phoneLabel: "Telefon (optional)",
      phonePlaceholder: "Geben Sie Ihre Telefonnummer ein",
      companyLabel: "Unternehmen (optional)",
      companyPlaceholder: "Geben Sie Ihren Firmennamen ein",
      practiceAreaLabel: "Praxisbereich (optional)",
      practiceAreaPlaceholder: "Wählen Sie einen Praxisbereich",
      messageLabel: "Nachricht",
      messagePlaceholder: "Wie können wir Ihnen helfen?",
      submit: "Nachricht senden",
      submitting: "Wird gesendet...",
    },
    zh: {
      title: "联系我们",
      subtitle: "各合伙人的联系方式见其个人页面。",
      officesTitle: "我们的办公室",
      mainOffice: "总部",
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
      mapTitle: "Santos & Saucedo San Pedro Garza García 办公室地图",
      telLabel: "电话",
      addressLabel: "地址",
      formTitle: "给我们留言",
      formSubtitle: "提交本表格并不构成律师与客户之间的委托关系。",
      fullName: "姓名",
      fullNamePlaceholder: "请输入您的姓名",
      emailLabel: "电子邮件",
      emailPlaceholder: "请输入您的电子邮件地址",
      phoneLabel: "电话 (可选)",
      phonePlaceholder: "请输入您的电话号码",
      companyLabel: "公司 (可选)",
      companyPlaceholder: "请输入您的公司名称",
      practiceAreaLabel: "业务领域 (可选)",
      practiceAreaPlaceholder: "选择业务领域",
      messageLabel: "留言",
      messagePlaceholder: "我们能如何帮助您？",
      submit: "发送消息",
      submitting: "发送中...",
    },
    ko: {
      title: "문의하기",
      subtitle: "각 파트너의 연락처는 해당 프로필에 있습니다.",
      officesTitle: "사무소 위치",
      mainOffice: "본사",
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
      mapTitle: "San Pedro Garza García에 있는 Santos & Saucedo 사무소 지도",
      telLabel: "전화",
      addressLabel: "주소",
      formTitle: "메시지 보내기",
      formSubtitle: "이 양식을 제출하는 것만으로 변호사와 의뢰인 관계가 성립하지는 않습니다.",
      fullName: "이름",
      fullNamePlaceholder: "성함을 입력하세요",
      emailLabel: "이메일",
      emailPlaceholder: "이메일 주소를 입력하세요",
      phoneLabel: "전화번호 (선택사항)",
      phonePlaceholder: "전화번호를 입력하세요",
      companyLabel: "회사명 (선택사항)",
      companyPlaceholder: "회사명을 입력하세요",
      practiceAreaLabel: "관심 업무 분야 (선택사항)",
      practiceAreaPlaceholder: "업무 분야를 선택하세요",
      messageLabel: "메시지",
      messagePlaceholder: "어떻게 도와드릴까요?",
      submit: "메시지 전송",
      submitting: "전송 중...",
    },
    ja: {
      title: "お問い合わせ",
      subtitle: "各パートナーの連絡先は、それぞれのプロフィールに掲載しています。",
      officesTitle: "オフィス",
      mainOffice: "本社",
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
      mapTitle: "San Pedro Garza García の Santos & Saucedo 事務所の地図",
      telLabel: "電話",
      addressLabel: "所在地",
      formTitle: "メッセージを送信",
      formSubtitle: "本フォームの送信によって、弁護士と依頼者の関係が成立するものではありません。",
      fullName: "氏名",
      fullNamePlaceholder: "氏名を入力してください",
      emailLabel: "メールアドレス",
      emailPlaceholder: "メールアドレスを入力してください",
      phoneLabel: "電話番号 (任意)",
      phonePlaceholder: "電話番号を入力してください",
      companyLabel: "会社名 (任意)",
      companyPlaceholder: "会社名を入力してください",
      practiceAreaLabel: "ご関心のある業務分野 (任意)",
      practiceAreaPlaceholder: "業務分野を選択してください",
      messageLabel: "メッセージ",
      messagePlaceholder: "どのようにお手伝いできますか？",
      submit: "メッセージを送信",
      submitting: "送信中...",
    },
    ar: {
      title: "اتصل بنا",
      subtitle: "تظهر بيانات الاتصال بكل شريك في صفحته الشخصية.",
      officesTitle: "مكاتبنا",
      mainOffice: "المقر الرئيسي",
      building: "Río Tamazunchale 205 Norte",
      floor: "الطابق 18",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "ساعات العمل",
      hoursDetails: "من الاثنين إلى الجمعة، 9:00–19:00",
      getDirections: "الحصول على الاتجاهات",
      mapTitle: "خريطة مكتب Santos & Saucedo في San Pedro Garza García",
      telLabel: "الهاتف",
      addressLabel: "العنوان",
      formTitle: "أرسل لنا رسالة",
      formSubtitle: "إرسال هذا النموذج لا يُنشئ علاقة بين محامٍ وموكّل.",
      fullName: "الاسم الكامل",
      fullNamePlaceholder: "أدخل اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
      phoneLabel: "الهاتف (اختياري)",
      phonePlaceholder: "أدخل رقم هاتفك",
      companyLabel: "الشركة (اختياري)",
      companyPlaceholder: "أدخل اسم شركتك",
      practiceAreaLabel: "مجال الممارسة (اختياري)",
      practiceAreaPlaceholder: "اختر مجال الممارسة",
      messageLabel: "الرسالة",
      messagePlaceholder: "كيف يمكننا مساعدتك؟",
      submit: "إرسال الرسالة",
      submitting: "جاري الإرسال...",
    },
    ru: {
      title: "Контакты",
      subtitle: "Контактные данные каждого партнёра указаны в его профиле.",
      officesTitle: "Наши офисы",
      mainOffice: "Главный офис",
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
      mapTitle: "Карта офиса Santos & Saucedo в Сан-Педро-Гарса-Гарсия",
      telLabel: "Телефон",
      addressLabel: "Адрес",
      formTitle: "Напишите нам",
      formSubtitle: "Отправка этой формы не устанавливает отношений адвоката и клиента.",
      fullName: "Имя",
      fullNamePlaceholder: "Введите ваше полное имя",
      emailLabel: "Эл. почта",
      emailPlaceholder: "Введите ваш адрес электронной почты",
      phoneLabel: "Телефон (необязательно)",
      phonePlaceholder: "Введите ваш номер телефона",
      companyLabel: "Компания (необязательно)",
      companyPlaceholder: "Введите название вашей компании",
      practiceAreaLabel: "Область практики (необязательно)",
      practiceAreaPlaceholder: "Выберите область практики",
      messageLabel: "Сообщение",
      messagePlaceholder: "Чем мы можем вам помочь?",
      submit: "Отправить сообщение",
      submitting: "Отправка...",
    },
    fr: {
      title: "Contact",
      subtitle: "Les coordonnées de chaque associé figurent sur sa fiche.",
      officesTitle: "Nos bureaux",
      mainOffice: "Siège",
      building: "Río Tamazunchale 205 Norte",
      floor: "18ème étage",
      street: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, MéxicoMexique",
      phone: "+52 81 8335 2086",
      fax: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      hours: "Heures d'ouverture",
      hoursDetails: "Du lundi au vendredi, de 9 h à 19 h",
      getDirections: "Itinéraire",
      mapTitle: "Plan d'accès au bureau de Santos & Saucedo à San Pedro Garza García",
      telLabel: "Téléphone",
      addressLabel: "Adresse",
      formTitle: "Envoyez-nous un message",
      formSubtitle: "L'envoi de ce formulaire ne crée pas de relation avocat-client.",
      fullName: "Nom complet",
      fullNamePlaceholder: "Entrez votre nom complet",
      emailLabel: "E-mail",
      emailPlaceholder: "Entrez votre adresse e-mail",
      phoneLabel: "Téléphone (facultatif)",
      phonePlaceholder: "Entrez votre numéro de téléphone",
      companyLabel: "Entreprise (facultatif)",
      companyPlaceholder: "Entrez le nom de votre entreprise",
      practiceAreaLabel: "Domaine de pratique (facultatif)",
      practiceAreaPlaceholder: "Sélectionnez un domaine de pratique",
      messageLabel: "Message",
      messagePlaceholder: "Comment pouvons-nous vous aider?",
      submit: "Envoyer le message",
      submitting: "Envoi en cours...",
    },
    it: {
      title: "Contatti",
      subtitle: "I recapiti di ciascun socio sono indicati nella sua scheda.",
      officesTitle: "I nostri uffici",
      mainOffice: "Sede principale",
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
      mapTitle: "Mappa dell'ufficio di Santos & Saucedo a San Pedro Garza García",
      telLabel: "Telefono",
      addressLabel: "Indirizzo",
      formTitle: "Inviaci un messaggio",
      formSubtitle: "L'invio di questo modulo non costituisce un rapporto avvocato-cliente.",
      fullName: "Nome",
      fullNamePlaceholder: "Inserisci il tuo nome completo",
      emailLabel: "E-mail",
      emailPlaceholder: "Inserisci il tuo indirizzo e-mail",
      phoneLabel: "Telefono (opzionale)",
      phonePlaceholder: "Inserisci il tuo numero di telefono",
      companyLabel: "Azienda (opzionale)",
      companyPlaceholder: "Inserisci il nome della tua azienda",
      practiceAreaLabel: "Area di pratica (opzionale)",
      practiceAreaPlaceholder: "Seleziona un'area di pratica",
      messageLabel: "Messaggio",
      messagePlaceholder: "Come possiamo aiutarti?",
      submit: "Invia messaggio",
      submitting: "Invio in corso...",
    },
  };

  const baseT = content[language] || content.en;
  const t = {
    ...baseT,
    floor: "",
    street: "Río Tamazunchale 205 Norte",
    colony: "Col. del Valle",
    city: "San Pedro Garza García, N.L., C.P. 66220, México",
  };

  const googleMapsUrl = "https://www.google.com/maps?q=R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220&output=embed";

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
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <Eyebrow num="06" tone="navy" className="mb-6" />
              <h1 className="mb-5" data-testid="text-contact-title">
                {t.title}
              </h1>
              <p data-testid="text-contact-subtitle">
                {t.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="py-16 lg:py-20">
          <div className="ss-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-16 lg:mb-20 max-w-4xl"
              data-testid="section-contact-form"
            >
              <div className="mb-8">
                <h2 
                  className={`${h2Class} mb-3`}
                  data-testid="text-form-title"
                >
                  {t.formTitle}
                </h2>
                <p 
                  className="text-base text-ss-tinta leading-relaxed max-w-2xl"
                  data-testid="text-form-subtitle"
                >
                  {t.formSubtitle}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-contact">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-fullname">{t.fullName}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t.fullNamePlaceholder} 
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
                              type="email"
                              placeholder={t.emailPlaceholder} 
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-phone">{t.phoneLabel}</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder={t.phonePlaceholder} 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage data-testid="error-phone" />
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
                              placeholder={t.companyPlaceholder} 
                              {...field} 
                              data-testid="input-company"
                            />
                          </FormControl>
                          <FormMessage data-testid="error-company" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="practiceArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-practice-area">{t.practiceAreaLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-practice-area">
                              <SelectValue placeholder={t.practiceAreaPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent data-testid="select-practice-area-content">
                            {practiceAreas.map((area) => (
                              <SelectItem 
                                key={area.value} 
                                value={area.value}
                                data-testid={`option-practice-area-${area.value}`}
                              >
                                {language === "es" ? area.es : area.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage data-testid="error-practice-area" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-message">{t.messageLabel}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t.messagePlaceholder} 
                            className="min-h-[120px]"
                            {...field} 
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-message" />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={contactMutation.isPending}
                    data-testid="button-submit-contact"
                  >
                    {contactMutation.isPending ? t.submitting : t.submit}
                  </Button>
                </form>
              </Form>
            </motion.div>

            {/* Oficina: lista de datos con filetes (sin tarjeta ni iconos) junto al mapa en gris.
                Sin la tarjeta "Contáctenos" (repetía el h1) ni "Conéctese con nosotros" (enlazaba
                a este mismo sitio). */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              data-testid="section-contact-office"
            >
              <h2 
                className={`${h2Class} mb-8`}
                data-testid="text-offices-title"
              >
                {t.officesTitle}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                <div data-testid="card-main-office">
                  <p className="ss-label text-ss-medio mb-2">{t.mainOffice}</p>
                  <h3 className={`${h3Class} mb-6`} data-testid="text-office-name">
                    {OFFICE_CITY}
                  </h3>

                  <dl className="border-b border-ss-rule">
                    <div className={rowClass}>
                      <dt className={dtClass}>{t.addressLabel}</dt>
                      <dd className={ddClass} data-testid="text-office-address">
                        <span className="block">{t.street}</span>
                        <span className="block">{t.colony}</span>
                        <span className="block">{t.city}</span>
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
                          <span dir="ltr">{t.phone}</span>
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
                    {FIRM_LINKEDIN_URL && (
                      <div className={rowClass}>
                        <dt className={dtClass}>LinkedIn</dt>
                        <dd className={ddClass}>
                          <a
                            href={FIRM_LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={ddLinkClass}
                            data-testid="button-linkedin"
                          >
                            Santos &amp; Saucedo
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>

                  {/* Enlace de texto de la marca (etiqueta, subrayado al pasar, flecha), sin botón con caja */}
                  <a 
                    href="https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ss-label group mt-6 inline-flex min-h-[44px] items-center gap-3 text-ss-marino"
                    data-testid="button-get-directions"
                  >
                    <span className="ss-link">{t.getDirections}</span>
                    <span aria-hidden="true" className="ss-arrow">
                      →
                    </span>
                  </a>
                </div>

                {/* Mapa en gris, sin marco ni esquinas; Hueso de fondo mientras carga */}
                <div className="aspect-[4/3] w-full bg-ss-paper lg:aspect-auto lg:h-full lg:min-h-[420px]">
                  <iframe
                    src={googleMapsUrl}
                    width="100%"
                    height="100%"
                    className="block h-full w-full"
                    style={{ border: 0, filter: "grayscale(1) contrast(.95)" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t.mapTitle}
                    data-testid="iframe-google-map"
                  />
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
