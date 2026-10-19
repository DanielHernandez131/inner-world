# Plan de cinco semanas

Las semanas son relativas al inicio efectivo del desarrollo. La base del repositorio no equivale a haber completado una semana del MVP. No hay fechas de entrega comprometidas aún.

| Semana | Objetivo                                                        | Hito                                                       |
| ------ | --------------------------------------------------------------- | ---------------------------------------------------------- |
| 1      | Modelo, navegación, persistencia de borrador y primer mapa SVG. | Una experiencia ficticia puede visualizarse y recuperarse. |
| 2      | Adaptador LLM y flujo de preguntas.                             | Un relato real obtiene una interpretación revisable.       |
| 3      | Revisión, personajes, fragmentos y confirmación.                | Un registro se guarda una sola vez y puede consultarse.    |
| 4      | Evolución del mapa, Espejo e historial.                         | Ciclo completo con eliminación coherente.                  |
| 5      | Pruebas, accesibilidad, errores y demo.                         | P0 verificable y documentación de lo implementado.         |

## Base del repositorio

- [x] Licencia MIT y documentación de colaboración.
- [x] Frontend ejecutable con regiones de vista previa.
- [x] API de salud y catálogo.
- [x] Modelos de análisis, ejemplo y tipos generados.
- [x] Pruebas y configuración de CI.
- [x] Repositorio público con la base inicial.
- [x] Primera ejecución remota de Actions completada correctamente.
- [ ] Configurar protección de `main` y reporte privado de vulnerabilidades.

## Avance de la exploración

Implementados WEB-01 (navegación local, sin rutas URL), API-01, API-02 y AI-02.
Primera versión de DATA-01, WORLD-01, WEB-02, DATA-02, WORLD-02 e HISTORY-01:
IndexedDB, revisión de intensidad y retirada de emociones, confirmación atómica y mapa SVG.
Espejo con origen de fragmentos; falta su validación individual. Falta evaluar AI-01 con un
proveedor real configurado, pruebas de cuota/migración del repositorio y accesibilidad completa.
Los criterios de la tabla siguen siendo la referencia para cerrar cada tarea del MVP.

## Backlog P0

| ID         | Tarea                                   | Criterio de aceptación                                                 |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------- |
| WEB-01     | Rutas y flujo de exploración            | Navegación, ayuda para empezar y estados vacío/carga/error.            |
| DATA-01    | Repositorio IndexedDB y borradores      | Tras recarga, recuperar texto y paso; fallo de guardado visible.       |
| WORLD-01   | Catálogo visual y renderer SVG          | Ocho familias, posiciones permitidas y vista usable en móvil.          |
| API-01     | Interfaz de proveedor y configuración   | Claves de servidor; proveedor ausente no simula IA.                    |
| API-02     | Endpoint de exploración y sus contratos | Unión pregunta/análisis/sin contexto y límites de entrada.             |
| AI-01      | Primera integración real                | Relato → resultado estructurado; timeout, formato y coste observables. |
| AI-02      | Verificación de evidencias              | No aceptar citas inventadas ni mensajes de origen inexistentes.        |
| WEB-02     | Descubrimiento y revisión               | Corregir emoción/intensidad antes de guardar.                          |
| DATA-02    | Confirmación y fragmentos               | Transacción local, ID estable y reintentos sin duplicados.             |
| WORLD-02   | Proyección del mundo                    | Mismo historial → mismo mapa; slots acotados y borrado coherente.      |
| MIRROR-01  | Espejo básico y validación              | Fragmentos con origen y estados aceptado/dudoso/rechazado.             |
| HISTORY-01 | Historial y eliminación                 | Confirmación de borrado y retirada de aportaciones dependientes.       |
| UX-01      | Accesibilidad y recuperación de errores | Teclado, lectura sin color, borrador conservado y movimiento reducido. |
| DEMO-01    | Demo, fixtures y documentación          | Ejemplos ficticios, estado real y ciclo completo reproducible.         |

Cada tarea puede convertirse en issue sin modificar su ID. No se han creado issues remotos en esta base.

## Aventura híbrida inicial (ampliación de esta fase)

- [x] Endpoint de personalización con contexto reducido y una llamada máxima por solicitud.
- [x] Primera plantilla narrativa con ramificaciones locales y recursos SVG reutilizados.
- [x] Persistencia de contenido, recorrido y reflexión por experiencia de origen.
- [x] Consumo de tokens informado por el proveedor y límite de salida configurable.
- [x] Pruebas del grafo, recuperación, eliminación y errores sin reparación automática.
- [ ] Evaluar la calidad narrativa y emocional con OpenAI configurado.
- [ ] Medir consumo real en un conjunto de pruebas ficticias.
- [ ] Presupuesto de tokens/gasto persistente y acceso por invitación antes de un servicio compartido.

Esta ampliación no implementa Dungeon ni Alchemist. El cierre inicial es una reflexión local:
no se generan nuevos análisis emocionales a partir de decisiones ficticias.

## P1

- Patrones IA con al menos tres registros pertinentes y referencias revisables.
- Una pregunta adicional a un personaje.
- Exportación/importación local con versión y validación.
- Animaciones y filtros de resumen.

## Fuera del MVP

Dungeon funcional, Alchemist funcional, RPG completo, cuentas, sincronización, inglés, social, 3D y generación de imágenes en tiempo real.

Si hay retrasos, se recortan P1 y variedad visual antes de sacrificar revisión, persistencia o la integración real con IA. La última semana se reserva principalmente para estabilizar.
