import { Fragment, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { OfficeImage } from "@shared/schema";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { OfficePhotography } from "@/components/editorial/OfficePhotography";
import { mediaDefaults } from "@/lib/cmsMedia";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { SplitSection, TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { keepFirmName } from "@/lib/firmName";
import { useOfficeLabel } from "@/lib/officeLabel";
import type { LanguageCode } from "@shared/schema";
type PhotoKey = "fachada" | "recepcion" | "vestibulo" | "vestibulo2" | "salaJuntas2" | "areaTrabajo" | "areaTrabajo2" | "privado" | "escultura" | "obraMazo";

interface OfficesContent {
  /** Introducción editorial, editable por idioma. */
  intro: string;
  story?: { workTitle: string; workText: string; cultureTitle: string; cultureText: string };
  reception: string;
  meetingRooms: string;
  workAreas: string;
  art: string;
  /** h2 del bloque de la dirección (el mismo término que /contact usa en su lista) */
  address: string;
  phone: string;
  email: string;
  hours: string;
  hoursDetails: string;
  getDirections: string;
  newTab: string;
  alt: Record<PhotoKey, string>;
}

// Textos de la dirección (teléfono, correo, horario, "Cómo llegar", aviso de pestaña nueva):
// los mismos de /contact en cada idioma.
const content: Record<LanguageCode, OfficesContent> = {
  es: {
    intro:
      "Nuestras oficinas se encuentran en la colonia Del Valle, en San Pedro Garza García, Nuevo León. Aquí recibimos a nuestros clientes y desarrollamos el trabajo cotidiano de la firma.",
    story: {"workTitle": "El trabajo diario", "workText": "Las áreas de trabajo y las salas de reunión permiten alternar el trabajo individual con la colaboración del equipo. Son espacios para revisar documentación, preparar asuntos y conversar con nuestros clientes.", "cultureTitle": "Biblioteca y arte", "cultureText": "La biblioteca jurídica y el arte contemporáneo conviven en distintos espacios de la oficina. Libros, pinturas y esculturas aportan un carácter propio al entorno de trabajo de Santos & Saucedo."},
    reception: "Recepción",
    meetingRooms: "Salas de juntas",
    workAreas: "Áreas de trabajo",
    art: "Obra",
    address: "Dirección",
    phone: "Teléfono",
    email: "Correo electrónico",
    hours: "Horario de oficina",
    hoursDetails: "Lunes a viernes, 9:00–19:00 h",
    getDirections: "Cómo llegar",
    newTab: "(se abre en otra pestaña)",
    alt: {
      fachada: "Fachada de cristal de la oficina de Santos & Saucedo, con el Cerro de la Silla reflejado",
      recepcion: "Recepción de la oficina de Santos & Saucedo",
      vestibulo: "Vestíbulo de la oficina de Santos & Saucedo, visto desde arriba",
      vestibulo2: "Sala de espera en el vestíbulo de la oficina de Santos & Saucedo",
      salaJuntas2: "Sala de juntas con estantería, en la oficina de Santos & Saucedo",
      areaTrabajo: "Área de trabajo abierta de la oficina de Santos & Saucedo",
      areaTrabajo2: "Escritorios en un área de trabajo de la oficina de Santos & Saucedo",
      privado: "Privado en la oficina de Santos & Saucedo",
      escultura: "Escultura azul ante un muro verde, en la oficina de Santos & Saucedo",
      obraMazo: "Pintura de un mazo de juez en la oficina de Santos & Saucedo",
    },
  },
  en: {
    intro:
      "Our offices are located in Colonia Del Valle, San Pedro Garza García, Nuevo León. This is where we meet with clients and carry out the firm’s daily work.",
    story: {"workTitle": "Everyday work", "workText": "Workspaces and meeting rooms accommodate both individual work and team collaboration. These are places to review documents, prepare matters and meet with our clients.", "cultureTitle": "Library and art", "cultureText": "The legal library and contemporary art share spaces throughout the office. Books, paintings and sculptures give the working environment at Santos & Saucedo its own character."},
    reception: "Reception",
    meetingRooms: "Meeting rooms",
    workAreas: "Work areas",
    art: "Art",
    address: "Address",
    phone: "Telephone",
    email: "Email",
    hours: "Office hours",
    hoursDetails: "Monday to Friday, 9:00–19:00",
    getDirections: "Get directions",
    newTab: "(opens in a new tab)",
    alt: {
      fachada: "Glass facade of the Santos & Saucedo office, with Cerro de la Silla reflected",
      recepcion: "Reception at the Santos & Saucedo office",
      vestibulo: "Lobby of the Santos & Saucedo office, seen from above",
      vestibulo2: "Waiting area in the lobby of the Santos & Saucedo office",
      salaJuntas2: "Meeting room with shelving at the Santos & Saucedo office",
      areaTrabajo: "Open work area at the Santos & Saucedo office",
      areaTrabajo2: "Desks in a work area of the Santos & Saucedo office",
      privado: "Private office at Santos & Saucedo",
      escultura: "Blue sculpture against a green wall at the Santos & Saucedo office",
      obraMazo: "Painting of a gavel at the Santos & Saucedo office",
    },
  },
  de: {
    intro:
      "Die Kanzleiräume von Santos & Saucedo liegen in der Colonia Del Valle in San Pedro Garza García, Nuevo León, gegenüber dem Cerro de la Silla.",
    story: {"workTitle": "Die tägliche Arbeit", "workText": "Arbeitsbereiche und Besprechungsräume erlauben den Wechsel zwischen Einzelarbeit und Zusammenarbeit im Team. Hier werden Unterlagen geprüft, Mandate vorbereitet und Gespräche mit unseren Mandanten geführt.", "cultureTitle": "Bibliothek und Kunst", "cultureText": "Die juristische Bibliothek und zeitgenössische Kunst teilen sich verschiedene Räume der Kanzlei. Bücher, Gemälde und Skulpturen verleihen dem Arbeitsumfeld von Santos & Saucedo einen eigenen Charakter."},
    reception: "Empfang",
    meetingRooms: "Besprechungsräume",
    workAreas: "Arbeitsbereiche",
    art: "Kunst",
    address: "Adresse",
    phone: "Telefon",
    email: "E-Mail",
    hours: "Öffnungszeiten",
    hoursDetails: "Montag bis Freitag, 9:00–19:00 Uhr",
    getDirections: "Anfahrt",
    newTab: "(öffnet in einem neuen Tab)",
    alt: {
      fachada: "Glasfassade der Kanzlei Santos & Saucedo, in der sich der Cerro de la Silla spiegelt",
      recepcion: "Empfang der Kanzlei Santos & Saucedo",
      vestibulo: "Eingangshalle der Kanzlei Santos & Saucedo, von oben gesehen",
      vestibulo2: "Wartebereich in der Eingangshalle der Kanzlei Santos & Saucedo",
      salaJuntas2: "Besprechungsraum mit Regal in der Kanzlei Santos & Saucedo",
      areaTrabajo: "Offener Arbeitsbereich der Kanzlei Santos & Saucedo",
      areaTrabajo2: "Schreibtische in einem Arbeitsbereich der Kanzlei Santos & Saucedo",
      privado: "Einzelbüro in der Kanzlei Santos & Saucedo",
      escultura: "Blaue Skulptur vor einer grünen Wand in der Kanzlei Santos & Saucedo",
      obraMazo: "Gemälde eines Richterhammers in der Kanzlei Santos & Saucedo",
    },
  },
  fr: {
    intro:
      "Le bureau de Santos & Saucedo se trouve dans la colonia Del Valle, à San Pedro Garza García, Nuevo León, face au Cerro de la Silla.",
    story: {"workTitle": "Le travail au quotidien", "workText": "Les espaces de travail et les salles de réunion permettent d’alterner travail individuel et collaboration en équipe. Ce sont des lieux pour examiner des documents, préparer les dossiers et échanger avec nos clients.", "cultureTitle": "Bibliothèque et art", "cultureText": "La bibliothèque juridique et l’art contemporain cohabitent dans différents espaces du bureau. Livres, tableaux et sculptures donnent un caractère propre à l’environnement de travail de Santos & Saucedo."},
    reception: "Accueil",
    meetingRooms: "Salles de réunion",
    workAreas: "Espaces de travail",
    art: "Œuvres",
    address: "Adresse",
    phone: "Téléphone",
    email: "E-mail",
    hours: "Heures d’ouverture",
    hoursDetails: "Du lundi au vendredi, de 9 h à 19 h",
    getDirections: "Itinéraire",
    newTab: "(s’ouvre dans un nouvel onglet)",
    alt: {
      fachada: "Façade vitrée du bureau de Santos & Saucedo, où se reflète le Cerro de la Silla",
      recepcion: "Accueil du bureau de Santos & Saucedo",
      vestibulo: "Hall du bureau de Santos & Saucedo, vu d’en haut",
      vestibulo2: "Espace d’attente dans le hall du bureau de Santos & Saucedo",
      salaJuntas2: "Salle de réunion avec étagères, au bureau de Santos & Saucedo",
      areaTrabajo: "Espace de travail ouvert du bureau de Santos & Saucedo",
      areaTrabajo2: "Postes de travail dans un espace du bureau de Santos & Saucedo",
      privado: "Bureau individuel chez Santos & Saucedo",
      escultura: "Sculpture bleue devant un mur végétal, au bureau de Santos & Saucedo",
      obraMazo: "Tableau représentant un marteau de juge, au bureau de Santos & Saucedo",
    },
  },
  it: {
    intro:
      "La sede di Santos & Saucedo si trova nella colonia Del Valle, a San Pedro Garza García, Nuevo León, di fronte al Cerro de la Silla.",
    story: {"workTitle": "Il lavoro quotidiano", "workText": "Le aree di lavoro e le sale riunioni permettono di alternare il lavoro individuale alla collaborazione di squadra. Sono spazi per esaminare documenti, preparare le pratiche e incontrare i nostri clienti.", "cultureTitle": "Biblioteca e arte", "cultureText": "La biblioteca giuridica e l’arte contemporanea convivono in diversi spazi della sede. Libri, dipinti e sculture conferiscono un carattere proprio all’ambiente di lavoro di Santos & Saucedo."},
    reception: "Accoglienza",
    meetingRooms: "Sale riunioni",
    workAreas: "Aree di lavoro",
    art: "Opere",
    address: "Indirizzo",
    phone: "Telefono",
    email: "E-mail",
    hours: "Orari di apertura",
    hoursDetails: "Dal lunedì al venerdì, 9:00–19:00",
    getDirections: "Indicazioni stradali",
    newTab: "(si apre in una nuova scheda)",
    alt: {
      fachada: "Facciata in vetro della sede di Santos & Saucedo, in cui si riflette il Cerro de la Silla",
      recepcion: "Accoglienza della sede di Santos & Saucedo",
      vestibulo: "Atrio della sede di Santos & Saucedo, visto dall’alto",
      vestibulo2: "Area d’attesa nell’atrio della sede di Santos & Saucedo",
      salaJuntas2: "Sala riunioni con scaffalature, nella sede di Santos & Saucedo",
      areaTrabajo: "Area di lavoro aperta della sede di Santos & Saucedo",
      areaTrabajo2: "Scrivanie in un’area di lavoro della sede di Santos & Saucedo",
      privado: "Ufficio privato nella sede di Santos & Saucedo",
      escultura: "Scultura blu davanti a una parete verde, nella sede di Santos & Saucedo",
      obraMazo: "Dipinto di un martelletto da giudice nella sede di Santos & Saucedo",
    },
  },
  ru: {
    intro:
      "Офис Santos & Saucedo находится в районе Дель-Валье в Сан-Педро-Гарса-Гарсия, штат Нуэво-Леон, напротив горы Серро-де-ла-Силья.",
    story: {"workTitle": "Повседневная работа", "workText": "Рабочие зоны и переговорные позволяют сочетать индивидуальную работу и командное взаимодействие. Здесь изучают документы, готовят дела и встречаются с клиентами.", "cultureTitle": "Библиотека и искусство", "cultureText": "Юридическая библиотека и современное искусство соседствуют в разных пространствах офиса. Книги, картины и скульптуры придают рабочей среде Santos & Saucedo особый характер."},
    reception: "Приёмная",
    meetingRooms: "Переговорные",
    workAreas: "Рабочие зоны",
    art: "Искусство",
    address: "Адрес",
    phone: "Телефон",
    email: "Эл. почта",
    hours: "Часы работы",
    hoursDetails: "Понедельник — пятница, 9:00–19:00",
    getDirections: "Как добраться",
    newTab: "(откроется в новой вкладке)",
    alt: {
      fachada: "Стеклянный фасад офиса Santos & Saucedo, в котором отражается гора Серро-де-ла-Силья",
      recepcion: "Приёмная офиса Santos & Saucedo",
      vestibulo: "Вестибюль офиса Santos & Saucedo, вид сверху",
      vestibulo2: "Зона ожидания в вестибюле офиса Santos & Saucedo",
      salaJuntas2: "Переговорная комната со стеллажом в офисе Santos & Saucedo",
      areaTrabajo: "Открытая рабочая зона офиса Santos & Saucedo",
      areaTrabajo2: "Рабочие столы в одной из рабочих зон офиса Santos & Saucedo",
      privado: "Отдельный кабинет в офисе Santos & Saucedo",
      escultura: "Синяя скульптура на фоне зелёной стены в офисе Santos & Saucedo",
      obraMazo: "Картина с судейским молотком в офисе Santos & Saucedo",
    },
  },
  zh: {
    intro: "Santos & Saucedo的办公室位于新莱昂州圣佩德罗加尔萨加西亚的Del Valle区，面朝马鞍山（Cerro de la Silla）。",
    story: {"workTitle": "日常工作", "workText": "办公区和会议室兼顾个人工作与团队协作，是审阅文件、准备案件以及与客户会谈的场所。", "cultureTitle": "图书馆与艺术", "cultureText": "法律图书馆与当代艺术分布在办公室的各个空间。书籍、绘画和雕塑赋予 Santos & Saucedo 的工作环境独特的气质。"},
    reception: "前台",
    meetingRooms: "会议室",
    workAreas: "办公区",
    art: "艺术品",
    address: "地址",
    phone: "电话",
    email: "电子邮件",
    hours: "办公时间",
    hoursDetails: "周一至周五 9:00–19:00",
    getDirections: "获取路线",
    newTab: "（在新标签页中打开）",
    alt: {
      fachada: "Santos & Saucedo办公室的玻璃外立面，映出马鞍山（Cerro de la Silla）",
      recepcion: "Santos & Saucedo办公室的前台",
      vestibulo: "俯瞰Santos & Saucedo办公室的大堂",
      vestibulo2: "Santos & Saucedo办公室大堂的等候区",
      salaJuntas2: "Santos & Saucedo办公室内设有书架的会议室",
      areaTrabajo: "Santos & Saucedo办公室的开放式办公区",
      areaTrabajo2: "Santos & Saucedo办公室办公区的办公桌",
      privado: "Santos & Saucedo办公室的独立办公间",
      escultura: "Santos & Saucedo办公室内绿墙前的蓝色雕塑",
      obraMazo: "Santos & Saucedo办公室内一幅描绘法槌的画作",
    },
  },
  ja: {
    intro:
      "Santos & Saucedoのオフィスは、ヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアのコロニア・デル・バジェにあり、セロ・デ・ラ・シージャに面しています。",
    story: {"workTitle": "日々の業務", "workText": "執務エリアと会議室は、個人作業とチームでの協働を切り替えられるよう設計されています。書類の確認や案件の準備、クライアントとの打ち合わせを行う場です。", "cultureTitle": "ライブラリーとアート", "cultureText": "法律書のライブラリーと現代アートが、オフィスのさまざまな空間に共存しています。書籍、絵画、彫刻が、Santos & Saucedoの職場に独自の個性を与えています。"},
    reception: "受付",
    meetingRooms: "会議室",
    workAreas: "執務エリア",
    art: "アート",
    // H5: en japonés, 所在地 para la dirección, como el pie y /contact
    address: "所在地",
    phone: "電話",
    email: "メールアドレス",
    hours: "営業時間",
    hoursDetails: "月曜日〜金曜日 9:00–19:00",
    getDirections: "アクセス",
    newTab: "（新しいタブで開きます）",
    alt: {
      fachada: "セロ・デ・ラ・シージャが映るSantos & Saucedoのオフィスのガラスのファサード",
      recepcion: "Santos & Saucedoのオフィスの受付",
      vestibulo: "上から見たSantos & Saucedoのオフィスのロビー",
      vestibulo2: "Santos & Saucedoのオフィスのロビーにある待合スペース",
      salaJuntas2: "書棚のあるSantos & Saucedoのオフィスの会議室",
      areaTrabajo: "Santos & Saucedoのオフィスのオープンな執務エリア",
      areaTrabajo2: "Santos & Saucedoのオフィスの執務エリアのデスク",
      privado: "Santos & Saucedoのオフィスの個室",
      escultura: "Santos & Saucedoのオフィスにある緑の壁の前の青い彫刻",
      obraMazo: "Santos & Saucedoのオフィスにある裁判官の木槌を描いた絵画",
    },
  },
  ko: {
    intro:
      "Santos & Saucedo의 사무실은 누에보레온주 산페드로가르사가르시아의 콜로니아 델바예에 있으며, 세로 데 라 시야를 마주하고 있습니다.",
    story: {"workTitle": "일상 업무", "workText": "업무 공간과 회의실은 개인 업무와 팀 협업을 오갈 수 있도록 마련되어 있습니다. 문서를 검토하고 사안을 준비하며 고객과 상담하는 공간입니다.", "cultureTitle": "도서관과 예술", "cultureText": "법률 도서관과 현대 미술이 사무실 곳곳에 함께 자리하고 있습니다. 책과 회화, 조각이 Santos & Saucedo의 업무 환경에 고유한 개성을 더합니다."},
    reception: "리셉션",
    meetingRooms: "회의실",
    workAreas: "업무 공간",
    art: "작품",
    address: "주소",
    phone: "전화",
    email: "이메일",
    hours: "업무 시간",
    hoursDetails: "월요일–금요일 9:00–19:00",
    getDirections: "길찾기",
    newTab: "(새 탭에서 열림)",
    alt: {
      fachada: "세로 데 라 시야가 비치는 Santos & Saucedo 사무실의 유리 외관",
      recepcion: "Santos & Saucedo 사무실의 리셉션",
      vestibulo: "위에서 본 Santos & Saucedo 사무실의 로비",
      vestibulo2: "Santos & Saucedo 사무실 로비의 대기 공간",
      salaJuntas2: "선반이 있는 Santos & Saucedo 사무실의 회의실",
      areaTrabajo: "Santos & Saucedo 사무실의 개방형 업무 공간",
      areaTrabajo2: "Santos & Saucedo 사무실 업무 공간의 책상",
      privado: "Santos & Saucedo 사무실의 개인 집무실",
      escultura: "Santos & Saucedo 사무실의 녹색 벽 앞에 놓인 파란 조각",
      obraMazo: "Santos & Saucedo 사무실에 걸린 판사봉 그림",
    },
  },
  ar: {
    intro:
      "يقع مكتب Santos & Saucedo في حي ديل فالي في سان بيدرو غارثا غارسيا بولاية نويفو ليون، قبالة جبل سيرو دي لا سيا.",
    story: {"workTitle": "العمل اليومي", "workText": "تتيح مساحات العمل وقاعات الاجتماعات التنقل بين العمل الفردي والتعاون الجماعي. وهي أماكن لمراجعة الوثائق وإعداد القضايا والاجتماع بعملائنا.", "cultureTitle": "المكتبة والفن", "cultureText": "تتجاور المكتبة القانونية والفن المعاصر في مساحات مختلفة من المكتب. وتمنح الكتب واللوحات والمنحوتات بيئة العمل في Santos & Saucedo طابعها الخاص."},
    reception: "الاستقبال",
    meetingRooms: "قاعات الاجتماعات",
    workAreas: "مساحات العمل",
    art: "أعمال فنية",
    address: "العنوان",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    hours: "ساعات العمل",
    hoursDetails: "من الاثنين إلى الجمعة، ⁦9:00–19:00⁩", // horario aislado (LRI…PDI), como en /contact
    getDirections: "كيفية الوصول",
    newTab: "(يُفتح في علامة تبويب جديدة)",
    alt: {
      fachada: "الواجهة الزجاجية لمكتب Santos & Saucedo، وينعكس عليها جبل سيرو دي لا سيا",
      recepcion: "الاستقبال في مكتب Santos & Saucedo",
      vestibulo: "بهو مكتب Santos & Saucedo من الأعلى",
      vestibulo2: "منطقة الانتظار في بهو مكتب Santos & Saucedo",
      salaJuntas2: "قاعة اجتماعات ذات رفوف في مكتب Santos & Saucedo",
      areaTrabajo: "مساحة عمل مفتوحة في مكتب Santos & Saucedo",
      areaTrabajo2: "مكاتب في إحدى مساحات العمل بمكتب Santos & Saucedo",
      privado: "غرفة مكتب خاصة في مكتب Santos & Saucedo",
      escultura: "منحوتة زرقاء أمام جدار أخضر في مكتب Santos & Saucedo",
      obraMazo: "لوحة لمطرقة قاضٍ في مكتب Santos & Saucedo",
    },
  },
};

// "Cómo llegar": las indicaciones de Google Maps en otra pestaña, con "Col. del Valle" (E15),
// la misma consulta que /contact. Sin mapa incrustado: el sitio público no carga terceros.
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+Col.+del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220";

// Lista de datos: filas con filete superior, como /contact; etiqueta (dt) en versalitas sans,
// dato (dd) en la sans de 17 px
const rowClass = "grid grid-cols-1 gap-y-1 border-t border-ss-rule py-4 sm:grid-cols-[11rem,1fr] sm:gap-x-6";
const dtClass = "ss-label text-ss-medio sm:pt-1";
const ddClass = "text-[17px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";

export default function Offices() {
  const siteDetails = useSiteDetails();
  const media = useCmsMedia();
  const officePhotos = media.officeGallery.filter(photo => photo.enabled && photo.photo in media.photos);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const officeNameFor = useOfficeLabel();
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const editableContent = useCmsContent("offices", content);
  const t = editableContent[language] ?? editableContent.en;
  const title = officeNameFor(language);
  const story = t.story ?? editableContent.en.story;
  const { data: gallery = [] } = useQuery<OfficeImage[]>({ queryKey: ["/api/office-images"] });
  const photographicTour = [
    ...officePhotos.slice(1).map(item => ({
      featured: item.featured,
      src: media.photos[item.photo as keyof typeof mediaDefaults.photos].url,
      small: media.photos[item.photo as keyof typeof mediaDefaults.photos].smallUrl,
      alt: language === "es" ? item.altEs : item.alt,
    })),
    ...(officePhotos.length ? [{featured:true, src: media.photos.fachada.url, small: media.photos.fachada.smallUrl, alt: t.alt.fachada}] : []),
    ...gallery.map(item => ({featured:false, src:item.imageUrl, small:item.imageUrl, alt:(language === "es" ? item.altEs : item.alt) || title})),
  ];
  const activePhoto = selectedPhoto === null ? undefined : photographicTour[selectedPhoto];
  const nextPhoto = (step: number) => setSelectedPhoto(index => index === null ? null : (index + step + photographicTour.length) % photographicTour.length);
  // Contacto: la etiqueta del menú (nav[5]) en cada idioma
  const nav = (cmsChrome[language] ?? cmsChrome.en).nav;
  // Dirección, teléfono y correo de /api/site-content (los mismos del pie)
  const firm = useSiteContact(language === "en" ? "en" : "es");

  return (
    <div className="min-h-screen bg-background" data-testid="page-offices">
      <SEOHead page="offices" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
        {/* § 01: la oficina pertenece a Nuestra firma en el menú. Sin subtítulo. */}
        <section className={`ss-office-cover ${officePhotos.length ? "ss-office-cover-photo" : ""}`} data-surface="dark" data-testid="section-offices-hero">
          {officePhotos[0] && <OfficePhotography photo={officePhotos[0].photo as keyof typeof mediaDefaults.photos} eager sizes="100vw" />}
          <div className="ss-office-cover-shade" aria-hidden="true" />
          <div className="ss-container relative z-10 pb-12 lg:pb-20">
            <Eyebrow num="01" tone="light" className="mb-6" />
            <h1 className="!text-white" data-testid="text-offices-title">{title}</h1>
          </div>
        </section>

        <div className="py-16 lg:py-24">
          <div className="ss-container">
            {/* Introducción en el cuerpo de la rejilla editorial. En coreano,
                keep-all: a 320 px partía "누에보레온주" y "있으며" dentro de la palabra (D18). */}
            <section className="mb-12 lg:mb-16" data-testid="section-offices-intro">
              <SplitSection>
                <p
                  className={`ss-lead max-w-[44rem] ${language === "ko" ? "[word-break:keep-all]" : ""}`}
                  data-testid="text-offices-intro"
                >
                  {keepFirmName(t.intro)}
                </p>
              </SplitSection>
            </section>

            <section className="mb-20 lg:mb-24" aria-label={title} data-testid="section-gallery">
              <div className="ss-office-gallery">
                {photographicTour.map((photo, index) => (
                  <Fragment key={`${photo.src}-${index}`}>
                  <figure className={photo.featured ? "ss-office-photo-featured" : "ss-office-photo-support"}>
                    <button type="button" className="ss-office-photo-button" onClick={()=>setSelectedPhoto(index)} aria-label={`${language === "es" ? "Ampliar fotografía" : "Enlarge photograph"}: ${photo.alt}`}>
                      <img src={photo.src} srcSet={photo.small !== photo.src ? `${photo.small} 768w, ${photo.src} 1536w` : undefined}
                        sizes="(min-width: 1024px) 60vw, 90vw" alt={photo.alt} loading="lazy" decoding="async" />
                      <span className="ss-office-photo-expand" aria-hidden="true"><ZoomIn size={13} strokeWidth={1.5} /></span>
                    </button>
                  </figure>
                  {story && (index === 5 || index === 11) && <section className="ss-office-story" aria-labelledby={`office-story-${index}`} data-testid={`office-story-${index}`}>
                    <SplitSection aside={<h2 id={`office-story-${index}`} className="ss-h2-sm">{index === 5 ? story.workTitle : story.cultureTitle}</h2>}>
                      <p className="ss-prose max-w-[44rem]">{keepFirmName(index === 5 ? story.workText : story.cultureText)}</p>
                    </SplitSection>
                  </section>}
                  </Fragment>
                ))}
              </div>
            </section>

            {/* Dirección: el h2 en el aside y en el cuerpo la lista de datos (los del pie) con
                "Cómo llegar" y "Contacto". Sin límite de medida (I3): los filetes terminan en el
                mismo borde que las fotos; el límite es solo para texto corrido. */}
            <section aria-labelledby="offices-address" data-testid="section-main-office">
              <SplitSection
                aside={
                  <h2 id="offices-address" className="ss-h2-sm">
                    {t.address}
                  </h2>
                }
              >
                <div data-testid="card-office-info">
                  <dl className="border-b border-ss-rule">
                    {/* La dirección ya la nombra el h2: su etiqueta solo para lectores de pantalla
                        (sr-only la saca de la rejilla) y el dato ocupa las dos columnas desde sm,
                        desde el borde de la columna, sin celda vacía delante (K5) */}
                    <div className={rowClass}>
                      <dt className="sr-only">{t.address}</dt>
                      {/* bdi: en árabe (RTL) el punto final de "N.L." no salta al principio de la línea */}
                      <dd className={`${ddClass} sm:col-span-2`} data-testid="text-full-address">
                        {firm.address.map((line, i) => (
                          <div key={i}>
                            <bdi>{line}</bdi>
                          </div>
                        ))}
                      </dd>
                    </div>
                    <div className={rowClass}>
                      <dt className={dtClass}>{t.phone}</dt>
                      <dd className={ddClass}>
                        <a href={firm.phoneHref} className={ddLinkClass} data-testid="link-phone">
                          <span dir="ltr" className="[font-size:inherit]">
                            {firm.phone}
                          </span>
                        </a>
                      </dd>
                    </div>
                    <div className={rowClass}>
                      <dt className={dtClass}>{t.email}</dt>
                      <dd className={ddClass}>
                        <a
                          href={`mailto:${firm.email}`}
                          dir="ltr"
                          className={`${ddLinkClass} [overflow-wrap:anywhere]`}
                          data-testid="link-email"
                        >
                          {firm.email}
                        </a>
                      </dd>
                    </div>
                    <div className={rowClass}>
                      <dt className={dtClass}>{t.hours}</dt>
                      <dd className={ddClass} data-testid="text-office-hours">
                        {t.hoursDetails}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
                    {/* Mismo aspecto que TextLink; <a> propio porque el destino es externo */}
                    <a
                      href={siteDetails.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ss-label group relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3"
                      data-testid="button-directions"
                    >
                      <span className="ss-link">{t.getDirections}</span>
                      <span className="sr-only">{` ${t.newTab}`}</span>
                      <span aria-hidden="true" className="ss-arrow">
                        →
                      </span>
                    </a>
                    <TextLink href="/contact" data-testid="button-contact">
                      {nav[5].label}
                    </TextLink>
                  </div>
                </div>
              </SplitSection>
            </section>
          </div>
        </div>
      </main>

      <Dialog open={activePhoto !== undefined} onOpenChange={open=>{if(!open)setSelectedPhoto(null);}}>
        <DialogContent className="max-w-6xl border-none bg-[#15152a] p-5 text-white sm:p-8" onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();nextPhoto(-1);}if(event.key==='ArrowRight'){event.preventDefault();nextPhoto(1);}}}>
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {activePhoto && <>
            <img src={activePhoto.src} alt={activePhoto.alt} className="mx-auto max-h-[72vh] max-w-full rounded-lg object-contain" />
            <div className="flex items-center justify-between gap-4 pt-3">
              <button type="button" className="grid size-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label={language==='es'?'Fotografía anterior':'Previous photograph'} onClick={()=>nextPhoto(-1)}><ChevronLeft /></button>
              <p aria-live="polite" className="text-sm">{(selectedPhoto ?? 0)+1} / {photographicTour.length}</p>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label={language==='es'?'Siguiente fotografía':'Next photograph'} onClick={()=>nextPhoto(1)}><ChevronRight /></button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
