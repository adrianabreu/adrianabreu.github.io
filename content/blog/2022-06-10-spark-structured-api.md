+++
Description = ""
date = "2022-06-10T17:02:32Z"
title = "Spark Dataframes"
+++

Spark was initial released for dealing with a particular type of data called **RDD**. Nowadays we work with abstract structures on top of it, the follow tables summarizes them.

| Type | Description | Advantages |
| ---- | ----------- | ---------- |
| Datasets | Structured composed of a list of <T> where you can specify your custom class (only Scala) | Type-safe operations, support for operations that cannot be expresed otherwise. |
| Dataframes | Datasets of type Row (a generic spark types) | Allow optimizations and are more flexible | 
| SQL tables and views | Same as dataframes but in scope of databases instead of programming languages | | 


Let's dig into the Dataframes.
They are a data abstraction for interacting with with name columns, those names are defined in a **schema**.

We have several ways of creating dataframes through a *Spark Session*

| Method | Scope |
| ------ | ----- |
| sql | Queries |
| table | Metastore tables |
| read | Files |
| range | |
| createDataframe | Testing |

While reading from files there are severeal data sources: CSV, Parquet, Json, Delta... And each one has it particular option. For example for the csv you can point if the header is included or what is the field delimiter. 

For those sources the schema can be inferred or given. We can declare and schema programatically using the **StructType** methods in the package **pyspark.sql.types**.

```python
from pyspark.sql.types import (StructType, StructField, StringType, LongType)

schema = StructType([
    StructField("user_id", StringType()),
    StructField("user_first_touch_timestamp", LongType()),
    StructField("email", StringType())
])
```

Also we can define the same schema using the DDL syntax
```
"user_id string, user_first_touch_timestamp long, email sting"
```

When we get a dataframe from a source we can apply several transformations to it, we can get rows that matching a given condition (filter), select a subset of columns (select), add a new column (withColumn) or maybe group rows by some columns (groupBy). Any of them are the lazy-evaluate expressions we talked in the spark execution and all the methods and signatures are available in the [official docs](https://spark.apache.org/docs/latest/api/python/reference/index.html).

The last transformation mentioned (groupBy) is quite special since is the only one that cannot be chained to others. While you can write:

```
df.withColumn().drop().filter().select().filter().drop().withColumn ...
```

The groupBy will require shuffle and will allow for aggregations to be run on top of it so the result of a groupBy is not a Dataframe but a **RelationalGroupDataset**

In order to use get back to a datagrame we need to run the `agg` method. 

When we use those methods we are indexing the values by columns, those are just a representation on a value computed for each record. They can be accessed in different ways:
```
df("columnName")
col("colName")
$"columnName"
$"columnName.field"
```
And provide an api for applying conditions on top of them for filtering for example, here is a list of operators for columns:

| Operator | Method |
| --- | --- |
| &&,|| | Boolean operators |
| *, +, <, ≥ | Math and comparison |
| alias, as | alias of columns |
| cast | cast to different data_type |
| isNull, isNan | check null equality |