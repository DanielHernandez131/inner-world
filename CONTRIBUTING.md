# Contribuir a Inner World

Puedes contribuir con documentación, interfaz, accesibilidad, pruebas o funcionalidades del backlog. Antes de abordar un cambio grande, abre una propuesta para acordar su alcance. No es necesario pedir aprobación para correcciones pequeñas.

## Preparación

Sigue las instrucciones del README. Usa una rama por cambio, por ejemplo `feat/exploration-flow`, `fix/fragment-validation` o `docs/local-setup`.

Los comentarios de código deben explicar decisiones y reglas que no sean evidentes. Evita comentar línea por línea o añadir abstracciones que el cambio no necesita. La interfaz y la documentación principal están en español; los identificadores de código están en inglés.

## Antes de abrir una pull request

1. Mantén el cambio centrado en un problema o funcionalidad.
2. Actualiza la documentación si cambias comportamiento o comandos.
3. Regenera los contratos si modificas los modelos de Python.
4. Añade pruebas cuando haya reglas de negocio, errores o relaciones de datos que verificar.
5. Ejecuta `npm run check` y describe qué validaste.

Se recomienda un mensaje de commit descriptivo como `feat: add draft recovery`. No se requiere un formato obligatorio ni un acuerdo de cesión de derechos.

## Pull requests

Explica el problema, el comportamiento resultante y cómo lo has comprobado. Incluye una captura si el cambio visual la necesita. El mantenedor revisará las propuestas antes de incorporarlas a `main`.

No publiques datos personales o secretos. Usa relatos ficticios en ejemplos. Una interpretación del modelo no debe convertirse en un hecho sobre la persona sin revisión; conserva el origen y los límites del contenido.

## Licencia de las contribuciones

Al enviar una contribución aceptas que se publique bajo la licencia MIT del proyecto. Conservas tu autoría. Incorpora únicamente contenido que tengas derecho a aportar y registra las licencias de recursos externos.
