---
name: Capturas visuales del Monitor
description: Límite de alcance para evitar falsos positivos en capturas de la sección.
---

Las referencias visuales del Monitor cubren la sección, no la navegación sticky.
Ocultar la cabecera solamente durante la captura, conservando su espacio.

**Why:** Al capturar una sección más alta que la pantalla, Chromium puede colocar
la cabecera sobre una tarjeta distinta según el scroll previo. Esto produjo
diferencias falsas aun cuando las tarjetas no habían cambiado.

**How to apply:** Mantener esta exclusión al modificar la prueba; no enmascarar
títulos, imágenes ni espacios del Monitor. La navegación debe verificarse aparte.
