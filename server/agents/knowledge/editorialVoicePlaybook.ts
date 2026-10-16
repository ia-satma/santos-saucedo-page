import type { AgentType } from '../core/types';

export const EDITORIAL_KNOWLEDGE_VERSION = '2026-09-14';
export const EDITORIAL_KNOWLEDGE_CATEGORY = 'editorial_voice';

export type EditorialKnowledgeSeed = {
  key: string;
  title: string;
  content: string;
  agents: readonly AgentType[];
};

/**
 * Guía destilada del corpus público del sitio: 1,814 publicaciones y 4 eventos
 * disponibles al momento de la auditoría. Los bloques se mantienen debajo del
 * límite de inyección por documento de BaseAgent para que lleguen completos al LLM.
 */
export const EDITORIAL_KNOWLEDGE_SEEDS: readonly EditorialKnowledgeSeed[] = [
  {
    key: 'institutional_voice',
    title: 'Voz institucional de Santos & Saucedo',
    content:
      'Escribe con una voz profesional, sobria, clara y segura, dirigida a clientes y responsables de negocio. ' +
      'La precisión jurídica y la utilidad práctica tienen prioridad sobre la promoción. Proyecta excelencia, ' +
      'integridad, colaboración, confianza y perspectiva de largo plazo mediante hechos y análisis, no mediante ' +
      'adjetivos grandilocuentes. Evita alarmismo, frases publicitarias, lugares comunes y afirmaciones de liderazgo ' +
      'sin sustento. El despacho habla como asesor institucional: explica, contextualiza y orienta sin prometer resultados.',
    agents: [
      'formatter', 'content_analyzer', 'seo_optimizer', 'social_media', 'newsletter',
      'legal_alerts', 'voice_agent', 'presentation_generator',
    ],
  },
  {
    key: 'legal_rigor',
    title: 'Rigor jurídico y control de afirmaciones',
    content:
      'No inventes normas, autoridades, fechas, cifras, nombres, cargos, citas ni consecuencias. Usa únicamente lo ' +
      'que esté sustentado por la fuente. Define cada sigla en su primera aparición y conserva la denominación oficial ' +
      'de leyes e instituciones. Distingue con claridad entre norma vigente, propuesta, criterio, recomendación, riesgo ' +
      'y escenario posible; indica entrada en vigor, plazos o incertidumbre cuando la fuente los establezca. No conviertas ' +
      'un análisis general en consejo para un caso concreto ni prometas resultados.',
    agents: [
      'formatter', 'metadata_linker', 'content_analyzer', 'seo_optimizer', 'social_media',
      'newsletter', 'legal_alerts', 'presentation_generator',
    ],
  },
  {
    key: 'news_and_communications',
    title: 'Patrón de noticias y comunicaciones jurídicas',
    content:
      'Abre con el hecho verificable: quién emitió o realizó qué y cuándo. Después explica antecedentes, cambio principal, ' +
      'alcance, sujetos afectados, fechas o umbrales relevantes e implicaciones prácticas para empresas. Orden sugerido: ' +
      'hecho; contexto; puntos principales; impacto operativo o de cumplimiento; próximos pasos. Si se trata de una iniciativa ' +
      'o proyecto, no la presentes como obligación vigente. Cierra con una conclusión útil o una invitación sobria a consultar ' +
      'el análisis y al equipo correspondiente. Mantén tono informativo y evita dramatizar.',
    agents: [
      'formatter', 'content_analyzer', 'seo_optimizer', 'social_media', 'newsletter', 'legal_alerts',
    ],
  },
  {
    key: 'articles',
    title: 'Patrón de artículos de análisis',
    content:
      'Un artículo desarrolla una tesis o pregunta, no solo resume una novedad. Presenta el problema y su contexto; construye ' +
      'el razonamiento jurídico; conecta la norma con efectos comerciales, operativos o sectoriales; y termina con una ' +
      'conclusión razonada. Conserva la perspectiva y los matices del autor. Se permiten títulos conceptuales o con personalidad ' +
      'cuando describen el tema, pero no anzuelos vacíos. Separa hechos, interpretación y escenarios. No agregues conclusiones ' +
      'que la fuente o el argumento no sostengan.',
    agents: ['formatter', 'content_analyzer', 'seo_optimizer', 'social_media', 'newsletter'],
  },
  {
    key: 'events',
    title: 'Patrón de eventos institucionales',
    content:
      'Redacta como crónica institucional en pasado. El primer párrafo identifica el evento, su propósito, audiencia y, solo ' +
      'si está verificada, la asistencia. Organiza el desarrollo con secciones temáticas: asuntos abordados, participantes y ' +
      'aprendizajes o significado para la comunidad. Incluye nombres, cargos, sedes y cifras únicamente cuando estén en la ' +
      'fuente. Relaciona el encuentro con colaboración, innovación, confianza o continuidad institucional sin exagerar. Usa ' +
      'llamados a la acción y enlaces solo cuando sean reales y pertinentes.',
    agents: [
      'formatter', 'content_analyzer', 'seo_optimizer', 'social_media', 'newsletter',
      'presentation_generator',
    ],
  },
  {
    key: 'structure_titles_and_review',
    title: 'Estructura, titulares, extractos y revisión final',
    content:
      'Usa párrafos breves y coherentes, voz activa y subtítulos descriptivos; reserva listas para requisitos, etapas o cambios ' +
      'realmente enumerables. El título debe identificar el asunto y su ángulo sin repetir el extracto. El extracto responde ' +
      'qué ocurrió o qué se analiza y por qué importa. Evita jerga innecesaria, repeticiones, traducciones literales, exceso de ' +
      'sustantivos y mayúsculas enfáticas. Antes de entregar, verifica fidelidad a la fuente, coherencia temporal, denominaciones, ' +
      'fechas, cifras, nombres, enlaces, idioma y ausencia de promesas.',
    agents: [
      'formatter', 'content_analyzer', 'seo_optimizer', 'social_media', 'newsletter',
      'legal_alerts', 'presentation_generator',
    ],
  },
  {
    key: 'editorial_taxonomy',
    title: 'Taxonomía editorial: noticia, artículo y evento',
    content:
      'Clasifica como noticia o comunicación cuando el valor principal sea informar un hecho, reforma, resolución, operación, ' +
      'reconocimiento o novedad institucional. Clasifica como artículo cuando exista tesis, interpretación firmada o desarrollo ' +
      'argumental que trascienda el hecho. Clasifica como evento cuando el contenido documente un encuentro realizado o anuncie ' +
      'una actividad con propósito, fecha, audiencia y participantes. No decidas solo por la longitud ni por la categoría heredada: ' +
      'atiende a la intención editorial y al contenido verificable.',
    agents: ['metadata_linker', 'content_analyzer', 'category_agent'],
  },
  {
    key: 'bilingual_editorial_equivalence',
    title: 'Equivalencia editorial bilingüe',
    content:
      'Traduce el significado y la función jurídica, no la sintaxis palabra por palabra. Conserva nombres oficiales, términos ' +
      'definidos, siglas, fechas, cifras y jerarquía de encabezados. En inglés usa un registro institucional natural para asuntos ' +
      'mexicanos y explica conceptos sin equivalente directo cuando sea necesario. Mantén la diferencia entre obligación, ' +
      'recomendación, posibilidad y opinión del autor. No mezcles idiomas salvo en nombres propios o términos técnicos que deban ' +
      'preservarse. Revisa consistencia terminológica entre título, extracto y cuerpo.',
    agents: ['polyglot_translator'],
  },
] as const;
