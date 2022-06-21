+++
Description = ""
date = "2022-06-19T14:43:22Z"
title = "Spark User Defined Functions"
tags = ["Spark", "Certification", "Data Engineer"]
+++

Sometimes we need to execute arbitrary Scala code on Spark. We may need to use an external library or so on. For that, we have the UDF, which accepts and return one or more columns.

When we have a function we need to register it on Spark so we can use it on our worker machines. If you are using Scala or Java, the udf can run inside the Java Virtual Machine so there's a little extra penalty. But from Python, there is an extra penalty as Spark needs to start a Python process on the worker, serialize the data from JVM to Python, run the function and then serialize the result to the JVM.

```goat 
  +--------+                                                             
  |Driver  |  --> Function serialized & sent to workers --> Spark starts Python process and process data --> Python Returns answers   
  +--------+                                                             
```

We can register our function as a Dataframe function:
```
import org.apache.spark.sql.functions.udf
def power3(number: Double): Double = number * number * number
val power3udf = udf(power3(_:Double): Double)

df.select(power3udf(col("myColumn"))).show
```

But we can also register them as Spark SQL functions making them available to all languages. That means we can register our Scala udf functions in Spark and then use it in our Python Code.

```

spark.udf.register("power3", power3(_: Double): Double)
udfExampleDF.selectExpr("power3(myColumn)").show
```

Here we are defining the return type which is not necessary but is a best practice. If the actual return type doesn't align with the specifications it will return a null instead of failing.


## UDAF

When dealing with aggregations we can also define functions to compute calculations over groups of input data. UDAF is only available on Scala and Java and is much more complicated than UDF. (please beware that there are udaf for datasets and dataframes).

First, we need to extend a base class known as **Aggregator**, and define three components:

- IN type
- BUFFer type
- OUT type

Then we need to define the operations if it was a fold map operation, we need to define the initial value (aka method zero), the merge value, and the reduce value. 

The reduced value will go through a finish method.

The example in the scala documentation is quite simplistic and I wanted to do something with complex types. 

Here is sample data which provides a list of ints for each given row. We are writing an udf for performing an element-wise sum of those lists.

```scala
import spark.implicits._
val input: Seq[(Int, Seq[Int])] = Seq(
(1, Seq(1,2,3,4)),
(1, Seq(5,6,7,8)),
(2, Seq(1,2,3,4))
)
input.toDF("id","tickets")
```

Let's register our elementwise sum, we need to extend the aggregator base class from `org.apache.spark.sql.expressions.Aggregator`

So we know that:

- IN will be a Seq of INT.
- BUFF  will be also a Seq of INT
- Out will be a Seq of INT.

```scala
import org.apache.spark.sql.{Encoder, Encoders, SparkSession}
import org.apache.spark.sql.catalyst.encoders.ExpressionEncoder
import org.apache.spark.sql.expressions.Aggregator
import org.apache.spark.sql.functions

object ElementWiseArraySum extends Aggregator[Seq[Int], Seq[Int], Seq[Int]] {
  // A zero value for this aggregation. Should satisfy the property that any b + zero = b
  def zero: Seq[Int] = Seq(0,0,0,0)
  // Combine two values to produce a new value. For performance, the function may modify `buffer`
  // and return it instead of constructing a new object
  def reduce(buffer: Seq[Int], data: Seq[Int]): Seq[Int] =
    buffer.zip(data).map { case (x, y) => x + y }
    
  // Merge two intermediate values
  def merge(b1: Seq[Int], b2: Seq[Int]): Seq[Int] = 
    b1.zip(b2).map { case (x, y) => x + y }
  
  // Transform the output of the reduction
  def finish(reduction: Seq[Int]): Seq[Int] = reduction
  // Specifies the Encoder for the intermediate value type
  def bufferEncoder = ExpressionEncoder[Seq[Int]]
  // Specifies the Encoder for the final output value type
  def outputEncoder = ExpressionEncoder[Seq[Int]]
}

// Register the function to access it
spark.udf.register("elementWiseSum", functions.udaf(ElementWiseArraySum))
```

The most complicated part to understand is the ExpressionEncoder. We need to provide an enconder for moving the data between the JVM and Spark. There are a series of encoders defined in the Encoder package but those are just primitive Scala types. We need to define an ExpressionEncoder for more complex types or a product type if we are talking about a case class.

Now we can use our udf:

```scala

input.toDF("id","tickets").selectExpr("elementWiseSum(tickets)")
```

|elementwisesum(tickets)|
| --------------------- |
|        [7, 10, 13, 16]|

And even use it in our aggregations!

```scala
import org.apache.spark.sql.functions.expr
input.toDF("id","tickets").groupBy("id").agg(expr("elementWiseSum(tickets)")).show
```

| id|elementWiseSum(tickets)|
| - | --------------------- |
|  1|         [6, 8, 10, 12]|
|  2|           [1, 2, 3, 4]|