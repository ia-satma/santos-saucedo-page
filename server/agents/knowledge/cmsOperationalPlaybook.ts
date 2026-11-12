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
    agentType: "presentation_generator",
    name: "brand_template_compliance",
    description: "Usa plantillas institucionales, conteo de contenido y exportación verificable.",
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
];
