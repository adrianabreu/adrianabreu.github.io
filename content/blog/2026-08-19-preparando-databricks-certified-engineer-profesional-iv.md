+++
Description = "Preparando databricks certified engineer professional (IV)"
date = "2026-08-18T15:13:00Z"
title = "Preparando databricks certified engineer professional (IV)"
tags = ["data engineering", "databricks"]
+++

Esto es una pequeña maratón, cada día, un tema :)

Hoy hablaré de dos cosas interesantes, de data modeling y cost & optimization. Cambio un poco el formato porque esto más bien, será un pequeño dump de mis memorias.


## Section 6: Cost & Performance Optimization

### Understand delta optimization techniques, such as deletion vectors and liquid clustering.

Delta fue una gran ventaja sobre parquet, antes eliminar datos de una tabla, había que o reescribir la tabla entera, o al menos la partición de esta. Cuando llegó delta, esto se hacía automáticamente, muchísimo más cómodo, ¿pero te imaginas reescribir un fichero de mil millones de filas solo porque quieres eliminar 4 datos? Pues esto pasaba, al menos hasta que llegaron los [deletion vectors](https://docs.delta.io/delta-deletion-vectors/)

Otro problema que había también era que había que reescribir la tabla frecuentemente para compactar los datos existentes, esto también se pudo solventar primero con el comando `OPTIMIZE` que permitía reescribir tablas y/o particiones para conseguir ficheros de 1GB.

Y más tarde con `AUTO OPTIMIZE`, una feature basada en otras dos Auto Compaction y Optimized writes. Con la primera se intentan combinar los datos ya existentes cuando se pasa por la tabla aprovechando esa operación de escritura para reescribir algunos ficheros. Con optimized writes se intenta hacer una especie de autorepartition para minimizar los ficheros que salen. De hecho en la propia doc lo indican:
```If you use optimized writes, Databricks recommends that you don't run coalesce(n) or repartition(n) just before a write to control the number of files written.```

Esto hace que estemos añadiendo de forma constante ficheros a la tabla, teniendo copias y copias de los datos. Estos datos se pueden limpiar usando `vacuum`. Vacuum elimina los ficheros de datos (excepto si el directorio empieza por _) cuando se pasa el periodo de `delta.deletedFileRetentionDuration`. Que por defecto es 7 días. Obviamente solo se elimina si el fichero no está en la versión actual de una tabla. Por hacer vacuum de una tabla que se creó hace un mes, no te quedas sin datos.

Una mejora muy común es permitir el paralelo: `"spark.databricks.delta.vacuum.parallelDelete.enabled" to "true".`

En features más avanzadas, tenemos el liquid clustering. Normalmente una tabla se balancea en tres aspectos: el particionado (cómo distribuimos los datos para que sean consistentes a medida que crezcan), la colocation (cómo usamos el zorder para redistribuir los datos dentro de los ficheros). Estas técnicas no son triviales, una tabla sobre particionada puede generar miles de ficheros pequeños y una tabla mal particionada puede causar particiones muy grandes y otras muy pequeñas.

El caso de [zorder](https://docs.databricks.com/aws/en/tables/data-skipping#delta-zorder) es aún más complejo, el zorder es una función que reescribe los datos para co-ubicarlos. Es una operación que intenta dejar ficheros balanceados en base a las columns que ponemos. Normalmente se utiliza una partición en combinación con ella:

```
OPTIMIZE events
WHERE date >= current_timestamp() - INTERVAL 1 day
ZORDER BY (eventType)
```

Y una mejora sobre esto, es confiar en quien tiene más información, que es el motor. En este caso NO podemos usar ni particiones ni zorder. Lo que se busca es flexibilidad, se recomienda para tablas que tienen skew, tablas que se filtran por varios tipos de columnas y es liquid clustering. El liquid clustering usa Hilbert space-filling curves que son mejores para hacer skipping de muchas columnas, además al ejecutar el optimize es incremental, los ficheros que ya estén ordenados no tienen que volver a escribirse.

### Understand how / why using Unity Catalog managed tables reduces operations overhead and maintenance burden.

La sutil diferencia entre una tabla managed y no se basa en especificar la cláusula `location` cuando creamos una tabla. Al hacerlo, le decimos a Unity Catalog que nosotros somos responsables de esa tabla. El ejemplo más típico es que decidimos que una tabla ya no es útil y hacemos `DROP TABLE my_catalog.gold.a` ¿qué pasa con esto? Pues que solamente estamos borrando la definición de la tabla en Unity Catalog, no los datos en sí de las tablas. Estos viven en la localización que hemos definido y tenemos que gestionarlos a mano. [En una tabla managed, esto no pasa, se borra todo](https://docs.databricks.com/aws/en/tables/managed#drop-a-managed-table).

Pero es que además tenemos cosas muy buenas como `Predictive Optimization` donde en background se ejecutará automáticamente el analyze, el vacuum y el optimize. E incluso podremos tener un `auto liquid clustering` (cluster by auto) donde la clave de clustering irá cambiando automáticamente en base a los patrones de accesos.


### Understand the optimization techniques used by Databricks to ensure the performance of queries on large datasets (data skipping, file pruning, etc.).

Aquí una lista de mejoras:

Disk Cache: En databricks si tienes que ir al storage a buscar un fichero parquet, ya que estás te quedas una copia. Lo más probable es que tengas que volver a leerlo, así que las siguientes lecturas serán más rápidas. En SQL Warehouses hay un algoritmo de caché. Se activa con `spark.conf.get("spark.databricks.io.cache.enabled")`. Para usarlo lo mejor es buscar un worker con SSD, y la mitad de ese tamaño es el que se podrá destinar a caché.

Data Skipping: Al escribir en delta lake en la entrada se incluyen estadísticas sobre las columnas que contien el fichero (máximos, mínimos, nulls y totales para intentar evitar ficheros irrelevantes.
Si tenemos una tabla externa solo cogeremos las primeras 32 columnas (incluidos campos enlazados!)

Estos campos se pueden modificar usando cualquiera de estas dos propiedades: 
`ALTER TABLE table_name SET TBLPROPERTIES('delta.dataSkippingStatsColumns' = 'col1, col2, col3') y dataSkippingStatsColumns`

Pero al hacerlo hay que reprocesar los ficheros ya escritos, para eso podemos ejecutar: 
`ANALYZE TABLE table_name COMPUTE DELTA STATISTICS`

Por cierto si tenemos un campo de texto, sacar estadísticas de este es muy difícil, se recomienda excluirlo.

DFP: Al margen del data skipping de antes, la idea del dynamic file pruning es extraer más datos del plan para poder filtrar dinámicamente. Un ejemplo es este, mandar un set a dos sitios para crear un filtro y no descartar los datos en el join.
![](https://www.databricks.com/wp-content/uploads/2020/04/blog-dynamic-file-pruning-4.png)

AQE: Esta la crem de la crem, es básicamente rehacer el plan buscando optimizaciones a medida que tenemos más información. Cuando trabajamos con spark generamos un plan lógico que genera diversos modelos de coste que dan lugar al mejor plan físico (o el que se piensa que es mejor). ¿Pero y si a medida que avanzamos en el plan físico vemos problemas? AQE permite hacer mejoras automáticas como encontrar skew data, cambiar joins a broadcast joins, combinar partitions en tareas de un tamaño más razonable. [A leer](https://docs.databricks.com/aws/en/optimizations/aqe)




### Apply Change Data Feed (CDF) to address specific limitations of streaming tables and enhance latency.
Bueno, el CDF es un pasote, de lo mejorcito que he tocado nunca. ¿Qué te da el cdf? Un histórico de cambios sobre delta. Se activa con `ALTER TABLE table_name SET TBLPROPERTIES (delta.enableChangeDataFeed = true)` y básicamente te da unas columnas de cdc: `_change_type` `_commit_version` y `_commit_timestamp`. Pongamos que lees una tabla delta en streaming y actualizas 6 filas con un merge y metes 10 nuevas. Para el read stream del consumidor, lo que ve son ficheros nuevos, no cambios. Esto hace que tengas que reprocesar muchos datos que ya tenías antes. Con esto, a cambio de espacio, eres mucho más eficiente. Al activarlo cuando escribes se crea un directorio _change_data (el vacuum sí que lo toca que está puesto en el código!) que tiene deltas, si solo haces insert no hay deltas porque ya te vale el parquet.

### Use the query profile to analyze the query and identify bottlenecks, such as bad data skipping, inefficient types of joins, and data shuffling.

Aquí no me pienso meter en detalle, esto ya hace unos años bajó dios y escribió [esto](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/). Os lo leéis, punto.


### Section 10: Data Modeling
* Design and implement scalable data models using Delta Lake to manage large datasets.
* Simplify data layout decisions and optimize query performance using Liquid Clustering.
* Identify the benefits of using liquid Clustering over Partitioning and ZOrder.
* Design Dimensional Models for analytical workloads, ensuring efficient querying and
aggregation.

De los puntos dos y tres no hay mucho que hablar, ya están comentados arriba.
Del primero, no sé qué decir

Del cuarto, modelo en estrella :) Hechos por un lado, distribuidos a lo largo del tiempo y clusterizados.

Para los modelos dimensionales, scd tipo 1 si solo queremos la actual, tipo 0 si es una referencia y tipo 2 si es necesario saber histórico. Estas además, se pueden hacer muy fácilmente con Spark Declarative Pipelines:

```sql
APPLY CHANGES INTO silver.customers_scd1
FROM STREAM(live.customers_cdc_clean)
KEYS (customer_id)
SEQUENCE BY update_timestamp
APPLY AS DELETE WHEN _change_type = 'delete'
STORED AS SCD TYPE 1;
```

Si lo ponemos tipo dos, se añade __start_at y __end_at.

Se puede determinar cuando se quieren filas nuevas en tipo dos:

```sql
APPLY CHANGES INTO silver.customers_scd2
FROM STREAM(live.customers_cdc_clean)
KEYS (customer_id)
SEQUENCE BY update_timestamp
STORED AS SCD TYPE 2
COLUMNS * EXCEPT (last_login) -- Ignora cambios en esta columna para el versionado histórico
TRACK HISTORY ON (address, status, membership_tier); -- Solo genera nueva fila si estas cambian
```

Del punto uno, ya lo veremos, por lo pronto hemos comentado muchas técnicas que usamos para gestionar grandes volúmenes de datos.
