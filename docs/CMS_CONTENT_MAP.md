# Mapa canónico del CMS

La fuente de este inventario es `client/src/features/site-config/editorMetadata.ts`. Si una página, bloque o alias cambia, ese archivo y esta documentación deben actualizarse en el mismo cambio.

## Páginas públicas

| ID | Ruta estable | Ruta pública en español | Aliases | Bloques principales |
| --- | --- | --- | --- | --- |
| `home` | `/` | `/` | — | Hero, firma, cifras, filosofía, prácticas, industrias, empresas extranjeras, socios, Monitor y pie |
| `about` | `/about` | `/nuestra-firma` | `/nuestra-firma` | Encabezado, historia, cifras, valores, prioridad, láminas, oficina y SEO |
| `practices` | `/practice-groups` | `/practicas` | `/practicas` | Hero, introducción, listado, servicios, lámina y SEO |
| `industries` | `/industries` | `/industrias` | `/industrias`, `/industry-groups`, fichas legacy | Hero, introducción, filtros, listado, animación, navegación y SEO |
| `team` | `/team` | `/socios` | `/socios` | Hero, introducción, socios, colaboradores, presencia y SEO |
| `news` | `/news` | `/monitor-laboral` | `/monitor-laboral`, `/articles`, `/events` | Hero, filtros, búsqueda, notas, paginación, suscripción y SEO |
| `contact` | `/contact` | `/contacto` | `/contacto` | Hero, datos, mapa, fotos, formulario, consentimiento y respuestas |
| `careers` | `/careers` | `/carreras` | `/carreras` | Hero, cultura, pasantías, vacantes, postulación y formulario |
| `interns` | `/careers/interns` | `/pasantias` | `/pasantias` | Hero, postulación, formulario y navegación |
| `offices` | `/offices` | `/oficinas` | `/oficinas` | Hero, dirección, mapa, horario, galería y lightbox |
| `newsletter` | `/newsletter` | `/boletin` | `/boletin` | Título, formulario, consentimiento, estados y relacionadas |
| `testimonials` | `/testimonios` | `/testimonios` | `/testimonials` | Hero, Google Reviews, estados, lista e invitaciones |
| `privacy` | `/privacy-policy` | `/aviso-de-privacidad` | `/aviso-de-privacidad` | Hero, fecha, secciones legales, contacto y SEO |
| `terms` | `/terms` | `/terminos` | `/terminos` | Hero, fecha, secciones legales, contacto y SEO |
| `not-found` | — | — | — | Título, subtítulo, enlaces y `noindex` |

## Fichas y catálogos

| Catálogo | Fichas | Fuente | Página que lo consume |
| --- | --- | --- | --- |
| Prácticas | `/practice-groups/:slug`, `/practicas/:slug` | tabla y API de prácticas | Inicio, Prácticas y ficha |
| Industrias | catálogo de grupos y slugs dinámicos | tabla y API de industrias | Inicio, Industrias y enlaces por hash |
| Equipo | `/team/:slug`, `/socios/:slug` | tabla y API de personas | Inicio, Socios y perfil |
| Monitor | `/news/:slug`, `/monitor-laboral/:slug` | tabla y API de notas | Inicio, Monitor y nota |
| Vacantes | ficha administrada en `/admin/jobs` | tabla de vacantes | Carreras |
| Testimonios | aprobación en `/admin/testimonials` | tabla y bandeja de revisión | Testimonios |

Las fichas se editan desde su catálogo. La página principal solo controla introducción, orden, visibilidad y enlaces al catálogo.

## Fuentes compartidas

| Dato | Fuente única | Se reutiliza en |
| --- | --- | --- |
| Dirección, teléfono y correo | `contactData` y datos persistidos | Contacto, Oficinas y pie |
| Logo, favicon, póster y video | Biblioteca de medios y App Storage | Hero, pie y páginas que lo indiquen |
| Perfiles | catálogo de equipo | Inicio, Socios, fichas y relaciones |
| Prácticas | catálogo de prácticas | Inicio, Prácticas, fichas y Monitor |
| Industrias | catálogo de industrias | Inicio, Industrias, Radar y Monitor |
| Etiquetas de navegación | `navigation` y `chrome` | Header, submenús, pie y enlaces |
| SEO | sección `seo` por página | `SEOHead`, sitemap y compartir |

## Idiomas

El sitio mantiene `es`, `en`, `de`, `zh`, `ko`, `ja`, `ar`, `ru`, `fr` e `it`. El contenido editorial debe declarar el idioma o usar la política de fallback documentada en `useCmsContent`. Las traducciones dinámicas se guardan en la caché de traducción y no sustituyen la revisión humana de textos legales.

## Visibilidad y pruebas mínimas

Cada página nueva debe tener:

- interruptor global
- interruptores por bloque cuando el bloque se puede ocultar
- desaparición del menú, pie y contenido al desactivar la página
- vista previa privada autenticada
- restauración a visible
- prueba en español e inglés como mínimo

Cada bloque nuevo debe tener una clave estable, una fuente CMS, una prueba de render y una prueba de ocultar y mostrar si admite visibilidad.

### Socios y equipo

La página separa sus bloques editables para que cada control tenga un efecto independiente:

- `socios` controla el lienzo y el listado de perfiles nombrados.
- `colaboradores` controla el mosaico de fotografías anónimas.
- `mapa` controla la presencia y el mapa.
- `hero` controla el encabezado de la página.

En `Socios y equipo → Colaboradores` cada fotografía se edita en línea. El formulario permite elegir o cargar el medio, cambiar el orden, ocultar una sola fotografía, editar el texto alternativo por idioma, ajustar el punto focal y quitar o añadir elementos. Las listas antiguas de rutas siguen siendo válidas durante la migración y se normalizan a objetos estructurados al guardar.
