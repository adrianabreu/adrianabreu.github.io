+++
Description = ""
date = "2020-08-25T17:22:32Z"
title = "Detectando ficheros pequenos Spark"
tags = ["Spark", "Analytics", "Datalake"]
+++

Uno de los mayores problemas de rendimiento que podemos encontrar en los datalake es tener que mover una enorme cantidad de ficheros pequeños, por el overhead que eso representa en las transacciones. 
Este post de databricks recomendada https://forums.databricks.com/questions/101/what-is-an-optimal-size-for-file-partitions-using.html que se crearan ficheros de 1GB parquet.

Sin embargo mucha gente no sabe como detectar esto. Hace poco estuve jugando con un notebook y usando simplemente las herramientas del dbutils pude clasificar los ficheros que tenia en las entidades del datalake en múltiples categorías, así podría estimar cuantos ficheros había en un rango de tiempo.

Lo que hice fue clasificar los ficheros en tres categorías:

- Pequeños: Serían aquellos ficheros inferiores a 10MB.
- Mediamos: Aquellos entre 10MB y 30MB.
- Grandes: Superiores a 30MB.

Nota: Este ajuste se hizo en base al tipo de dato que se trataba.

El código es el siguiente:

```scala
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class FilesCategory(val smallSize: Int, val mediumSize: Int, val bigSize: Int) {
  override def  toString() = {
    s"Small: ${smallSize} Medium: ${mediumSize} Big: ${bigSize}, percentage of files smaller than 30mb is ${(smallSize + mediumSize) * 100 / (smallSize + mediumSize + bigSize)} %"
  }
}
object EntityFilesInfo {
    val smallSize: Int = 10000000
    val mediumSize: Int = 30000000
  
    def readFiles(from: String, to: String, entity:String): FilesCategory = {
      val parsedFrom = LocalDate.parse(from, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
      val parsedTo =  LocalDate.parse(to, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
      val dates = for (i <- 0 to (parsedTo.toEpochDay - parsedFrom.toEpochDay).toInt) yield parsedFrom.plusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
      val files = dates.map(d => generatePath(entity, d)).filter(p => checkIfPathExists(p)).map(p => dbutils.fs.ls(p)).reduce(_ ++ _) 
      val validFiles = files.filter(f => f.name.startsWith("part"))
      val smallFiles = validFiles.filter(f => f.size <= smallSize).length
      val mediumFiles = validFiles.filter(f => f.size > smallSize && f.size <= mediumSize).length
      val bigFiles = validFiles.filter(f => f.size > mediumSize).length
      new FilesCategory(smallFiles, mediumFiles, bigFiles)
    }
  
  def generatePath(entity: String, d: String): String = s"adl://datalake.azuredatalakestore.net/${entity}/datekey=${d}"
  
  def checkIfPathExists(p: String): Boolean = {
     try {
      dbutils.fs.ls(p)
      true       
     }
     catch {
      case _: Throwable => false  
     }  
  }
}
```

**¡No os olvidéis de poner el path de datalake que corresponda así como la estructura que mejor se ajuste a vuestras entidades!**

Como veis es muy sencillo, nuestra entidad está particionada por días y lo único que hacemos es recorrer cada uno de los path que generamos a partir de un rango temporal. Así, contamos cuantos ficheros hay de cada tipo. Además se hace una pequeña validación para que no haya problemas de encontrar algún path inválido.

Un ejemplo de uso, sería este:

```scala
val entity = "sales"
EntityFilesInfo.readFiles("2020-07-01", "2020-08-20", entity)
```

Y este sería su output:
```md
res12: FilesCategory = Small: 52 Medium: 34 Big: 105, percentage of files smaller than 30mb is 45 %
```

Y ahora que hemos detectado el problema, simplemente tenemos que "compactar" estos ficheros. Para ello nos basta simplemente con leer las carpetas y repartir los datos de forma balanceada. Para esto podemos usar na función de ventana que se encargue de hacer shuffling.

```scala

val partitionField = col("datekey")
val maxRecordsPerFile = 950000
val windowSpec = Window
      .partitionBy(partitionField)
      .orderBy(partitionField)

val df = spark.sql("select * from sales where datekey = d")
df
.withColumn("partition_number",
    (row_number().over(windowSpec) / maxRecordsPerFile).cast("int"))
.repartition((partitionField ++ Seq(col("partition_number"))):_*)
.drop("partition_number")
.write
.partitionBy(partitionField)
.mode(Append)
.format("orc")
.saveAsTable("salescompacted")
```

No hay mucho que explicar, seleccionamos los datos y los distribuimos con un row_number y un repartition. Esto nos generará dataframes balanceados que guardaremos en otro sitio.

Es recomendable hacerlo así para validar la integridad de los datos, luego podremos hacer un swap y un
`msck repair`para dejar la tabla funcioando de nuevo.

Igualmente si tenemos delta, podemos hacer un **vacuum** que hará el mantenimiento del datalake automáticamente: https://docs.delta.io/latest/delta-utility.html#vacuum