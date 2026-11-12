/* Textos de /contact y del formulario de contacto (página y hoja «Escribir» del teléfono).
   Los de siempre (10 idiomas, editables en el panel: secciones «contact», «contact-consent» y
   «contact-feedback») vienen tal cual de la página anterior. Los nuevos de la demo v3 (aprobada el
   5-11-2026) tienen copia para los diez idiomas. */
import type { LanguageCode } from "@shared/schema";
import { localizedRecord } from "@/v3/locales";
import type { V3Lang } from "@/v3/shared";

// Valor «otro asunto» del selector: los demás son los slugs de /api/practice-groups. No cambia: es lo que guarda /api/contact.
export const OTHER_VALUE = "otro";
// Etiqueta de «Otro» en los idiomas que no son español ni inglés (en esos dos, «Otro asunto» de la demo)
export const OTHER_LABEL: Record<LanguageCode, string> = {
  es: "Otro", en: "Other", de: "Sonstiges", zh: "其他", ko: "기타", ja: "その他", ar: "أخرى", ru: "Другое", fr: "Autre", it: "Altro",
};

// Mensajes de validación en registro sobrio (G9): qué escribir, sin "es requerido" ni "Por favor"
export const VALIDATION: Record<LanguageCode, {
  fullNameRequired: string;
  companyRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
  consentRequired: string;
}> = {
  en: {
    fullNameRequired: "Enter your name.",
    companyRequired: "Enter your company name.",
    emailRequired: "Enter a valid email address.",
    emailInvalid: "Enter a valid email address.",
    messageRequired: "Enter your message.",
    consentRequired: "Accept the privacy notice to submit.",
  },
  es: {
    fullNameRequired: "Escriba su nombre.",
    companyRequired: "Escriba el nombre de su empresa.",
    emailRequired: "Escriba un correo válido.",
    emailInvalid: "Escriba un correo válido.",
    messageRequired: "Escriba su mensaje.",
    consentRequired: "Acepte el aviso de privacidad para enviar.",
  },
  de: {
    fullNameRequired: "Geben Sie Ihren Namen ein.",
    companyRequired: "Geben Sie den Namen Ihres Unternehmens ein.",
    emailRequired: "Geben Sie eine gültige E-Mail-Adresse ein.",
    emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
    messageRequired: "Geben Sie Ihre Nachricht ein.",
    consentRequired: "Akzeptieren Sie den Datenschutzhinweis, um das Formular zu senden.",
  },
  zh: {
    fullNameRequired: "请填写姓名。",
    companyRequired: "请填写公司名称。",
    emailRequired: "请填写有效的电子邮件地址。",
    emailInvalid: "请填写有效的电子邮件地址。",
    messageRequired: "请填写留言。",
    consentRequired: "请接受隐私声明后再发送。",
  },
  ko: {
    fullNameRequired: "이름을 입력해 주세요.",
    companyRequired: "회사명을 입력해 주세요.",
    emailRequired: "올바른 이메일 주소를 입력해 주세요.",
    emailInvalid: "올바른 이메일 주소를 입력해 주세요.",
    messageRequired: "메시지를 입력해 주세요.",
    consentRequired: "보내려면 개인정보 처리방침에 동의해 주세요.",
  },
  ja: {
    fullNameRequired: "氏名を入力してください。",
    companyRequired: "会社名を入力してください。",
    emailRequired: "有効なメールアドレスを入力してください。",
    emailInvalid: "有効なメールアドレスを入力してください。",
    messageRequired: "メッセージを入力してください。",
    consentRequired: "送信するには、プライバシーポリシーに同意してください。",
  },
  ar: {
    fullNameRequired: "اكتب اسمك.",
    companyRequired: "اكتب اسم شركتك.",
    emailRequired: "اكتب عنوان بريد إلكتروني صالحًا.",
    emailInvalid: "اكتب عنوان بريد إلكتروني صالحًا.",
    messageRequired: "اكتب رسالتك.",
    consentRequired: "وافق على إشعار الخصوصية لإرسال النموذج.",
  },
  ru: {
    fullNameRequired: "Укажите имя.",
    companyRequired: "Укажите название компании.",
    emailRequired: "Укажите действительный адрес эл. почты.",
    emailInvalid: "Укажите действительный адрес эл. почты.",
    messageRequired: "Напишите сообщение.",
    consentRequired: "Примите политику конфиденциальности, чтобы отправить форму.",
  },
  fr: {
    fullNameRequired: "Saisissez votre nom.",
    companyRequired: "Saisissez le nom de votre entreprise.",
    emailRequired: "Saisissez une adresse e-mail valide.",
    emailInvalid: "Saisissez une adresse e-mail valide.",
    messageRequired: "Saisissez votre message.",
    consentRequired: "Acceptez la politique de confidentialité pour envoyer le formulaire.",
  },
  it: {
    fullNameRequired: "Inserisca il suo nome.",
    companyRequired: "Inserisca il nome della sua azienda.",
    emailRequired: "Inserisca un indirizzo e-mail valido.",
    emailInvalid: "Inserisca un indirizzo e-mail valido.",
    messageRequired: "Inserisca il suo messaggio.",
    consentRequired: "Accetti l’informativa sulla privacy per inviare il modulo.",
  },
};

// Casilla del aviso de privacidad: los mismos textos que el boletín (Newsletter.tsx)
export const CONSENT: Record<LanguageCode, { before: string; link: string; after: string }> = {
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
// programa de correo del visitante con el mensaje.
export const FEEDBACK: Record<LanguageCode, {
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

// Textos de la página anterior (sección «contact» del panel). Algunos ya no se muestran (horario: la
// junta pidió no prometer horario ni tiempo de respuesta; encabezado anterior), pero se conservan
// para que el panel siga leyendo y guardando la misma forma.
export interface ContactContent {
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  /** Bajo los datos de la oficina, antes de "Cómo llegar" (como en el documento de redacción) */
  partnersNote: string;
  officesTitle: string;
  officeSectionTitle?: string;
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
  formSectionTitle?: string;
  formSectionLead?: string;
  fullName: string;
  emailLabel: string;
  companyLabel: string;
  practiceAreaLabel: string;
  messageLabel: string;
  submit: string;
  submitting: string;
}

export const CONTACT_CONTENT: Record<LanguageCode, ContactContent> = {
  en: {
    title: "Contact",
    heroTitle: "We are here to help",
    heroSubtitle: "Get in touch with us or visit our offices",
    partnersNote: "Each partner’s contact details appear on their profile.",
    officesTitle: "Office",
    officeSectionTitle: "Our location",
    building: "Río Tamazunchale 205 Norte",
    floor: "",
    street: "San Pedro Garza García, N.L.",
    colony: "Nuevo León",
    city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
    phone: "+52 81 8335 2086",
    fax: "+52 81 8335 2086",
    email: "administracion@santossaucedo.com",
    hours: "Office hours",
    hoursDetails: "Monday to Friday, 9:00–19:00",
    getDirections: "Get directions",
    photoAlt: "Glass facade of the Santos & Saucedo offices reflecting the Cerro de la Silla",
    newTab: "(opens in a new tab)",
    telLabel: "Telephone",
    addressLabel: "Address",
    formTitle: "Message",
    formSubtitle: "Submitting this form does not create an attorney-client relationship.",
    formSectionTitle: "Send us a message",
    formSectionLead: "Share your details and tell us how we can help. Our team will be in touch.",
    fullName: "Full name",
    emailLabel: "Email",
    companyLabel: "Company",
    practiceAreaLabel: "Practice (optional)",
    messageLabel: "Message",
    submit: "Send message",
    submitting: "Sending…",
  },
  es: {
    title: "Contacto",
    heroTitle: "Estamos aquí para ayudarte",
    heroSubtitle: "Ponte en contacto con nosotros o visita nuestras oficinas",
    partnersNote: "Los datos de contacto de cada socio aparecen en su ficha.",
    officesTitle: "Oficina",
    officeSectionTitle: "Nuestra ubicación",
    building: "Río Tamazunchale 205 Norte",
    floor: "",
    street: "San Pedro Garza García, N.L.",
    colony: "Nuevo León",
    city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
    phone: "+52 81 8335 2086",
    fax: "+52 81 8335 2086",
    email: "administracion@santossaucedo.com",
    hours: "Horario de oficina",
    hoursDetails: "Lunes a viernes, 9:00–19:00 h",
    getDirections: "Cómo llegar",
    photoAlt: "Fachada de cristal de las oficinas de Santos & Saucedo con el Cerro de la Silla reflejado",
    newTab: "(se abre en otra pestaña)",
    telLabel: "Teléfono",
    addressLabel: "Dirección",
    formTitle: "Mensaje",
    formSubtitle: "El envío de este formulario no crea una relación abogado-cliente.",
    formSectionTitle: "Envíanos un mensaje",
    formSectionLead: "Déjanos tus datos y cuéntanos cómo podemos ayudarte. Nuestro equipo se pondrá en contacto contigo.",
    fullName: "Nombre completo",
    emailLabel: "Correo electrónico",
    companyLabel: "Empresa",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "Unternehmen",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "公司",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "회사명",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "会社名",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "الشركة",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "Компания",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "Entreprise",
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
    email: "administracion@santossaucedo.com",
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
    companyLabel: "Azienda",
    practiceAreaLabel: "Area di pratica (opzionale)",
    messageLabel: "Messaggio",
    submit: "Inviare il messaggio",
    submitting: "Invio in corso…",
  },
};

/* ---------- Textos nuevos de la demo v3: español tal cual, inglés en el mismo registro ---------- */
export type FotoClave = "fachada" | "vestibulo" | "sala" | "escultura" | "biblioteca" | "mezanine";

export interface TextosV3 {
  /** Título del formulario (en otros idiomas, el del panel en su idioma) */
  formH: string;
  pasos: [string, string];
  continuar: string;
  regresar: string;
  /** Aprobado por la junta: quién responde, sin plazo */
  resp: string;
  otroMensaje: string;
  otroAsunto: string;
  datosTel: string;
  datosCorreo: string;
  oficinasH: string;
  /** Entrada de «Nuestras oficinas»: la calle y la ciudad salen de los datos del sitio */
  oficinasLead: (calle: string, ciudad: string) => string;
  oficinasLeadSinDir: string;
  oficinasMas: string;
  mapaCap: string;
  fotos: Record<FotoClave, { cap: string; txt: string }>;
  /** Alt de las fotos que no lo tienen en el panel */
  altMezanine: string;
  altBiblioteca: string;
  altSala: string;
  /** Barra y hoja del teléfono */
  acciones: string;
  llamar: string;
  escribir: string;
  llamenos: string;
  copiar: string;
  copiado: string;
  cerrar: string;
}

const CT_BASE: Record<V3Lang, TextosV3> = {
  es: {
    formH: "Escríbanos",
    pasos: ["Sus datos", "Su asunto"],
    continuar: "Continuar",
    regresar: "Regresar",
    resp: "Le responde el área de administración.",
    otroMensaje: "Escribir otro mensaje",
    otroAsunto: "Otro asunto",
    datosTel: "Teléfono",
    datosCorreo: "Correo",
    oficinasH: "Nuestras oficinas",
    oficinasLead: (calle, ciudad) => `${calle}, en ${ciudad}. Las salas donde se recibe a cada cliente y se preparan sus asuntos.`,
    oficinasLeadSinDir: "Las salas donde se recibe a cada cliente y se preparan sus asuntos.",
    oficinasMas: "Más fotografías de la oficina",
    mapaCap: "La ubicación",
    fotos: {
      fachada: { cap: "La fachada", txt: "En el cristal, el Cerro de la Silla." },
      vestibulo: { cap: "El vestíbulo", txt: "Visto desde el mezanine." },
      sala: { cap: "La sala de juntas", txt: "Donde se recibe a cada cliente." },
      escultura: { cap: "El jardín interior", txt: "La escultura azul." },
      biblioteca: { cap: "La biblioteca", txt: "Junto a la escalera." },
      mezanine: { cap: "El mezanine", txt: "Donde trabaja el equipo." },
    },
    altMezanine: "Mezanine con estaciones de trabajo y barandal de cristal",
    altBiblioteca: "Librero de madera con los tomos de jurisprudencia junto a la escalera",
    altSala: "Sala de juntas con mesa de granito, sillas ejecutivas y obra abstracta de colores en el muro",
    acciones: "Acciones rápidas",
    llamar: "Llamar",
    escribir: "Escribir",
    llamenos: "Llámenos",
    copiar: "Copiar el número",
    copiado: "Número copiado",
    cerrar: "Cerrar",
  },
  en: {
    formH: "Write to us",
    pasos: ["Your details", "Your matter"],
    continuar: "Continue",
    regresar: "Back",
    resp: "Our administration department will reply.",
    otroMensaje: "Write another message",
    otroAsunto: "Other matter",
    datosTel: "Telephone",
    datosCorreo: "Email",
    oficinasH: "Our offices",
    oficinasLead: (calle, ciudad) => `${calle}, in ${ciudad}. The rooms where we receive each client and prepare their matters.`,
    oficinasLeadSinDir: "The rooms where we receive each client and prepare their matters.",
    oficinasMas: "More photographs of the office",
    mapaCap: "Location",
    fotos: {
      fachada: { cap: "The facade", txt: "The Cerro de la Silla, reflected in the glass." },
      vestibulo: { cap: "The lobby", txt: "Seen from the mezzanine." },
      sala: { cap: "The boardroom", txt: "Where each client is received." },
      escultura: { cap: "The interior garden", txt: "The blue sculpture." },
      biblioteca: { cap: "The library", txt: "Beside the staircase." },
      mezanine: { cap: "The mezzanine", txt: "Where the team works." },
    },
    altMezanine: "Mezzanine with workstations and a glass railing",
    altSala: "Boardroom with a granite table, executive chairs and colorful abstract artwork on the wall",
    altBiblioteca: "Wooden bookcase with volumes of case law beside the staircase",
    acciones: "Quick actions",
    llamar: "Call",
    escribir: "Write",
    llamenos: "Call us",
    copiar: "Copy the number",
    copiado: "Number copied",
    cerrar: "Close",
  },
};
export const CT: Record<LanguageCode, TextosV3> = localizedRecord("contacto", CT_BASE, (value) => {
  const translated = value as Omit<TextosV3, "oficinasLead"> & { oficinasLead: string };
  return {
    ...translated,
    oficinasLead: (calle: string, ciudad: string) => translated.oficinasLead.replace("{{calle}}", calle).replace("{{ciudad}}", ciudad),
  };
});
