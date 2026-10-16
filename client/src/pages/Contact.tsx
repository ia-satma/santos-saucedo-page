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
import edificioCerro from "@assets/ss26/edificio-cerro.webp";
import type { SiteContent, ContactFormData, LanguageCode } from "@shared/schema";

// Perfil de LinkedIn del despacho. Sin URL confirmada el botón "Síguenos en LinkedIn"
// no se muestra (antes enlazaba a /contact en otra pestaña). Para activarlo, poner aquí
// la URL externa (https://www.linkedin.com/company/…).
const FIRM_LINKEDIN_URL: string | null = null;

// Prácticas de la firma (las cuatro de /practice-groups, con sus nombres) y "Otro". Antes el
// formulario usaba la lista heredada de @shared/schema (fusiones, competencia, energía…), que
// no son prácticas de Santos & Saucedo.
const PRACTICE_OPTIONS: { value: string; label: Record<LanguageCode, string> }[] = [
  {
    value: "laboral-seguridad-social",
    label: { es: "Laboral y seguridad social", en: "Labor and social security", de: "Arbeitsrecht und soziale Sicherheit", zh: "劳动与社会保障", ko: "노동 및 사회보장", ja: "労働・社会保障", ar: "العمل والضمان الاجتماعي", ru: "Трудовое право и социальное обеспечение", fr: "Droit du travail et sécurité sociale", it: "Diritto del lavoro e previdenza sociale" },
  },
  {
    value: "corporativo-contractual",
    label: { es: "Corporativo y contractual", en: "Corporate and contracts", de: "Gesellschafts- und Vertragsrecht", zh: "公司与合同", ko: "기업 및 계약", ja: "企業法務・契約", ar: "الشركات والعقود", ru: "Корпоративное и договорное право", fr: "Droit des sociétés et des contrats", it: "Diritto societario e contrattuale" },
  },
  {
    value: "migratorio",
    label: { es: "Migratorio", en: "Immigration", de: "Migrationsrecht", zh: "移民", ko: "출입국", ja: "出入国管理", ar: "الهجرة", ru: "Миграционное право", fr: "Immigration", it: "Immigrazione" },
  },
  {
    value: "litigio-contencioso",
    label: { es: "Litigio contencioso", en: "Litigation", de: "Prozessführung", zh: "诉讼", ko: "소송", ja: "訴訟", ar: "التقاضي", ru: "Судебные споры", fr: "Contentieux", it: "Contenzioso" },
  },
  {
    value: "otro",
    label: { es: "Otro", en: "Other", de: "Sonstiges", zh: "其他", ko: "기타", ja: "その他", ar: "أخرى", ru: "Другое", fr: "Autre", it: "Altro" },
  },
];

// Lista de datos de la oficina: filas con filete superior; etiqueta (dt) en la sans
// versal espaciada, Gris Medio; dato (dd) en la sans de 17 px, Gris Tinta. Etiqueta al lado
// del dato solo con la ficha a todo el ancho (sm–md); en la columna de 5/12 del escritorio,
// encima (a 1024 px la dirección se partía en seis líneas y el correo salía del filete).
const rowClass = "grid grid-cols-1 gap-y-1 border-t border-ss-rule py-4 sm:grid-cols-[11rem,1fr] sm:gap-x-6 lg:grid-cols-1";
const dtClass = "ss-label text-ss-medio sm:pt-1 lg:pt-0";
const ddClass = "text-[17px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";

// Titulares: .ss-h2 (index.css), la escala única de las secciones de página.

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
    successTitle: "Nachricht gesendet",
    successDescription: "Wir haben Ihre Nachricht erhalten.",
    errorTitle: "Fehler",
    errorDescription: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.",
  },
  zh: {
    successTitle: "消息已发送",
    successDescription: "我们已收到您的消息。",
    errorTitle: "错误",
    errorDescription: "发送消息时出错。请重试。",
  },
  ko: {
    successTitle: "메시지 전송 완료",
    successDescription: "메시지를 받았습니다.",
    errorTitle: "오류",
    errorDescription: "메시지 전송에 실패했습니다. 다시 시도해 주세요.",
  },
  ja: {
    successTitle: "メッセージを送信しました",
    successDescription: "メッセージを受け付けました。",
    errorTitle: "エラー",
    errorDescription: "メッセージの送信に失敗しました。もう一度お試しください。",
  },
  ar: {
    successTitle: "تم إرسال الرسالة",
    successDescription: "تلقّينا رسالتك.",
    errorTitle: "خطأ",
    errorDescription: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
  },
  ru: {
    successTitle: "Сообщение отправлено",
    successDescription: "Мы получили ваше сообщение.",
    errorTitle: "Ошибка",
    errorDescription: "Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.",
  },
  fr: {
    successTitle: "Message envoyé",
    successDescription: "Nous avons bien reçu votre message.",
    errorTitle: "Erreur",
    errorDescription: "Échec de l'envoi du message. Veuillez réessayer.",
  },
  it: {
    successTitle: "Messaggio inviato",
    successDescription: "Abbiamo ricevuto il tuo messaggio.",
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
          data.practiceArea
            ? `Área: ${PRACTICE_OPTIONS.find((o) => o.value === data.practiceArea)?.label.es ?? data.practiceArea}`
            : "",
          "",
          data.message,
        ].filter(Boolean).join("\n"),
      );

      window.location.href = `mailto:${siteContent?.email || "info@santossaucedo.com"}?subject=${subject}&body=${body}`;
      // Sitio estático (sin servidor): el mensaje sale por el programa de correo del visitante
      toast({
        title: language === "es" ? "Enviar por correo" : "Send by email",
        description: language === "es"
          ? "Se abrió su programa de correo para enviar el mensaje."
          : "Your email program was opened to send the message.",
      });
      return;
    }

    contactMutation.mutate(data);
  };

  const content: Record<LanguageCode, {
    title: string;
    subtitle: string;
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
    phoneLabel: string;
    companyLabel: string;
    practiceAreaLabel: string;
    messageLabel: string;
    submit: string;
    submitting: string;
  }> = {
    en: {
      title: "Contact",
      subtitle: "Each partner's contact details appear on their profile.",
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
      phoneLabel: "Phone (optional)",
      companyLabel: "Company (optional)",
      practiceAreaLabel: "Practice area of interest (optional)",
      messageLabel: "Message",
      submit: "Send message",
      submitting: "Sending...",
    },
    es: {
      title: "Contacto",
      subtitle: "Los datos de contacto de cada socio aparecen en su ficha.",
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
      phoneLabel: "Teléfono (opcional)",
      companyLabel: "Empresa (opcional)",
      practiceAreaLabel: "Área de práctica de interés (opcional)",
      messageLabel: "Mensaje",
      submit: "Enviar mensaje",
      submitting: "Enviando...",
    },
    de: {
      title: "Kontakt",
      subtitle: "Die Kontaktdaten der einzelnen Partner stehen in ihrem jeweiligen Profil.",
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
      phoneLabel: "Telefon (optional)",
      companyLabel: "Unternehmen (optional)",
      practiceAreaLabel: "Praxisbereich (optional)",
      messageLabel: "Nachricht",
      submit: "Nachricht senden",
      submitting: "Wird gesendet...",
    },
    zh: {
      title: "联系我们",
      subtitle: "各合伙人的联系方式见其个人页面。",
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
      phoneLabel: "电话 (可选)",
      companyLabel: "公司 (可选)",
      practiceAreaLabel: "业务领域 (可选)",
      messageLabel: "留言",
      submit: "发送消息",
      submitting: "发送中...",
    },
    ko: {
      title: "문의하기",
      subtitle: "각 파트너의 연락처는 해당 프로필에 있습니다.",
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
      phoneLabel: "전화번호 (선택사항)",
      companyLabel: "회사명 (선택사항)",
      practiceAreaLabel: "관심 업무 분야 (선택사항)",
      messageLabel: "메시지",
      submit: "메시지 전송",
      submitting: "전송 중...",
    },
    ja: {
      title: "お問い合わせ",
      subtitle: "各パートナーの連絡先は、それぞれのプロフィールに掲載しています。",
      officesTitle: "所在地",
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
      phoneLabel: "電話番号 (任意)",
      companyLabel: "会社名 (任意)",
      practiceAreaLabel: "ご関心のある業務分野 (任意)",
      messageLabel: "メッセージ",
      submit: "メッセージを送信",
      submitting: "送信中...",
    },
    ar: {
      title: "اتصل بنا",
      subtitle: "تظهر بيانات الاتصال بكل شريك في صفحته الشخصية.",
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
      phoneLabel: "الهاتف (اختياري)",
      companyLabel: "الشركة (اختياري)",
      practiceAreaLabel: "مجال الممارسة (اختياري)",
      messageLabel: "الرسالة",
      submit: "إرسال الرسالة",
      submitting: "جاري الإرسال...",
    },
    ru: {
      title: "Контакты",
      subtitle: "Контактные данные каждого партнёра указаны в его профиле.",
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
      phoneLabel: "Телефон (необязательно)",
      companyLabel: "Компания (необязательно)",
      practiceAreaLabel: "Область практики (необязательно)",
      messageLabel: "Сообщение",
      submit: "Отправить сообщение",
      submitting: "Отправка...",
    },
    fr: {
      title: "Contact",
      subtitle: "Les coordonnées de chaque associé figurent sur sa fiche.",
      officesTitle: "Bureau",
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
      photoAlt: "Façade vitrée des bureaux de Santos & Saucedo, où se reflète le Cerro de la Silla",
      newTab: "(s’ouvre dans un nouvel onglet)",
      telLabel: "Téléphone",
      addressLabel: "Adresse",
      formTitle: "Message",
      formSubtitle: "L'envoi de ce formulaire ne crée pas de relation avocat-client.",
      fullName: "Nom complet",
      emailLabel: "E-mail",
      phoneLabel: "Téléphone (facultatif)",
      companyLabel: "Entreprise (facultatif)",
      practiceAreaLabel: "Domaine de pratique (facultatif)",
      messageLabel: "Message",
      submit: "Envoyer le message",
      submitting: "Envoi en cours...",
    },
    it: {
      title: "Contatti",
      subtitle: "I recapiti di ciascun socio sono indicati nella sua scheda.",
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
      formSubtitle: "L'invio di questo modulo non costituisce un rapporto avvocato-cliente.",
      fullName: "Nome",
      emailLabel: "E-mail",
      phoneLabel: "Telefono (opzionale)",
      companyLabel: "Azienda (opzionale)",
      practiceAreaLabel: "Area di pratica (opzionale)",
      messageLabel: "Messaggio",
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

  // "Cómo llegar": las indicaciones de Google Maps en otra pestaña. Sin mapa incrustado: al
  // cargarse, el iframe de Google podía fijar cookies y recibir la IP del visitante (el sitio
  // público ya no carga terceros).
  const directionsUrl = "https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220";

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
          {/* Ficha de la oficina a la izquierda y formulario a la derecha. En el teléfono, por
              orden del documento: ficha, formulario y, al final, la foto del edificio. En
              escritorio la foto va bajo la ficha (fila 2) y el formulario ocupa las dos filas. */}
          <div className="ss-container grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-12">
            {/* Oficina: lista de datos con filetes (sin tarjeta ni iconos) y el enlace "Cómo llegar" */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
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
                          Santos&nbsp;&amp;&nbsp;Saucedo
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Mismo aspecto que TextLink (etiqueta, subrayado, flecha y área táctil ampliada);
                    <a> propio porque TextLink es un Link de wouter y este destino es externo */}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ss-label group relative mt-8 inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3"
                  data-testid="button-get-directions"
                >
                  <span className="ss-link">{t.getDirections}</span>
                  <span className="sr-only">{` ${t.newTab}`}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    →
                  </span>
                </a>
              </div>
            </motion.section>

            {/* Formulario: sin llamada en el título ni marcadores que repitan la etiqueta */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1"
              data-testid="section-contact-form"
            >
              <h2 className="ss-h2 mb-8" data-testid="text-form-title">
                {t.formTitle}
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-contact">
                  {/* Dos campos por fila solo en tableta (formulario a todo el ancho); en escritorio,
                      columna de 6/12: un campo por fila */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-fullname">{t.fullName}</FormLabel>
                          <FormControl>
                            <Input
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-phone">{t.phoneLabel}</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              autoComplete="tel"
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
                              autoComplete="organization"
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
                        {/* Radix no hereda la dirección del documento: en árabe, valor a la
                            derecha y flecha a la izquierda, como los campos de texto vecinos */}
                        <Select
                          dir={language === "ar" ? "rtl" : "ltr"}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-practice-area">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent data-testid="select-practice-area-content">
                            {PRACTICE_OPTIONS.map((area) => (
                              <SelectItem
                                key={area.value}
                                value={area.value}
                                data-testid={`option-practice-area-${area.value}`}
                              >
                                {area.label[language] ?? area.label.en}
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
                            className="min-h-[160px]"
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-message" />
                      </FormItem>
                    )}
                  />

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
              </Form>
            </motion.section>

            {/* El edificio (la foto de la portada), en gris y en 3:4 desde el borde izquierdo:
                el cuadro deja fuera el letrero del estacionamiento (x 712–918 de 952) */}
            <figure className="sm:max-w-[26rem] lg:col-span-5 lg:row-start-2 lg:self-start" data-testid="figure-contact-building">
              <div className="overflow-hidden bg-ss-rule">
                <img
                  src={edificioCerro}
                  alt={t.photoAlt}
                  loading="lazy"
                  decoding="async"
                  width={952}
                  height={937}
                  className="ss-photo block aspect-[3/4] h-auto w-full object-cover object-[0%_50%]"
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
