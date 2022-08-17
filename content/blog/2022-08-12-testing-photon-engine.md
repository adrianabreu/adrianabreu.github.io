+++
Description = ""
date = "2022-08-12T09:52:32Z"
title = "Testing Databricks Photon"
tags = ["Spark", "Databricks", "Photon", "Data Engineer"]
+++

I was a bit skeptical about photon since I realized that it cost about double the amount of DBU, required specifically optimized machines and did not support UDFs (it was my main target).

From the Databricks Official Docs:

# **Limitations**

- Does not support Spark Structured Streaming.
- Does not support UDFs.
- Does not support RDD APIs.
- Not expected to improve short-running queries (<2 seconds), for example, queries against small amounts of data.

[Photon runtime](https://docs.databricks.com/runtime/photon.html)

But I needed to create an aggregate of the user behavior in my work’s app dealing with hundreds of millions of rows and decided to give it a try.

I did a calculation for the last two months. The machine used was memory optimizing for being able to run photons on top of it.

4 Workers 256 GB Memory 32 Cores
1 Driver 64 GB Memory, 8 Cores
Runtime 10.4.x-scala2.12

| Run | Time |
| --- | --- |
| July | 11m 50s |
| June | 12m 12s |

With a cost of 20 DBU/h (**$0.10 /** DBU is the price por premium jobs workloads)

I did a launch for 3 months. The process is extremely simple, read some partitions, filter on some value, group by and count. About the volume, 1 month of data has this amount of rows

| number of output batches | 2,774,302 |
| --- | --- |
| cumulative time total (min, med, max) | 41.3 m (685 ms, 962 ms, 7.0 s) |
| rows output | 11,200,056,905 |

And it is aggregated as:

| num batches aggregated in sparse mode | 898,423 |
| --- | --- |
| rows output | 1,243,774,432 |


I didn’t feel happy about this, twice the cost, and forced me to use a kind of machine that didn’t appeal to me as necessary. Maybe it wasn’t enough data. So I did a 3-month calculation with photons and without.

| Run | Time | Photon |
| --- | --- | --- |
| December-October | 23m 53s | YES |
| September - June |  | NO |

Damn, that was unexpected. The computation time didn’t increase that much for Photon and went wild on non-photon workload. We are talking about 3x speed as they stated in their slogan. We are talking about (24 / 60) hour * 20 DBU / hour * 0.15 $/DBU =  1.2$ vs (86 / 60) hour * 10 DBU / hour * 0,15$/DBU = 2.15$

Well as far as I can tell photon works smoothly but only under a heavy workload. I’d mainly use it for specific KPIs or repopulate tables after changes, but it will be the defacto for those tasks.

Maybe others have a much better experience with it!