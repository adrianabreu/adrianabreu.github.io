+++
Description = ""
date = "2020-09-29T18:52:32Z"
title = "Tipos de join en spark"
+++

Hace unos días tuve la fortuna (o desgracia) de implementar la lógica más compleja de todo el dominio. 
El resultado, como esperaba, una etl que falaba por recursos constantementes. El problema:

```
Caused by: org.apache.spark.SparkException: Could not execute broadcast in 300 secs. You can increase the timeout for broadcasts via spark.sql.broadcastTimeout or disable broadcast join by setting spark.sql.autoBroadcastJoinThreshold to -1
```

Lo primero fue revisar el plan de ejecución para ver que estaba sucediendo.

Había que identificar en que parte estaba ocurriendo 