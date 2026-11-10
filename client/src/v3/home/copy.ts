/* Textos nuevos del Inicio v3 (demo aprobada el 5-11-2026). El español es el de la demo, al pie de la
   letra; el inglés, en el mismo registro institucional. NO viven aquí (los edita el panel): la frase de
   la firma (home.firma: title y body[0]), la banda de la filosofía (home.creemos: quote, body[0] y label),
   los titulares de las prácticas y de los socios (home.practicas.title, home.socios.title),
   los nombres y resúmenes de las prácticas y los cargos de los socios (/api/practice-groups, /api/team).
   Cifras: las que el sitio ya afirma (about.stats del panel: más de 40 años de experiencia de los socios,
   más de 72 ciudades en la red de despachos aliados) más las 32 entidades de esa red y las cuatro áreas.
   Sin año de fundación: el sitio dice 2009 en «La firma» y «Desde 2010» en la portada. */
import { v3Asset } from "../asset";

export const homeCopy = {
  es: {
    intro: {
      boton: "Conozca la firma",
      cifras: {
        anos: "Años de experiencia",
        ciudades: "Ciudades con presencia",
        entidades: "Entidades federativas",
        areas: "Áreas de práctica",
      },
    },
    practicas: {
      entrada: "La práctica laboral es el centro de la firma; las demás la acompañan.",
      ver: "Ver la práctica",
    },
    industrias: {
      titulo: "Industrias que asesoramos",
      boton: "Ver las industrias",
      ver: "Ver la industria",
    },
    socios: {
      boton: "Conozca a los socios y al equipo",
    },
  },
  en: {
    intro: {
      boton: "About the firm",
      cifras: {
        anos: "Years of experience",
        ciudades: "Cities in our alliance network",
        entidades: "States and Mexico City",
        areas: "Practice areas",
      },
    },
    practicas: {
      entrada: "Labor law is the core of the firm; the other practices support it.",
      ver: "View the practice",
    },
    industrias: {
      titulo: "Industries we advise",
      boton: "View the industries",
      ver: "View the industry",
    },
    socios: {
      boton: "Meet the partners and the team",
    },
  },
  de: {
    intro: { boton: "Die Kanzlei kennenlernen", cifras: { anos: "Jahre Erfahrung", ciudades: "Städte in unserem Netzwerk", entidades: "Bundesländer und Mexiko-Stadt", areas: "Praxisbereiche" } },
    practicas: { entrada: "Arbeitsrecht ist der Kern der Kanzlei; die weiteren Bereiche ergänzen ihn.", ver: "Praxis ansehen" },
    industrias: { titulo: "Branchen, die wir beraten", boton: "Branchen ansehen", ver: "Branche ansehen" },
    socios: { boton: "Partner und Team kennenlernen" },
  },
  zh: {
    intro: { boton: "了解本所", cifras: { anos: "经验年限", ciudades: "联盟网络覆盖城市", entidades: "州及墨西哥城", areas: "业务领域" } },
    practicas: { entrada: "劳动法是本所的核心业务，其他领域与之协同配合。", ver: "查看业务领域" },
    industrias: { titulo: "我们提供咨询的行业", boton: "查看行业", ver: "查看行业" },
    socios: { boton: "了解合伙人与团队" },
  },
  ko: {
    intro: { boton: "로펌 알아보기", cifras: { anos: "경력 연수", ciudades: "제휴 네트워크 도시", entidades: "주 및 멕시코시티", areas: "업무 분야" } },
    practicas: { entrada: "노동법은 로펌의 핵심 업무이며 다른 분야가 이를 뒷받침합니다.", ver: "업무 분야 보기" },
    industrias: { titulo: "자문 산업 분야", boton: "산업 분야 보기", ver: "산업 분야 보기" },
    socios: { boton: "파트너와 팀 알아보기" },
  },
  ja: {
    intro: { boton: "事務所について", cifras: { anos: "経験年数", ciudades: "提携ネットワークの都市", entidades: "州およびメキシコシティ", areas: "取扱分野" } },
    practicas: { entrada: "労働法務を中核に、その他の分野がこれを支えます。", ver: "取扱分野を見る" },
    industrias: { titulo: "ご相談いただく業界", boton: "業界を見る", ver: "業界を見る" },
    socios: { boton: "パートナーとチームを見る" },
  },
  ar: {
    intro: { boton: "تعرّفوا على مكتبنا", cifras: { anos: "سنوات الخبرة", ciudades: "مدن شبكة التحالف", entidades: "الولايات ومكسيكو سيتي", areas: "مجالات الممارسة" } },
    practicas: { entrada: "قانون العمل هو جوهر المكتب، وتدعمه مجالات الممارسة الأخرى.", ver: "عرض مجال الممارسة" },
    industrias: { titulo: "الصناعات التي نقدم لها المشورة", boton: "عرض الصناعات", ver: "عرض الصناعة" },
    socios: { boton: "تعرّفوا على الشركاء والفريق" },
  },
  ru: {
    intro: { boton: "Ознакомьтесь с фирмой", cifras: { anos: "Лет опыта", ciudades: "Городов в нашей сети", entidades: "Штаты и Мехико", areas: "Практики" } },
    practicas: { entrada: "Трудовое право — основа фирмы; остальные практики дополняют её.", ver: "Посмотреть практику" },
    industrias: { titulo: "Отрасли, которым мы помогаем", boton: "Посмотреть отрасли", ver: "Посмотреть отрасль" },
    socios: { boton: "Познакомьтесь с партнёрами и командой" },
  },
  fr: {
    intro: { boton: "Découvrez le cabinet", cifras: { anos: "Années d’expérience", ciudades: "Villes de notre réseau", entidades: "États et Mexico", areas: "Domaines de pratique" } },
    practicas: { entrada: "Le droit du travail est au cœur du cabinet ; les autres domaines l’accompagnent.", ver: "Voir le domaine" },
    industrias: { titulo: "Secteurs que nous conseillons", boton: "Voir les secteurs", ver: "Voir le secteur" },
    socios: { boton: "Découvrir les associés et l’équipe" },
  },
  it: {
    intro: { boton: "Scopri lo studio", cifras: { anos: "Anni di esperienza", ciudades: "Città della nostra rete", entidades: "Stati e Città del Messico", areas: "Aree di pratica" } },
    practicas: { entrada: "Il diritto del lavoro è il centro dello studio; le altre aree lo affiancano.", ver: "Vedi l’area" },
    industrias: { titulo: "Settori che assistiamo", boton: "Vedi i settori", ver: "Vedi il settore" },
    socios: { boton: "Conosci gli associati e il team" },
  },
} satisfies Record<string, unknown>;

export function homeCopyFor(language: string) {
  return homeCopy[language as keyof typeof homeCopy] ?? homeCopy.en;
}

/* Foto de cada práctica en el bloque de Baker, por el slug de la base. Litigio toma la foto que la
   demo aprobada tenía en ese mismo cuadro (los rollos de acero de «seguridad social», práctica que el
   sitio ya integra en Laboral): no es la cabecera de ninguna página de práctica, así que no le roba
   la imagen a otra, y su tono hondo y monocromo se lee bien bajo el velo. */
export const PRACTICE_PHOTOS: Record<string, { clave: string; img: string; w: number; h: number }> = {
  "laboral-seguridad-social": { clave: "laboral", img: v3Asset("/v3/c-laboral.webp"), w: 2000, h: 1334 },
  "corporativo-contractual": { clave: "corporativo", img: v3Asset("/v3/c-corporativo.webp"), w: 2000, h: 1333 },
  migratorio: { clave: "migratorio", img: v3Asset("/v3/c-migratorio.webp"), w: 2000, h: 1333 },
  "litigio-contencioso": { clave: "litigio", img: v3Asset("/v3/c-acumulado.webp"), w: 2400, h: 1600 },
};

/* Los cuatro socios, siempre en este orden (y su respaldo si /api/team no responde). */
export const PARTNERS_FALLBACK = [
  { slug: "mario-saucedo-montemayor", name: "Mario Saucedo Montemayor", es: "Socio director", en: "Managing partner", imageUrl: v3Asset("/team_photos/mario-saucedo-montemayor.png") },
  { slug: "enrique-santos-guzman", name: "Enrique Santos Guzmán", es: "Socio director", en: "Managing partner", imageUrl: v3Asset("/team_photos/enrique-santos-guzman.png") },
  { slug: "enrique-santos-arce", name: "Enrique Santos Arce", es: "Socio fundador", en: "Founding partner", imageUrl: v3Asset("/team_photos/enrique-santos-arce.png") },
  { slug: "mario-saucedo-rodriguez", name: "Mario Saucedo Rodríguez", es: "Socio fundador (in memoriam)", en: "Founding partner (in memoriam)", imageUrl: v3Asset("/team_photos/mario-saucedo-rodriguez-color.png") },
] as const;
