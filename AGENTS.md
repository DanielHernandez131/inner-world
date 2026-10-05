# Guía para trabajar en Inner World

- Lee `README.md`, `docs/technical-spec.md` y `docs/roadmap.md` antes de ampliar funcionalidades.
- Mantén la interfaz en español y los identificadores de código en inglés.
- El estado inicial es una base de desarrollo. No describas funciones pendientes como implementadas.
- La fuente de los contratos emocionales es `apps/api/src/inner_world/schemas.py`.
- Tras modificar contratos, ejecuta `npm run contracts:generate` e incluye sus archivos generados.
- Conserva trazabilidad entre experiencias, fragmentos y elementos del mundo.
- No conviertas hipótesis IA en pensamientos literales del usuario.
- No introduzcas cuentas, nube, 3D o generación dinámica de imágenes dentro del P0.
- No incluyas datos personales, relatos reales, claves o archivos `.env` en Git.
- Prueba reglas de dominio y errores materiales. No añadas pruebas que solo repliquen código trivial.
- Ejecuta los checks pertinentes al cambio; `npm run check` reúne la validación de la base.
- La publicación de código en GitHub no implica autorización para desplegar un servicio público.
