import { useCmsMedia, mediaDefaults } from "@/lib/cmsMedia";
import { useLanguage } from "@/contexts/LanguageContext";
import { keepFirmName } from "@/lib/firmName";
import { highFetchPriority } from "@/lib/teamPhotoSources";
import type { LanguageCode } from "@shared/schema";

// Banda de foto de la oficina a todo el ancho de la ventana (petición del cliente, 16-10-2026:
// las fotos "tipo todo el background", no "como un cuadro", repartidas por el sitio). Sin marco,
// sin pie y sin rótulo visible: solo el texto alternativo. Va FUERA de .ss-container, de borde a
// borde. Color natural suave (.ss-photo--soft); la fachada, con cielo, además --sky.

export type OfficePhotoKey = keyof typeof mediaDefaults.photos;

// Ancho real de cada archivo (grande, pequeño): el srcset declara su ancho verdadero. Las fotos
// originales de la sesión miden 1536 de ancho como mucho; no hay versión mayor.
const WIDTHS: Record<OfficePhotoKey, [number, number]> = {
  fachada: [1159, 768],
  recepcion: [1522, 761],
  recepcionBanda: [1522, 761],
  escultura: [1024, 640],
  vestibulo: [1536, 768],
  vestibulo2: [1536, 768],
  vestibulo3: [1536, 768],
  salaJuntas: [1536, 768],
  salaJuntas2: [1536, 768],
  areaTrabajo: [1536, 768],
  areaTrabajo2: [1536, 768],
  privado: [1536, 768],
  obraMazo: [1536, 768],
  estancia: [1536, 768],
  mezanine: [1536, 768],
  biblioteca: [1536, 768],
};

type AltSet = Partial<Record<OfficePhotoKey, string>>;

// Texto alternativo por idioma: describe el lugar; nunca se muestra en pantalla. Los de las fotos
// que ya estaban en /offices son los mismos de esa página.
export const officePhotoAlt: Record<LanguageCode, AltSet> = {
  es: {
    fachada: "Fachada de cristal de la oficina de Santos & Saucedo, con el Cerro de la Silla reflejado",
    recepcion: "Recepción de la oficina de Santos & Saucedo",
    recepcionBanda: "Recepción de la oficina de Santos & Saucedo",
    vestibulo: "Vestíbulo de la oficina de Santos & Saucedo, visto desde arriba",
    vestibulo2: "Sala de espera en el vestíbulo de la oficina de Santos & Saucedo",
    vestibulo3: "Sala de espera con dos sillones frente a la sala de juntas, en la oficina de Santos & Saucedo",
    salaJuntas: "Sala de juntas con un tríptico abstracto, en la oficina de Santos & Saucedo",
    salaJuntas2: "Sala de juntas con estantería, en la oficina de Santos & Saucedo",
    areaTrabajo: "Área de trabajo abierta de la oficina de Santos & Saucedo",
    areaTrabajo2: "Escritorios en un área de trabajo de la oficina de Santos & Saucedo",
    privado: "Privado en la oficina de Santos & Saucedo",
    escultura: "Escultura azul ante un muro verde, en la oficina de Santos & Saucedo",
    obraMazo: "Pintura de un mazo de juez en la oficina de Santos & Saucedo",
    estancia: "Estancia con una pintura del mapamundi, en la oficina de Santos & Saucedo",
    mezanine: "Área de trabajo en el entrepiso de la oficina de Santos & Saucedo",
    biblioteca: "Libros jurídicos en el librero de la escalera, en la oficina de Santos & Saucedo",
  },
  en: {
    fachada: "Glass facade of the Santos & Saucedo office, with Cerro de la Silla reflected",
    recepcion: "Reception at the Santos & Saucedo office",
    recepcionBanda: "Reception at the Santos & Saucedo office",
    vestibulo: "Lobby of the Santos & Saucedo office, seen from above",
    vestibulo2: "Waiting area in the lobby of the Santos & Saucedo office",
    vestibulo3: "Waiting area with two armchairs in front of the meeting room at the Santos & Saucedo office",
    salaJuntas: "Meeting room with an abstract triptych at the Santos & Saucedo office",
    salaJuntas2: "Meeting room with shelving at the Santos & Saucedo office",
    areaTrabajo: "Open work area at the Santos & Saucedo office",
    areaTrabajo2: "Desks in a work area of the Santos & Saucedo office",
    privado: "Private office at Santos & Saucedo",
    escultura: "Blue sculpture against a green wall at the Santos & Saucedo office",
    obraMazo: "Painting of a gavel at the Santos & Saucedo office",
    estancia: "Lounge with a painted world map at the Santos & Saucedo office",
    mezanine: "Work area on the mezzanine of the Santos & Saucedo office",
    biblioteca: "Law books on the staircase bookcase at the Santos & Saucedo office",
  },
  de: {
    fachada: "Glasfassade der Kanzlei Santos & Saucedo, in der sich der Cerro de la Silla spiegelt",
    recepcion: "Empfang der Kanzlei Santos & Saucedo",
    recepcionBanda: "Empfang der Kanzlei Santos & Saucedo",
    vestibulo: "Eingangshalle der Kanzlei Santos & Saucedo, von oben gesehen",
    vestibulo2: "Wartebereich in der Eingangshalle der Kanzlei Santos & Saucedo",
    vestibulo3: "Wartebereich mit zwei Sesseln vor dem Besprechungsraum der Kanzlei Santos & Saucedo",
    salaJuntas: "Besprechungsraum mit einem abstrakten Triptychon in der Kanzlei Santos & Saucedo",
    salaJuntas2: "Besprechungsraum mit Regal in der Kanzlei Santos & Saucedo",
    areaTrabajo: "Offener Arbeitsbereich der Kanzlei Santos & Saucedo",
    areaTrabajo2: "Schreibtische in einem Arbeitsbereich der Kanzlei Santos & Saucedo",
    privado: "Einzelbüro in der Kanzlei Santos & Saucedo",
    escultura: "Blaue Skulptur vor einer grünen Wand in der Kanzlei Santos & Saucedo",
    obraMazo: "Gemälde eines Richterhammers in der Kanzlei Santos & Saucedo",
    estancia: "Sitzecke mit einem Gemälde der Weltkarte in der Kanzlei Santos & Saucedo",
    mezanine: "Arbeitsbereich auf der Galerie der Kanzlei Santos & Saucedo",
    biblioteca: "Juristische Bücher im Regal am Treppenaufgang der Kanzlei Santos & Saucedo",
  },
  fr: {
    fachada: "Façade vitrée du bureau de Santos & Saucedo, où se reflète le Cerro de la Silla",
    recepcion: "Accueil du bureau de Santos & Saucedo",
    recepcionBanda: "Accueil du bureau de Santos & Saucedo",
    vestibulo: "Hall du bureau de Santos & Saucedo, vu d’en haut",
    vestibulo2: "Espace d’attente dans le hall du bureau de Santos & Saucedo",
    vestibulo3: "Espace d’attente avec deux fauteuils devant la salle de réunion, au bureau de Santos & Saucedo",
    salaJuntas: "Salle de réunion avec un triptyque abstrait, au bureau de Santos & Saucedo",
    salaJuntas2: "Salle de réunion avec étagères, au bureau de Santos & Saucedo",
    areaTrabajo: "Espace de travail ouvert du bureau de Santos & Saucedo",
    areaTrabajo2: "Postes de travail dans un espace du bureau de Santos & Saucedo",
    privado: "Bureau individuel chez Santos & Saucedo",
    escultura: "Sculpture bleue devant un mur végétal, au bureau de Santos & Saucedo",
    obraMazo: "Tableau représentant un marteau de juge, au bureau de Santos & Saucedo",
    estancia: "Salon avec une peinture de la carte du monde, au bureau de Santos & Saucedo",
    mezanine: "Espace de travail en mezzanine au bureau de Santos & Saucedo",
    biblioteca: "Ouvrages juridiques dans la bibliothèque de l’escalier, au bureau de Santos & Saucedo",
  },
  it: {
    fachada: "Facciata in vetro della sede di Santos & Saucedo, in cui si riflette il Cerro de la Silla",
    recepcion: "Accoglienza della sede di Santos & Saucedo",
    recepcionBanda: "Accoglienza della sede di Santos & Saucedo",
    vestibulo: "Atrio della sede di Santos & Saucedo, visto dall’alto",
    vestibulo2: "Area d’attesa nell’atrio della sede di Santos & Saucedo",
    vestibulo3: "Area d’attesa con due poltrone davanti alla sala riunioni, nella sede di Santos & Saucedo",
    salaJuntas: "Sala riunioni con un trittico astratto, nella sede di Santos & Saucedo",
    salaJuntas2: "Sala riunioni con scaffalature, nella sede di Santos & Saucedo",
    areaTrabajo: "Area di lavoro aperta della sede di Santos & Saucedo",
    areaTrabajo2: "Scrivanie in un’area di lavoro della sede di Santos & Saucedo",
    privado: "Ufficio privato nella sede di Santos & Saucedo",
    escultura: "Scultura blu davanti a una parete verde, nella sede di Santos & Saucedo",
    obraMazo: "Dipinto di un martelletto da giudice nella sede di Santos & Saucedo",
    estancia: "Salottino con un dipinto del planisfero, nella sede di Santos & Saucedo",
    mezanine: "Area di lavoro sul soppalco della sede di Santos & Saucedo",
    biblioteca: "Libri giuridici nella libreria della scala, nella sede di Santos & Saucedo",
  },
  ru: {
    fachada: "Стеклянный фасад офиса Santos & Saucedo, в котором отражается гора Серро-де-ла-Силья",
    recepcion: "Приёмная офиса Santos & Saucedo",
    recepcionBanda: "Приёмная офиса Santos & Saucedo",
    vestibulo: "Вестибюль офиса Santos & Saucedo, вид сверху",
    vestibulo2: "Зона ожидания в вестибюле офиса Santos & Saucedo",
    vestibulo3: "Зона ожидания с двумя креслами перед переговорной в офисе Santos & Saucedo",
    salaJuntas: "Переговорная с абстрактным триптихом в офисе Santos & Saucedo",
    salaJuntas2: "Переговорная комната со стеллажом в офисе Santos & Saucedo",
    areaTrabajo: "Открытая рабочая зона офиса Santos & Saucedo",
    areaTrabajo2: "Рабочие столы в одной из рабочих зон офиса Santos & Saucedo",
    privado: "Отдельный кабинет в офисе Santos & Saucedo",
    escultura: "Синяя скульптура на фоне зелёной стены в офисе Santos & Saucedo",
    obraMazo: "Картина с судейским молотком в офисе Santos & Saucedo",
    estancia: "Зона отдыха с картиной карты мира в офисе Santos & Saucedo",
    mezanine: "Рабочая зона на антресоли офиса Santos & Saucedo",
    biblioteca: "Юридические книги на стеллаже у лестницы в офисе Santos & Saucedo",
  },
  zh: {
    fachada: "Santos & Saucedo办公室的玻璃外立面，映出马鞍山（Cerro de la Silla）",
    recepcion: "Santos & Saucedo办公室的前台",
    recepcionBanda: "Santos & Saucedo办公室的前台",
    vestibulo: "俯瞰Santos & Saucedo办公室的大堂",
    vestibulo2: "Santos & Saucedo办公室大堂的等候区",
    vestibulo3: "Santos & Saucedo办公室会议室前设有两把扶手椅的等候区",
    salaJuntas: "Santos & Saucedo办公室内挂有抽象三联画的会议室",
    salaJuntas2: "Santos & Saucedo办公室内设有书架的会议室",
    areaTrabajo: "Santos & Saucedo办公室的开放式办公区",
    areaTrabajo2: "Santos & Saucedo办公室办公区的办公桌",
    privado: "Santos & Saucedo办公室的独立办公间",
    escultura: "Santos & Saucedo办公室内绿墙前的蓝色雕塑",
    obraMazo: "Santos & Saucedo办公室内一幅描绘法槌的画作",
    estancia: "Santos & Saucedo办公室内挂有世界地图画作的休息区",
    mezanine: "Santos & Saucedo办公室夹层的办公区",
    biblioteca: "Santos & Saucedo办公室楼梯旁书架上的法律书籍",
  },
  ja: {
    fachada: "セロ・デ・ラ・シージャが映るSantos & Saucedoのオフィスのガラスのファサード",
    recepcion: "Santos & Saucedoのオフィスの受付",
    recepcionBanda: "Santos & Saucedoのオフィスの受付",
    vestibulo: "上から見たSantos & Saucedoのオフィスのロビー",
    vestibulo2: "Santos & Saucedoのオフィスのロビーにある待合スペース",
    vestibulo3: "Santos & Saucedoのオフィスの会議室前にある、二脚のアームチェアを置いた待合スペース",
    salaJuntas: "抽象画の三連作が掛かるSantos & Saucedoのオフィスの会議室",
    salaJuntas2: "書棚のあるSantos & Saucedoのオフィスの会議室",
    areaTrabajo: "Santos & Saucedoのオフィスのオープンな執務エリア",
    areaTrabajo2: "Santos & Saucedoのオフィスの執務エリアのデスク",
    privado: "Santos & Saucedoのオフィスの個室",
    escultura: "Santos & Saucedoのオフィスにある緑の壁の前の青い彫刻",
    obraMazo: "Santos & Saucedoのオフィスにある裁判官の木槌を描いた絵画",
    estancia: "世界地図の絵画が掛かるSantos & Saucedoのオフィスのラウンジ",
    mezanine: "Santos & Saucedoのオフィスの中二階にある執務エリア",
    biblioteca: "Santos & Saucedoのオフィスの階段脇の書棚に並ぶ法律書",
  },
  ko: {
    fachada: "세로 데 라 시야가 비치는 Santos & Saucedo 사무실의 유리 외관",
    recepcion: "Santos & Saucedo 사무실의 리셉션",
    recepcionBanda: "Santos & Saucedo 사무실의 리셉션",
    vestibulo: "위에서 본 Santos & Saucedo 사무실의 로비",
    vestibulo2: "Santos & Saucedo 사무실 로비의 대기 공간",
    vestibulo3: "Santos & Saucedo 사무실 회의실 앞, 안락의자 두 개가 놓인 대기 공간",
    salaJuntas: "추상 삼면화가 걸린 Santos & Saucedo 사무실의 회의실",
    salaJuntas2: "선반이 있는 Santos & Saucedo 사무실의 회의실",
    areaTrabajo: "Santos & Saucedo 사무실의 개방형 업무 공간",
    areaTrabajo2: "Santos & Saucedo 사무실 업무 공간의 책상",
    privado: "Santos & Saucedo 사무실의 개인 집무실",
    escultura: "Santos & Saucedo 사무실의 녹색 벽 앞에 놓인 파란 조각",
    obraMazo: "Santos & Saucedo 사무실에 걸린 판사봉 그림",
    estancia: "세계 지도 그림이 걸린 Santos & Saucedo 사무실의 라운지",
    mezanine: "Santos & Saucedo 사무실 메자닌의 업무 공간",
    biblioteca: "Santos & Saucedo 사무실 계단 옆 책장에 꽂힌 법률 서적",
  },
  ar: {
    fachada: "الواجهة الزجاجية لمكتب Santos & Saucedo، وينعكس عليها جبل سيرو دي لا سيا",
    recepcion: "الاستقبال في مكتب Santos & Saucedo",
    recepcionBanda: "الاستقبال في مكتب Santos & Saucedo",
    vestibulo: "بهو مكتب Santos & Saucedo من الأعلى",
    vestibulo2: "منطقة الانتظار في بهو مكتب Santos & Saucedo",
    vestibulo3: "منطقة انتظار بها مقعدان أمام قاعة الاجتماعات في مكتب Santos & Saucedo",
    salaJuntas: "قاعة اجتماعات فيها لوحة ثلاثية تجريدية في مكتب Santos & Saucedo",
    salaJuntas2: "قاعة اجتماعات ذات رفوف في مكتب Santos & Saucedo",
    areaTrabajo: "مساحة عمل مفتوحة في مكتب Santos & Saucedo",
    areaTrabajo2: "مكاتب في إحدى مساحات العمل بمكتب Santos & Saucedo",
    privado: "غرفة مكتب خاصة في مكتب Santos & Saucedo",
    escultura: "منحوتة زرقاء أمام جدار أخضر في مكتب Santos & Saucedo",
    obraMazo: "لوحة لمطرقة قاضٍ في مكتب Santos & Saucedo",
    estancia: "ركن جلوس فيه لوحة لخريطة العالم في مكتب Santos & Saucedo",
    mezanine: "مساحة عمل في طابق الميزانين بمكتب Santos & Saucedo",
    biblioteca: "كتب قانونية على رف الدرج في مكتب Santos & Saucedo",
  },
};

// Alturas: "tall" ≈ 66vh en escritorio (la banda principal de una página), "medium" ≈ 52vh; en
// teléfono menos (44 / 38vh), con un mínimo para que no quede en tira.
const HEIGHTS = {
  tall: "h-[44vh] min-h-[260px] sm:h-[56vh] lg:h-[66vh] lg:min-h-[460px] max-h-[820px]",
  medium: "h-[38vh] min-h-[240px] sm:h-[46vh] lg:h-[54vh] lg:min-h-[400px] max-h-[720px]",
  /** Para medias bandas lado a lado (/offices): la altura la pone el contenedor */
  fill: "h-full",
} as const;

export type PhotoBandHeight = keyof typeof HEIGHTS;

/** Hook: la imagen de una foto de la oficina (archivo de la CMS, srcset y medidas reales) */
function useOfficePhoto(photo: OfficePhotoKey) {
  const { photos } = useCmsMedia();
  const configured = photos[photo] ?? mediaDefaults.photos[photo];
  const [lw, sw] = WIDTHS[photo];
  const srcSet =
    configured.smallUrl && configured.smallUrl !== configured.url
      ? `${configured.smallUrl} ${sw}w, ${configured.url} ${lw}w`
      : undefined;
  return { url: configured.url, srcSet };
}

export function PhotoBand({
  photo,
  widePhoto,
  alt,
  height = "tall",
  position = "",
  sizes = "100vw",
  eager = false,
  className = "",
  testId,
}: {
  photo: OfficePhotoKey;
  /** Otra versión para pantallas desde 768 px (p. ej. la franja recepcion-banda en escritorio) */
  widePhoto?: OfficePhotoKey;
  /** Texto alternativo propio (p. ej. el editable de /offices); si no, el de officePhotoAlt */
  alt?: string;
  height?: PhotoBandHeight;
  /** Encuadre del recorte en clases (p. ej. "object-[50%_40%] md:object-[50%_60%]"); centro si no */
  position?: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
  testId?: string;
}) {
  const { language } = useLanguage();
  const main = useOfficePhoto(photo);
  const wide = useOfficePhoto(widePhoto ?? photo);
  const altText = alt ?? officePhotoAlt[language]?.[photo] ?? officePhotoAlt.en[photo] ?? "";
  const tone = photo === "fachada" ? "ss-photo--soft ss-photo--sky" : "ss-photo--soft";
  const img = (
    <img
      src={main.url}
      srcSet={main.srcSet}
      sizes={sizes}
      alt={keepFirmName(altText)}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      {...(eager ? highFetchPriority : {})}
      className={`${tone} absolute inset-0 h-full w-full object-cover ${position}`}
    />
  );
  return (
    // Fondo Línea mientras carga; overflow para que el recorte no desborde
    <div className={`ss-photo-band relative w-full overflow-hidden bg-ss-rule ${HEIGHTS[height]} ${className}`} data-testid={testId}>
      {widePhoto ? (
        <picture>
          <source media="(min-width: 768px)" srcSet={wide.srcSet ?? wide.url} sizes={sizes} />
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
}
