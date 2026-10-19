# Inner World

[![CI](https://github.com/DanielHernandez131/inner-world/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielHernandez131/inner-world/actions/workflows/ci.yml)

**Tus experiencias. Un mundo por comprender.**

Inner World es un proyecto open source de exploración emocional gamificada mediante inteligencia artificial. Su propuesta es convertir experiencias cotidianas en perspectivas, personajes emocionales y huellas de un mundo visual que el usuario pueda revisar y conservar.

**Estado: primera fase de exploración y aventura híbrida, previa al MVP completo.** Incluye relatos, preguntas con botones, revisión, guardado local, mapa SVG y una aventura breve con personalización inicial. El adaptador de OpenAI está implementado; necesita clave y modelo de servidor. La calidad con un proveedor real sigue pendiente de evaluación.

## La experiencia que queremos construir

1. Cuenta una experiencia o utiliza una pregunta para comenzar.
2. Explora el contexto con una IA mediante una conversación breve.
3. Revisa las emociones sugeridas y las perspectivas de sus personajes.
4. Decide qué guardar y observa sus huellas en el mapa.
5. Vuelve sobre tus fragmentos en el Espejo y en el historial.

El modelo conceptual utiliza ocho familias inspiradas en Plutchik. Todas pueden contribuir al mundo; no hay emociones que resten puntos o destruyan el escenario. La primera versión será en español y sin cuentas. Dungeon y Alchemist quedan como expansiones futuras. La aventura híbrida inicial es un recorrido breve separado, sin combate ni puntuaciones.

Consulta la [definición completa del MVP](docs/product/definicion-mvp.md) o el [documento de presentación en PDF](docs/presentation/Inner_World_Definicion_MVP.pdf).

## Qué funciona hoy

| Disponible                                                      | Estado                                                                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Exploración, revisión, Espejo e Historial en español            | Ejecutables                                                                                                 |
| Ocho regiones SVG con huellas de experiencias confirmadas       | Proyección local reconstruible                                                                              |
| API de salud, catálogo, exploración y personalización           | Implementada                                                                                                |
| Contrato de análisis emocional, esquema JSON y tipos TypeScript | Generados y validados                                                                                       |
| Pruebas de API y validación de contratos                        | Ejecutables                                                                                                 |
| CI, formateo y configuración de Dependabot                      | Configurados; [ver ejecuciones](https://github.com/DanielHernandez131/inner-world/actions/workflows/ci.yml) |
| Adaptador LLM, preguntas y guardado IndexedDB                   | Implementados; llamada real pendiente de configuración y evaluación                                         |

Los ejemplos y las pruebas usan relatos ficticios. Al comenzar una exploración, y tras aceptar el aviso en pantalla, el relato y las aclaraciones se envían a OpenAI a través del backend. Sin configuración se muestra un error de disponibilidad; no se simula una interpretación.

## Desarrollo local

Requisitos: **Node.js 24**, npm 11 o superior, **Python 3.12** y [uv](https://docs.astral.sh/uv/getting-started/installation/). Los comandos siguientes se ejecutan desde la raíz del repositorio, salvo que se indique lo contrario.

```bash
git clone https://github.com/DanielHernandez131/inner-world.git
cd inner-world
npm ci
uv sync --project apps/api --locked
```

En dos terminales:

```bash
npm run dev
```

```bash
npm run dev:api
```

- Frontend: <http://127.0.0.1:5173>
- API: <http://127.0.0.1:8000/api/v1/health>
- Documentación interactiva: <http://127.0.0.1:8000/docs>

Vite redirige `/api` al backend durante el desarrollo. El mapa y los registros locales pueden consultarse sin IA; analizar una experiencia requiere la API y el proveedor configurado.

Para habilitar la IA, copia `apps/api/.env.example` a `apps/api/.env`. En Windows puedes usar `Copy-Item`; en macOS/Linux, `cp`. Configura `INNER_WORLD_OPENAI_API_KEY` y `INNER_WORLD_OPENAI_MODEL` con un modelo de tu cuenta compatible con Responses y Structured Outputs. Reinicia el backend tras cambiar estas variables. No añadas secretos al frontend ni a Git.

El flujo admite hasta dos preguntas, opciones por botones y respuestas libres. Puedes terminar antes, ajustar intensidades o retirar emociones antes de confirmar. Solo la confirmación modifica el mapa. IndexedDB conserva el borrador, el resultado original y el revisado; el historial permite eliminar una experiencia con sus huellas y fragmentos. Borrar los datos del navegador elimina estos registros.

El backend no persiste ni registra relatos. El adaptador usa `store: false`; esto no equivale a retención cero: OpenAI puede conservar registros de seguridad hasta 30 días según los controles de la cuenta. Consulta [sus controles de datos](https://developers.openai.com/api/docs/guides/your-data). El contexto enviado incluye relato, preguntas previas y respuestas; no se envía el historial de otras experiencias. Las claves permanecen en el servidor. Las pruebas automáticas sustituyen el proveedor y no demuestran calidad emocional, calidad narrativa ni una llamada real.

## Aventura híbrida inicial

Después de confirmar una experiencia, abre **Aventura**, selecciona su origen y acepta el envío del resumen y las emociones. El backend hace **una llamada adicional** a OpenAI para personalizar título, introducción, tres detalles de escena y una pregunta final. No reenvía el relato original, las aclaraciones, los fragmentos ni el historial. El resumen puede contener información personal: revisa su contenido antes de aceptar el envío.

El bosque, el claro, el refugio, el puente y la torre tienen textos, acciones e ilustración SVG preparados. Las ramificaciones y la reflexión final funcionan localmente, con un máximo de cuatro decisiones. Se conserva una aventura por experiencia, con su plantilla versionada y su recorrido. Retomarla o recargar utiliza lo guardado, sin regenerar. La reflexión no modifica el análisis, los fragmentos ni el mapa: las elecciones ficticias no se convierten en hechos sobre la persona.

`POST /api/v1/adventures/personalize` comparte clave, modelo y límite global con la exploración. La salida de personalización se limita por defecto a 1200 tokens con `INNER_WORLD_ADVENTURE_MAX_OUTPUT_TOKENS` (500–2000). No hay reparación automática: un fallo no dispara una segunda llamada. El consumo de entrada/salida que informe el proveedor se muestra en la aventura guardada; no es todavía un contador global ni un límite monetario.

Si falla el guardado después de generar, la interfaz conserva el resultado en memoria y permite reintentar **solo el guardado**. No cierres esa pestaña hasta guardarlo. Si falla la conexión después del envío, un reintento manual puede generar otra llamada facturable: no hay una caché de resultados ni deduplicación entre procesos en el servidor. La persistencia y reutilización son locales a cada navegador. La API no es un servicio público con cuotas por usuario.

La clave recomendada sigue siendo una service account exclusiva del proyecto, por ejemplo `inner-world-dev`, con permiso de creación de Responses (`api.responses.write`). La aventura no necesita permisos de archivos, herramientas, imágenes o administración. Configura los límites de gasto del proyecto en el proveedor por separado. El ejemplo `.env.example` propone 3 operaciones/minuto y 30/día para empezar las pruebas.

Los límites locales por proceso son 12 operaciones/minuto y 200/día, con hasta dos llamadas por operación si hay reparación de formato o evidencias. Son configurables y se reinician con el proceso; no sustituyen cuotas del proveedor ni controles de un servicio público.

## Comprobaciones

```bash
npm run check
```

Ejecuta lint, TypeScript, build, validaciones de backend, pruebas y formateo. Para aplicar formato:

```bash
npm run format
uv run --project apps/api ruff format apps/api
```

Los modelos de `apps/api/src/inner_world/schemas.py` son la fuente del contrato emocional. Si los modificas:

```bash
npm run contracts:generate
npm run check
```

Incluye los cambios generados en el commit. CI vuelve a generarlos y comprueba que coincidan.

## Estructura

| Ruta         | Contenido                                                               |
| ------------ | ----------------------------------------------------------------------- |
| `apps/web/`  | React, TypeScript, Vite y CSS; organizado por funcionalidades.          |
| `apps/api/`  | FastAPI, configuración, rutas, modelos y pruebas.                       |
| `contracts/` | OpenAPI, esquema JSON y ejemplo ficticio del contrato.                  |
| `scripts/`   | Exportación de contratos y generación de tipos.                         |
| `docs/`      | Producto, arquitectura, especificación inicial, backlog y presentación. |
| `.github/`   | CI, Dependabot y plantillas de colaboración.                            |

La API es stateless y no utiliza base de datos. El cliente guarda borradores y experiencias en IndexedDB mediante un repositorio. El mundo se deriva de los registros confirmados; los fragmentos conservan su experiencia y los mensajes de origen. Quedan pendientes validación individual de fragmentos, migraciones y evaluación de la integración con IA real.

## Documentación

- [Arquitectura y decisiones iniciales](docs/architecture.md)
- [Especificación técnica inicial](docs/technical-spec.md)
- [Plan de cinco semanas y backlog](docs/roadmap.md)
- [Desarrollo y resolución de problemas](docs/development.md)
- [Configuración y colaboración en GitHub](docs/github-setup.md)
- [Contribuir](CONTRIBUTING.md)

## Contribuir

Se agradecen contribuciones de código, diseño, accesibilidad, documentación y evaluación con ejemplos ficticios. Revisa [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md) antes de proponer un cambio.

El proyecto explora interpretaciones emocionales; no ofrece diagnóstico ni tratamiento. Los resultados futuros serán propuestas revisables por el usuario. No incluyas relatos personales de terceros, credenciales ni información privada en issues, PR o fixtures.

## Licencia

El código y la documentación originales del proyecto se distribuyen bajo la [licencia MIT](LICENSE). Las dependencias mantienen sus propias licencias. Cualquier recurso externo que se incorpore deberá documentarse en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Creado por **Daniel Hernández Tamayo**.
