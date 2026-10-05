# Seguridad

La base actual es una versión de desarrollo y no tiene una versión de producción con soporte. No procesa relatos de usuarios ni incorpora un proveedor de IA todavía.

## Comunicar una vulnerabilidad

No publiques credenciales, datos personales ni detalles explotables en un issue abierto. Si el repositorio tiene habilitado “Report a vulnerability”, usa ese canal privado. Su habilitación es una tarea pendiente de configuración en GitHub, no una capacidad garantizada por este archivo.

Si ese canal no está disponible, contacta de forma privada con el mantenedor a través de un canal indicado en su perfil de GitHub. No se promete un plazo de respuesta mientras el proyecto se desarrolla.

## Reglas del proyecto

- Las claves de proveedores permanecen en el servidor y fuera de Git.
- La salida del LLM se valida; no se ejecuta como código o HTML arbitrario.
- Los logs no deben registrar relatos emocionales.
- Las pruebas y demos compartidas usan datos ficticios.
- Antes de exponer endpoints de IA se implementarán límites de tamaño, timeout y tasa de peticiones.

Consulta `docs/technical-spec.md` para el tratamiento previsto de los datos. La persistencia local futura no elimina el envío de contenido necesario al proveedor LLM cuando el usuario solicite una exploración.
