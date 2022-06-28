
+++
Description = ""
date = "2022-06-28T13:43:22Z"
title = "Spark Cert Exam Practice"
tags = ["Spark", "Certification", "Data Engineer"]
quiz = true
+++

<script 
src="https://cdn.jsdelivr.net/npm/quizdown@latest/public/build/quizdown.js">
</script>
<script 
 src="https://cdn.jsdelivr.net/npm/quizdown@latest/public/build/extensions/quizdownKatex.js">
</script>
<script 
 src="https://cdn.jsdelivr.net/npm/quizdown@latest/public/build/extensions/quizdownHighlight.js">
</script>
<script>quizdown.register(quizdownHighlight).register(quizdownKatex).init()</script> 

{{< quizdown >}}

---
primary_color: orange
secondary_color: lightgray
text_color: black
shuffle_questions: false
---

## Which of the following statements about the Spark driver is incorrect?

- [ ] The Spark driver is the node in which the Spark application's main method runs to ordinate the Spark application.
- [X] The Spark driver is horizontally scaled to increase overall processing throughput.
- [ ] The Spark driver contains the SparkContext object.
- [ ] The Spark driver is responsible for scheduling the execution of data by various worker nodes in cluster mode.
- [ ] The Spark driver should be as close as possible to worker nodes for optimal performance.

## Which of the following describes nodes in cluster-mode Spark?

- [ ] Nodes are the most granular level of execution in the Spark execution hierarchy.
- [ ] There is only one node and it hosts both the driver and executors.
- [ ] Nodes are another term for executors, so they are processing engine instances for performing computations.
- [ ] There are driver nodes and worker nodes, both of which can scale horizontally.
- [X] Worker nodes are machines that host the executors responsible for the execution of tasks

## Which of the following statements about slots is true?

- [ ] There must be more slots than executors.
- [ ] There must be more tasks than slots.
- [ ] Slots are the most granular level of execution in the Spark execution hierarchy.
- [ ] Slots are not used in cluster mode.
- [X] Slots are resources for parallelization within a Spark application.

## Which of the following is a combination of a block of data and a set of transformers that will run on a single executor?

- [ ] Executor
- [ ] Node
- [ ] Job
- [X] Task
- [ ] Slot

## Which of the following is a group of tasks that can be executed in parallel to compute the same set of operations on potentially multiple machines?

- [ ] Job
- [ ] Slot
- [ ] Executor
- [ ] Task
- [X] Stage

## Which of the following describes a shuffle?
- [X] A shuffle is the process by which data is compared across partitions.
- [ ] A shuffle is the process by which data is compared across executors.
- [ ] A shuffle is the process by which partitions are allocated to tasks.
- [ ] A shuffle is the process by which partitions are ordered for write.
- [ ] A shuffle is the process by which tasks are ordered for execution.

## DataFrame df is very large with a large number of partitions, more than there are executors in the cluster. Based on this situation, which of the following is incorrect? Assume there is one core per executor.

- [X] Performance will be suboptimal because not all executors will be utilized at the same time.
- [ ] Performance will be suboptimal because not all data can be processed at the same time.
- [ ] There will be a large number of shuffle connections performed on DataFrame df when operations inducing a shuffle are called.
- [ ] There will be a lot of overhead associated with managing resources for data processing within each task.
- [ ] There might be risk of out-of-memory errors depending on the size of the executors in the cluster.

## Which of the following operations will trigger evaluation?
- [ ] DataFrame.filter()
- [ ] DataFrame.distinct()
- [ ] DataFrame.intersect()
- [ ] DataFrame.join()
- [X] DataFrame.count()

## Which of the following describes the difference between transformations and actions?

- [ ] Transformations work on DataFrames/Datasets while actions are reserved for native language objects.
- [ ] There is no difference between actions and transformations.
- [ ] Actions are business logic operations that do not induce execution while transformations are execution triggers focused on returning results.
- [ ] Actions work on DataFrames/Datasets while transformations are reserved for native  language objects.
- [X] Transformations are business logic operations that do not induce execution while actions  are execution triggers focused on returning results.

## Which of the following DataFrame operations is always classified as a narrow transformation?
- [ ] DataFrame.sort()
- [ ] DataFrame.distinct()
- [ ] DataFrame.repartition()
- [X] DataFrame.select()
- [ ] DataFrame.join()

## Spark has a few different execution/deployment modes: cluster, client, and local. Which of the following describes Spark's execution/deployment mode? 

- [X] Spark's execution/deployment mode determines where the driver and executors are physically located when a Spark application is run
- [ ] Spark's execution/deployment mode determines which tasks are allocated to which  executors in a cluster
- [ ] Spark's execution/deployment mode determines which node in a cluster of nodes is responsible for running the driver program
- [ ] Spark's execution/deployment mode determines exactly how many nodes the driver will connect to when a Spark application is run
- [ ] Spark's execution/deployment mode determines whether results are run interactively in a notebook environment or in batch

## Which of the following cluster configurations will ensure the completion of a Spark application in light of a worker node failure? Note: each configuration has roughly the same compute power using 100GB of RAM and 200 cores. 

{{< resp-image "/images/databricks-cert/q12.png" >}}

- [ ] Scenario #1
- [X] They should all ensure completion because worker nodes are fault-tolerant.
- [ ] Scenario #4
- [ ] Scenario #5
- [ ] Scenario #6

## Which of the following describes out-of-memory errors in Spark?

- [X] An out-of-memory error occurs when either the driver or an executor does not have enough memory to collect or process the data allocated to it.
- [ ] An out-of-memory error occurs when Spark's storage level is too lenient and allows data objects to be cached to both memory and disk.
- [ ] An out-of-memory error occurs when there are more tasks than are executors regardless of the number of worker nodes.
- [ ] An out-of-memory error occurs when the Spark application calls too many transformations in a row without calling an action regardless of the size of the data object  on which the transformations are operating.
- [ ] An out-of-memory error occurs when too much data is allocated to the driver for computational purposes.

## Which of the following is the default storage level for persist() for a non-streaming DataFrame/Dataset?

- [X] MEMORY_AND_DISK
- [ ] MEMORY_AND_DISK_SER
- [ ] DISK_ONLY
- [ ] MEMORY_ONLY_SER
- [ ] MEMORY_ONLY

## Which of the following describes a broadcast variable?

- [ ] A broadcast variable is a Spark object that needs to be partitioned onto multiple worker  nodes because it's too large to fit on a single worker node.
- [ ] A broadcast variable can only be created by an explicit call to the broadcast() operation.
- [ ] A broadcast variable is entirely cached on the driver node so it doesn't need to be present on any worker nodes.
- [X] A broadcast variable is entirely cached on each worker node so it doesn't need to be shipped or shuffled between nodes with each stage.
- [ ] A broadcast variable is saved to the disk of each worker node to be easily read into memory  when needed.

## Which of the following operations is most likely to induce a skew in the size of your data's partitions?

- [ ] DataFrame.collect()
- [ ] DataFrame.cache()
- [ ] DataFrame.repartition(n)
- [X] DataFrame.coalesce(n)
- [ ] DataFrame.persist()

## Which of the following data structures are Spark DataFrames built on top of?
- [ ] Arrays
- [ ] Strings
- [X] RDDs
- [ ] Vectors
- [ ] SQL Tables

### Which of the following code blocks returns a DataFrame containing only column storeId and column **division** from DataFrame **storesDF?**

- [ ] `storesDF.select("storeId").select("division")`
- [ ] `storesDF.select(storeId, division)`
- [X] `storesDF.select("storeId", "division")`
- [ ] `storesDF.select(col("storeId", "division"))`
- [ ] `storesDF.select(storeId).select(division)`

## Which of the following code blocks returns a DataFrame containing all columns from DataFrame storesDF except for column sqft and column customerSatisfaction?  A sample of DataFrame storesDF is below:
{{< resp-image "/images/databricks-cert/q19.png" >}}

- [X] `storesDF.drop("sqft", "customerSatisfaction")`
- [ ] `storesDF.select("storeId", "open", "openDate", "division")`
- [ ] `storesDF.select(-col(sqft), -col(customerSatisfaction))`
- [ ] `storesDF.drop(sqft, customerSatisfaction)`
- [ ] `storesDF.drop(col(sqft), col(customerSatisfaction))`

## The below code shown block contains an error. The code block is intended to return a DataFrame  containing only the rows from DataFrame storesDF where the value in DataFrame storesDF's "sqft" column is less than or equal to 25,000. Assume DataFrame storesDF is the only defined language variable. Identify the error. Code block: `storesDF.filter(sqft <= 25000)`

- [ ] The column name **sqft** needs to be quoted like s**toresDF.filter("sqft" <=000).**
- [X] The column name sqft needs to be quoted and wrapped in the **col()** function like **storesDF.filter(col("sqft") <= 25000).**
- [ ] The sign in the logical condition inside **filter()** needs to be changed from <= to >.
- [ ] The sign in the logical condition inside **filter()** needs to be changed from <= to >=.
- [ ] The column name sqft needs to be wrapped in the **col()** function like **storesDF.filter(col(sqft) <= 25000).**

## The code block shown below should return a DataFrame containing only the rows from DataFrame storesDF where the value in column sqft is less than or equal to 25,000 OR the value in column customerSatisfaction is greater than or equal to 30. Choose the response that correctly fills in the numbered blanks within the code block to complete this task. Code block: storesDF.__**1__**(__**2**__ __3__ __4__)

- [X] ```
    1. filter
    2. (col("sqft") <= 25000)
    3. |
    4. (col("customerSatisfaction") >= 30)
     ```
- [ ] ```
  1. drop
  2. (col(sqft) <= 25000)
  3. |
  4. (col(customerSatisfaction) >= 30)
```
- [ ] ```
  1. filter
  2. col("sqft") <= 25000
  3. |
  4. col("customerSatisfaction") >= 30
```
- [ ] ```
  1. filter
  2. col("sqft") <= 25000
  3. or
  4. col("customerSatisfaction") >= 30
```
- [ ] ```
  1. filter
  2. (col("sqft") <= 25000)
  3. or
  4. (col("customerSatisfaction") >= 30)
```

## Which of the following operations can be used to convert a DataFrame column from one type to another type?

- [X] col().cast()
- [ ] convert()
- [ ] castAs()
- [ ] col().coerce()
- [ ] col()

## Which of the following code blocks returns a new DataFrame with a new column sqft100 that is 1/100th of column sqft in DataFrame storesDF? Note that column sqft100 is not in the original DataFrame storesDF.

- [ ] `storesDF.withColumn("sqft100", col("sqft") * 100)`
- [ ] `storesDF.withColumn("sqft100", sqft / 100)`
- [ ] `storesDF.withColumn(col("sqft100"), col("sqft") / 100)`
- [X] `storesDF.withColumn("sqft100", col("sqft") / 100)`
- [ ] `storesDF.newColumn("sqft100", sqft / 100)`

## Which of the following code blocks returns a new DataFrame from DataFrame storesDF where column numberOfManagers is the constant integer 1?

- [ ] `storesDF.withColumn("numberOfManagers", col(1))`
- [ ] `storesDF.withColumn("numberOfManagers", 1)`
- [X] `storesDF.withColumn("numberOfManagers", lit(1))`
- [ ] `storesDF.withColumn("numberOfManagers", lit("1"))`
- [ ] `storesDF.withColumn("numberOfManagers", IntegerType(1))`

## The code block shown below contains an error. The code block intends to return a new DataFrame where column storeCategory from DataFrame storesDF is split at the underscore character into column storeValueCategory and column storeSizeCategory. Identify the error. A sample of DataFrame storesDF is displayed below: Code block:
```
(storesDF.withColumn(
    "storeValueCategory", col("storeCategory").split("*")[0]
  ).withColumn(
    "storeSizeCategory", col("storeCategory").split("*")[1]
  )
)
```
{{< resp-image "/images/spark-certification/q25.png" >}}

- [ ] The split() operation comes from the imported functions object. It accepts a string column name and split character as arguments. It is not a method of a Column object.
- [X] The split() operation comes from the imported functions object. It accepts a Column object and split character as arguments. It is not a method of a Column object.
- [ ] The index values of 0 and 1 should be provided as second arguments to the split() operation rather than indexing the result.
- [ ] The index values of 0 and 1 are not correct — they should be 1 and 2, respectively.
- [ ] The withColumn() operation cannot be called twice in a row.


## Which of the following operations can be used to split an array column into an individual DataFrame row for each element in the array?
- [ ] extract()
- [ ] split()
- [X] explode()
- [ ] arrays_zip()
- [ ] unpack()

## Which of the following code blocks returns a new DataFrame where column storeCategory is an all-lowercase version of column storeCategory in DataFrame storesDF? Assume DataFrame storesDF is the only defined language variable.

- [X] `storesDF.withColumn("storeCategory", lower(col("storeCategory")))`
- [ ] `storesDF.withColumn("storeCategory", coll("storeCategory").lower())`
- [ ] `storesDF.withColumn("storeCategory", tolower(col("storeCategory")))`
- [ ] `storesDF.withColumn("storeCategory", lower("storeCategory"))`
- [ ] `storesDF.withColumn("storeCategory", lower(storeCategory))`

## The code block shown below contains an error. The code block is intended to return a new DataFrame where column division from DataFrame storesDF has been renamed to column state and column managerName from DataFrame storesDF has been renamed to column managerFullName. Identify the error. Code block:
```
(storesDF.withColumnRenamed("state", "division")
.withColumnRenamed("managerFullName", "managerName"))
```

- [ ] Both arguments to operation withColumnRenamed() should be wrapped in the col() operation.
- [ ] The operations withColumnRenamed() should not be called twice, and the first argument should be ["state", "division"] and the second argument should be["managerFullName", "managerName"].
- [ ] The old columns need to be explicitly dropped.
- [X] The first argument to operation withColumnRenamed() should be the old column name and the second argument should be the new column name.
- [ ] The operation withColumnRenamed() should be replaced with withColumn().

## Which of the following code blocks returns a DataFrame where rows in DataFrame storesDF containing missing values in every column have been dropped?

- [ ] storesDF.nadrop("all")
- [ ] storesDF.na.drop("all", subset = "sqft")
- [ ] storesDF.dropna()
- [ ] storesDF.na.drop()
- [X] storesDF.na.drop("all")

## Which of the following operations fails to return a DataFrame where every row is unique?

- [ ] DataFrame.distinct()
- [ ] DataFrame.drop_duplicates(subset = None)
- [ ] DataFrame.drop_duplicates()
- [ ] DataFrame.dropDuplicates()
- [X] DataFrame.drop_duplicates(subset = "all")

## Which of the following code blocks will not always return the exact number of distinct values in column division?

- [X] `storesDF.agg(approx_count_distinct(col("division")).alias("divisionDistinct"))`
- [ ] `storesDF.agg(approx_count_distinct(col("division"), 0).alias("divisionDistinct"))`
- [ ] `storesDF.agg(countDistinct(col("division")).alias("divisionDistinct"))`
- [ ] `storesDF.select("division").dropDuplicates().count()`
- [ ] `storesDF.select("division").distinct().count()`

## The code block shown below should return a new DataFrame with the mean of column sqft from DataFrame storesDF in column sqftMean. Choose the response that correctly fills in the numbered blanks within the code block to complete this task. Code block:
`storesDF.__**1__**(__2__(__**3**__).alias("sqftMean"))`

- [X] ```
  1. agg
  2. mean
  3. col("sqft")
```
- [ ] ```
  1. mean
  2. col
  3. "sqft"
```
- [ ] ```
  1. withColumn
  2. mean
  3. col("sqft")
```
- [ ] ```
  1. agg
  2. mean
  3. "sqft"
```
- [ ] ```
  1. agg
  2. average
  3. col("sqft")
```

## Which of the following code blocks returns the number of rows in DataFrame storesDF?

- [ ] storesDF.withColumn("numberOfRows", count())
- [ ] storesDF.withColumn(count().alias("numberOfRows"))
- [ ] storesDF.countDistinct()
- [X] storesDF.count()
- [ ] storesDF.agg(count())

## Which of the following code blocks returns the sum of the values in column sqft in DataFrame storesDF grouped by distinct value in column division?

- [ ] storesDF.groupBy.agg(sum(col("sqft")))
- [ ] storesDF.groupBy("division").agg(sum())
- [ ] storesDF.agg(groupBy("division").sum(col("sqft")))
- [ ] storesDF.groupby.agg(sum(col("sqft")))
- [X] storesDF.groupBy("division").agg(sum(col("sqft")))

## Which of the following code blocks returns a DataFrame containing summary statistics only for column sqft in DataFrame storesDF?

- [ ] storesDF.summary("mean")
- [X] storesDF.describe("sqft")
- [ ] storesDF.summary(col("sqft"))
- [ ] storesDF.describeColumn("sqft")
- [ ] storesDF.summary()

## Which of the following operations can be used to sort the rows of a DataFrame?

- [X] sort() and orderBy()
- [ ] orderby()
- [ ] sort() and orderby()
- [ ] orderBy()
- [ ] sort()

## The code block shown below contains an error. The code block is intended to return a 15 percent sample of rows from DataFrame storesDF without replacement. Identify the error.  Code block: storesDF.sample(True, fraction = 0.15)

- [ ] There is no argument specified to the seed parameter.
- [ ] There is no argument specified to the withReplacement parameter.
- [ ] The sample() operation does not sample without replacement — sampleby() should be  used instead.
- [ ] The sample() operation is not reproducible.
- [X] The first argument True sets the sampling to be with replacement.

## Which of the following operations can be used to return the top n rows from a DataFrame?

- [ ] DataFrame.n()
- [X] DataFrame.take(n)
- [ ] DataFrame.head
- [ ] DataFrame.show(n)
- [ ] DataFrame.collect(n)

## The code block shown below should extract the value for column sqft from the first row of DataFrame storesDF. Choose the response that correctly fills in the numbered blanks within the  code block to complete this task.
Code block:
`__**1__.__2 __.__3 __**`

- [ ] ```
  1. storesDF
  2. first
  3. col("sqft")
```
- [ ] ```
  1. storesDF
  2. first
  3. sqft
```
- [ ] ```
  1. storesDF
  2. first
  3. ["sqft"]
```
- [X] ```
  1. storesDF
  2. first()
  3. sqft
```
- [ ] ```
  1. storesDF
  2. first()
  3. col("sqft")
```

## Which of the following lines of code prints the schema of a DataFrame?

- [ ] print(storesDF)
- [ ] storesDF.schema
- [ ] print(storesDF.schema())
- [X] DataFrame.printSchema()
- [ ] DataFrame.schema()

## In what order should the below lines of code be run in order to create and register a SQL UDF named "ASSESS_PERFORMANCE" using the Python function assessPerformance and apply it to column customerSatistfaction in table stores?
```
Lines of code:
1.`spark.udf.register("ASSESS_PERFORMANCE", assessPerformance)`
2.`spark.sql("SELECT customerSatisfaction, assessPerformance(customerSatisfaction) AS result FROM stores")`
3.`spark.udf.register(assessPerformance, "ASSESS_PERFORMANCE")`
4. `spark.sql("SELECT customerSatisfaction, ASSESS_PERFORMANCE(customerSatisfaction) AS result FROM
stores")`
```

- [ ] 3, 4
- [X] 1, 4
- [ ] 3, 2
- [ ] 2
- [ ] 1, 2

## In what order should the below lines of code be run in order to create a Python UDF assessPerformanceUDF() using the integer-returning Python function assessPerformance and apply it to column customerSatisfaction in DataFrame storesDF?
```
Lines of code:
1. assessPerformanceUDF = udf(assessPerformance, IntegerType)
2. assessPerformanceUDF = spark.register.udf("ASSESS_PERFORMANCE",
assessPerformance)
3. assessPerformanceUDF = udf(assessPerformance, IntegerType())
4. storesDF.withColumn("result",
assessPerformanceUDF(col("customerSatisfaction")))
5. storesDF.withColumn("result",
assessPerformance(col("customerSatisfaction")))
6. storesDF.withColumn("result",
ASSESS_PERFORMANCE(col("customerSatisfaction")))
```

- [X] 3, 4
- [ ] 2, 6
- [ ] 3, 5
- [ ] 1, 4
- [ ] 2, 5

## Which of the following operations can execute a SQL query on a table?

- [ ] spark.query()
- [ ] DataFrame.sql()
- [X] spark.sql()
- [ ] DataFrame.createOrReplaceTempView()
- [ ] DataFrame.createTempView()

## Which of the following code blocks creates a single-column DataFrame from Python list years which is made up of integers?

- [ ] `spark.createDataFrame([years], IntegerType())`
- [X] `spark.createDataFrame(years, IntegerType())`
- [ ] `spark.DataFrame(years, IntegerType())`
- [ ] `spark.createDataFrame(years)`
- [ ] `spark.createDataFrame(years, IntegerType)`


## Which of the following operations can be used to cache a DataFrame only in Spark’s memory assuming the default arguments can be updated?

- [ ] DataFrame.clearCache()
- [ ] DataFrame.storageLevel
- [ ] StorageLevel
- [X] DataFrame.persist()
- [ ] DataFrame.cache()

## The code block shown below contains an error. The code block is intended to return a new 4-partition DataFrame from the 8-partition DataFrame storesDF without inducing a shuffle. Identify the error. Code block: storesDF.repartition(4)

- [ ] The repartition operation will only work if the DataFrame has been cached to memory. 
- [ ] The repartition operation requires a column on which to partition rather than a number of partitions.
- [ ] The number of resulting partitions, 4, is not achievable for an 8-partition DataFrame.
- [X] The repartition operation induced a full shuffle. The coalesce operation should be used instead.
- [ ] The repartition operation cannot guarantee the number of result partitions.

## Which of the following code blocks will always return a new 12-partition DataFrame from the 8-partition DataFrame storesDF?

- [ ] storesDF.coalesce(12)
- [ ] storesDF.repartition()
- [X] storesDF.repartition(12)
- [ ] storesDF.coalesce()
- [ ] storesDF.coalesce(12, "storeId")

## Which of the following Spark config properties represents the number of partitions used in wide transformations like join()?

- [x] `spark.sql.shuffle.partitions`
- [ ] `spark.shuffle.partitions`
- [ ] `spark.shuffle.io.maxRetries`
- [ ] `spark.shuffle.file.buffer`
- [ ] `spark.default.parallelism`

###  In what order should the below lines of code be run in order to return a DataFrame containing a column openDateString, a string representation of Java’s SimpleDateFormat? Note that column openDate is of type integer and represents a date in the UNIX epoch format — the number of seconds since midnight on January 1st, 1970. An example of Java's SimpleDateFormat is "Sunday, Dec 4, 2008 1:05 PM". A sample of storesDF is displayed below:
```
Lines of code:
1. `storesDF.withColumn("openDateString",
from_unixtime(col("openDate"), simpleDateFormat))`
2. `simpleDateFormat = "EEEE, MMM d, yyyy h:mm a"`
3. `storesDF.withColumn("openDateString",
from_unixtime(col("openDate"), SimpleDateFormat()))`
4.`storesDF.withColumn("openDateString",
date_format(col("openDate"), simpleDateFormat))`
5.`storesDF.withColumn("openDateString",
date_format(col("openDate"), SimpleDateFormat()))`
6.`simpleDateFormat = "wd, MMM d, yyyy h:mm a"`
```

- [ ] 2, 3
- [X] 2, 1
- [ ] 6, 5
- [ ] 2, 4
- [ ] 6, 1

## Which of the following code blocks returns a DataFrame containing a column month, an integer representation of the month from column openDate from DataFrame storesDF? Note that column openDate is of type integer and represents a date in the UNIX epoch format — the number of seconds since midnight on January 1st, 1970. A sample of storesDF is displayed below:
{{< resp-image "/images/databricks-cert/q50.png" >}}

- [ ] `storesDF.withColumn("month", getMonth(col("openDate")))`
- [X] `storesDF.withColumn("openTimestamp", col("openDate").cast("Timestamp")).withColumn("month", month(col("openTimestamp")))`
- [ ] `storesDF.withColumn("openDateFormat", col("openDate").cast("Date")).withColumn("month", month(col("openDateFormat")))`
- [ ] `storesDF.withColumn("month", substr(col("openDate"), 4, 2))`
- [ ] `storesDF.withColumn("month", month(col("openDate")))`


## Which of the following operations performs an inner join on two DataFrames?

- [ ] DataFrame.innerJoin()
- [X] DataFrame.join()
- [ ] Standalone join() function
- [ ] DataFrame.merge()
- [ ] DataFrame.crossJoin()

## Which of the following code blocks returns a new DataFrame that is the result of an outer join between DataFrame storesDF and DataFrame employeesDF on column storeId?

- [X] storesDF.join(employeesDF, "storeId", "outer")
- [ ] storesDF.join(employeesDF, "storeId")
- [ ] storesDF.join(employeesDF, "outer", col("storeId"))
- [ ] storesDF.join(employeesDF, "outer", storesDF.storeId == employeesDF.storeId)
- [ ] storesDF.merge(employeesDF, "outer", col("storeId"))

## The below code block contains an error. The code block is intended to return a new DataFrame that is the result of an inner join between DataFrame storesDF and DataFrame employeesDF on column storeId and column employeeId which are in both DataFrames. Identify the error.
Code block:
`storesDF.join(employeesDF, [col("storeId"), col("employeeId")])`

- [ ] The join() operation is a standalone function rather than a method of DataFrame — the join() operation should be called where its first two arguments are storesDF and employeesDF.
- [ ] There must be a third argument to join() because the default to the how parameter is not "inner".
- [ ] The col("storeId") and col("employeeId") arguments should not be separate elements of a list — they should be tested to see if they're equal to one another like col("storeId") == col("employeeId").
- [ ] There is no DataFrame.join() operation — DataFrame.merge() should be used instead.
- [X] The references to "storeId" and "employeeId" should not be inside the col() function — removing the col() function should result in a successful join.

## Which of the following Spark properties is used to configure the broadcasting of a DataFrame without the use of the broadcast() operation?

- [X] spark.sql.autoBroadcastJoinThreshold
- [ ] spark.sql.broadcastTimeout
- [ ] spark.broadcast.blockSize
- [ ] spark.broadcast.compress
- [ ] spark.executor.memoryOverhead


## The code block shown below should return a new DataFrame that is the result of a cross join between DataFrame storesDF and DataFrame employeesDF. Choose the response that correctly fills in the numbered blanks within the code block to complete this task. Code block:

__***1*__**.__**2__**(__3__)

- [ ] ```
  1. storesDF
  2. crossJoin
  3. employeesDF, "storeId"
```
- [ ] ```
  1. storesDF
  2. join
  3. employeesDF, "cross"
```
- [ ] ```
  1. storesDF
  2. crossJoin
  3. employeesDF, "storeId"
```
- [ ] ```
  1. storesDF
  2. join
  3. employeesDF, "storeId", "cross"
```
- [X] ```
  1. storesDF
  2. crossJoin
  3. employeesDF
```

## Which of the following operations performs a position-wise union on two DataFrames?

- [ ] The standalone concat() function
- [ ] The standalone unionAll() function
- [ ] The standalone union() function
- [ ] DataFrame.unionByName()
- [X] DataFrame.union()

## Which of the following code blocks writes DataFrame storesDF to file path filePath as parquet?

- [ ] storesDF.write.option("parquet").path(filePath)
- [ ] storesDF.write.path(filePath)
- [ ] storesDF.write().parquet(filePath)
- [ ] storesDF.write(filePath)
- [X] storesDF.write.parquet(filePath)

## The code block shown below contains an error. The code block is intended to write DataFrame storesDF to file path filePath as parquet and partition by values in column division. Identify the error. Code block:

`storesDF.write.repartition("division").parquet(filePath)`

- [ ] The argument division to operation repartition() should be wrapped in the col() function to return a Column object.
- [ ] There is no parquet() operation for DataFrameWriter — the save() operation should be used instead.
- [X] There is no repartition() operation for DataFrameWriter — the partitionBy() operation should be used instead.
- [ ] DataFrame.write is an operation — it should be followed by parentheses to return a
DataFrameWriter.
- [ ] The mode() operation must be called to specify that this write should not overwrite
existing files.

## Which of the following code blocks reads a parquet at the file path filePath into a DataFrame?

- [ ] spark.read().parquet(filePath)
- [ ] spark.read().path(filePath, source = "parquet")
- [ ] spark.read.path(filePath, source = "parquet")
[x] spark.read.parquet(filePath)
- [ ] spark.read().path(filePath)


## Which of the following code blocks reads JSON at the file path filePath into a DataFrame with the specified schema schema?

- [ ] spark.read().schema(schema).format(json).load(filePath)
- [ ] spark.read().schema(schema).format("json").load(filePath)
- [ ] spark.read.schema("schema").format("json").load(filePath)
- [ ] spark.read.schema("schema").format("json").load(filePath)
- [x] spark.read.schema(schema).format("json").load(filePath)


{{< /quizdown >}}