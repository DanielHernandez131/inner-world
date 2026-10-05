# Inner World

[![CI](https://github.com/DanielHernandez131/inner-world/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielHernandez131/inner-world/actions/workflows/ci.yml)

**Tus experiencias. Un mundo por comprender.**

Inner World es un proyecto open source de exploración emocional gamificada mediante inteligencia artificial. Su propuesta es convertir experiencias cotidianas en perspectivas, personajes emocionales y huellas de un mundo visual que el usuario pueda revisar y conservar.

**Estado: base de desarrollo, previa al MVP.** La versión actual incluye un frontend inicial, una API ejecutable y contratos de datos. La exploración con IA, el mundo persistente y el Espejo funcional todavía están pendientes.

## La experiencia que queremos construir

1. Cuenta una experiencia o utiliza una pregunta para comenzar.
2. Explora el contexto con una IA mediante una conversación breve.
3. Revisa las emociones sugeridas y las perspectivas de sus personajes.
4. Decide qué guardar y observa sus huellas en el mapa.
5. Vuelve sobre tus fragmentos en el Espejo y en el historial.

El modelo conceptual utiliza ocho familias inspiradas en Plutchik. Todas pueden contribuir al mundo; no hay emociones que resten puntos o destruyan el escenario. La primera versión será en español y sin cuentas. Dungeon y Alchemist quedan como expansiones futuras.

Consulta la [definición completa del MVP](docs/product/definicion-mvp.md) o el [documento de presentación en PDF](docs/presentation/Inner_World_Definicion_MVP.pdf).

## Qué funciona hoy

| Disponible                                                        | Estado                                                                                                      |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Interfaz inicial en español y vistas vacías de Espejo e Historial | Ejecutable                                                                                                  |
| Ocho regiones visuales y ubicaciones futuras                      | Vista previa estática                                                                                       |
| API de salud y catálogo de emociones                              | Implementada                                                                                                |
| Contrato de análisis emocional, esquema JSON y tipos TypeScript   | Generados y validados                                                                                       |
| Pruebas de API y validación de contratos                          | Ejecutables                                                                                                 |
| CI, formateo y configuración de Dependabot                        | Configurados; [ver ejecuciones](https://github.com/DanielHernandez131/inner-world/actions/workflows/ci.yml) |
| Conversación con LLM, guardado y evolución del mundo              | Pendientes                                                                                                  |

Los textos de personajes del ejemplo son ficticios. La aplicación inicial no envía relatos ni realiza llamadas a un proveedor de IA. No necesita ninguna clave.

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

Vite redirige `/api` al backend durante el desarrollo. El frontend actual es una vista estática y no depende de que la API esté levantada.

La configuración por defecto sirve para el inicio local. Si necesitas personalizar CORS, copia `apps/api/.env.example` a `apps/api/.env`. En Windows puedes usar `Copy-Item`; en macOS/Linux, `cp`. No añadas secretos al frontend ni a Git.

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

La API no utiliza base de datos en esta etapa. La persistencia del MVP será local, detrás de una interfaz de repositorio. El proveedor LLM se elegirá e integrará después, mediante un adaptador del backend.

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
