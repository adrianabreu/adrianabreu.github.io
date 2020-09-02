+++
Description = ""
date = "2020-09-02T10:12:32Z"
title = "Calcular el domingo de la semana"
tags = ["Spark", "Analytics", "SQL"]
+++

A la hora de publicar reportes es común agrupar los datos por semanas. Otro motivo es alinearse con el negocio donde los cierres pueden producirse en días concretos, por ejemplo, un domingo. 

En esos casos si tenemos los datos particionados por días nos interesa saber a que domingo correspondería cada uno de los datos.

Los que venimos de otros entornos tendemos a pensar en esas complicadas librerías de fechas (moment.js, jodatime, etc). Incluso alguien podría pensar en extraer los datos del dataframe y procesarlo en local.

Sin embargo, el coste de rendimiento de hacer un collect() es inviable y lo mejor que podemos hacer es aplicar una solución en spark sql.

Como ejemplo, partadamos de que tenemos un dataframe muy sencillo.

```scala
val table = Seq[(String)](
("2020-09-01"),
("2020-08-27"),
("2020-09-06")
).toDF("datekey")
```
Y que queremos para ese datekey, calcular el domingo correspondiente. 

El output esperado sería:

| datekey | sunday |
| ------- | ------ |
| 2020-09-01 | 2020-09-06 |
| 2020-08-27 | 2020-08-30 |
| 2020-09-06 | 2020-09-06 |

La mejor forma de solucionr esto es utilizar una expresión de sql. 

```scala
import org.apache.spark.sql.functions.expr
```

Ahora crearemos una nueva columna, y vamos a usar dos funciones, primero la función **dayofweek**
que nos dará en número en que día de la semana estamos de 1 a 7. 

Y luego **date_add**, que nos permite añadir días a la fecha actual.

Si estamos en un domingo (1) no tenemos que añadir nada, si no tendremos que añadir lo suficiente para llegar a "8" que sería el domingo siguiente.

Es decir tenemos que añadir 8-dayofweek del día actual. ¿Y cómo solventamos el caso del domingo? Bueno, en el caso del domingo añadiríamos "7" para obtener el domingo siguiente, pero lo que queremos es añadir 0, para mantener el mismo día. Para esto podemos usar el operador de módulo. Aplicando el módulo de 7 ya conseguimos lo que queremos.

```scala
val x = table.withColumn("sunday", expr("date_add(datekey, (8-dayofweek(datekey))%7)"))
```

Y el resultado:

| datekey | sunday |
| ------- | ------ |
| 2020-09-01 | 2020-09-06 |
| 2020-08-27 | 2020-08-30 |
| 2020-09-06 | 2020-09-06 |

De esta manera tan sencilla hemos podido calcular el día que nos interesa utilizar para agregar los datos.