+++
Description = ""
date = "2022-06-07T17:02:32Z"
title = "Spark Architecture"
+++

Spark works on top of a cluster that will be managed by a cluster manager. One node will act as a Driver and the rest will be Workers.

```goat
        Spark  
          +--------+
      (1) |        | (N)
          |        |
        Driver   Workers

```

Who are that Driver and those Workers? That depends on the **Execution Mode**.

There 3 kinds:

1. Cluster Mode: This is the most common way. A user submits a pre-compiled JAR or python script to a cluster manager. The cluster manager then launches the driver process on a node inside the cluster along with the executor processes, so the cluster manager is responsible for maintaining all spark application-related processes.
2. Client Mode: It’s the same as the cluster mode but the spark driver remains on the client machine that submitted the application. 
3. Local Mode: Runs the entire spark application on a single machine, achieving parallelism through threads on that single machine. It is a good mode for learning, testing, or experimenting iteratively. 

We talked here about **Executors** what are they? They are JVM machines inside the worker nodes. Each executor will run the code assigned by the driver and report the status of the computation. back to it. Inside the executor, we found several cores, as spark parallelizes at two levels, one distributing the load across the workers, the other one inside each executor.

How does Spark do that? Well, when you create Spark Code (that is you start from a **SparkSession** and perform spark computations) the code is analyzed and then is divided into:

```goat

Jobs
|
+-- Stages (are dependent on each other)
    |
    +- Tasks (are the true unit of work)

```

So we will have **Tasks** running in our Executors **Cores** (alias **slots**). We can now the number of cores with `sc.defaultParallelism`
