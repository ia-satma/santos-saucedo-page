/* Qué lleva cada página de práctica del diseño de la demo v3: su foto de cabecera y sus láminas.
   Las prácticas son las cuatro del sitio (slug de /api/practice-groups); nombre, resumen, texto,
   servicios y equipo vienen de la base y del panel, no de aquí.

   Fotos (las de la demo aprobada; créditos en client/public/v3/creditos-fotos.txt):
   - Laboral y seguridad social: el camino de montaña con su defensa, la foto de la página «laboral» de
     la demo (la de seguridad social, el trabajador asegurado al mástil, queda fuera al unirse las dos).
   - Corporativo y contractual: las vigas de acero, la de la página «corporativo» de la demo.
   - Migratorio: San Pedro desde el dron de la firma, la de la página «migratorio» de la demo.
   - Litigio y penal laboral (sin página en la demo): los rollos de acero en la nave, el patrimonio de la
     empresa que esta práctica defiende (robo, fraude, abuso de confianza); es también su foto en el
     bloque de prácticas del Inicio.

   Láminas: las de la demo para lo que cada práctica hace según su propio texto, con el número que
   tienen en la demo (las siete láminas van en una sola serie n/7, como en Nuestra firma: 1/7 y 2/7 son
   las de la filosofía).
   - Laboral: «Prevención» 3/7 y «Solución» 4/7 (anatomía; el lema de la firma, como en la página
     laboral de la demo) y el calendario del IMSS y el INFONAVIT 6/7 (seguridad social).
   - Corporativo: el archivero 5/7. Migratorio: la torre de charolas 7/7.
   - Litigio: ninguna. La lámina «Solución» es el juicio LABORAL (Centro de Conciliación, Tribunal
     Laboral, amparo), que en el sitio es parte de la práctica laboral; esta práctica es litigio civil,
     mercantil y penal patrimonial. En su lugar, sus servicios van en una banda azul con una foto de la
     oficina de la firma (feature: la pintura del mazo, editable en el panel como foto «obraMazo»).

   Orden de la página: cabecera; el texto de la práctica y «Qué hacemos»; la primera lámina; los
   servicios del texto; las demás láminas; las cuatro prácticas y la siguiente. Así ninguna lámina azul
   queda pegada a otra (en laboral, los servicios separan la anatomía del calendario). */
import type { LanguageCode } from "@shared/constants";
import type { FgArea } from "./figurasSvg";
import type { SheetId } from "./textos";

/** Número de cada lámina en la serie de la demo (n/7) */
export const LAMINAS_TOTAL = 7;
export const LAMINA_N: Record<SheetId | FgArea, number> = { orden: 3, solucion: 4, corporativo: 5, seguridad: 6, migratorio: 7 };

export type Plate = { kind: "anatomia"; sheets: SheetId[] } | { kind: "figura"; area: FgArea };

/** Banda azul con foto de la oficina (de las fotos del panel, cmsMedia «photos») para los servicios
    de una práctica sin lámina */
export interface Feature { photo: "obraMazo" | "biblioteca"; pos: string }

export interface PracticeV3 {
  /** nombre de la página en la demo (data-vista) */
  vista: string;
  photo: { src: string; w: number; h: number; pos: string; alt: Record<LanguageCode, string> };
  plates: Plate[];
  feature?: Feature;
}

export const PRACTICE_V3: Record<string, PracticeV3> = {
  "laboral-seguridad-social": {
    vista: "laboral",
    photo: {
      src: "v3/c-prevencion.webp", w: 2400, h: 1600, pos: "50% 58%",
      alt: {
        es: "Un camino de montaña sube en curvas por la ladera, visto desde lo alto", en: "A mountain road winds up the hillside, seen from above",
        de: "Eine Bergstraße windet sich von oben gesehen in Kurven den Hang hinauf", zh: "从高处看，一条山路沿山坡蜿蜒上升", ko: "산길이 위에서 보았을 때 비탈을 굽이굽이 올라갑니다", ja: "山道が上空から見て斜面を曲がりながら上っています", ar: "طريق جبلي يصعد منحدرًا في منعطفات، من الأعلى", ru: "Горная дорога извивается по склону, вид сверху", fr: "Une route de montagne monte en lacets sur le versant, vue d’en haut", it: "Una strada di montagna sale a tornanti sul pendio, vista dall’alto",
      },
    },
    plates: [
      { kind: "anatomia", sheets: ["orden", "solucion"] },
      { kind: "figura", area: "seguridad" },
    ],
  },
  "corporativo-contractual": {
    vista: "corporativo",
    photo: {
      src: "v3/c-estructura.webp", w: 2400, h: 1602, pos: "50% 50%",
      alt: {
        es: "Vigas de acero iluminadas de noche, cruzadas en diagonal", en: "Steel beams lit at night, crossing on the diagonal",
        de: "Nachts beleuchtete Stahlträger, diagonal gekreuzt", zh: "夜间照亮的钢梁交叉成对角线", ko: "밤에 조명을 받은 강철 빔이 대각선으로 교차합니다", ja: "夜に照らされた鉄骨が斜めに交差しています", ar: "عوارض فولاذية مضاءة ليلًا تتقاطع قطريًا", ru: "Стальные балки, освещённые ночью и пересекающиеся по диагонали", fr: "Des poutres d’acier éclairées la nuit se croisent en diagonale", it: "Travi d’acciaio illuminate di notte, incrociate in diagonale",
      },
    },
    plates: [{ kind: "figura", area: "corporativo" }],
  },
  migratorio: {
    vista: "migratorio",
    photo: {
      src: "v3/c-san-pedro.webp", w: 1920, h: 872, pos: "50% 50%",
      alt: {
        es: "Torres de San Pedro Garza García con el Cerro de la Silla al fondo, vistas desde un dron", en: "Towers of San Pedro Garza García with the Cerro de la Silla behind them, seen from a drone",
        de: "Türme von San Pedro Garza García mit dem Cerro de la Silla im Hintergrund, aus einer Drohne gesehen", zh: "从无人机俯瞰圣佩德罗加尔萨加西亚的高楼，背景是塞拉德拉西利亚山", ko: "드론으로 본 산페드로 가르사 가르시아의 타워와 뒤편의 세로 데 라 시야", ja: "ドローンから見たサン・ペドロ・ガルサ・ガルシアの高層ビルと背後のセロ・デ・ラ・シヤ", ar: "أبراج سان بيدرو غارسا غارسيا وجبل سيرو دي لا سيّا في الخلفية، من طائرة مسيّرة", ru: "Башни Сан-Педро-Гарса-Гарсия с Серро-де-ла-Силья на заднем плане, вид с дрона", fr: "Les tours de San Pedro Garza García avec le Cerro de la Silla en arrière-plan, vues depuis un drone", it: "Le torri di San Pedro Garza García con il Cerro de la Silla sullo sfondo, viste da un drone",
      },
    },
    plates: [{ kind: "figura", area: "migratorio" }],
  },
  "litigio-contencioso": {
    vista: "litigio",
    photo: {
      src: "v3/c-acumulado.webp", w: 2400, h: 1600, pos: "50% 55%",
      alt: {
        es: "Rollos de lámina de acero alineados en una nave industrial en penumbra", en: "Coils of sheet steel lined up in a dim industrial warehouse",
        de: "Blechstahlrollen in einer dämmrigen Industriehalle", zh: "昏暗工业厂房中排列的钢板卷材", ko: "어두운 산업 창고에 줄지어 있는 판재 강철 코일", ja: "薄鋼板のコイルが薄暗い工場に並んでいます", ar: "لفائف من صفائح الفولاذ مصطفّة في مستودع صناعي خافت الإضاءة", ru: "Рулоны листовой стали, выстроенные в полутёмном промышленном цехе", fr: "Des bobines de tôle d’acier alignées dans un entrepôt industriel sombre", it: "Bobine di lamiera d’acciaio allineate in un capannone industriale in penombra",
      },
    },
    plates: [],
    feature: { photo: "obraMazo", pos: "50% 50%" },
  },
};

/** Direcciones de la demo (y de enlaces viejos) que apuntaban a prácticas con otro nombre:
    se llevan a la práctica del sitio en lugar de mostrar «no encontrada». */
export const LEGACY_SLUGS: Record<string, string> = {
  "consultoria-litigio-laboral": "laboral-seguridad-social",
  laboral: "laboral-seguridad-social",
  "seguridad-social": "laboral-seguridad-social",
  corporativo: "corporativo-contractual",
  litigio: "litigio-contencioso",
};
