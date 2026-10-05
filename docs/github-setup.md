# Configuración y colaboración en GitHub

Repositorio público: [DanielHernandez131/inner-world](https://github.com/DanielHernandez131/inner-world). Rama principal: `main`. Licencia: MIT.

## Obtener el código

```bash
git clone https://github.com/DanielHernandez131/inner-world.git
cd inner-world
npm ci
uv sync --project apps/api --locked
```

Sigue el README para arrancar frontend y backend. Si ya tienes una copia, recupera los cambios con `git pull --ff-only` desde una rama limpia que siga a `origin/main`.

## Trabajar en una contribución

Quien tenga permisos de escritura puede crear una rama en este repositorio. Los colaboradores externos pueden usar un fork y abrir una pull request hacia `main`.

```bash
git switch -c feat/nombre-del-cambio
```

Realiza el cambio, ejecuta sus comprobaciones y abre una PR explicando el problema y el resultado. Las instrucciones completas están en `CONTRIBUTING.md`.

## Automatización incluida

- `CI`: instalaciones con lockfile, generación de contratos, lint, tipos, build y pruebas.
- Dependabot: propuestas semanales para npm, uv y GitHub Actions.
- Plantillas de errores, propuestas y pull requests.

El workflow usa permisos de lectura, no necesita secretos y no despliega un servicio. Su resultado se consulta en la pestaña [Actions](https://github.com/DanielHernandez131/inner-world/actions).

## Configuración del mantenedor

Estas opciones requieren configuración en GitHub; incluir los archivos no las activa automáticamente:

1. Configurar protección o un ruleset de `main`, con PR y el check `checks` requerido tras su primera ejecución.
2. Habilitar el reporte privado de vulnerabilidades si está disponible.
3. Revisar permisos de Actions y las propuestas de Dependabot.
4. Añadir topics como `react`, `typescript`, `fastapi`, `generative-ai` y `gamification`.

El backlog de `docs/roadmap.md` está preparado para convertirse en issues. Las tareas de producto conservan sus IDs entre documentación e implementación.
