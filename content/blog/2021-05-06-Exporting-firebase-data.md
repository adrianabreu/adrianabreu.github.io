+++
Description = ""
date = "2021-05-06T11:49:36Z"
title = "Exportando los datos de firebase"
tags = ["Spark", "Analytics", "Firebase"]
+++

Si trabajamos analizando los datos de una aplicación móvil es muy probable que esté integrado algún sistema para trackear los eventos de la app. Y entre ellos, uno de los más conocidos es Firebase.

Estos eventos contienen mucha información útil y nos permiten por ejemplo saber, un usuario que se ha ido cuanto tiempo ha usado la aplicación o cuantos dias han pasado.

O si realmente ha seguido el flujo de acciones que esperabamos (con un diagrama de sankey podríamos ver donde se han ido los usuarios).

Pero para ello necesitamos poder consultar estos datos. Simplemente hay que habilitar la exportación de datos de firebase y con ello ya empezaremos a tener los datos disponibles en Big Query.

¿Pero y como los movemos? 

Hay varias opciones para traer los datos a, una idea sería tener una query schedulada en big query que guarde el resultado en un google storage y que luego este lo movamos a nuestro datalake.

Aunque yo estoy probando una un poco más sencilla, el connector de [big query para spark](https://cloud.google.com/dataproc/docs/tutorials/bigquery-connector-spark-example).

Con esto ya podemos leer los datos. ¿Pero cuando están los datos? 

La verdad es que esta aproximación parecía un poco de ciencia infusa. Big Query agrupa los eventos en tablas del estilo <dataset_id>.<project_id>.events_20210505

Y estas tablas se crean aproximadamente a las 06 UTC.

¿Pero son fijas estas tablas? Por prueba y error se puede ver que no. Pero ahora gracias a las sentencias de dml se puede saber exactamente.

Con esta query:

```
 select * from `<dataset_id>.<project_id>`.INFORMATION_SCHEMA.PARTITIONS
```

Podemos ver la información de cuando se ha modificado cada unas de las tablas.

| table_name | last_modified_time |
| ---------  | ------------------ |
| events_20210503 | 2021-05-06 04:52:03.173 UTC	|
| events_20210504 | 2021-05-06 04:52:05.184 UTC	|
| events_20210505 | 2021-05-06 04:53:20.333 UTC	|

Y con esto podemos confirmar que firebase puede actualizar las tablas con hasta 3 días de diferencia. Y lo hace aproximadamente a las 05 UTC. (Y ya no es ciencia infusa).

