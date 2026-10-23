---
name: Instrumentación del HTML de desarrollo
description: Diferenciar los atributos añadidos por el editor del marcado real de la página.
---

Las comparaciones de HTML en desarrollo deben ignorar la instrumentación de ubicación de código que añade el editor, pero conservar atributos funcionales y de accesibilidad.

**Why:** La vista previa añade referencias al archivo y a la línea de origen. Mover código puede cambiar esas referencias aunque el banner renderizado sea idéntico, produciendo falsos fallos de conservación.

**How to apply:** Al comparar HTML de antes y después, normalizar únicamente los atributos de instrumentación de ubicación. No eliminar clases, identificadores, destinos, etiquetas accesibles ni contenido para conseguir que una comprobación pase.
