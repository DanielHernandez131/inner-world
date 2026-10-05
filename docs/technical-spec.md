# Especificación técnica inicial

Versión 0.1. Esta especificación traduce la definición del producto a módulos y contratos. Distingue lo implementado en la base de lo que debe construirse durante las cinco semanas.

## Pantallas y componentes

| Ruta futura                | Página         | Componentes previstos                                     | Estados esenciales                              |
| -------------------------- | -------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `/`                        | Mi mundo       | WorldMap, RegionPanel, ThoughtBubble, ExperienceCTA       | Vacío, listo, reconstruyendo, error local.      |
| `/explorar`                | Exploración    | StoryEditor, GuidedStart, ClarificationQuestion           | Borrador, enviando, pregunta, error, resultado. |
| `/descubrimiento/:draftId` | Descubrimiento | EmotionReview, CharacterCard, FragmentReview, ConfirmSave | Provisional, editado, guardando, guardado.      |
| `/espejo`                  | Espejo         | FragmentList, FragmentDetails, EmotionSummary             | Vacío, fragmentos disponibles, sin patrones.    |
| `/historial`               | Historial      | ExperienceList, ExperienceDetail, DeleteExperience        | Vacío, registros, confirmar eliminación, error. |

La base actual usa navegación local entre tres vistas sin router. Las rutas y componentes anteriores se incorporarán con el flujo real; no existen aún como endpoints del frontend.

## Modelo de dominio

### Identificadores y fechas

Se usarán UUID para entidades e ISO 8601 en UTC para fechas persistidas. La interfaz podrá mostrar hora local. Se generará el ID de experiencia al empezar el borrador y se mantendrá en reintentos.

### Entidades del cliente previstas

| Entidad             | Campos mínimos                                                                      | Regla                                                             |
| ------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| ExplorationDraft    | id, schemaVersion, createdAt, updatedAt, story, messages, step, provisionalAnalysis | No modifica el mundo. Recuperable tras recarga.                   |
| ConfirmedExperience | id, schemaVersion, createdAt, confirmedAt, story, messages, analysis, revisions     | Solo se guarda después de revisión. ID único.                     |
| Fragment            | id, type, provenance, text, experienceIds, relatedEmotions, validation, createdAt   | Conserva origen; validación accepted, uncertain, rejected o null. |
| WorldElement        | id, assetId, region, slotId, experienceId, intensity                                | Solo activos y slots permitidos; ID derivado estable.             |
| WorldSnapshot       | schemaVersion, sourceRevision, elements                                             | Caché reconstruible a partir del historial.                       |

El contrato `EmotionalAnalysis` implementado contiene `schema_version`, `summary`, `emotions`, `characters` y `fragments`. Cada emoción incluye intensidad entera 1-10, explicación y evidencias. Los fragmentos del análisis son candidatos; los IDs persistentes y la validación del usuario se añaden al confirmar.

Los patrones son una ampliación P1 y no se incluyen en el contrato de candidatos P0. No hay un campo de diagnóstico ni un porcentaje de confianza.

### Validaciones existentes

- Se prohíben campos desconocidos en los modelos emocionales.
- Se rechazan familias desconocidas e intensidades fuera de rango o convertidas desde cadenas, booleanos o decimales.
- No puede haber emociones ni voces duplicadas.
- Las voces y emociones de fragmentos deben referirse a emociones presentes.
- Un pensamiento no puede declarar procedencia `ai_hypothesis`.
- Se acotan textos, cantidad de evidencias, voces y fragmentos.

El JSON Schema y los tipos TypeScript expresan formas y límites de datos. Las validaciones relacionales de Pydantic no quedan todas representadas en JSON Schema; la API debe validarlas de nuevo. TypeScript no valida datos recibidos en tiempo de ejecución.

### Validaciones todavía pendientes

El servicio de exploración deberá comprobar que los IDs de evidencia existen en la conversación y que cada cita literal aparece en el mensaje referenciado. Los pensamientos `user_quote` deben coincidir con el texto original. Ningún resultado del modelo se guardará solo por tener JSON válido.

Al editar emociones, se recalcularán relaciones de personajes y fragmentos. Se conservará el resultado propuesto y una lista de revisiones; las vistas y el mundo usarán el resultado confirmado.

## API

### Endpoints implementados

| Método y ruta          | Resultado                                       |
| ---------------------- | ----------------------------------------------- |
| `GET /api/v1/health`   | Estado de API, versión y `ai_enabled: false`.   |
| `GET /api/v1/emotions` | Ocho identificadores y sus etiquetas españolas. |
| `GET /openapi.json`    | Contrato OpenAPI de las rutas implementadas.    |

El contrato emocional se exporta aparte en `contracts/emotional-analysis.schema.json`, porque la ruta de exploración todavía no existe. Los endpoints no guardan datos ni llaman a IA.

### Operación de exploración planificada

Se propone **`POST /api/v1/explorations/analyze`** con un relato y el contexto limitado de la exploración. Un único endpoint devuelve una pregunta o un análisis, evitando sesiones de servidor para el MVP. El payload y su modelo concreto se implementarán en la tarea API-02.

Entrada prevista:

```json
{
  "experience_id": "22222222-2222-4222-8222-222222222222",
  "story": {
    "id": "11111111-1111-4111-8111-111111111111",
    "text": "Mañana presento un proyecto y me preocupa quedarme en blanco."
  },
  "answers": [],
  "finish_now": false
}
```

Cada respuesta posterior relacionará la pregunta mostrada y un mensaje de respuesta con su UUID. No se aceptarán mensajes de sistema proporcionados por el cliente. Las preguntas previas se consideran contexto no confiable; el servidor conserva las instrucciones y reglas.

Salida prevista, como unión discriminada:

- `status: clarification`, `question` y `request_id`.
- `status: complete`, `analysis: EmotionalAnalysis` y `request_id`.
- `status: insufficient_context`, explicación breve y `request_id`.

Límites iniciales propuestos: relato de 20-4.000 caracteres, hasta dos respuestas aclaratorias de 2.000 caracteres cada una, una pregunta por turno y timeout de proveedor de 30 segundos. Si `finish_now` es true o ya existen dos respuestas, no se generan nuevas preguntas. Sin contexto suficiente puede finalizar sin emociones.

Los límites de conversación no sustituyen un límite de tasa y presupuesto en el backend. La configuración CORS actual solo admite GET; se ampliará de forma deliberada al incorporar POST.

### Errores previstos

| Código | Situación                                 | Comportamiento de UI                                   |
| ------ | ----------------------------------------- | ------------------------------------------------------ |
| 422    | Entrada inválida o demasiado extensa.     | Mantener borrador y explicar el campo que corregir.    |
| 429    | Límite de peticiones.                     | Mantener borrador y respetar Retry-After.              |
| 502    | Respuesta inválida o fallo del proveedor. | Permitir reintento acotado; no modificar el mundo.     |
| 503    | Proveedor no configurado o no disponible. | Explicar disponibilidad sin inventar una respuesta IA. |
| 504    | Timeout.                                  | Mantener borrador y ofrecer reintentar.                |

Se implementará una envoltura de error con código estable y mensaje apto para el cliente. No se devolverán excepciones internas, claves ni relatos en mensajes de error. En particular, se revisará el manejador de validación para no reflejar texto sensible recibido dentro de respuestas 422.

No se necesita `/world/update`: el constructor local transforma registros confirmados. El Espejo P0 calcula resúmenes locales. La generación IA de patrones tendrá una operación separada en P1.

## Persistencia y estado

Se propone IndexedDB con un adaptador de repositorio y stores para `drafts`, `experiences`, `fragments` y `meta`. Las escrituras de experiencia y fragmentos serán una transacción. El mundo se reconstruirá como proyección del historial.

La confirmación será idempotente mediante el ID del borrador: un reintento no añade otra experiencia. Al eliminar se retirarán sus fragmentos exclusivos, se invalidarán los compartidos que pierdan evidencia suficiente y se reconstruirá el mundo. Los resúmenes se recalcularán.

El repositorio expondrá operaciones `saveDraft`, `getDraft`, `confirmExperience`, `listExperiences`, `deleteExperience` y `setFragmentValidation`. Su implementación deberá gestionar cuota, almacenamiento no disponible y datos de versión futura sin sobrescribirlos.

Zustand se utilizará para el flujo compartido cuando haga falta. La base de datos será la fuente del historial; el store mantendrá vistas y estado de interacción, sin persistir otra copia independiente.

## Construcción del mapa

El catálogo tendrá ocho regiones y un conjunto pequeño de activos por región. Cada combinación región-slot es única. La función `buildWorld(confirmedExperiences, catalog)` devolverá una proyección reproducible sin tocar el almacenamiento ni llamar a IA.

Como propuesta inicial, se mostrarán hasta tres huellas por región. Si hay más experiencias, se agrupan con un contador y un acceso al historial, sin ocultar registros. La selección usará orden estable por `confirmedAt` e ID como desempate. La intensidad afecta a una variante acotada del activo, no a su tamaño sin límite.

La atmósfera puede derivarse de los registros de los últimos siete días; es una ventana de producto, no una medición de bienestar. Las regiones vacías conservarán su base. No se seleccionan URL, posiciones arbitrarias o estilos libres desde respuestas IA.

## Fragmentos y Espejo

Un fragmento muestra su tipo, procedencia y experiencia de origen. Cambiar su validación es una acción local persistida. Un fragmento rechazado puede seguir visible para el usuario como rechazado, pero no se incorpora como hecho a prompts futuros.

El Espejo P0 muestra número de registros, recuento de apariciones por familia y fragmentos. Las intensidades no se suman para construir una supuesta puntuación psicológica. Con un único registro se muestra un resumen de ese registro; no se infiere un patrón.

## IA y tratamiento de datos

Se definirá una interfaz de proveedor que recibe contexto acotado y devuelve datos estructurados. El sistema no entrena un modelo propio. Un adaptador ficticio solo puede usarse en pruebas o demos claramente etiquetadas; no reemplazará silenciosamente a un proveedor caído.

El relato necesario viajará navegador → backend → proveedor. No se conservará en el servidor ni en logs ordinarios. Las claves se cargarán desde variables de servidor. Antes de pruebas con relatos reales se documentarán el proveedor, sus condiciones de retención y la información que recibe.

Las instrucciones del usuario dentro de un relato se tratarán como contenido, no como instrucciones del sistema. Habrá validación de esquema, verificación de citas, una reparación acotada de formato y un error claro si falla. La respuesta nunca se ejecuta como código.

## Pruebas de los siguientes módulos

- Flujo: máximo dos preguntas, omisión y salida sin contexto.
- Servicio IA: citas inventadas, ID desconocido, familia inválida, timeout y respuesta no JSON.
- Repositorio: confirmación duplicada, borrado con dependencias, fallo de cuota y migración.
- Constructor: estabilidad, límite de slots, empate temporal y reconstrucción después de eliminar.
- UI: revisar antes de guardar, reintentar sin perder borrador y navegación con teclado.

Las pruebas actuales de backend cubren el contrato inicial y las rutas disponibles. No demuestran todavía persistencia, calidad emocional ni funcionamiento de un LLM.
