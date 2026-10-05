# Desarrollo local

## Herramientas

Usa Node 24 con npm 11+, Python 3.12 y uv. En macOS/Linux, si utilizas nvm puedes ejecutar `nvm use` desde la raíz. En Windows puedes usar un gestor de versiones equivalente o instalar las versiones directamente.

`npm ci` respeta `package-lock.json`; `uv sync --project apps/api --locked` respeta `uv.lock` y detecta si el manifiesto ha cambiado sin actualizarlo. Ambos lockfiles se versionan.

## Comandos desde la raíz

| Comando                      | Función                                          |
| ---------------------------- | ------------------------------------------------ |
| `npm run dev`                | Iniciar Vite en 127.0.0.1:5173.                  |
| `npm run dev:api`            | Iniciar API con recarga en 127.0.0.1:8000.       |
| `npm run check`              | Ejecutar todas las comprobaciones de la base.    |
| `npm run api:check`          | Ruff y pruebas de backend.                       |
| `npm run contracts:generate` | Exportar JSON Schema/OpenAPI y tipos TypeScript. |
| `npm run format`             | Aplicar Prettier.                                |
| `npm run build`              | Compilar frontend en apps/web/dist.              |

## Añadir dependencias

Frontend: `npm install NOMBRE --workspace @inner-world/web`. Backend: `uv add --project apps/api NOMBRE`. No se deben instalar librerías solo por estar previstas en el roadmap.

Incluye el manifiesto y su lockfile en el mismo commit. Después ejecuta los checks pertinentes. Para cambios de backend también se debe comprobar si cambia OpenAPI.

## Configuración

La API busca `apps/api/.env` de forma consistente, aunque se inicie desde la raíz. El archivo es opcional; el ejemplo explica las variables existentes. No hay un archivo `.env` del frontend porque la base no necesita variables cliente.

Los prefijos `VITE_` hacen accesible una variable al código del navegador: no deben usarse para claves de IA. El proveedor todavía no está integrado.

## Problemas comunes

- Puerto 5173 ocupado: detén el proceso anterior; Vite no cambia de puerto silenciosamente.
- `uv` no encontrado: instálalo siguiendo su documentación y abre una terminal nueva.
- Tipos generados desactualizados: ejecuta `npm run contracts:generate`, revisa el diff y vuelve a validar.
- Python distinto de 3.12: selecciona la versión compatible antes de sincronizar.
- Cambiaste pyproject y `--locked` falla: resuelve intencionalmente con `uv lock --project apps/api`, revisa el cambio y sincroniza.
- API CORS: los orígenes locales están permitidos; la base no permite credenciales ni orígenes arbitrarios.

## Separación de contenido

Los ejemplos compartidos pertenecen a `contracts/examples`. Usa siempre relatos ficticios. Cualquier registro personal de prueba debe permanecer fuera de Git, por ejemplo en una carpeta `local-data/` ignorada.

## Producción

La base no configura alojamiento. `npm run build` solo genera el frontend. El proxy del servidor Vite no se incorpora al build: el alojamiento futuro deberá proporcionar la ruta de API, sus límites y variables de servidor.
