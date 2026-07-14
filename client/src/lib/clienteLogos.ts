// Client logos from the 2026 presentation deck's "Clientes" pages.
const logoModules = import.meta.glob("../../../attached_assets/pdf2026/clientes/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const displayNames: Record<string, string> = {
  "aceros-del-toro": "Aceros del Toro",
  "adecco": "Adecco",
  "alen": "AlEn",
  "american-express": "American Express",
  "arca-continental": "Arca Continental",
  "arnecom": "Arnecom",
  "at-t": "AT&T",
  "banregio": "Banregio",
  "barry-callebaut": "Barry Callebaut",
  "basal": "Basal",
  "bosch": "Bosch",
  "brown-forman": "Brown-Forman",
  "brown-root": "Brown & Root",
  "bsh": "BSH",
  "carza": "Carza",
  "cinemex": "Cinemex",
  "clarios": "Clarios",
  "clc": "CLC",
  "colgate": "Colgate",
  "compania-mexicana-de-gas": "Compañía Mexicana de Gas",
  "contactpoint-360": "ContactPoint 360",
  "dhl": "DHL",
  "don-colchon": "Don Colchón",
  "el-pollo-loco": "El Pollo Loco",
  "eme-pe": "eme.pe",
  "evertis": "Evertis",
  "femsa": "FEMSA",
  "fortacero": "Fortacero",
  "galaxy": "Galaxy",
  "grupo-delmex": "Grupo Delmex",
  "grupo-prosol": "Grupo Prosol",
  "grupo-xpress-internacional": "Grupo Xpress Internacional",
  "harmak": "Harmak",
  "hsbc": "HSBC",
  "hydal": "Hydal",
  "impuls": "Impuls",
  "johnson-controls": "Johnson Controls",
  "kia": "KIA",
  "lafargeholcim": "LafargeHolcim",
  "lear-corporation": "Lear Corporation",
  "lenovo": "Lenovo",
  "levare": "Levare",
  "liverpool": "Liverpool",
  "nestle": "Nestlé",
  "oxxo": "OXXO",
  "pena-colorada": "Peña Colorada",
  "racel": "Racel",
  "red-ambiental": "Red Ambiental",
  "redexpress": "RedExpress",
  "sasil": "Sasil",
  "schneider-electric": "Schneider Electric",
  "siemens": "Siemens",
  "sinergia-deportiva": "Sinergia Deportiva",
  "smurfit-westrock": "Smurfit Westrock",
  "super-salads": "Super Salads",
  "topgolf": "Topgolf",
  "trouw-nutrition": "Trouw Nutrition",
  "unicredix": "Unicredix",
  "usg": "USG",
  "uvm": "UVM",
  "venus": "Venus",
  "vidusa": "Vidusa",
  "xignux": "Xignux",
  "zf": "ZF",
};

export type ClienteLogo = {
  slug: string;
  name: string;
  image: string;
};

export const clienteLogos: ClienteLogo[] = Object.keys(logoModules)
  .sort()
  .map((key) => {
    const slug = key.split("/").pop()!.replace(".webp", "");
    return {
      slug,
      name: displayNames[slug] || slug,
      image: logoModules[key],
    };
  });
