+++
Description = ""
date = "2022-08-15T09:52:32Z"
title = "Optimizing Spark II"
tags = ["Spark", "Databricks", "Data Engineer"]
+++


Continuando con la lista de optimizaciones en spark tneemos el spill.

Hacer spill no es más que persistir un rdd en disco, ya que, sus datos no caben en memoria. 

Existen varias causas, la más sencilla de pensar es hacer un explode un array donde nuestras columnas crecen de forma exponencial.

Cuando el spill ocurre se puede identificar por dos valores que siempre van de la mano:

* Spill (Memory)
* Spill (Disk)

(Estas columnas solo aparecen en la spark ui si hay spill). 

El spill puede ralentizar seriamente la ejecución de tu job y es difícil saber que parte de los datos se está "escupiendo" a disco. Pero podemos usar un **SparkListener** para esto. 