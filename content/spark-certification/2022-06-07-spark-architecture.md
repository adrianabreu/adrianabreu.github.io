+++
Description = ""
date = "2022-06-07T17:02:32Z"
title = "Spark Architecture"
tags = ["Spark", "Certification", "Data Engineer"]
+++

Spark works on top of a cluster supervised by a cluster manager. The cluster manager is responsible of: 
1. Tracking resource allocation across all applications running on the cluster.
2. Monitoring the health of all the nodes.

Inside each node there is a node manager which is responsible to track each node health and resources and inform the cluster manager.

```goat

+----------------+    +---+ Node Manager
|Cluster Manager +----+   
+----------------+    +---+ Node Manager
                      +
                      +---+ Node Manager
``` 

When we run a Spark application we generate process inside the cluster one node will act as a Driver and the rest will be Workers. Here there are two main points:

- A cluster manager works with machines, a spark application work with processes (as both have worker nodes and so on it may be confusing).
- The spark Driver is the **heart** of the application, if it fails, the application will fail too. The driver is responsible of distributing and scheduling all the job across executors.


```goat
        Spark  
          +--------+
      (1) |        | (N)
          |        |
        Driver   Workers

```

Who are that Driver and those Workers? That depends on the **Execution Mode** selected during the application submission.

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

So we will have **Tasks** running in our Executors **Cores** (alias **slots** alias **threads** -it is quite confusing that they are called  cores as they are not related to phsyical cores). We can now the number of cores with `sc.defaultParallelism`