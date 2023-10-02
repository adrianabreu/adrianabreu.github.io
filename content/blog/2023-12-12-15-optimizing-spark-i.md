+++
Description = ""
date = "2022-08-15T09:52:32Z"
title = "Optimizing Spark"
tags = ["Spark", "Databricks", "Data Engineer"]
+++

Últimamente me he centrado en mejorar mis habilidades con Spark y he aprovechado para hacer algunos trainings de databricks. (Que por cierto ha sacado Beacons, un programa de reconocimiento para sus colaboradores y ha mencionado algunos nombres muy grandes por ahí).

Y en estos cursos está optimizing spark, que simplifica y explica de una forma bastante sencilla los problemas de rendimientos que ocurren en el mundo de big data. A estos problemas se les denomina las **5s**:

* Skew
* Spill
* Shuffle
* Storage
* Serialization

En este post hablaremos del skew. (Ya se vió como afectaba en un post que hice hace un tiempo repasando una query de hive). Pero básicamente recordamos. Tenemos tareas (unidades de trabajo) que se ejecutan en paralelo en cores para completar stages. Una stage tarda tanto como su tarea más lenta y cada tarea trabaja con una **partición**. 

De aquí es intuitivo sacar que si las tareas trabajan con distintos tamaños (particiones desbalanceadas) tendremos tareas muy rápidas, tareas muy lentas, y por tanto un gran tiempo de duración. (E incluso problemas de OOM).

Para solucionar esto podemos:

1. Balancear los datos para que se repartan equitativamente (añadamos un numero random al identificador repartido entre las particiones que queremos y hagamos un shuffling de los datos para balancear los tamaños de las particiones). Lo pongo el primero porque es la solución más intituitiva, pero no es suficiente ni la más optima.

2. Decirle al databricks engine para algunos cazsos muy concretos (los joins) que nuestro dataframe tiene skew. Con el comando `df.hint("skew", "col1")` el runtime construirá un mejor plan de ejecución que no sufra de data skew. Se puede especificar incluso valores de una columna en los skew join. https://docs.databricks.com/delta/join-performance/skew-join.html

3. Habilitar el adaptative query execution. Normalmente spark genera un plan de ejecución para el código (que vemos a través de la spark ui) y a partir de ahí (tras el sistema de costes de planes físicosy demás) se ejecuta el job. Sin embargo con esta nueva feature, despues de que se completen las tareas que no tienen dependencias o cuyas dependencias han terminado se pueden usar las estadísticas extraídas de estos stages para mejorar los planes de ejecucion (hacer un coalesce de particiones, cambiar estrategías de joins, detectar skew joins, etc).

![https://databricks.com/wp-content/uploads/2020/05/blog-adaptive-query-execution-1.png](Databricks explain for AQE)

Lamentablemente el AQE solo está disponible para Spark 3. Pero ya es momento de ir evolucionando hacia él.