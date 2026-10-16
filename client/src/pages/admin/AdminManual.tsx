import { Link } from "wouter";
const lessons = [
  {
    title: "Editar una página",
    text: "Abra Páginas y textos, busque la sección y elija el idioma. Modifique los campos y pulse Guardar cambios. La vista del sitio muestra la versión guardada; un borrador sin guardar no cambia la página.",
    href: "/admin/content",
    label: "Encontrar una página",
  },
  {
    title: "Añadir o actualizar un abogado",
    text: "En Abogados y equipo puede modificar nombre, cargo, biografía, listas profesionales y fotografía. Visible en el sitio controla el perfil público; Mostrar en Inicio controla su aparición en la portada. Un perfil oculto permanece en el catálogo.",
    href: "/admin/team",
    label: "Abrir equipo",
  },
  {
    title: "Cambiar el orden",
    text: "Abra Orden del contenido y seleccione el catálogo. Arrastre una fila o use las flechas. Guarde la lista completa. Si otra sesión cambió el catálogo, recargue y revise la nueva lista. El diseño conserva sus grupos de socios y equipo.",
    href: "/admin/order",
    label: "Ordenar contenido",
  },
  {
    title: "Subir y reutilizar archivos",
    text: "La biblioteca acepta JPG, PNG, WebP, GIF, MP4, WebM y PDF, hasta 50 MB por archivo. Los selectores permiten cargar o elegir un archivo existente. Quitar una referencia no elimina el original. Archivar retira el medio de los selectores y permite restaurarlo después.",
    href: "/admin/media",
    label: "Abrir biblioteca",
  },
  {
    title: "Preparar una publicación",
    text: "Cree una entrada del Monitor Laboral, complete español e inglés y guarde el borrador. Añada imagen, PDF por idioma y autores confirmados. La vista previa privada muestra el registro guardado. Publicada y la fecha programada determinan cuándo aparece en el sitio.",
    href: "/admin/news/new",
    label: "Crear publicación",
  },
  {
    title: "Actualizar navegación y datos",
    text: "Navegación y pie reúne las etiquetas, la visibilidad y el orden de enlaces. Datos del despacho reúne teléfonos, direcciones y correos. Identidad y portada contiene logos, fotos y video. Revise ambas versiones de idioma antes de guardar.",
    href: "/admin/site-config/chrome",
    label: "Editar navegación",
  },
  {
    title: "Revisar mensajes y vacantes",
    text: "Mensajes y suscripciones contiene la información recibida por los formularios. Las vacantes aparecen en Carreras cuando están publicadas y vigentes. El panel no envía campañas ni respuestas por correo desde estas pantallas.",
    href: "/admin/inbox",
    label: "Abrir mensajes",
  },
  {
    title: "Contenido y publicación de código",
    text: "Guardar un contenido lo persiste en la base de datos del entorno que está usando. Development y producción pueden tener bases distintas. Un cambio de código requiere un despliegue en Replit; guardar contenido no publica una nueva versión del programa.",
    href: "/admin/dashboard",
    label: "Volver al resumen",
  },
];
export default function AdminManual() {
  return (
    <main className="admin-overview">
      <p className="admin-page-kicker">Ayuda para el equipo</p>
      <h1>Guía de uso</h1>
      <p className="admin-page-description">
        Los recorridos principales para mantener el sitio. Guarde y revise antes
        de activar la visibilidad de un contenido.
      </p>
      <div className="mt-9 space-y-8 max-w-3xl">
        {lessons.map((lesson, i) => (
          <section
            key={lesson.title}
            className="border-t pt-6 grid grid-cols-[30px_minmax(0,1fr)] gap-5"
          >
            <span className="text-xs text-muted-foreground tabular-nums pt-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-base font-medium">{lesson.title}</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {lesson.text}
              </p>
              <Link
                href={lesson.href}
                className="text-xs underline inline-block mt-4"
              >
                {lesson.label}
              </Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
