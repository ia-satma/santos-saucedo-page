---
name: Verificación de efectos hover
description: Criterio para distinguir movimientos del banner de cambios independientes del contenido.
---

Para verificar un efecto hover local, usar capturas del área afectada y comprobar que permanezcan estables la cabecera, el título y el inicio del contenido. No exigir identidad de toda la página como prueba de que el efecto no desplaza elementos.

**Why:** Durante las comprobaciones hubo variaciones subpíxel en la altura del contenido cargado de forma asíncrona, sin movimiento de la cabecera ni del inicio del contenido. Atribuirlas al hover produjo falsos fallos.

**How to apply:** En futuras pruebas de interacciones decorativas, separar el efecto local de las actualizaciones independientes del cuerpo. Revisar entrada y salida reales del cursor y comparar capturas acotadas, además de comprobar los límites de la cabecera.
