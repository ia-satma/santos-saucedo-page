---
name: santos-saucedo-redes
description: Genera posts (1080×1080) y carruseles de 4 diapositivas para redes sociales de Santos & Saucedo (despacho de derecho laboral para empresas), siguiendo su sistema de diseño. Úsalo cuando pidan posts, carruseles, piezas de Instagram/LinkedIn/Facebook o contenido de redes del despacho.
---

# Skill · Redes sociales Santos & Saucedo

## Antes de diseñar
1. Lee `SISTEMA-DE-DISENO.md` (colores, tipografía, retícula y la regla de fotos).
2. Revisa las plantillas en `plantillas/posts/` y `plantillas/carruseles/`. Parte siempre de la más cercana al pedido, no de cero.
3. Usa `componentes.js` (objeto `SS`) para construir piezas nuevas, y `generador.html` como ejemplo ejecutable.

## Reglas obligatorias
- Lienzo de 1080 × 1080, `overflow:hidden`, con márgenes de 90 / 90 / 80 px.
- Solo los colores del sistema y solo las fuentes Lora + DM Sans.
- Cada pieza lleva el logo correcto: azul sobre claro, blanco sobre azul o foto.
- **Fotos: nunca filtros ni capas de color completas.** Solo se permite `SS.degradado()` en la parte inferior.
- Texto mínimo de 24 px. Contraste AA: sobre blanco, usa `#5e8f17` (no `#8cc63f`) para el texto verde.
- Carrusel = portada → contenido (1–2 ideas por diapositiva) → cierre con contacto. Va paginado "02 / 04".
- Alterna modos de fondo dentro de un carrusel (p. ej. light → light → dark).
- Si citas la ley, pon el artículo. Si el dato es dudoso o la cita es inventada, marca la pieza con el sello rojo "PENDIENTE DE APROBACIÓN".
- Nombre: "Santos & Saucedo" en el copy, "Santos Saucedo" en el logo/print.

## Catálogo de tipos
| Necesidad | Plantilla |
|---|---|
| Dato o cifra de autoridad | 1a, 3c (lima), 3d (fecha), 3g |
| Noticia / monitor laboral | 1b, 3h (foto) |
| Cita o voz del socio | 1c, 3a |
| Pregunta frecuente / glosario | 3e, 3i, 4c, 4f |
| Servicio con imagen | 3b, 3f, 3j, 4j |
| Guía / lista / checklist | 2a, 4a, 4e |
| Mito vs. realidad / comparativo | 2b, 4i |
| Paso a paso / caso | 2c, 4d |
| Calendario / cifras de ley | 4b, 4h |
| Equipo | 3j, 4g |

## Flujo
1. Define el objetivo, el tipo (ver catálogo), el modo de color y el copy (titular de 12 palabras como máximo, bajada de 20).
2. Copia la plantilla más cercana o compón con `SS.*`.
3. Sustituye los marcadores `data-foto` por `<img src="…" style="position:absolute;…;object-fit:cover">`.
4. Verifica: nada se sale del lienzo, se respetan los márgenes, hay logo y paginación, y las fotos no llevan filtro.
5. Exporta cada `[data-screen-label]` como PNG de 1080 × 1080.

## Ejemplo rápido
```js
SS.A.base = 'assets/';
SS.postCifra({modo:'dark', seccion:'TRAYECTORIA', cifra:'+72', titulo:'ciudades de México'});
SS.carrusel('5a', [
  {tipo:'portada', modo:'light', seccion:'GUÍA', titulo:'3 claves de la NOM-035'},
  {tipo:'lista', seccion:'GUÍA', items:[{n:'01',t:'Política',d:'…'},{n:'02',t:'Identificación',d:'…'}]},
  {tipo:'lista', seccion:'GUÍA', items:[{n:'03',t:'Medidas',d:'…'}]},
  {tipo:'cierre', modo:'dark', titulo:'¿Su empresa cumple?'}
]);
```
