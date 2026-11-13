# Sistema de diseño · Redes sociales Santos Saucedo

Formato único: **1080 × 1080 px (1:1)**: Instagram, Facebook y LinkedIn. Carruseles de 4 diapositivas (portada, 2 de contenido, cierre).

## 1. Marca
- Logo azul (`assets/logo-azul.png`) sobre fondos claros, y logo blanco (`assets/logo-blanco.png`) sobre azul o sobre foto.
- El logo tiene aire a la izquierda, así que se compensa con `margin-left: -7.2%` de su ancho para alinearlo ópticamente al margen.
- Isotipo oficial `SantosSaucedo_Isotipo-Principal-07.png`, optimizado como `assets/ss-simbolo.png`, como marca de agua: esquina inferior derecha, `right:-200px; bottom:-110px; height:960px`, con máscara de degradado vertical. En fondos oscuros se usa la variante blanca con el filtro existente. Opacidad 0.09 en blanco sobre azul y 0.065 sobre blanco.
- Nombre en copy de redes: **Santos & Saucedo**. En piezas de marca/print: **Santos Saucedo**.
- Descriptor: DERECHO LABORAL PARA EMPRESAS.

## 2. Color
| Token | Hex | Uso |
|---|---|---|
| Azul marino | `#0b2850` | Fondo principal oscuro, titulares sobre claro |
| Degradado azul | `#0c2340 → #0d3358 → #0f3e69 → #145385` (180°) | Fondos oscuros |
| Azul medio | `#145385` | Banda de pie |
| Lima | `#bbf741` | Acentos sobre azul, fondo de "tip" |
| Verde | `#8cc63f` | Acentos (barras, números) sobre blanco |
| Verde texto | `#5e8f17` | Eyebrows y etiquetas sobre blanco (contraste AA) |
| Blanco | `#ffffff` | Fondo claro |
| Gris claro | `#eef2f6` | Fondo alterno (glosario) |
| Línea | `#d3dbe6` | Divisores sobre claro |
| Texto secundario | `#55566a` / `#4a5f7d` | Párrafos / paginación sobre claro |
| Texto sobre azul | `#c5d2e3` | Párrafos sobre azul |
| Alerta (solo uso interno) | `#a3333d` | Sello "pendiente de aprobación" |

Hay 4 modos de fondo: **dark** (degradado azul), **light** (blanco), **gris** (#eef2f6) y **lime** (#bbf741 con todo el texto en azul marino). En un carrusel conviene alternar al menos dos modos.

## 3. Tipografía
- **Lora** 400 (y cursiva) para titulares, cifras, números de lista y comillas.
- **DM Sans** 400/500 para eyebrows, párrafos, pie y paginación.

| Rol | Tamaño | Notas |
|---|---|---|
| Cifra hero | 220–500 px | Lora, line-height 0.8, letter-spacing −6 a −20 px |
| Titular portada | 84–120 px | Lora, line-height 1.05–1.08 |
| Titular contenido | 46–64 px | Lora |
| Párrafo | 28–36 px | DM Sans, line-height 1.45 |
| Eyebrow | 26 px · 500 · tracking 8 px · MAYÚSCULAS | Con barra de 72 × 4 px |
| Paginación | 26 px | "02 / 04" |

El texto nunca baja de 24 px. Usar `text-wrap: pretty` en titulares.

## 4. Retícula
- Margen de 90 px en los laterales y arriba, y 80 px abajo.
- Estructura vertical: **eyebrow/cabecera** arriba, **contenido** centrado (flex:1) y **pie** abajo.
- El pie puede ser: (a) logo + url con línea superior; (b) mini (logo de 250 px + →); (c) banda azul de 176 px con línea lima de 4 px.
- Layouts divididos: panel de 420–540 px más una línea lima vertical de 6 px.

## 5. Componentes
Eyebrow · Cabecera con paginación · Pie (3 variantes) · Banda · Marca de agua · Etiqueta sobre foto (cuadro azul con barra lima) · Lista numerada · Checklist · Bloque de fecha · Término de glosario · P./R. · Tabla comparativa ✓/— · Contacto con íconos (versión lima sobre azul). Todos están en `componentes.js`.

## 6. Fotografía (regla estricta)
- **No aplicar nunca** filtros que modifiquen el color: nada de grayscale, blend modes, tintes ni capas de color sobre toda la foto.
- **Solo se permite** un degradado parcial (40–66 % inferior) de transparente a `#0c2340`, para que se lea el texto.
- Encuadre con `object-fit: cover`. En retratos, `object-position: 50% 25%`.
- Formatos: foto completa, banda superior (540–600 px), panel lateral (534 px), arco (border-radius superior) y círculo con borde lima.

## 7. Contenido
- Tono: profesional, preventivo, en "usted".
- Si la pieza cita la ley, incluir el artículo (p. ej. "Art. 87, LFT").
- Cierre de carrusel: llamada a la acción + teléfono, correo y web.
- Datos de contacto: +52 81 8335 2086 · info@santossaucedo.com · santossaucedo.com.
- Pendientes: validar "+40 años" frente a "Desde 2010", y aprobar las citas de ejemplo y los casos ilustrativos.
