import type { AgentId } from "@shared/agentConstants";

export const CMS_OPERATIONAL_KNOWLEDGE_VERSION = "cms-operational-2026-11-12-v1";
export const CMS_OPERATIONAL_KNOWLEDGE_CATEGORY = "cms_operational_playbook";

export const CMS_OPERATIONAL_SKILLS: ReadonlyArray<{
  agentType: AgentId;
  name: string;
  description: string;
}> = [
  {
    agentType: "website_auditor",
    name: "cms_block_mapping",
    description: "Relaciona cada bloque visible con su sección CMS y página pública.",
  },
  {
    agentType: "website_auditor",
    name: "localized_route_validation",
    description: "Comprueba slugs por idioma, canonical, hreflang y redirecciones.",
  },
  {
    agentType: "website_auditor",
    name: "media_reference_audit",
    description: "Detecta medios sin referencia y conserva la trazabilidad de App Storage.",
  },
  {
    agentType: "content_auditor",
    name: "page_block_completeness",
    description: "Revisa que cada página tenga contenido, traducciones y bloques conectados.",
  },
  {
    agentType: "content_auditor",
    name: "translation_leakage_review",
    description: "Detecta frases en otro idioma cuando no existe una intención editorial.",
  },
  {
    agentType: "polyglot_translator",
    name: "santos_legal_style",
    description: "Aplica la voz institucional y terminología laboral mexicana de Santos & Saucedo.",
  },
  {
    agentType: "polyglot_translator",
    name: "url_and_marker_preservation",
    description: "Conserva URLs, rutas, nombres propios, cifras y marcadores durante la traducción.",
  },
  {
    agentType: "seo_optimizer",
    name: "localized_canonical_seo",
    description: "Genera títulos, descripciones y rutas canónicas por idioma.",
  },
  {
    agentType: "social_media",
    name: "brand_channel_constraints",
    description: "Adapta posts y carruseles al tono de marca y límites de cada red.",
  },
  {
    agentType: "social_media",
    name: "post_carousel_art_direction",
    description: "Aplica la retícula, tipografía, color, fotografía y secuencia del kit de posts y carruseles sin cerrar la exploración creativa.",
  },
  {
    agentType: "social_media",
    name: "taste_design_direction",
    description: "Elige una dirección visual coherente, revisa jerarquía, contraste, desbordes y comportamiento responsive antes de entregar una pieza.",
  },
  {
    agentType: "social_media",
    name: "hook_generation",
    description: "Propone aperturas basadas en hechos sin clickbait y con revisión editorial.",
  },
  {
    agentType: "social_media",
    name: "post_formatting",
    description: "Organiza el copy con estructuras editoriales reconocibles y lo adapta a cada canal.",
  },
  {
    agentType: "social_media",
    name: "content_matrix",
    description: "Combina pilares de Monitor Laboral con formatos de posts y carruseles para ideación controlada.",
  },
  {
    agentType: "social_media",
    name: "carousel_storyboarding",
    description: "Ordena portada, desarrollo, ritmo y cierre de un carrusel sin perder la fuente legal.",
  },
  {
    agentType: "social_media",
    name: "social_visual_review",
    description: "Revisa jerarquía, contraste, desbordes y legibilidad de cada pieza antes de entregarla.",
  },
  {
    agentType: "presentation_generator",
    name: "brand_template_compliance",
    description: "Usa la plantilla institucional aprobada, su orden editorial, conteo de contenido y exportación verificable.",
  },
  {
    agentType: "presentation_generator",
    name: "taste_design_direction",
    description: "Mantiene ritmo visual, contraste, márgenes, tipografía y legibilidad comprobados en los tamaños de salida.",
  },
  {
    agentType: "website_auditor",
    name: "testimonial_provenance_review",
    description: "Comprueba consentimiento, origen y aprobación humana antes de publicar testimonios.",
  },
];

export const CMS_OPERATIONAL_KNOWLEDGE_SEEDS: ReadonlyArray<{
  key: string;
  title: string;
  content: string;
  agents: readonly AgentId[];
}> = [
  {
    key: "cms-pages-and-blocks",
    title: "Mapa editorial de páginas y bloques",
    content:
      "Cada página pública se edita desde su propia página CMS. Portada, Nuestra firma, Prácticas, " +
      "Industrias, Socios y equipo, Monitor Laboral, Contacto, Carreras, Oficinas y Testimonios deben " +
      "mostrar únicamente los bloques que realmente renderiza el frontend. Un bloque sin conexión pública " +
      "se reporta como huérfano. Los nombres visibles se escriben en español y explican qué cambia en el sitio.",
    agents: ["website_auditor", "content_auditor"],
  },
  {
    key: "localized-routes",
    title: "Rutas españolas y SEO localizado",
    content:
      "En español usa rutas como /es/nuestra-firma, /es/practicas, /es/industrias, /es/socios, " +
      "/es/monitor-laboral, /es/contacto, /es/oficinas, /es/aviso-de-privacidad y /es/terminos. " +
      "Las rutas antiguas redirigen con 301. Canonical, hreflang, sitemap, enlaces internos y metadatos " +
      "deben apuntar a la ruta canónica del idioma activo. Las rutas internas guardadas en el CMS permanecen estables.",
    agents: ["website_auditor", "seo_optimizer", "polyglot_translator"],
  },
  {
    key: "labor-radar-scope",
    title: "Radar jurídico laboral nacional con prioridad Nuevo León",
    content:
      "El Radar jurídico laboral cubre fuentes oficiales de todo México, incluyendo DOF, Semanario Judicial, STPS, IMSS, Infonavit " +
      "y autoridades estatales. El CMS muestra primero Nuevo León mediante filtros, pero conserva el resto del país para consulta. " +
      "Cada hallazgo debe guardar fuente, URL, identificador, fecha, entidad, materia, hash, confianza y estado de aprobación antes de alimentar Monitor Laboral o redes.",
    agents: ["legal_alerts", "content_analyzer", "category_agent", "social_media", "website_auditor"],
  },
  {
    key: "media-and-storage",
    title: "Medios y App Storage",
    content:
      "Los medios se verifican por referencia en CMS, frontend, App Storage y módulos generativos. Un medio huérfano " +
      "se reporta con nombre, tipo, ruta y última referencia. Se archiva de forma reversible después de confirmar " +
      "que no se usa. Nunca se borra el original durante una auditoría editorial.",
    agents: ["website_auditor", "image_suggestion", "presentation_generator"],
  },
  {
    key: "translation-quality",
    title: "Calidad de traducción jurídica",
    content:
      "Usa registro jurídico corporativo claro y sobrio. Conserva nombres propios, siglas mexicanas, cifras, fechas, " +
      "URLs, etiquetas HTML y marcadores. No inventes explicaciones ni cambies plazos. Si existe ambigüedad jurídica, " +
      "conserva el término original y deja la entrada para revisión humana.",
    agents: ["polyglot_translator", "content_auditor"],
  },
  {
    key: "testimonial-approval",
    title: "Testimonios con aprobación humana",
    content:
      "Los testimonios importados o recibidos quedan capturados y pendientes. Solo una persona con permiso de edición " +
      "puede aprobarlos y publicarlos. Deben conservar origen, consentimiento, fecha y persona aprobadora. Un testimonio " +
      "sin aprobación o sin consentimiento se mantiene oculto.",
    agents: ["website_auditor", "content_auditor", "social_media"],
  },
  {
    key: "brand-generators",
    title: "Generadores con identidad institucional",
    content:
      "Posts, carruseles, presentaciones, documentos con membrete, imágenes y audio parten de la identidad oficial. " +
      "Los agentes generan borradores y archivos versionados. La publicación, el envío externo y el uso de testimonios " +
      "requieren revisión humana.",
    agents: ["social_media", "presentation_generator", "image_suggestion", "voice_agent"],
  },
  {
    key: "presentation-reference-template",
    title: "Plantilla de presentación institucional aprobada",
    content:
      "La plantilla Presentacion Santos Saucedo define una secuencia editorial de portada, agenda, quiénes somos, " +
      "cifras, servicios, metodología, cita, actualidad, alianza nacional y contacto. El generador debe alternar " +
      "divisores oscuros, cifras, listas numeradas, procesos y citas con mucho espacio en blanco, títulos serif, " +
      "texto sans serif, azul profundo #0B2850 y lima #BBF741. Los ejemplos de 40 años, 72 ciudades y 2010 son " +
      "referencias de diseño y solo se reutilizan cuando el material fuente los confirma. La publicación y el uso " +
      "de cifras requieren revisión humana.",
    agents: ["presentation_generator"],
  },
  {
    key: "social-reference-kit",
    title: "Kit de posts y carruseles aprobado",
    content:
      "El kit de redes sociales contiene familias para datos, noticias, citas, preguntas frecuentes, servicios, guías, " +
      "mitos, comparativos, calendarios, equipo y pasos a paso. Usa 1080 × 1080, Lora y DM Sans, azul #0B2850, " +
      "lima #BBF741, verde de texto #5E8F17, fotos sin filtros, márgenes de 90 px y cierres con contacto. " +
      "Las plantillas orientan la calidad, pero el agente puede proponer ideas y composiciones nuevas. Los datos legales, " +
      "cifras y citas requieren fuente o revisión humana.",
    agents: ["social_media"],
  },
  {
    key: "taste-design-direction",
    title: "Dirección visual Taste para generadores",
    content:
      "La skill Taste exige decidir una dirección visual antes de producir, trabajar con una retícula estable, " +
      "márgenes equivalentes, una idea dominante por pantalla o diapositiva, fotografías reales relacionadas con el tema, " +
      "contraste AA y texto dentro de sus cajas. Los agentes comprueban 1440, 1024, 768 y 390/375 px, corrigen desbordes, " +
      "saltos de línea, imágenes vacías y jerarquía, y mantienen alternativas estáticas para movimiento o pantallas pequeñas. " +
      "Los efectos son discretos y nunca desplazan el contenido jurídico.",
    agents: ["social_media", "presentation_generator"],
  },
  {
    key: "social-media-skills",
    title: "Skills de contenido social aprobadas",
    content:
      "La adaptación de social-media-skills aporta hooks, estructuras PAS/AIDA/BAB/STAR/SLAY, matriz de pilares y formatos, " +
      "storyboard de carrusel, composición editable y scoring editorial. Investigación de fuentes, analytics, Apify y Gemini " +
      "solo se marcan activos cuando existe una conexión autorizada. Sin ella el agente trabaja con material del Monitor y deja " +
      "el resultado como borrador pendiente de aprobación humana.",
    agents: ["social_media"],
  },
];
