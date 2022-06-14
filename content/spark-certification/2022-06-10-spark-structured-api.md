+++
Description = ""
date = "2022-06-10T17:02:32Z"
title = "Spark Dataframes"
tags = ["Spark", "Certification", "Data Engineer"]
+++

Spark was initially released for dealing with a particular type of data called **RDD**. Nowadays we work with abstract structures on top of it, and the following tables summarize them.

| Type | Description | Advantages |
| ---- | ----------- | ---------- |
| Datasets | Structured composed of a list of <T> where you can specify your custom class (only Scala) | Type-safe operations, support for operations that cannot be expressed otherwise. |
| Dataframes | Datasets of type Row (a generic spark type) | Allow optimizations and are more flexible | 
| SQL tables and views | Same as Dataframes but in the scope of databases instead of programming languages | | 


Let's dig into the Dataframes.
They are a data abstraction for interacting with name columns, those names are defined in a **schema**.

We have several ways of creating Dataframes through a *Spark Session*, which can be built through the builder. 

```
from pyspark.sql import SparkSession

spark = SparkSession \
    .builder \
    .appName("Python Spark SQL basic example") \
    .config("spark.some.config.option", "some-value") \
    .getOrCreate()
```

| Method | Scope |
| ------ | ----- |
| SQL | Queries |
| table | Metastore tables |
| read | Files |
| range | |
| createDataframe | Testing |

While reading from files there are several data sources: CSV, Parquet, JSON, Delta... And each one has its particular option. For example, for the CSV you can point out if the header is included or what is the field delimiter. 

For those sources, the schema can be inferred or given. We can declare and schema programmatically using the **StructType** methods in the package **pyspark.sql.types**.

```python
from pyspark.sql.types import (StructType, StructField, StringType, LongType)

schema = StructType([
    StructField("user_id", StringType()),
    StructField("user_first_touch_timestamp", LongType()),
    StructField("email", StringType())
])
```

Also, we can define the same schema using the DDL syntax
```
"user_id string, user_first_touch_timestamp long, email sting"
```

When we get a dataframe from a source we can apply several transformations to it, we can get rows that match a given condition (filter), select a subset of columns (select), add a new column (withColumn), or maybe group rows by some columns (groupBy). Any of them are the lazy-evaluate expressions we talked about in the spark execution and all the methods and signatures are available in the [official docs](https://spark.apache.org/docs/latest/api/python/reference/index.html).

The last transformation mentioned (groupBy) is quite special since is the only one that cannot be chained to others. While you can write:

```
df.withColumn().drop().filter().select().filter().drop().withColumn ...
```

The groupBy will require shuffle and will allow for aggregations to be run on top of it so the result of a groupBy is not a Dataframe but a **RelationalGroupDataset**

To use get back to a dataframe we need to run the `agg` method. Then we are calculating a single value on a group of rows. Users can create their custom aggregate functions alias **udaf**.



When we use those methods we are indexing the values by columns, those are just a representation of a value computed for each record. They can be accessed in different ways:
```
df("columnName")
col("colName")
$"columnName"
$"columnName.field"
```
And provide an API for applying conditions on top of them for filtering, for example, here is a list of operators for columns:

| Operator | Method |
| --- | --- |
| &&,|| | Boolean operators |
| *, +, <, ≥ | Math and comparison |
| alias, as | alias of columns |
| cast | cast to different data_type |
| isNull, isNan | check null equality |
