import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { SplitSection, TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { keepFirmName } from "@/lib/firmName";
import { officeLabel } from "@/lib/officeLabel";
import { highFetchPriority } from "@/lib/teamPhotoSources";
import type { LanguageCode } from "@shared/schema";
// Fotos de la oficina (ronda 6): dos tamaños por foto. Solo estas; el resto del folder de la
// firma no se usa (varias tienen huellas de retoque).
import fachadaS from "@assets/ss26/oficina/fachada-768.webp";
import fachadaL from "@assets/ss26/oficina/fachada-1536.webp";
import recepcionS from "@assets/ss26/oficina/recepcion-768.webp";
import recepcionL from "@assets/ss26/oficina/recepcion-1536.webp";
import vestibuloS from "@assets/ss26/oficina/vestibulo-768.webp";
import vestibuloL from "@assets/ss26/oficina/vestibulo-1536.webp";
import vestibulo2S from "@assets/ss26/oficina/vestibulo-2-768.webp";
import vestibulo2L from "@assets/ss26/oficina/vestibulo-2-1536.webp";
import salaJuntas2S from "@assets/ss26/oficina/sala-juntas-2-768.webp";
import salaJuntas2L from "@assets/ss26/oficina/sala-juntas-2-1536.webp";
import areaTrabajoS from "@assets/ss26/oficina/area-trabajo-768.webp";
import areaTrabajoL from "@assets/ss26/oficina/area-trabajo-1536.webp";
import areaTrabajo2S from "@assets/ss26/oficina/area-trabajo-2-768.webp";
import areaTrabajo2L from "@assets/ss26/oficina/area-trabajo-2-1536.webp";
import privadoS from "@assets/ss26/oficina/privado-768.webp";
import privadoL from "@assets/ss26/oficina/privado-1536.webp";
import esculturaS from "@assets/ss26/oficina/escultura-768.webp";
import esculturaL from "@assets/ss26/oficina/escultura-1536.webp";
import obraMazoS from "@assets/ss26/oficina/obra-mazo-768.webp";
import obraMazoL from "@assets/ss26/oficina/obra-mazo-1536.webp";

// "La oficina" (H1, ronda 6), como la página de oficinas de Von Wobeser: h1, una frase de
// introducción, la fachada y las fotos por tema, y la dirección con "Cómo llegar". Sin metros,
// pisos, arquitecto ni adjetivos: la firma no los ha confirmado. Sin carrusel, sin visor y sin
// animación. Las fotos en color suave (.ss-photo--soft, K1: ganó 5 a 0 al gris en el juicio a
// ciegas de la ronda 7): personas en gris, lugares en color suave.

type PhotoKey =
  | "fachada"
  | "recepcion"
  | "vestibulo"
  | "vestibulo2"
  | "salaJuntas2"
  | "areaTrabajo"
  | "areaTrabajo2"
  | "privado"
  | "escultura"
  | "obraMazo";

// Medidas reales de cada archivo (srcset con su ancho verdadero; width/height del grande
// reservan el hueco y la página no se mueve al cargar). La fachada, la recepción y la escultura
// no llegan a 1536: sus archivos "-1536" miden 1159, 1522 y 1024 de ancho. La obra del mazo,
// recortada (I4), mide 1536 × 940.
interface PhotoFile {
  s: string;
  sw: number;
  l: string;
  lw: number;
  lh: number;
}

const PHOTOS: Record<PhotoKey, PhotoFile> = {
  fachada: { s: fachadaS, sw: 768, l: fachadaL, lw: 1159, lh: 900 },
  recepcion: { s: recepcionS, sw: 761, l: recepcionL, lw: 1522, lh: 1024 },
  vestibulo: { s: vestibuloS, sw: 768, l: vestibuloL, lw: 1536, lh: 1024 },
  vestibulo2: { s: vestibulo2S, sw: 768, l: vestibulo2L, lw: 1536, lh: 1024 },
  salaJuntas2: { s: salaJuntas2S, sw: 768, l: salaJuntas2L, lw: 1536, lh: 1024 },
  areaTrabajo: { s: areaTrabajoS, sw: 768, l: areaTrabajoL, lw: 1536, lh: 1024 },
  areaTrabajo2: { s: areaTrabajo2S, sw: 768, l: areaTrabajo2L, lw: 1536, lh: 1024 },
  privado: { s: privadoS, sw: 768, l: privadoL, lw: 1536, lh: 1024 },
  escultura: { s: esculturaS, sw: 640, l: esculturaL, lw: 1024, lh: 1536 },
  obraMazo: { s: obraMazoS, sw: 768, l: obraMazoL, lw: 1536, lh: 940 },
};

// sizes según el hueco de cada foto. .ss-container: 1320 px de contenido y 5vw de margen
// (20 px bajo 400). Desde lg el cuerpo de SplitSection (columnas 5–12) mide hasta 872 px
// (≈ 60vw); antes, todo el contenedor (≈ 90vw). Media columna: la mitad menos el hueco de 24 px.
// La fachada va en el mismo cuerpo (I3): mismo sizes que las anchas.
const SIZES = {
  wide: "(min-width: 1024px) min(872px, 60vw), 90vw",
  half: "(min-width: 1024px) min(424px, 30vw), (min-width: 640px) calc(45vw - 12px), 90vw",
  // Obra: vertical y horizontal a la misma altura (columnas 235fr / 576fr desde sm: 29 % y 71 %
  // de lo que queda tras el hueco)
  tall: "(min-width: 1024px) min(246px, 17.4vw), (min-width: 640px) calc(26.1vw - 7px), 90vw",
  beside: "(min-width: 1024px) min(603px, 42.6vw), (min-width: 640px) calc(63.9vw - 17px), 90vw",
} as const;

interface OfficesContent {
  /** Introducción: una sola frase, sin cifras ni adjetivos */
  intro: string;
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
      "La oficina de Santos & Saucedo está en la colonia Del Valle, en San Pedro Garza García, Nuevo León, frente al Cerro de la Silla.",
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
      "Santos & Saucedo’s office is in Colonia Del Valle, San Pedro Garza García, Nuevo León, facing Cerro de la Silla.",
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

/** Una foto: srcset de dos tamaños, sizes del hueco, medidas para reservar el sitio, color
    suave (.ss-photo--soft; la fachada, con cielo, además .ss-photo--sky) y diferida salvo la
    primera (la fachada, que se ve al abrir la página). */
function OfficePhoto({
  photo,
  alt,
  sizes,
  eager = false,
  className = "",
  testId,
}: {
  photo: PhotoKey;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
  testId?: string;
}) {
  const f = PHOTOS[photo];
  return (
    <img
      src={f.l}
      srcSet={`${f.s} ${f.sw}w, ${f.l} ${f.lw}w`}
      sizes={sizes}
      width={f.lw}
      height={f.lh}
      alt={keepFirmName(alt)}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      {...(eager ? highFetchPriority : {})}
      className={`${photo === "fachada" ? "ss-photo--soft ss-photo--sky" : "ss-photo--soft"} block h-auto w-full ${className}`}
      data-testid={testId}
    />
  );
}

/** Bloque de fotos: el nombre (h2.ss-h2-sm) en el aside y las fotos en el cuerpo */
function PhotoBlock({
  id,
  title,
  testId,
  children,
}: {
  id: string;
  title: string;
  testId: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-20 lg:mb-24" aria-labelledby={id} data-testid={testId}>
      <SplitSection
        aside={
          <h2 id={id} className="ss-h2-sm">
            {title}
          </h2>
        }
      >
        {children}
      </SplitSection>
    </section>
  );
}

export default function Offices() {
  const { language } = useLanguage();
  const t = content[language] ?? content.en;
  const title = officeLabel(language);
  // Contacto: la etiqueta del menú (nav[5]) en cada idioma
  const nav = (chrome26[language] ?? chrome26.en).nav;
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
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-offices-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="01" tone="navy" className="mb-6" />
              <h1 data-testid="text-offices-title">{title}</h1>
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-24">
          <div className="ss-container">
            {/* Introducción: una sola frase, en el cuerpo de la rejilla editorial. En coreano,
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

            {/* La fachada, dentro del contenedor (no a sangre): desde lg en la columna del cuerpo
                (5–12), con el mismo borde inicial que la introducción y las fotos de abajo (I3);
                bajo lg, a todo el ancho del contenedor. Nunca más ancha que su archivo (1159 px;
                el cuerpo mide hasta 872). La única foto que no se difiere. */}
            <div className="mb-20 lg:mb-24">
              <SplitSection>
                <OfficePhoto
                  photo="fachada"
                  alt={t.alt.fachada}
                  sizes={SIZES.wide}
                  eager
                  testId="img-offices-facade"
                />
              </SplitSection>
            </div>

            {/* Fotos por tema. Composición editorial: una ancha y dos a media columna, una sola
                ancha, o una vertical junto a una horizontal; huecos de 24 px (gap-6), sin bordes
                ni sombras. En teléfono, una debajo de otra. Sin pie de foto: el nombre del bloque
                basta. */}
            <div data-testid="section-gallery">
              <PhotoBlock id="offices-reception" title={t.reception} testId="section-offices-reception">
                {/* La sala de espera ancha; debajo, recepción (1522 × 1024) y vestíbulo (1536 × 1024)
                    en columnas 1522fr / 1536fr para que las dos tengan la misma altura */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1522fr_1536fr]">
                  <OfficePhoto photo="vestibulo2" alt={t.alt.vestibulo2} sizes={SIZES.wide} className="sm:col-span-2" />
                  <OfficePhoto photo="recepcion" alt={t.alt.recepcion} sizes={SIZES.half} />
                  <OfficePhoto photo="vestibulo" alt={t.alt.vestibulo} sizes={SIZES.half} />
                </div>
              </PhotoBlock>

              {/* Una sola foto ancha: sala-juntas y sala-juntas-2 son casi la misma toma, y la
                  primera ya está en la portada (Empresas extranjeras) */}
              <PhotoBlock id="offices-meeting-rooms" title={t.meetingRooms} testId="section-offices-meeting-rooms">
                <OfficePhoto photo="salaJuntas2" alt={t.alt.salaJuntas2} sizes={SIZES.wide} />
              </PhotoBlock>

              <PhotoBlock id="offices-work-areas" title={t.workAreas} testId="section-offices-work-areas">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <OfficePhoto photo="areaTrabajo" alt={t.alt.areaTrabajo} sizes={SIZES.wide} className="sm:col-span-2" />
                  <OfficePhoto photo="areaTrabajo2" alt={t.alt.areaTrabajo2} sizes={SIZES.half} />
                  <OfficePhoto photo="privado" alt={t.alt.privado} sizes={SIZES.half} />
                </div>
              </PhotoBlock>

              {/* Vertical junto a horizontal: a la misma altura, el ancho de cada una es su
                  proporción (1024/1536 y 1536/940), es decir 235fr / 576fr */}
              <PhotoBlock id="offices-art" title={t.art} testId="section-offices-art">
                <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[235fr_576fr]">
                  <OfficePhoto photo="escultura" alt={t.alt.escultura} sizes={SIZES.tall} />
                  <OfficePhoto photo="obraMazo" alt={t.alt.obraMazo} sizes={SIZES.beside} />
                </div>
              </PhotoBlock>
            </div>

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
                      href={DIRECTIONS_URL}
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

      <Footer />
    </div>
  );
}
