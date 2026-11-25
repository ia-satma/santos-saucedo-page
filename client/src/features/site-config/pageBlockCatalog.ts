export type PageBlockMeta = {
  label: string;
  where: string;
  description: string;
};

const catalog: Record<string, Record<string, PageBlockMeta>> = {
  home: {
    hero: { label: "Hero y encabezado", where: "La primera pantalla de Inicio", description: "Controla el video, el póster, el logo y la frase animada." },
    firma: { label: "Nuestra firma", where: "La banda de firma de Inicio", description: "Edita el título, los párrafos, la fotografía y su pie." },
    cifras: { label: "Cifras de la portada", where: "Las cifras junto a Nuestra firma", description: "Cambia las etiquetas. Los valores vienen de las fuentes compartidas." },
    creemos: { label: "Lo que creemos", where: "La banda de filosofía de Inicio", description: "Edita la cita, los párrafos y la imagen de filosofía." },
    practicas: { label: "Prácticas", where: "El bloque de prácticas de Inicio", description: "Edita la introducción y enlaza con las fichas del catálogo." },
    industrias: { label: "Industrias", where: "El bloque de industrias de Inicio", description: "Edita sus textos. Las fichas y fotografías se cambian en Industrias." },
    extranjeras: { label: "Empresas extranjeras", where: "La sección posterior a Prácticas", description: "Edita su texto, fotografía y cifras editoriales." },
    socios: { label: "Socios y equipo", where: "El bloque de perfiles de Inicio", description: "Edita el título y el enlace. Los perfiles se administran en Socios y equipo." },
    monitor: { label: "Monitor Laboral", where: "El bloque de publicaciones de Inicio", description: "Edita el título y la introducción. Las notas se administran en Monitor Laboral." },
  },
  about: {
    hero: { label: "Encabezado", where: "La primera pantalla de Nuestra firma", description: "Edita título, introducción, imagen y datos alternativos." },
    historia: { label: "Historia", where: "La sección institucional de Nuestra firma", description: "Edita los párrafos de historia." },
    cifras: { label: "Cifras", where: "La sección de cifras de Nuestra firma", description: "Edita los valores y sus etiquetas." },
    valores: { label: "Valores y principios", where: "La sección de principios", description: "Edita el título y cada principio." },
    prioridad: { label: "Prioridad y frases", where: "La sección editorial de prioridad", description: "Edita las frases y notas que acompañan la lámina." },
    laminaSiempreAdelante: { label: "Lámina Siempre hacia adelante", where: "La primera lámina visual", description: "Edita sus textos, etapas, accesibilidad y orden." },
    laminaReaccion: { label: "Lámina Capacidad de reacción", where: "La segunda lámina visual", description: "Edita sus textos, etapas, accesibilidad y orden." },
    laminas: { label: "Láminas visuales", where: "Las láminas animadas de Nuestra firma", description: "Control general de las láminas cuando se usa el esquema anterior." },
    oficina: { label: "Oficina y fotografías", where: "La sección de oficina y galería", description: "Edita fotografías, pies y textos alternativos." },
  },
  practices: {
    hero: { label: "Portada", where: "La primera pantalla de Prácticas", description: "Edita el encabezado y la introducción." },
    lista: { label: "Listado de prácticas", where: "Las tarjetas de prácticas", description: "Ordena y enlaza las áreas del catálogo." },
    servicios: { label: "Servicios", where: "El contenido de servicios de cada práctica", description: "Edita los textos que acompañan las áreas." },
    industries: { label: "Industrias relacionadas", where: "El bloque de industrias relacionado con Prácticas", description: "Controla su aparición desde este resumen de visibilidad." },
    laminaReaccion: { label: "Lámina Capacidad de reacción", where: "La lámina al final de Prácticas", description: "Controla su aparición en la página." },
  },
  industries: {
    hero: { label: "Portada", where: "La primera pantalla de Industrias", description: "Edita el encabezado y la introducción." },
    lista: { label: "Listado de industrias", where: "El catálogo de Industrias", description: "Las fichas, imágenes y orden se editan en el catálogo." },
    textos: { label: "Textos de cada industria", where: "Los enlaces y textos de la portada", description: "Controla las etiquetas que acompañan cada industria." },
    animacion: { label: "Animación y mapa", where: "La animación y el mapa de Industrias", description: "Controla la sección visual y sus medios." },
  },
  team: {
    hero: { label: "Portada", where: "La primera pantalla de Socios y equipo", description: "Edita el encabezado y la introducción." },
    socios: { label: "Socios", where: "El carrusel de socios nombrados", description: "La visibilidad y el orden de cada perfil se editan en el catálogo de equipo." },
    colaboradores: { label: "Colaboradores", where: "El mosaico de fotografías", description: "Cambia fotos, orden, visibilidad, recorte y texto alternativo." },
    mapa: { label: "Presencia y mapa", where: "El mapa de presencia nacional", description: "Controla el mapa y sus textos editoriales." },
  },
  news: {
    hero: { label: "Introducción", where: "El encabezado de Monitor Laboral", description: "Edita título y presentación." },
    filtros: { label: "Filtros y estados", where: "La búsqueda y los estados vacíos", description: "Edita etiquetas, filtros y mensajes." },
    publicaciones: { label: "Notas", where: "El listado de publicaciones", description: "Las notas completas se editan en el catálogo del Monitor." },
    suscripcion: { label: "Suscripción", where: "El formulario de suscripción", description: "Edita la invitación y sus estados." },
  },
  contact: {
    hero: { label: "Encabezado", where: "La primera pantalla de Contacto", description: "Edita el título y la introducción." },
    datos: { label: "Datos de contacto", where: "La dirección, teléfono y correo", description: "Fuente compartida con Oficinas y el pie de página." },
    formulario: { label: "Formulario", where: "El formulario público de Contacto", description: "Edita campos, consentimiento y mensajes de envío." },
  },
  offices: {
    hero: { label: "Encabezado", where: "La primera pantalla de Oficinas", description: "Edita el nombre y la introducción." },
    datos: { label: "Contenido y datos", where: "Dirección, horario y mapa", description: "Los datos de contacto se comparten con Contacto y el pie." },
    galeria: { label: "Galería", where: "El recorrido fotográfico de Oficinas", description: "Cambia imágenes, orden, pies y textos alternativos." },
  },
  careers: {
    hero: { label: "Encabezado", where: "La primera pantalla de Carreras", description: "Edita el título, imagen y presentación." },
    informacion: { label: "Información y pasantías", where: "La presentación y la banda de Pasantías", description: "Edita cultura, entorno y el enlace al programa." },
    vacantes: { label: "Vacantes", where: "El listado de oportunidades", description: "Las vacantes se administran en su catálogo." },
    formulario: { label: "Postulación", where: "El formulario de candidatura", description: "Edita instrucciones, campos y estados." },
  },
};

function humanize(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
}

export function getPageBlockMeta(pageId: string, blockKey: string): PageBlockMeta {
  return catalog[pageId]?.[blockKey] ?? {
    label: humanize(blockKey),
    where: "Esta página pública",
    description: "Controla la visibilidad de este bloque y conserva sus datos para editarlo después.",
  };
}

export function getSectionGuide(pageId: string, section: string, label: string) {
  const meta = getPageBlockMeta(pageId, section);
  return {
    label: meta.label || label,
    where: meta.where,
    description: meta.description,
  };
}
