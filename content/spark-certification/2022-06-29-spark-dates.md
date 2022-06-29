+++
Description = ""
date = "2022-06-29T15:43:22Z"
title = "Spark Dates"
tags = ["Spark", "Certification", "Data Engineer"]
+++

I can perfectly describe this as the scariest part of the exam. I'm used to working with dates but I'm especially used to suffering from the typical UTC / not UTC / summer time hours difference. 

I will try to make some simple exercises for this, the idea would be: 

- We have some sales data and god knows how the business people love to refresh super fast their dashboards on Databricks SQL. So we decided to aggregate at different levels the same KPI, our sales per store. Considering some data as:

```python

data = [
  (1656520076, 1001, 10),
  (1656520321, 1001, 8),
  (1656509025, 1002, 5),
  (1656510826, 1002, 3),
  (1656510056, 1001, 5),
  (1656514076, 1001, 8),
]

ts = "ts"
store_id = "store_id"
amount = "amount"

df = spark.createDataFrame(data, [ts, store_id, amount])
```

We need to parse that data into a readable date as the first number is an epoch or _unix_time_. Using the function from_unixttime this is quite simple:

```python
from pyspark.sql.functions import (from_unixtime, col)
display(df.withColumn("date_parsed", from_unixtime(col(ts))))
```

Not we need to perform different aggregations, we want the sum of the amount per store on:

- Quarter of the year
- Month
- Week of the year
- Day of the year

All those aggregations can be done with Spark, and not only that but Spark has first-level functions for those, making the transformations direct:

```python
from pyspark.sql.functions import *
from functools import reduce
functions = [quarter, month, weekofyear, dayofyear]

dfs = [parsed_df.groupBy(f(col(parsed_date)), col(store_id)).agg(sum(col(amount))) for f in functions]

display(reduce(lambda x,y: x.union(y), dfs))
```


| period | store_id | sum(amount) |
| ------ | -------- | ----------- |
| 2 | 1001 | 31 |
| 2 | 1002 | 8 |
| 6 | 1001 | 31
| 6 | 1002 | 8 |
| 26 | 1001 | 31 |
| 26 | 1002 | 8 |
| 180 | 1001 | 31 |
| 180 | 1002 | 8 |

As we can see this part is straightforward, but there is a dark non-mentioned part, which is formatting timestamp and parsing those formats.

The timestamp has an extended variety of formats, the UTC standard is as:

`2022-06-29T19:22:55Z`

This can be translated to:

`YYYY-MM-DDTHH:mm:SS[.f]'Z'`

If we want to parse that kind of ts with spark we have the function _from_utc_timestamp_ which accepts both the column and the format (the format could also be another column).

Spark provides an alias for the default format so I can avoid writing all the stuff above and just type "Z" as the UTC format.


```python

from pyspark.sql.types import *

data_ts = [
  ('2022-06-29T19:22:55Z',),
  ('2022-06-29T19:22:55Z',)
]

df_ts = spark.createDataFrame(data_ts, StructType([
  StructField("ts", StringType())
]))

display(df_ts.withColumn("parsed", from_utc_timestamp(col(ts), "Z")))
``` 

| ts | parsed |
| -- | ----- |
| 2022-06-29T19:22:55Z | 2022-06-29T19:22:55.000+0000 |
| 2022-06-29T19:22:55Z | 2022-06-29T19:22:55.000+0000 |
