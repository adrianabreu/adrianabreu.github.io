+++
Description = ""
date = "2022-06-08T17:02:32Z"
title = "Spark Execution"
tags = ["Spark", "Certification", "Data Engineer"]
+++

Spark provides an api and an engine, that engine is responsible for analyzing the code and performing several optimizations. But how does this work?
We can do two kinds of operations with Spark, transformations and actions. 

Transformations are operations on top of the data that modify the data but do not yield a result directly, that is because they all are lazily evaluated so, you can add new columns, filter rows, or perform some computations that won't be executed immediately. 

Actions are responsible for triggering computations and delimiting a job (you get a job per action), which means that the workers must perform some action and yield the result back to the driver, for example, triggering a count, collecting the data, or writing the data.

Now that we know that we know that the typical DE code would be like this:

1. Read
2. Select
3. Filter
4. Group By
5. Aggregate
6. Write

And as it does have just one action it would be one job. That job would be subdivided, but how? We need to know when the data must be **shuffled** (interchanged across the nodes) for understanding the bounds of the inner stages.

Spark analyses the code bottom-up and when it faces the groupBy it knows that it is a wide transformation.  That means that some data may be dispersed across several nodes so a shuffle is needed. 


```goat
Narrow     Wide
A --> X    A +----- X 
B --> Y       \
               +--- Y
                \
                 +-- Z
                /
           B --+---- W
```

As we need to move the data we need two stages.  The group by operation will be subdivided into smaller stages and will delimit the two stages.

| 1 | read |  |
| --- | --- | --- |
| 2 | select |  |
| 3 | filter |  |
| 4 | groupBy 1 |  |
| 4a | shuffle write | STAGE 1 |
| 4b | shuffle read | STAGE 2 |
| 4c | groupBy 2 |  |
| 5 | filter |  |
| 6 | write |  |

That is, then each piece of data will be considered a **partition** and will be assigned to a task. That's how spark performs the computation and achieves parallelism. But who does this? 

The **Catalyst Optimizer**

```goat 
                            +------------+                                                  +------------+     
                            |LOGICAL     |                                                  |COST BASED  |
                            |OPTIMIZATION|                                                  |OPTIMIZATION|
                            +------------+                                                  +------------+
QUERY -> UNRESOLVED LOGICAL PLAN --> LOGICAL PLAN --> OPTIMIZED LOGICAL PLAN -> PHYSICAL PLANS --> SELECTED PHYSICAL PLAN
  +--------+                                                             +------------+
  |ANALYSIS|                                                             | PHYSICAL   |   
  +--------+                                                             | PLANNING   |
                                                                         +------------+
````

It converts the query into a tree which we can call the **unresolved logical plan**.

That plain is validated against the metadata catalog and it checks that all the column exists and there are no typos. As result, we get the **logical plan**.

Then using the engine rules that plan is rewrote as an **optimized logical plan**.

That plan can be executed in several ways physically. So we will get a **physical plan** for each way than will be evaluated against a cost model. The best cost model will be the **selected physical plan.**

Usually, that was the end of the cycle but with spark 3.0 there is also a new feature called **Adaptative Query Executions** that allows the code to use runtime statistics and reevaluated the logical plan considering this (for example is there are skew joins).

We can get the logical plan programmatically for an execution using the **explain** method on a dataframe call.