# Evoluciona · A tu ritmo

Una aplicación para reconocer tus pequeños avances, pensada para usar en el móvil. Primera versión funcional, en español, sin cuentas, dependencias ni servidor propio.

## Publicarla en GitHub desde la web

1. Haz doble clic en `Evoluciona-lista-para-GitHub.zip` en el Finder del Mac para descomprimirlo.
2. Crea un repositorio en GitHub. Nombre sugerido: `evoluciona-diario`. Así no sustituyes una aplicación anterior.
3. En el repositorio, elige **Add file → Upload files** y abre la carpeta que se ha creado al descomprimir y sube **todos los archivos que hay dentro**. No subas el ZIP ni dejes los archivos dentro de otra carpeta. `index.html` debe quedar en la raíz del repositorio. Conserva los nombres y las subcarpetas.
4. Guarda la subida con **Commit changes**.
5. Abre **Settings → Pages → Build and deployment**. En **Source**, selecciona **Deploy from a branch**; elige la rama **main** y la carpeta **/(root)**. Pulsa **Save**.
6. Cuando termine la publicación, abre la dirección que GitHub muestra en Pages. No es necesario ejecutar `npm install` ni configurar claves.
7. En el iPhone, abre esa dirección en Safari y pulsa **Compartir → Añadir a pantalla de inicio**.

Si GitHub no permite activar Pages en el repositorio privado con tu plan, usa un repositorio público para el código. Los registros personales no se incluyen en este proyecto ni se suben desde la app. **No subas tus copias de seguridad a GitHub.**

Referencia de publicación: [documentación oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Tres vistas

### Hoy

- Marca gimnasio, estudio y suplementos con un toque. Puedes archivar los hábitos que no quieras usar y crear los tuyos.
- El botón marca/desmarca «Hecho». El selector distingue «Hecho», «No», «Descanso» y «Sin marcar».
- Registra tu ánimo entre 0 y 100, si quieres. El valor inicial de 50 no se guarda hasta que pulses registrar.
- Guarda un logro del día; también se guarda al salir del campo. Lo puedes corregir o borrar dejando el texto vacío.
- Consulta y completa días pasados con el selector de fecha.
- Recupera un logro al azar con «Recuérdame un avance». Si hay logros destacados, se elige entre ellos.
- Las metas semanales son opcionales y se cambian en Ajustes. El gimnasio empieza con 3 sesiones/semana; puedes elegir «Sin meta».

### Progreso

- Resumen mensual de sesiones de gimnasio, días con registros, logros y ánimo medio.
- Calendario por hábito, incluidos los archivados. Toca un día para editarlo.
- Porcentaje = días «Hecho» / días «Hecho» + «No». Descansos y días sin registrar quedan fuera. Por ejemplo, 2 hechos y 1 no son 67 %, aunque haya más días sin registrar. No es una tasa de cumplimiento de todos los días del mes.
- Gráfica del ánimo; solo se conectan días consecutivos con registro, sin rellenar los vacíos.
- Lista de logros, con opción de destacarlos.
- Gráfica anual de ahorro e inversión, con tabla accesible de importes. Los meses sin cierre quedan sin dato.

### Mi espacio

Cuatro apartados desplegables en una sola vista:

- **Pendientes:** tarea, temática y fecha opcional; completar y eliminar. Filtros: todos, hoy, próximos siete días y sin fecha. «Hoy» y «7 días» también incluyen los pendientes anteriores sin completar.
- **Cosas a mejorar:** propósito y un pequeño paso concreto. Puedes marcar la mejora como trabajada o convertir el paso en un hábito.
- **Finanzas:** gastos manuales, con fecha, importe y concepto. Un gasto «A revisar» aparece en ámbar, sin penalizar otras áreas. Cierre mensual con ahorro e inversión separados. Los gastos no se conectan al banco ni calculan automáticamente tu ahorro.
- **Diario privado:** pensamientos por fecha, protegidos con una contraseña propia. Puedes consultar fechas anteriores y eliminar entradas.

## Tus datos y tu privacidad

Esta versión guarda sus datos en `localStorage`, exclusivamente en el origen web de la aplicación y en el navegador usado. No tiene analítica, anuncios, fuentes externas, servidor de datos ni conexiones con bancos. Al publicarla, GitHub sirve los archivos de la aplicación; los datos que introduces no se envían a GitHub desde el código.

**No existe sincronización entre dispositivos.** Para pasar de uno a otro, exporta una copia en Ajustes e impórtala en el otro dispositivo. La importación **sustituye** el contenido anterior, no lo fusiona. Cada usuario debe utilizar su propio navegador, perfil o dispositivo. No hay perfiles independientes en una misma instalación.

En iOS, Safari y la app añadida a inicio pueden tener almacenamiento separado. Usa siempre la misma instalación para tus registros. Cambiar de dominio, borrar datos de navegación, usar navegación privada o perder el dispositivo puede hacer que dejes de tener acceso a los datos. Descarga copias periódicas.

### Diario cifrado

- Cifrado autenticado **AES-GCM de 256 bits** con un IV aleatorio nuevo para cada guardado.
- Clave derivada con **PBKDF2-SHA-256, 600.000 iteraciones** y una sal aleatoria de 16 bytes.
- La clave y el texto descifrado permanecen en memoria durante la sesión del diario; no se guardan en persistencia.
- Contraseña de al menos 12 caracteres. Es preferible una frase larga y única. **No hay recuperación de contraseña.**
- Bloqueo al salir de la vista Mi espacio, cerrar el apartado, ocultar la app, abrir Ajustes o tras cinco minutos sin actividad. **Los pensamientos requieren pulsar Guardar antes de salir**; un borrador sin guardar se descarta al bloquear.
- No incluye Face ID en esta versión.
- El diario requiere HTTPS, que GitHub Pages proporciona, o localhost en desarrollo.

Los hábitos, el ánimo numérico, las finanzas, los pendientes y los logros **no están cifrados**. La copia de seguridad conserva cifrado el diario, pero el resto es legible. El cifrado protege el diario almacenado; no sustituye la protección del dispositivo, una contraseña fuerte ni la confianza en el código que se sirve. Cualquier script ejecutado desde el mismo origen podría leer datos o el diario mientras está desbloqueado. Evita alojar proyectos no confiables en el mismo origen de GitHub Pages. No se ha realizado una auditoría independiente de seguridad.

### Copias

**Ajustes → Descargar copia de seguridad** genera un JSON con todos los registros y el diario cifrado. Guárdalo fuera del repositorio. **Restaurar una copia** comprueba su estructura y pide confirmar antes de sustituir tus datos. Las copias no contienen la contraseña del diario.

Si el almacenamiento está lleno, la app avisa y revierte el cambio que no pudo guardar. Si los datos existentes no se pueden leer, bloquea las modificaciones y permite exportar el contenido original para recuperarlo.

## Archivos

| Archivo | Función |
| --- | --- |
| `index.html` | Pantallas y formularios |
| `styles.css` | Diseño adaptable a móvil y ordenador |
| `core.js` | Fechas, resúmenes y validación de copias |
| `vault.js` | Funciones de cifrado |
| `app.js` | Interacciones, datos y diario |
| `sw.js` | Caché para uso sin conexión |
| `manifest.webmanifest` | Instalación en pantalla de inicio |
| `icon.svg`, `icon-192.png`, `icon-512.png` | Iconos |
| `.nojekyll` | Sirve los archivos estáticos sin Jekyll |
| `tests/` | Pruebas automáticas sin dependencias |

## Probar en un ordenador (opcional)

Desde la carpeta del proyecto, con Python 3:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000`. Para el diario, usa localhost, no una IP de red local sin HTTPS. No uses doble clic sobre el HTML como prueba principal: las funciones de cifrado y caché requieren un origen web apropiado.

Con Node.js 20 o posterior:

```sh
node --test tests/*.test.cjs
```

Seis comprobaciones cubren fechas, validación de copias, resúmenes, semanas entre meses, restauración de importes y cifrado (contraseña incorrecta, alteración del texto cifrado y unicidad del IV).

## Actualizaciones y uso sin conexión

Tras una primera carga correcta y con el navegador compatible, el service worker guarda los archivos de la app para abrirla sin conexión. Los registros siguen guardándose en el dispositivo. La instalación y conservación de la caché dependen del navegador.

Para actualizar, sustituye los archivos del código en GitHub y cambia el nombre de caché en `sw.js` (por ejemplo, `evoluciona-static-v1.0.1`). Si la pestaña ya estaba abierta, cierra las pestañas de la app y vuelve a abrirla para activar la nueva versión. Actualizar los archivos no debe borrar los registros; conserva siempre una copia antes de cambios importantes.

No cambies `KEY` en `app.js` ni la estructura `version` de los datos sin programar una migración. Conserva las rutas relativas para que funcione dentro de un repositorio de GitHub Pages.

## Alcance de la primera versión

El gimnasio se registra como hecho/no/descanso, sin rutinas ni objetivos de fuerza. El estudio se registra como hábito, sin temporizador. No hay notificaciones programadas, sincronización, integración bancaria ni cuentas. Son ampliaciones posibles, manteniendo el registro diario como centro.

El diseño y los principales flujos se han revisado en Chrome de escritorio. Se han comprobado guardado y persistencia tras recarga, calendario, ánimo, logros, pendientes, creación de hábitos desde mejoras y cierre financiero. El cifrado y las copias se han comprobado mediante pruebas automáticas. La instalación real, el modo sin conexión y la presentación en Safari/iPhone requieren comprobarse en el dispositivo al publicarla.
