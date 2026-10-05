[Inner_World_README.md](https://github.com/user-attachments/files/33070243/Inner_World_README.md)
# Inner World

**Convierte tus experiencias en un mundo que puedes explorar y comprender.**

Definición de producto y alcance del MVP · Versión 1.0 · 5 de octubre de 2026  
Promotor del proyecto: Daniel Hernández Tamayo  
Estado: definición previa al desarrollo · Horizonte: 5 semanas · Idioma inicial: español

## 1. Resumen del proyecto

Inner World es una aplicación web de exploración emocional gamificada. El usuario relata una experiencia cotidiana y una IA le ayuda a explorar las emociones que podrían estar presentes. Tras revisar la interpretación, esas emociones se convierten en personajes, elementos de un mundo visual persistente y fragmentos de reflexión.

La experiencia se articula alrededor de cuatro acciones: **contar, comprender, visualizar y descubrir**. El resultado no es solo una conversación: cada exploración deja una huella que puede consultarse en el mapa y en el Espejo.

El MVP busca demostrar un ciclo completo: relato, preguntas de contexto, interpretación revisable, personajes emocionales, transformación del mundo y recuperación del historial al volver a abrir la aplicación. No requiere cuentas ni registro.

**Propuesta de valor:** dar una forma visual, narrativa y revisable a experiencias que a veces cuesta expresar o relacionar entre sí.

**Presentación breve:** “Inner World transforma experiencias cotidianas en un mundo emocional interactivo. Una IA propone preguntas y perspectivas que el usuario puede corregir. Cada exploración incorpora personajes, elementos visuales y fragmentos a un mundo persistente. El proyecto combina conversación, narrativa y seguimiento personal en un MVP web de cinco semanas”.

Este documento describe el producto que se pretende construir. Las funcionalidades, los ejemplos y los objetivos de validación son propuestas de diseño, no resultados de una aplicación ya implementada.

## 2. Problema, público y objetivo

### Necesidad que queremos explorar

Partimos de la hipótesis de que algunas personas encuentran difícil pasar de expresiones generales como “estoy mal” o “tengo muchas cosas en la cabeza” a una descripción más matizada de una experiencia. También puede resultar difícil recuperar lo que descubrieron en una conversación y relacionarlo con registros posteriores.

Inner World propone una entrada sencilla, una exploración breve y una representación que permita volver sobre lo vivido. La utilidad de este enfoque deberá contrastarse con usuarios; no se presupone una mejora psicológica demostrada.

### Público inicial

Personas adultas interesadas en la autorreflexión, el diario personal y las experiencias visuales o narrativas. La validación inicial se centrará en si comprenden el flujo, se reconocen en las interpretaciones y encuentran útil recuperar sus fragmentos.

### Objetivo del MVP

Demostrar que una experiencia escrita puede convertirse en una representación emocional comprensible, corregible y persistente. Se evaluará la claridad del producto y la calidad de la interacción, sin plantear medidas de eficacia clínica.

### Posicionamiento

La IA propone interpretaciones; el usuario decide cuáles le representan. Los personajes y el mapa son metáforas narrativas. La aplicación se concibe como herramienta de exploración personal, sin diagnóstico ni tratamiento y sin sustituir apoyo profesional.

## 3. Recorrido del usuario

| Paso | Acción del usuario | Respuesta de la aplicación |
| --- | --- | --- |
| 1. Entrar | Abre su mundo o inicia uno vacío. | Muestra el mapa y el acceso “Explorar una experiencia”. |
| 2. Contar | Escribe un suceso o elige “No sé por dónde empezar”. | Ofrece una entrada libre o preguntas breves de apoyo. |
| 3. Explorar | Responde a las aclaraciones que considere útiles. | La IA pide contexto cuando falta información relevante. |
| 4. Revisar | Acepta, corrige o descarta emociones e interpretaciones. | Presenta emociones, explicaciones y voces de personajes. |
| 5. Incorporar | Confirma qué desea guardar. | Añade la experiencia y sus elementos al mundo una sola vez. |
| 6. Volver | Consulta el mapa, el historial o el Espejo. | Recupera fragmentos y registros de sesiones anteriores. |

### Reglas de interacción propuestas

- Una pregunta por turno y un máximo inicial de dos preguntas aclaratorias por experiencia, ajustable tras las pruebas.
- El usuario puede omitir una pregunta, volver al relato o abandonar sin modificar el mundo.
- Si falta información, la aplicación puede mostrar una interpretación provisional o reconocer que no tiene contexto suficiente.
- El mapa cambia después de la confirmación, no mientras se escribe ni ante una respuesta incompleta de la IA.
- Las emociones pueden coexistir. No es obligatorio escoger una única emoción ni rellenar todas las categorías.
- Si la conexión falla, se conserva el borrador y se ofrece reintentar sin duplicar la experiencia.

### Entrada guiada

“¿Ha habido algún momento del día que sigas pensando?”, “¿Ha ocurrido algo diferente de lo que esperabas?” o “¿Qué parte de esa situación te gustaría entender mejor?”. Estas preguntas ayudan a empezar y no obligan a revelar detalles personales.

## 4. Modelo emocional e interpretación

### Referencia conceptual

Se utilizará la rueda de Robert Plutchik como referencia para organizar ocho familias: **alegría, confianza, miedo, sorpresa, tristeza, aversión, ira y anticipación**. El modelo contempla relaciones entre emociones e intensidad [1]. La representación artística y las reglas del producto son adaptaciones propias.

Para el MVP, las ocho familias estarán disponibles en los datos y en la interfaz. No se construirán ocho escenarios independientes: compartirán un mapa y una biblioteca visual acotada.

### Qué devuelve la exploración

- Emociones sugeridas con una explicación vinculada al relato.
- Intensidad orientativa que el usuario pueda corregir; se propone una escala de 1 a 10, sin significado clínico.
- Situaciones o detonantes mencionados, sin inventar hechos ausentes.
- Pensamientos expresados por el usuario, distinguidos de las interpretaciones de la IA.
- Una o varias voces emocionales breves y un fragmento de reflexión cuando tenga sentido.

Etiquetas como “alivio”, “frustración” o “nostalgia” pueden conservarse como matices de lenguaje natural. Su asociación con las familias base será contextual, no una equivalencia universal. El catálogo completo de intensidades y díadas queda pendiente de especificación.

### Incertidumbre y corrección

La IA utilizará expresiones como “podría aparecer” o “¿te representa?”. Un valor de confianza generado por un LLM no se tratará como una probabilidad calibrada ni se mostrará como porcentaje de certeza. La necesidad de preguntar dependerá del contexto que falte, no solo de un umbral numérico.

El usuario podrá modificar las emociones y sus intensidades antes de guardar. Los fragmentos tendrán los estados “Me representa”, “No estoy seguro” y “No me representa”. Esta revisión forma parte del núcleo del MVP.

### Personajes emocionales

Los personajes expresan perspectivas narrativas, sin afirmar conocer motivos inconscientes. Por ejemplo: “Miedo: quizá intento anticipar lo que podría salir mal porque esta presentación te importa”. Se usarán retratos o símbolos predefinidos y textos contextualizados por la IA. La conversación adicional con un personaje será una mejora opcional.

## 5. Construcción del mundo visual

### Estrategia híbrida

El mundo se compondrá de activos visuales preparados durante el desarrollo. La IA aportará significado y podrá sugerir elementos dentro de un catálogo permitido. Un constructor del mundo aplicará reglas controladas para decidir posiciones, cantidades y variaciones. Así se conserva la continuidad entre sesiones.

La generación de imágenes puede utilizarse para producir fondos, retratos y objetos durante la creación del proyecto. Esos recursos se revisarán y pasarán a formar parte de la biblioteca de la aplicación. No se generará una imagen completa nueva en cada interacción del MVP.

### Capas del escenario

1. Base compartida: terreno, fondo y zonas del mapa.
2. Elementos regionales: vegetación, agua, arquitectura y caminos.
3. Ambiente: luz, niebla y pequeñas variaciones de intensidad.
4. Huellas personales: objetos vinculados a experiencias y globos de pensamiento.

### Traducción artística inicial

| Familia | Zona simbólica propuesta | Elementos posibles |
| --- | --- | --- |
| Alegría | Jardín luminoso | Flores, luces y claros. |
| Confianza | Refugio compartido | Puentes, hogares y árboles conectados. |
| Miedo | Bosque de vigilancia | Niebla, faroles y torres. |
| Sorpresa | Claro de los hallazgos | Destellos y objetos inesperados. |
| Tristeza | Lago de los recuerdos | Agua, lluvia suave y bancos. |
| Aversión | Jardín de los límites | Setos, filtros y umbrales. |
| Ira | Fortaleza de la energía | Rocas, braseros y murallas. |
| Anticipación | Observatorio de caminos | Senderos, señales y miradores. |

Los nombres, colores y recursos de esta tabla son propuestas artísticas pendientes de diseño. No describen funciones psicológicas universales.

### Reglas de evolución

Todas las emociones pueden aportar elementos al mundo. Ninguna destruye el escenario ni reduce una puntuación de bienestar. No se premia registrar malestar intenso o revelar más información.

Cada experiencia confirmada incorporará un conjunto pequeño y limitado de cambios. El mapa usará ubicaciones predefinidas y límites de densidad para evitar acumulación ilegible. La misma experiencia no podrá aplicarse dos veces.

Se propone conservar los objetos como huellas del historial y reservar la atmósfera para representar registros recientes. La ventana temporal y los límites exactos se cerrarán en la especificación técnica. Borrar una experiencia deberá retirar sus aportaciones o reconstruir el mapa a partir de los registros restantes.

## 6. Fragmentos, Espejo y seguimiento

### Globos de pensamiento

Los fragmentos son unidades de contenido vinculadas a una o varias experiencias. Aparecen como globos seleccionables en el mapa y como tarjetas en el Espejo. Al abrirlos se muestra el texto completo, su tipo, origen y estado de validación.

| Tipo | Significado | Ejemplo ilustrativo |
| --- | --- | --- |
| Pensamiento | Algo que el usuario ha expresado. | “Me preocupa quedarme en blanco”. |
| Descubrimiento | Una interpretación surgida en la exploración. | “Quizá me preocupa más la evaluación que el contenido”. |
| Posibilidad | Una pregunta o alternativa para reflexionar. | “¿Qué cambiaría si aceptara no tener todas las respuestas?”. |
| Patrón | Una hipótesis basada en varias experiencias. | “En varios registros aparece incertidumbre antes de presentar”. |

Los pensamientos literales se identificarán como citas; las paráfrasis y el contenido generado se etiquetarán como tales. La IA no atribuirá al usuario una frase que no haya dicho.

### Espejo básico: incluido

Reúne los fragmentos, permite revisarlos y muestra un resumen descriptivo de las emociones guardadas, junto con el historial. Los recuentos se calculan sobre los registros del usuario, no sobre supuestas mediciones objetivas de su estado emocional. Debe indicar cuántas experiencias sustentan el resumen.

### Patrones longitudinales: ampliación

Si queda capacidad, se añadirá una función que proponga relaciones entre varias experiencias. Como regla inicial de producto, se exigirán al menos tres registros pertinentes y se mostrarán sus referencias. Ese mínimo es una restricción de diseño, no un criterio de validez estadística.

Sin evidencia suficiente, el Espejo indicará que todavía no hay base para proponer un patrón. Las hipótesis rechazadas no se utilizarán como hechos en análisis posteriores. Los registros relacionados podrán consultarse y una eliminación deberá invalidar los patrones afectados.

### Gamificación

La recompensa consiste en descubrir perspectivas, incorporar huellas visuales y explorar lo registrado. El MVP no necesita rankings, rachas obligatorias ni puntuaciones que clasifiquen las emociones como buenas o malas.

## 7. Pantallas y alcance de entrega

### Navegación prevista

| Vista | Contenido principal |
| --- | --- |
| Mi mundo | Mapa, regiones, fragmentos y acceso a nueva exploración. |
| Explorar | Relato libre, ayuda para empezar y preguntas de contexto. |
| Descubrimiento | Emociones revisables, personajes y confirmación del guardado. |
| Espejo | Fragmentos, validación y resumen descriptivo. |
| Historial | Lista de experiencias, detalle y eliminación. |

Las regiones y los personajes podrán abrirse en paneles, sin crear pantallas adicionales. La entrada al producto será breve; una landing extensa no es requisito del MVP.

### P0: necesario para demostrar el producto

- Interfaz en español y acceso sin cuenta.
- Relato libre y ayudas para comenzar.
- Integración real con un LLM, preguntas acotadas y respuesta estructurada validada.
- Ocho familias emocionales, revisión del resultado y personajes con texto breve.
- Mapa 2D con cambios limitados, relacionados con experiencias confirmadas.
- Fragmentos con origen y validación por el usuario.
- Persistencia local, historial y eliminación de experiencias.
- Espejo básico con fragmentos y resumen descriptivo.
- Borradores recuperables, estados de carga, errores y reintento.
- Demo con ejemplos ficticios y aviso claro cuando se usen datos precargados.

### P1: mejoras si el núcleo ya funciona

- Patrones longitudinales generados mediante IA.
- Una pregunta adicional a un personaje emocional.
- Animaciones ambientales, transiciones y variaciones visuales más ricas.
- Filtros del Espejo, exportación e importación de registros.

### P2: evolución posterior

Dungeon y Alchemist aparecerán como ubicaciones marcadas “En desarrollo”, con una descripción breve. No contendrán retos ni alquimia funcionales. El RPG avanzado también queda fuera; su aportación al MVP son los personajes emocionales.

También quedan fuera: cuentas, registro, sincronización entre dispositivos, persistencia en la nube, inglés, funciones sociales, multijugador, generación de imágenes en tiempo real, 3D y entrenamiento de un modelo propio.

**Orden de recorte:** si hay retrasos, se eliminan primero P1, las animaciones y la variedad de activos. Se conserva el ciclo completo de exploración, revisión, mundo y recuperación del historial.

## 8. Enfoque técnico y datos

### Arquitectura orientativa, pendiente de especificación

Se propone React con TypeScript para la interfaz, una API en FastAPI como intermediaria con el proveedor LLM y persistencia en el navegador. Zustand es una opción para el estado compartido. Son candidatos de implementación, no decisiones cerradas sobre versiones o librerías concretas.

La representación visual utilizará un escenario 2D compuesto. La elección entre SVG, capas HTML u otra solución se decidirá con un prototipo pequeño. La persistencia local se abstraerá para permitir una futura migración; habrá que escoger entre IndexedDB y localStorage según la estructura y el volumen final.

### Responsabilidades

| Módulo | Responsabilidad |
| --- | --- |
| Exploración emocional | Pedir contexto y proponer un análisis estructurado. |
| Validación de resultados | Comprobar formatos, categorías, límites y referencias. |
| Constructor del mundo | Traducir datos revisados a cambios de un catálogo permitido. |
| Repositorio local | Guardar experiencias, fragmentos y relaciones entre ellos. |
| Espejo | Calcular resúmenes y, en P1, solicitar hipótesis longitudinales. |

El constructor del mundo no necesita una segunda llamada a un LLM para funcionar. Su versión inicial puede ser determinista. Si se incorpora una selección semántica de objetos por IA, las sugerencias se validarán y existirá una alternativa por reglas.

### Entidades conceptuales

Experiencia: relato, respuestas y fecha. Análisis: emociones e interpretaciones propuestas y revisadas. Personaje: familia emocional, recurso visual y voz. Fragmento: tipo, contenido, origen y validación. Estado del mundo: elementos y experiencias que los justifican. Estas relaciones permitirán editar, eliminar y reconstruir sin perder trazabilidad.

### Tratamiento de la información

El historial se guardará en el navegador, pero el texto necesario para la exploración se enviará al backend y al proveedor de IA. “Persistencia local” no significa “procesamiento totalmente local”. Antes del envío, la interfaz explicará este recorrido de forma breve.

Las claves del proveedor permanecerán en el servidor. Se propone no conservar relatos en el backend ni incluirlos en logs ordinarios. La elección del proveedor deberá revisar sus condiciones de tratamiento y retención. El almacenamiento local no ofrece sincronización ni copia de seguridad automática y puede perderse al borrar los datos del navegador.

### Robustez y experiencia de uso

La salida de la IA será validada antes de afectar al estado. Un texto del usuario o del modelo nunca se ejecutará como código ni elegirá recursos fuera del catálogo. Se limitarán turnos, tamaño de entrada y peticiones para controlar latencia y consumo.

Los controles esenciales serán utilizables con teclado, tendrán etiquetas legibles y no dependerán solo del color. Se respetará la reducción de movimiento. Antes de una prueba con usuarios se definirá el comportamiento ante contenido de crisis para evitar respuestas de juego inadecuadas.

## 9. Plan de cinco semanas

Las semanas son relativas al inicio efectivo del desarrollo. El plan presupone un catálogo visual pequeño, uso de una API LLM existente y ausencia de autenticación. La disponibilidad del equipo y el presupuesto se concretarán antes de comprometer fechas.

| Semana | Trabajo principal | Resultado verificable |
| --- | --- | --- |
| 1 | Cerrar alcance, flujo, modelo de datos y prototipo visual. | Navegación con datos ficticios y mapa capaz de representar un registro de prueba. |
| 2 | Conectar la IA, validar sus respuestas y resolver aclaraciones. | Un relato real produce una interpretación revisable de principio a fin. |
| 3 | Incorporar personajes, fragmentos, guardado e historial. | Una experiencia confirmada se recupera al recargar y puede eliminarse. |
| 4 | Integrar constructor del mundo, trazabilidad y Espejo básico. | Los registros cambian el mapa; sus fragmentos y resúmenes son consultables. |
| 5 | Pruebas, accesibilidad, errores, ajuste visual y presentación. | Demo reproducible, documentación actualizada y P0 comprobado. |

### Hitos de control

Al finalizar la semana 2 debe funcionar la integración real con IA. Al finalizar la semana 4 debe existir el ciclo completo con persistencia. La última semana se reserva principalmente para estabilizar, no para incorporar nuevos sistemas.

### Riesgos y respuesta prevista

- Alcance visual excesivo: reutilizar capas, limitar variantes y posiciones.
- Respuestas inconsistentes: esquema validado, ejemplos de evaluación y reintentos acotados.
- Latencia o consumo elevados: conversaciones cortas y presupuesto por sesión; medir antes de fijar objetivos.
- Interpretaciones poco representativas: permitir corregir, descartar y consultar el origen.
- Pérdida local de datos: explicar los límites del navegador; exportación como mejora P1.
- Desviación de calendario: recortar P1 y recursos decorativos antes del núcleo funcional.

No se fija todavía un coste monetario: dependerá del proveedor, el modelo, el tráfico y el alojamiento elegidos. La primera integración deberá registrar métricas técnicas de consumo sin almacenar el contenido de los relatos.

## 10. Validación y demo de presentación

### Criterios de aceptación del MVP

1. Una persona puede comenzar con texto libre o mediante una pregunta de apoyo.
2. La IA propone emociones y explicaciones vinculadas al relato, o solicita contexto sin bucles indefinidos.
3. El usuario puede corregir el resultado y decidir qué incorpora al mundo.
4. Un guardado genera cambios visibles una sola vez y mantiene la relación con su experiencia.
5. Al recargar se recuperan experiencias, fragmentos y mapa coherentes.
6. El Espejo muestra el origen y la validación de los fragmentos; no presenta patrones inventados.
7. Borrar una experiencia retira o recalcula los elementos dependientes.
8. Una respuesta inválida o un fallo de red no pierde el borrador ni corrompe el mundo.
9. Dungeon y Alchemist se identifican con claridad como funciones futuras.

### Prueba de producto propuesta

Realizar una primera prueba con 3 a 5 personas adultas usando situaciones ficticias o relatos que decidan compartir. Observar si encuentran la acción principal, completan el flujo sin ayuda y pueden explicar por qué cambió el mundo. Recoger qué interpretaciones corregirían y si los fragmentos les resultan comprensibles.

Como evaluación técnica, preparar al menos 10 relatos ficticios variados: emociones mezcladas, texto ambiguo, poco contexto, ausencia de emoción identificable y entradas que intenten alterar las instrucciones del modelo. Registrar fallos de formato, referencias inventadas, latencia y duplicados. Las metas son criterios de proyecto, no resultados obtenidos.

### Guion de demo de 3 a 5 minutos

1. Mostrar un mundo vacío y la acción “Explorar una experiencia”.
2. Introducir: “Mañana presento un proyecto. Lo he preparado, pero me preocupa quedarme en blanco”.
3. Responder, si hace falta, a una pregunta sobre lo que más preocupa.
4. Revisar emociones sugeridas y escuchar la perspectiva breve de un personaje. El resultado exacto puede variar.
5. Confirmar el guardado y mostrar la aparición de un objeto y un fragmento.
6. Abrir el Espejo, validar el fragmento y recargar para demostrar persistencia.
7. Mostrar Dungeon y Alchemist como expansiones futuras.

Si se implementa P1, se podrá añadir un ejemplo de patrón con varios registros ficticios identificados. Una demo con una sola experiencia no debe presentar un patrón longitudinal. Se preparará un modo demostración con datos precargados, claramente etiquetado, para contingencias de conexión.

## 11. Próxima fase: especificación técnica

### Decisiones ya acordadas

Producto web en español, cinco semanas, exploración mediante IA, ocho familias inspiradas en Plutchik, personajes, mapa con activos predefinidos, fragmentos, persistencia local y ausencia de cuentas. Dungeon y Alchemist se muestran como ampliaciones en desarrollo.

### Ajustes de alcance incorporados en esta definición

La corrección de interpretaciones y la validación de fragmentos pasan a P0, porque el usuario debe poder revisar lo que se guarda. El Espejo básico pertenece a P0; la inferencia longitudinal queda en P1. El constructor del mundo se plantea con reglas controladas como base, evitando depender de otra generación IA para completar el ciclo.

### Decisiones que deben cerrarse antes de programar

- Proveedor y modelo LLM, presupuesto de prueba y política de tratamiento de datos.
- Stack definitivo, solución de persistencia y técnica de renderizado del mapa.
- Límites de conversación, catálogo de activos y reglas de evolución temporal.
- Estilo visual, comportamiento móvil y estructura de navegación.
- Equipo, disponibilidad y fecha de inicio.

### Entregables de la especificación

1. Árbol de pantallas y componentes, con estados vacío, carga, error y éxito.
2. Modelo de datos versionado, relaciones y reglas de eliminación.
3. Esquemas de entrada y salida del LLM, prompts y ejemplos válidos e inválidos.
4. Contratos de la API: operaciones, formatos, errores y límites.
5. Gestión de estado, persistencia, migraciones y prevención de duplicados.
6. Catálogo visual y algoritmo de transformación de análisis a mundo.
7. Backlog semanal con tareas y criterios de aceptación.
8. Casos de prueba y guion final de demo.

Los endpoints, las interfaces TypeScript y la estructura de carpetas se definirán en esa fase. Este documento fija la intención funcional y evita convertir ejemplos preliminares en contratos definitivos.

## 12. Referencia y mantenimiento

[1] Plutchik, R. (2001). *The Nature of Emotions*. American Scientist, 89(4), 344-350. DOI: [10.1511/2001.4.344](https://doi.org/10.1511/2001.4.344). [Copia del artículo consultada](https://motricidadehumana.org/wp-content/uploads/2019/11/the_nature_of_emotions_plutchik_2001.pdf).

La referencia fundamenta la elección del marco emocional. Los biomas, los personajes, los fragmentos, el flujo de interacción y las reglas del mundo son decisiones de diseño de Inner World; no se presentan como instrumentos psicológicos validados.

Este README es la base de producto previa al desarrollo. Las instrucciones de instalación, variables de entorno, comandos, pruebas y despliegue se incorporarán cuando exista una implementación verificable. Se mantendrá una distinción explícita entre funciones implementadas, previstas y fuera de alcance.
