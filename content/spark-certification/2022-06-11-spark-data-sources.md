+++
Description = ""
date = "2022-06-11T16:43:22Z"
title = "Spark DataSources"
tags = ["Spark", "Certification", "Data Engineer"]
+++

As estated in the [structured api section](/spark-certification/2022-06-10-spark-structured-api), Spark supports a lot of sources with a lot of options. There is no other goal for this post than to clarify how the most common ones work and how they will be converted to **DataFrames**.

First, all the supported sources are listed here: https://spark.apache.org/docs/latest/sql-data-sources.html

And we can focus on the typical ones: JSON, CSV and Parquet (as those are the typical format on open-source data).

There are two main options available to almost all datasources, the mode and the schema. This mode performs different functions if it for read or write. For reading it allow us to choose an strategy for dealing with malformed data. We could abort the read (FAILFAST), ignore them or put them under some specific path. And for writing it allow us to specify what to do when there is data in the destination path: Overwrite all data? Append Only?.

The schema allow us to specify before-hand how the data should be. And while we can infer the schema from the files, there is a cost on it, let's review it.

I'm using [Databricks Community](https://community.cloud.databricks.com/?) with the sample dataset `dbfs:/databricks-datasets/amazon/users/part-r-00000-f8d9888b-ba9e-47bb-9501-a877f2574b3c.csv`.

First, let's read the file without specifying the schema:
```
spark.read.option("header","true").csv("dbfs:/databricks-datasets/amazon/users/part-r-00000-f8d9888b-ba9e-47bb-9501-a877f2574b3c.csv")

(1) Spark Jobs
res0: org.apache.spark.sql.DataFrame = [user: string]
Command took 6.74 seconds
```

As we can see there is a Spark Job triggered, why? Because we need to infer the schema of the file. So there is a job for the driver to infer the schema of the files list. If we get into the execution plan it shows it clearly:

```
== Physical Plan ==
CollectLimit (3)
+- * Filter (2)
   +- Scan text  (1)


(1) Scan text 
Output [1]: [value#433]
Batched: false
Location: InMemoryFileIndex [dbfs:/databricks-datasets/amazon/users/part-r-00000-f8d9888b-ba9e-47bb-9501-a877f2574b3c.csv]
ReadSchema: struct<value:string>

(2) Filter [codegen id : 1]
Input [1]: [value#433]
Condition : (length(trim(value#433, None)) > 0)

(3) CollectLimit
Input [1]: [value#433]
Arguments: 1
```

On the other hand if we specify the schema there is no job generated:

```
from pyspark.sql.types import (StructType, StructField, StringType)

schema = StructType([
  StructField("user", StringType())
])

spark.read.schema(schema).option("header","true").csv("dbfs:/databricks-datasets/amazon/users/part-r-00000-f8d9888b-ba9e-47bb-9501-a877f2574b3c.csv")

Out[2]: DataFrame[user: string]
Command took 0.52 seconds 
```

Also if there was a folder it would be extra jobs for listing all the files, checking the existence and it would have to read them all for generating a common schema. The overhead seems small but if you specify a folder with CSV or Jsons, the time can increase exponentially. 

When we read a folder, each file will be a partition and it will be processed by an executor. We cannot read the same file with multiple executors at the same time but we could avoid reading the files entirely if the file is "splittable" (like Parquet files that are delimited in chunks).

As 1 file matches 1 partition, when we write 1 partition will be 1 file. If we write the data directly we will end up with a lot of files that will be impact the performance of another job reading them. (For each file there is the overhead we mentioned before). We will need to balance the partitions using repartition or coalesce in our dataframe.

Also there are two write options for it:
1. partitionBy: allow us to order the files in folder by the given columns. Those folders will respect the hive style format `/field=value/`. And they will represent the value for all the files internally. That will allow to skip a lot of data when looking for certain values (typically there is a date_key value). 
2. bucketing: this will make data with the same bucket_id value to be on the same physical partition. For example for one given day all the sales of each store could be together so the readers will avoid shuffling when they want to perform computations on it. If we partitioned each days sales by store we may end up with a lof of directories that would cause overhead on the storage systems.

