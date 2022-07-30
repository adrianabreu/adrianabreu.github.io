+++
Description = ""
date = "2022-07-30T13:52:32Z"
title = "Databricks Cluster Management"
tags = ["Spark","DataBricks","Data Engineer"]
+++

For the last few months, I've been into ETL optimization. Most of the changes were as dramatic as moving tables from ORC to delta revamping the partition strategy to some as simple as upgrading the runtime version to 10.4 so the ETL starts using low-shuffle merge. 

But at my job, we have a _lot_ of jobs. Each ETL can be easily launched at *30 with different parameters so I wanted to dig into the most effective strategy for it. 

For the sake of newcomers let's say that we as data engineers run a lot of ETLS processes. Those processes are executed on clusters which are a bunch of virtual machines where you run your spark code (there are standalone clusters for some purposes but let's keep it generic).

How are those created? Well, databricks has an API on their side that can create and manage resources on your Azure subscription. 

So when you come to databricks and start dealing with a notebook on a cluster you're using an **all-purpose cluster**. This type of cluster is persistent and can be restarted.

On the other hand, when you have your code ready and want to schedule it you can create a new **job cluster**, which is ephemeral and will be destroyed at the end of the execution. 

If we compared both they have different costs, an interactive cluster can cost as much as 3 times per dbu as a scheduled job (with the current data of azure databricks pricing: 0.40$  vs 0.15$).

When you launch a job you need some "warming up time" for the resources to be allocated and the machines to be configured and ready to start your processes. (On average 7 mins from my experience). Which multiplied by a lot of short-running can result in more time spent warming up than executing. We can configure a set of machines to be ready-to-use called a **pool**. Pools come with a cost from the virtual machine to be reserved but databricks do not apply charges on idle machines on the pool.

But databricks has this covered, in a pool, you configure the instance type, the name, and three parameters: min idle (the minimum instances that have to be always read on the pool), the max capacity (which establish a limit, and helps with core quotas and other limitations related) and "idle instance auto termination" which ensure that the machines will go off. 

If we are running a pipeline at night you can set your pool to have 0 idle instances and auto terminate the job after 15 minutes of idling. With this, your first job will take a bit but subsequent jobs will start sooner. Also when your jobs are finished they will go idle. 

When running jobs databricks provides autoscaling but is generally more useful on ad-hoc usage. (it is discouraged on streaming workloads. 

## Choosing the right cluster

Despite the different types of machines, you can find (compute-optimized, memory-optimized, general purpose...) My typical review process includes going through the ganglia UI metrics and checking for:

* Is the whole CPU being used? We will need more cores
* Are we using all the memory? Check the amount of spill, if that, changes to memory optimized instances. 
* Do we have a lot of networking? Fewer bugs bigger instances. 

## Making cluster configuration easier

We can establish a cluster policy for preconfiguring clusters settings (like credentials for the metastore or the lake configuration) as well as establish maximums in the clusters thus preventing huge clusters to be created. 

Also, it allows you to set up clusters tags that are propagated to the virtual so you can monitor team costs later.

Also, it can help in something really important, avoiding newcomers to run production jobs on non-standard databricks versions (like relying on a non its version) or running their jobs against all-purpose clusters incurring higher costs. 


## Capacity limits

This brings me some memories of resource exhaustion and our subscription going down for a few days. We moved to pools soon after and never experience such a problem again :)

You can run 1000 jobs at the same time on a workspace, and you can create as many as 5000 jobs per hour in a workspace. 

On resource allocation, you can just get 100 VM per minute, and reserve as much as 1800. There is an inner limitation related to the azure provider which works per subscription so, dividing into databricks workspaces won't work. 

## Billing

This topic is one of those that may discourage some people to change to databricks. Despite the cost of the machine, you will have an overhead cost of "Dataricks Unit" (DBU). Also, there are some costs in infra besides just the machine: disks, storage, network, ips... And so on.

The good part is that you can tag all your machines. When you create a workspace their tags will be propagated to all the resources so you will be able to monitor it easily through the Azure costs portal. 

You can also add specific tags (bear in mind that if you want to see the cost of a job databricks has a tag called run name that allows it!)

For monitoring and measuring it effectively the most simple division is to create one workspace per team/product so you can monitor the cost with the defined tags. 