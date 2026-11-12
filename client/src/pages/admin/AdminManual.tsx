import { Link } from "wouter";
import { ArrowRight, CheckCircle2, CircleHelp, Search } from "lucide-react";
import "@/features/admin/manual.css";

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

const quickStart = [
  "Empiece en Resumen para ver el estado del sitio y los pendientes.",
  "Abra la sección que quiere cambiar y use la ayuda contextual de la pantalla.",
  "Guarde los cambios y compruebe la vista pública antes de continuar.",
];

export default function AdminManual() {
  return (
    <main className="admin-overview admin-manual-page" data-testid="admin-manual-page">
      <header className="admin-overview-heading admin-manual-hero">
        <div>
          <p className="admin-page-kicker">Centro de ayuda</p>
          <h1>Guía de uso del CMS</h1>
          <p className="admin-page-description">
            Recorridos sencillos para editar el sitio, revisar cambios y publicar
            contenido sin tocar código.
          </p>
        </div>
        <Link href="/admin/content" className="admin-primary-link">
          <Search aria-hidden="true" />
          Buscar una sección
        </Link>
      </header>

      <section className="admin-manual-start" aria-labelledby="manual-start-title">
        <div>
          <p className="admin-page-kicker">Primeros pasos</p>
          <h2 id="manual-start-title">La forma más fácil de empezar</h2>
          <p>
            El CMS organiza el contenido por lo que las personas ven en el sitio.
            Cada pantalla explica qué puede cambiar y dónde se reflejará.
          </p>
        </div>
        <ol>
          {quickStart.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="admin-manual-heading">
        <div>
          <p className="admin-page-kicker">Recorridos frecuentes</p>
          <h2>Qué quiere hacer hoy</h2>
        </div>
        <Link href="/admin/guide" className="admin-subtle-link">
          Ver guía técnica <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="admin-manual-grid">
        {lessons.map((lesson, i) => (
          <section
            key={lesson.title}
            className="admin-manual-card"
          >
            <div className="admin-manual-card-top">
              <span className="admin-manual-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <CheckCircle2 aria-hidden="true" />
            </div>
            <div>
              <h3>{lesson.title}</h3>
              <p>{lesson.text}</p>
              <Link
                href={lesson.href}
                className="admin-manual-card-link"
              >
                {lesson.label} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section className="admin-manual-note" aria-labelledby="manual-help-title">
        <CircleHelp aria-hidden="true" />
        <div>
          <h2 id="manual-help-title">¿No sabe dónde está una opción?</h2>
          <p>
            Use la búsqueda del panel con palabras sencillas como “portada”,
            “abogados”, “video” o “contacto”. También puede abrir la ayuda de
            cada pantalla sin perder lo que ya estaba editando.
          </p>
        </div>
      </section>
    </main>
  );
}
