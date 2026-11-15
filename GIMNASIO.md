# Gimnasio · ejercicios y doble progresión

## Empieza con un ejercicio

En **Hoy**, abre **Gimnasio** y pulsa **+ Ejercicio**. Ejemplo:

| Campo | Ejemplo |
| --- | --- |
| Nombre | Curl de bíceps |
| Cómo anotas el peso | Kg por mancuerna |
| Peso inicial | 16 kg |
| Series de trabajo previstas | 4 |
| Mínimo de repeticiones | 8 |
| Máximo de repeticiones | 12 |
| Incremento disponible | 1 kg, o 2 kg si ese es el salto real de tus mancuernas |
| Confirmación | Dos sesiones consecutivas, o una si eliges ese criterio |

En una barra, anota el peso total incluida la barra. En mancuernas, elige «por mancuerna» y no sumes las dos. Usa un ejercicio distinto para máquinas, variantes o modos de peso diferentes: no son equivalentes. El tipo de peso queda bloqueado después del primer registro para evitar mezclar datos.

## Registra lo que realmente haces

1. Selecciona la fecha del entrenamiento en Hoy.
2. Abre el ejercicio. Verás el último entrenamiento anterior a esa fecha, incluidos todos los pesos y repeticiones.
3. Introduce las repeticiones realizadas en cada serie y ajusta el peso si cambió. Puedes añadir o quitar series.
4. Indica cómo fue la técnica y si hubo molestias. Es opcional guardar estos datos, pero sin ellos no se propone subir.
5. Indica el RIR de la última serie: las repeticiones adicionales que crees que podrías haber hecho con buena técnica. RIR 2 = dos repeticiones más aproximadamente. Es una estimación personal, no una medición exacta.
6. Pulsa **Guardar entrenamiento**. Si ya existe un registro de ese ejercicio ese día, se actualiza. La app admite un registro por ejercicio y fecha.

El peso puede aparecer precargado como referencia o propuesta, pero las repeticiones del nuevo día empiezan vacías. Pulsar «Usar últimos pesos» o «Usar propuesta» prepara los campos; **no registra una sesión completada**. Registra series de trabajo, excluyendo calentamientos. Si quieres registrar dos bloques del mismo ejercicio en un día, anótalos como series del mismo registro.

Los borradores se conservan en memoria al cambiar de fecha o vista durante la misma sesión, pero no se guardan al cerrar o recargar. Guarda antes de salir. Los datos guardados sí se conservan en el navegador y en las copias exportadas.

## La regla que utiliza la app

La doble progresión organiza dos variables: primero repeticiones dentro del rango y después carga. No es el único sistema válido para hipertrofia ni está demostrado que este algoritmo concreto sea superior a otros.

La app propone probar una subida si:

- Todas las series de trabajo previstas han alcanzado al menos el máximo de repeticiones.
- Todas esas series llevan la misma carga y el mismo criterio de anotación.
- Se ha registrado buena técnica y ausencia de dolor.
- El RIR de la última serie es al menos 2.
- Se confirma en las sesiones consecutivas del ejercicio que hayas configurado: dos por defecto, o una.

La confirmación y el umbral de RIR son elecciones conservadoras de diseño, no requisitos universales ni reglas que las guías hayan validado para esta aplicación. Si hay una sesión intermedia que no cumple o cambias de carga, se reinicia la confirmación. Si cambias series o rango, la app necesita registros con la nueva pauta; no altera los antiguos.

No propone subir con dolor, técnica a revisar, información insuficiente, series parciales o extra, cargas distintas entre series o una sesión que quedó por debajo del rango. Puedes guardar esos entrenamientos igualmente: siguen siendo parte del historial, no «fracasos».

## Qué ocurre con 16 → 18 → 20 kg

Con 4 × 12 a 16 kg y las condiciones anteriores cumplidas:

- Si configuras un salto de **1 kg**, tras confirmar se puede precargar **17 kg (+6,25 %)** para la próxima sesión.
- Si solo tienes saltos de **2 kg**, la app muestra **18 kg (+12,5 %)** como prueba opcional y aconseja buscar una microcarga menor cuando sea posible. Conserva 16 kg en los campos hasta que tú elijas probar 18.
- **18 → 20 kg es +11,1 %**, por lo que también aparece como un salto grande.
- Por encima del **20 %** no se prepara un peso superior; se pide un incremento menor o un ajuste manual. Ese límite también es una decisión de diseño.

Después de subir, intenta trabajar hacia la parte baja del rango con técnica y esfuerzo adecuados. **No hay una fórmula que garantice que pasar de 16 a 18 kg te deje exactamente en 8 repeticiones o permita completar 4 × 8.** Las series pueden ser, por ejemplo, 10, 9, 9 y 8. Regístralas tal como salgan. Si la carga no encaja con el rango o altera el movimiento, ajústala.

La regla automática está pensada para cargas externas. En máquinas asistidas, bajar el peso de asistencia puede aumentar la dificultad: este algoritmo no interpreta ese caso. Crea una referencia manual aparte sin utilizar la sugerencia automática de subir kg.

## Ver tu evolución

En **Progreso → Tu progreso en el gimnasio**, elige un ejercicio. Se muestran hasta las últimas 20 sesiones anteriores o iguales al mes seleccionado. Cambia a un mes anterior para consultar registros más antiguos. Verás:

- La carga de la primera serie, para tener una referencia definida.
- Los pesos y repeticiones de todas las series.
- El número de series, repeticiones totales, RIR y valoración de técnica/molestias.
- Un enlace en cada fecha para corregir ese día.

Más kilos en una gráfica no equivalen directamente a más músculo. La interpretación depende del ejercicio, técnica, repeticiones, esfuerzo y contexto. No compares kilos entre máquinas o ejercicios diferentes.

## Base científica y límites

La [posición del ACSM de 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/) respalda el entrenamiento progresivo, el esfuerzo suficiente y la adaptación individual. Entrenar al fallo en todas las series no es necesario; los autores plantean unas 2–3 repeticiones en reserva como orientación práctica, reconociendo la incertidumbre sobre un objetivo exacto. El rango 8–12 es una elección cómoda de la app, no una zona exclusiva para ganar músculo.

La [posición histórica del ACSM de 2009](https://pubmed.ncbi.nlm.nih.gov/19204579/) describía incrementos de carga del 2–10 % al superar las repeticiones previstas. La app usa el 10 % como señal orientativa de un salto grande, no como una frontera biológica universal. La regla de todas las series al techo, las confirmaciones y el bloqueo por RIR son una implementación propia; esas publicaciones no han validado ni evaluado este software.

No se garantiza crecimiento muscular con un porcentaje o una cifra de repeticiones. Esta función ayuda a registrar y elegir un siguiente paso; no programa todo el entrenamiento ni individualiza una pauta clínica.

## Datos y actualización

Los ejercicios y sesiones son datos locales no cifrados, como el resto de hábitos. Se incluyen en Ajustes → Descargar copia de seguridad. El diario privado mantiene su cifrado independiente. Esta actualización acepta las copias anteriores de Evoluciona sin borrar registros existentes.
