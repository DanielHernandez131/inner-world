# Especificación técnica inicial

Versión 0.3. La primera exploración está implementada: relato → hasta dos aclaraciones con botones o texto → revisión → confirmación → mapa SVG. El adaptador OpenAI necesita configuración y evaluación real. Esta especificación conserva las propuestas del MVP todavía pendientes.

## Estado de la primera exploración

- Navegación local entre mundo, exploración, Espejo e Historial; aún sin rutas de URL.
- `POST /api/v1/explorations/analyze`, sin sesión de servidor. La entrada es `ExplorationRequest`; la salida contiene `request_id` y `result`, unión por `result.status`: `clarification`, `complete` o `insufficient_context`. Los contratos completos se generan desde Pydantic en `contracts/exploration-*.schema.json` y tipos TypeScript.
- La pregunta lleva UUID, texto y 2-5 opciones únicas. La interfaz ofrece texto libre y salida anticipada. Máximo dos respuestas; `finish_now` prohíbe nuevas preguntas también en el servidor.
- Adaptador OpenAI Responses con JSON Schema estricto, `store: false`, 4000 tokens máximos de salida y timeout de 30 segundos por llamada. Una reparación adicional como máximo si el formato o las evidencias fallan; el cliente espera hasta 70 segundos.
- Verificación de citas y UUID contra los mensajes del usuario, incluidos fragmentos literales. Las preguntas nunca sirven de evidencia. Las hipótesis IA se etiquetan y no pueden tener tipo `thought`.
- Repositorio IndexedDB versión 1 con stores `drafts` y `experiences`. Fragmentos embebidos en la experiencia, no en un store separado; IDs de huellas derivados de experiencia y región, fragmentos localizados por experiencia e índice. La confirmación escribe por ID estable y elimina el borrador en una transacción. El resultado original y la revisión se conservan. No se genera otra copia persistida del mapa.
- Mapa SVG con ocho regiones, tres huellas visibles por región y contador adicional; todas las experiencias siguen accesibles. Orden por confirmación descendente y UUID ascendente. La intensidad solo afecta la opacidad acotada de una huella.
- Historial con relato, aclaraciones y eliminación; Espejo básico con fragmentos y origen. Falta validación individual de fragmentos, migraciones completas, exportación y edición para añadir familias emocionales nuevas.
- Errores 422 sanitizados (sin reflejar entrada), 429 con Retry-After, 502, 503 y 504. Presupuesto global en memoria por proceso (12 operaciones/minuto, 200/día); una operación puede consumir dos llamadas. No hay servicio público ni controles distribuidos.
- Las pruebas cubren contrato, límite de preguntas, citas falsas, fuentes inexistentes, formato, timeout, presupuesto y proyección del mundo. No validan calidad emocional ni una llamada real. El aviso antes del envío enlaza las condiciones del proveedor.

## Primera aventura híbrida

Ampliación autorizada para esta fase: una aventura breve basada en una experiencia confirmada.
No incluye Dungeon, combate, cuentas, nube de almacenamiento, 3D ni imágenes dinámicas.

- `POST /api/v1/adventures/personalize` recibe `experience_id`, `template_id: crossing-v1`, resumen de hasta 500 caracteres y 1–8 familias únicas. No admite campos con el relato ni respuestas. La API valida el contrato, pero no puede comprobar una confirmación guardada únicamente en el navegador; el cliente ofrece experiencias confirmadas.
- El proveedor recibe plantilla, resumen y familias; se omite el UUID de experiencia. Devuelve solo título, introducción, detalles del claro/refugio/llegada y pregunta de reflexión. No decide rutas, efectos sobre el mapa ni opciones de botones. Se validan forma y longitudes; la adecuación narrativa todavía requiere evaluación con un modelo real.
- La salida incluye `request_id`, `experience_id`, `template_id`, `personalization` y `usage` con tokens de entrada/salida o null si no se informan. Los contratos se generan desde `schemas.py` en `contracts/adventure-*.schema.json` y tipos TypeScript.
- Un máximo de una llamada por solicitud de personalización, timeout de 30 segundos, sin reparación automática. Límite de salida configurable, por defecto 1200 tokens. Comparte el presupuesto de operaciones de la exploración; no constituye un presupuesto monetario persistente.
- Grafo local sin ciclos: umbral → claro o refugio → puente → llegada. Puede pasarse del claro al refugio; todos los caminos llegan con un máximo de cuatro elecciones. Los detalles IA no asumen una ruta concreta. Se reutilizan textos e ilustración SVG preparados.
- Una sesión por experiencia, embebida en el registro IndexedDB existente: `schemaVersion`, `experienceId`, `createdAt`, respuesta original, elecciones y reflexión. No cambia la versión del esquema de stores porque es un campo opcional. Guardar comprueba que la experiencia todavía exista y evita sobrescribir sesiones de versión futura. Borrar el origen elimina la sesión al estar embebida.
- Solo se avanza al completar la escritura local. Si falla guardar la personalización ya pagada, se conserva en memoria, se deshabilita el cambio de origen y se ofrece reintentar el guardado sin IA. Recargar tras una escritura correcta restaura recorrido y contenido sin llamadas al proveedor.
- No hay deduplicación del servidor entre peticiones ni entre navegadores. Un fallo de red después del envío puede haber generado consumo; la interfaz avisa antes de que se reintente manualmente. Una aventura guardada no tiene botón de regeneración.
- Las elecciones ficticias y la reflexión (`connects`, `fiction_only`, `uncertain`) permanecen separadas del análisis emocional; no alimentan prompts posteriores ni alteran el mundo. No se deriva una reacción real de una elección narrativa.
- Pruebas con proveedor sustituido para límites, privacidad del payload, errores, uso de tokens y ausencia de reparación; grafo completo, versiones y transacciones con fake-indexeddb como dependencia exclusiva de desarrollo.

## Pantallas y componentes

| Ruta futura                | Página         | Componentes previstos                                     | Estados esenciales                              |
| -------------------------- | -------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `/`                        | Mi mundo       | WorldMap, RegionPanel, ThoughtBubble, ExperienceCTA       | Vacío, listo, reconstruyendo, error local.      |
| `/explorar`                | Exploración    | StoryEditor, GuidedStart, ClarificationQuestion           | Borrador, enviando, pregunta, error, resultado. |
| `/descubrimiento/:draftId` | Descubrimiento | EmotionReview, CharacterCard, FragmentReview, ConfirmSave | Provisional, editado, guardando, guardado.      |
| `/espejo`                  | Espejo         | FragmentList, FragmentDetails, EmotionSummary             | Vacío, fragmentos disponibles, sin patrones.    |
| `/historial`               | Historial      | ExperienceList, ExperienceDetail, DeleteExperience        | Vacío, registros, confirmar eliminación, error. |

La base actual usa navegación local entre cinco vistas sin router. Las rutas y componentes anteriores se incorporarán con el flujo real; siguen sin existir como rutas de URL; las vistas equivalentes usan navegación local.

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

El JSON Schema expresa formas y límites; los tipos TypeScript generados describen la estructura sin imponer longitudes de listas. Las validaciones relacionales de Pydantic no quedan todas representadas en JSON Schema; la API debe validarlas de nuevo. TypeScript no valida datos recibidos en tiempo de ejecución.

### Verificación de evidencias implementada

El servicio comprueba que los IDs de evidencia existen en la conversación y que cada cita literal aparece en el mensaje referenciado. Los fragmentos `user_quote` deben coincidir con el texto original. Ningún resultado se devuelve solo por tener JSON válido.

Al editar emociones, se recalcularán relaciones de personajes y fragmentos. Se conservará el resultado propuesto y una lista de revisiones; las vistas y el mundo usarán el resultado confirmado.

## API

### Endpoints implementados

| Método y ruta          | Resultado                                        |
| ---------------------- | ------------------------------------------------ |
| `GET /api/v1/health`   | Estado, versión y presencia de configuración IA. |
| `GET /api/v1/emotions` | Ocho identificadores y sus etiquetas españolas.  |
| `GET /openapi.json`    | Contrato OpenAPI de las rutas implementadas.     |

El contrato emocional se exporta en `contracts/emotional-analysis.schema.json`. La ruta de exploración está implementada y llama al adaptador; salud y catálogo no llaman al proveedor.

### Operación de exploración

Se implementa **`POST /api/v1/explorations/analyze`** con un relato y el contexto limitado de la exploración. Un único endpoint devuelve una pregunta o un análisis, evitando sesiones de servidor para el MVP. Los modelos concretos están en `schemas.py`.

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

Salida dentro de `result`, como unión por `status`, con `request_id` fuera de la unión:

- `status: clarification`, `question` y `request_id`.
- `status: complete`, `analysis: EmotionalAnalysis` y `request_id`.
- `status: insufficient_context`, explicación breve y `request_id`.

Límites implementados: relato de 20-4.000 caracteres, hasta dos respuestas aclaratorias de 2.000 caracteres cada una, una pregunta por turno y timeout de proveedor de 30 segundos. Si `finish_now` es true o ya existen dos respuestas, no se generan nuevas preguntas. Sin contexto suficiente puede finalizar sin emociones.

Los límites de conversación no sustituyen un límite de tasa y presupuesto en el backend. CORS permite GET y POST solo desde los orígenes configurados.

### Errores implementados

| Código | Situación                                 | Comportamiento de UI                                   |
| ------ | ----------------------------------------- | ------------------------------------------------------ |
| 422    | Entrada inválida o demasiado extensa.     | Mantener borrador y explicar el campo que corregir.    |
| 429    | Límite de peticiones.                     | Mantener borrador y respetar Retry-After.              |
| 502    | Respuesta inválida o fallo del proveedor. | Permitir reintento acotado; no modificar el mundo.     |
| 503    | Proveedor no configurado o no disponible. | Explicar disponibilidad sin inventar una respuesta IA. |
| 504    | Timeout.                                  | Mantener borrador y ofrecer reintentar.                |

Se implementa una envoltura de error con código estable y mensaje apto para el cliente. No se devolverán excepciones internas, claves ni relatos en mensajes de error. En particular, se sanitiza el manejador de validación para no reflejar texto sensible recibido dentro de respuestas 422.

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

La interfaz de proveedor recibe contexto acotado y devuelve datos estructurados mediante el adaptador OpenAI. El sistema no entrena un modelo propio. Un adaptador ficticio solo puede usarse en pruebas o demos claramente etiquetadas; no reemplazará silenciosamente a un proveedor caído.

El relato necesario viajará navegador → backend → proveedor. No se conservará en el servidor ni en logs ordinarios. Las claves se cargarán desde variables de servidor. El README y la interfaz documentan el envío a OpenAI y enlazan sus condiciones de retención.

Las instrucciones del usuario dentro de un relato se tratarán como contenido, no como instrucciones del sistema. Habrá validación de esquema, verificación de citas, una reparación acotada de formato y un error claro si falla. La respuesta nunca se ejecuta como código.

## Pruebas de los siguientes módulos

- Flujo: máximo dos preguntas, omisión y salida sin contexto.
- Servicio IA: citas inventadas, ID desconocido, familia inválida, timeout y respuesta no JSON.
- Repositorio: confirmación duplicada, borrado con dependencias, fallo de cuota y migración.
- Constructor: estabilidad, límite de slots, empate temporal y reconstrucción después de eliminar.
- UI: revisar antes de guardar, reintentar sin perder borrador y navegación con teclado.

Las pruebas actuales de backend cubren contratos, rutas, evidencias, límites y fallos del adaptador con un proveedor sustituido. No demuestran calidad emocional ni funcionamiento de un LLM real.
