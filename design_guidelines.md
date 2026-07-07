# Design Guidelines: Santos & Saucedo Abogados

## Manual de Identidad Corporativa
Este documento define la identidad visual de Santos & Saucedo Abogados aplicada a la plataforma web (adaptada de la base Santos & Saucedo por SATMA, julio 2026).

---

## 1. Colores Corporativos

### Color Principal
| Referencia | Valor | Uso |
|------------|-------|-----|
| Navy | **#202058** | Logotipo, líneas de apoyo, CTAs principales |
| RGB | 32, 32, 88 | |
| HSL | 240° 47% 24% | |

### Variantes de Marca
| Nombre | HEX | Uso |
|--------|-----|-----|
| Navy Profundo | **#181848** | Fondos oscuros, hero, footer |
| Navy Suave | **#484878** | Estados hover, acentos secundarios |
| Gris de Apoyo | **#484848** | Texto secundario del wordmark |

### Uso del Color
- **Fondos:** Blanco/gris neutro (#FAFAFA) primario, navy para secciones destacadas (hero, footer)
- **Texto:** Gris neutro oscuro para cuerpo, navy para headlines y acentos
- **Acentos:** Navy (#202058) para CTAs y elementos importantes - usar con moderación
- **Bordes/Divisores:** Gris neutro claro

---

## 2. Tipografías

Se conserva el esquema tipográfico heredado (serif editorial + sans de apoyo), aplicado en tono navy.

| Fuente | Uso |
|--------|-----|
| **Playfair Display** | Títulos, subtítulos, H1–H3 |
| **Optima / Lato** | Texto corrido, cuerpo |
| **Geomanist / Century Gothic** | Labels, menú, botones |

### Variables CSS Implementadas
```css
--font-heading: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
--font-sans: 'Optima', 'Lato', 'Calibri', 'Segoe UI', sans-serif;
--font-support: 'Geomanist', 'Century Gothic', 'Lato', 'Segoe UI', sans-serif;
```

### Reglas de Uso
- **NO usar versión itálica** excepto para: palabras en otro idioma, citas textuales, blockquotes, o mensajes cortos a destacar

---

## 3. Elementos Gráficos de Apoyo

### Líneas
- ✅ **Líneas navy horizontales** - Permitido
- ❌ **Líneas navy verticales** - Evitar

### Fondos
- Fondos navy (para secciones destacadas: hero, footer, CTAs)
- Fondos en gris claro neutro
- Franjas y recuadros grises

---

## 4. Logotipo

### Uso Principal
- Monograma "SS" entrelazado (dos S en espejo) dentro de triángulo navy + wordmark "SANTOS & SAUCEDO"
- Versión color: navy sobre fondo blanco (`logo-ss-color.png`)
- Versión blanca: monograma y wordmark en blanco, para fondos navy/oscuros (`logo-ss-white.png`)
- Favicon: monograma aislado, recortado del lockup horizontal

### Área de Seguridad
- Reservar espacio alrededor del logotipo equivalente a la altura del triángulo del monograma
- Esta zona no debe invadirse con ningún elemento gráfico

---

## 5. Layout y Componentes

### Border Radius
- **Política:** Esquinas rectas en todo el sitio (rounded-none)
- Excepto: Avatares y elementos circulares

### Espaciado
- Unidades Tailwind: 4, 6, 8, 12, 16, 20, 24
- Contenedor máximo: 1400px (max-w-7xl)
- Padding secciones: py-20 (desktop) / py-12 (mobile)

### Grid Patterns
- Tarjetas de contenido: 3 columnas (lg:grid-cols-3, md:grid-cols-2)
- Áreas laborales: grid de 6 tarjetas
- Galería: Grid asimétrico masonry

---

## 6. Navegación

### Sitemap
Inicio · La Firma · Áreas Laborales · Abogados · Publicaciones · Contacto · Avisos

### Header
- Fixed header con transición transparente-a-sólido en scroll
- Logo alineado a la izquierda
- Menú alineado a la derecha
- Sin selector de idioma visible en el prototipo (español único; multilenguaje diferido a Fase 3)
- Sin border radius

### Footer
- Layout multi-columna: Dirección | Enlaces | Contacto
- Fondo navy con texto blanco
- Copyright y avisos legales

---

## 7. Hero Section

### Imagen
- Full-viewport (min-h-screen)
- Overlay navy oscuro para legibilidad (bg-[#181848]/40)
- Indicador de scroll sutil

### Contenido
- Headline centrado con animación
- Botón CTA con fondo difuminado (backdrop-blur-md bg-white/10)

---

## 8. Animaciones

### Principio: Movimiento Conservador
- Page load: Fade-in para texto hero (duration-700)
- Scroll: Parallax sutil (translateY 30%)
- Cards: Scale en hover (1.02-1.05, duration-200)
- Navegación: Transición suave de altura

### Prohibido
- Animaciones excesivas trigger por scroll
- Carruseles con autoplay
- Efectos distrayentes

---

## 9. Accesibilidad

- Focus states: 2px navy outline (ring-2 ring-primary)
- Touch target mínimo: 44px × 44px
- Contrast ratio: Mínimo 4.5:1 para todo texto
- Alt text obligatorio para imágenes
- Soporte de navegación por teclado

---

## 10. Dark Mode

En modo oscuro:
- El navy primario se aclara ligeramente a HSL(240, 50%, 58%)
- Los grises se invierten manteniendo la jerarquía
- Mantener contraste adecuado en todos los textos

---

## 11. Datos de Contacto (para uso en meta/schema/footer)

- **Dirección:** Río Tamazunchale 205 Norte, San Pedro Garza García, N.L., México
- **Teléfono:** (81) 8335 2086
- **Email:** info@santossaucedo.com
- **Horario:** Lunes–Viernes, 9:00–19:00
