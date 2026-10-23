// Browser-only fixtures: never inserted into the database or exposed by the app.
export const monitorArticles = [
  {
    slug: "visual-conciliacion",
    title: "Individual labor disputes before the Conciliation Boards",
    titleEs: "Conflictos individuales de trabajo ante las Juntas de Conciliación",
    excerpt: "A practical guide to resolving disputes and protecting employment relationships through timely legal advice.",
    excerptEs: "Una guía práctica para resolver controversias y proteger las relaciones de trabajo mediante asesoría oportuna.",
    category: "insights",
    image: "monitor-conciliacion.webp",
  },
  {
    slug: "visual-prevencion",
    title: "Preventive review of labor administration",
    titleEs: "Revisión preventiva de la administración laboral",
    excerpt: "Key considerations for a consistent and effective compliance strategy.",
    excerptEs: "Aspectos clave para una estrategia de cumplimiento consistente y efectiva.",
    category: "alerts",
    image: "monitor-prevencion.webp",
  },
  {
    slug: "visual-auditoria",
    title: "Checklist for a comprehensive employment law audit",
    titleEs: "Lista de verificación para una auditoría jurídico-laboral integral",
    excerpt: "Documents, processes and obligations to review before the next inspection.",
    excerptEs: "Documentos, procesos y obligaciones que conviene revisar antes de la próxima inspección.",
    category: "events",
    image: "monitor-auditoria.webp",
  },
].map(({ image, ...article }, index) => ({
  ...article,
  id: `monitor-visual-${index}`,
  date: `2026-10-${15 - index}T12:00:00.000Z`,
  imageUrl: `/__monitor_visual__/${image}`,
  published: true,
  featuredHome: index === 0,
  content: "<p>Stable visual fixture.</p>",
  contentEs: "<p>Contenido fijo de prueba visual.</p>",
}));
