import { useQuery } from "@tanstack/react-query";
import type { OfficeImage } from "@shared/schema";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { useCmsContent } from "@/hooks/useCmsContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhotoBand, type OfficePhotoKey } from "@/components/home26/PhotoBand";
import { Eyebrow } from "@/components/editorial";
import { SplitSection, TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { keepFirmName } from "@/lib/firmName";
import { useOfficeLabel } from "@/lib/officeLabel";
import type { LanguageCode } from "@shared/schema";
// "La oficina": un recorrido visual por la oficina con fotos grandes a todo lo ancho de la
// ventana (PhotoBand), sin rótulos por tipo de espacio (petición del cliente, 16-10-2026: no
// "recepción", "área de trabajo"; las fotos "tipo todo el background", no "como un cuadro"), y al
// final la dirección y cómo llegar ("para que sepan dónde estamos"). Sin pies de foto, sin
// carrusel, sin visor y sin animación. Color natural suave (.ss-photo--soft). El texto
// alternativo de las fotos de siempre es el editable de esta página (alt); el de las nuevas, el
// de PhotoBand.

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

interface OfficesContent {
  /** Introducción: una sola frase, sin cifras ni adjetivos */
  intro: string;
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
const ddClass = "text-[19px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";

/** Dos fotos lado a lado desde sm (cada una media ventana, a la misma altura); en teléfono,
    una debajo de otra. Huecos de Hueso entre fotos (gap), sin marco. */
function PhotoPair({
  photos,
  alt,
  positions = ["", ""],
}: {
  photos: [OfficePhotoKey, OfficePhotoKey];
  alt: (k: OfficePhotoKey) => string | undefined;
  positions?: [string, string];
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
      {photos.map((k, i) => (
        <div key={k} className="h-[44vh] min-h-[260px] sm:h-[52vh] lg:h-[66vh] lg:min-h-[460px] max-h-[820px]">
          <PhotoBand photo={k} alt={alt(k)} height="fill" sizes="(min-width: 640px) 50vw, 100vw" position={positions[i]} />
        </div>
      ))}
    </div>
  );
}

export default function Offices() {
  const siteDetails = useSiteDetails();
  const officeNameFor = useOfficeLabel();
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const editableContent = useCmsContent("offices", content);
  const t = editableContent[language] ?? editableContent.en;
  const title = officeNameFor(language);
  // El alt editable de esta página para sus fotos; las nuevas, el de PhotoBand
  const altFor = (k: OfficePhotoKey) => (t.alt as Partial<Record<OfficePhotoKey, string>>)[k];
  const { data: gallery = [] } = useQuery<OfficeImage[]>({ queryKey: ["/api/office-images"] });
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
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-offices-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="01" tone="navy" className="mb-6" />
              <h1 data-testid="text-offices-title">{title}</h1>
            </div>
          </div>
        </section>

        <div className="pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="ss-container">
            {/* Introducción: una sola frase, en el cuerpo de la rejilla editorial. En coreano,
                keep-all: a 320 px partía "누에보레온주" y "있으며" dentro de la palabra (D18). */}
            <section data-testid="section-offices-intro">
              <SplitSection>
                <p
                  className={`ss-lead max-w-[44rem] ${language === "ko" ? "[word-break:keep-all]" : ""}`}
                  data-testid="text-offices-intro"
                >
                  {keepFirmName(t.intro)}
                </p>
              </SplitSection>
            </section>
          </div>
        </div>

        {/* El recorrido: fotos de borde a borde de la ventana, una tras otra, y algunas en pareja.
            Sin rótulos ni pies: quien no puede venir ve la oficina como al recorrerla (la fachada,
            el vestíbulo, la recepción, las salas, las áreas de trabajo y la obra). La fachada es
            la única que no se difiere. */}
        <div className="space-y-2 sm:space-y-3" data-testid="section-gallery">
          <PhotoBand photo="fachada" alt={altFor("fachada")} eager position="object-[50%_42%]" testId="img-offices-facade" />
          <PhotoBand photo="vestibulo2" alt={altFor("vestibulo2")} position="object-[50%_62%]" />
          <PhotoPair photos={["recepcion", "vestibulo"]} alt={altFor} />
          <PhotoBand photo="salaJuntas2" alt={altFor("salaJuntas2")} position="object-[50%_55%]" />
          <PhotoBand photo="vestibulo3" alt={altFor("vestibulo3")} position="object-[50%_62%]" />
          <PhotoBand photo="areaTrabajo" alt={altFor("areaTrabajo")} position="object-[50%_60%]" />
          <PhotoPair photos={["areaTrabajo2", "privado"]} alt={altFor} />
          <PhotoBand photo="mezanine" alt={altFor("mezanine")} position="object-[50%_62%]" />
          <PhotoPair photos={["estancia", "biblioteca"]} alt={altFor} positions={["object-[50%_40%]", "object-[50%_50%]"]} />
          <PhotoPair photos={["escultura", "obraMazo"]} alt={altFor} positions={["object-[50%_30%]", "object-[50%_50%]"]} />
          {/* Fotos que la firma suba desde el panel: también a todo lo ancho */}
          {gallery.map((photo) => (
            <div key={photo.id} className="relative h-[44vh] min-h-[260px] w-full overflow-hidden bg-ss-rule sm:h-[56vh] lg:h-[66vh] lg:min-h-[460px] max-h-[820px]">
              <img
                src={photo.imageUrl}
                alt={language === "es" ? photo.altEs : photo.alt}
                className="ss-photo--soft absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                data-testid="section-office-gallery"
              />
            </div>
          ))}
        </div>

        <div className="py-16 lg:py-24">
          <div className="ss-container">
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

      <Footer />
    </div>
  );
}
