+++
Description = ""
date = "2023-10-27T12:06:32Z"
title = "Tweaking Spark Kafka"
tags = ["Spark", "Databricks", "Structured Streaming"]
+++

Well, I'm facing a huge interesting case. I'm working at Wallbox where we need to deal with billions of rows every day. Now we need to use Spark for some Kafka filtering and publish the results into different topics according to some rules.  

I won't dig deep into the logic except for performance-related stuff, let's try to increase the processing speed.

When reading from Kafka you usually get 1 task per partition, so if you have 6 partitions and 48 cores you are not using 87.5 percent of your cluster. That could be adjusted with the following property `**minPartitions`.**

So we need to set up a multiple of the number of cores we have, lets say that we start with 12 cores and our maximum autoscale is 32 cores. Then we will look for the LCM, setting up 96 tasks.  (By the way databricks doesn't recommend using autoscaling on spark streaming jobs, only with delta tables where they provide enhanced autoscaling)

Now what are we interesting is to set up a proper processing pace. If we had a trigger of 5 seconds, all our batches should took at most 5 seconds, or we will be end up lagging behind.

{{< resp-image "/images/batch_times.png" >}}

How can we ensure that we keep a good pace with our batches? By limiting the amount of offsets we process. That's done with another property! `maxOffsetsPerTrigger`. We need to look for a number (that will be shared between all partitions) that allows us to process more data that we need on a normal basis but still keep the batch duration under the proper amount.

This parameter needs a lot of manual adjustment, I look for the cluster metrics, look for the offsets increase, and get a small multiple of it.  For example, let's see this query:

```
 Streaming query made progress: {
  "id" : "c3c6fc01-8d20-432e-92e4-74e81ee0cccf",
  "runId" : "b5dfb5f6-3b7a-47dd-b885-10e4473059b6",
  "name" : "kafka-stream-writer",
  "timestamp" : "2023-10-27T12:52:00.000Z",
  "batchId" : 19854,
  "numInputRows" : 286286,
  "inputRowsPerSecond" : 57257.2,
  "processedRowsPerSecond" : 76180.41511442256,
  "durationMs" : {
    "addBatch" : 3583,
    "commitOffsets" : 83,
    "getBatch" : 0,
    "latestOffset" : 20,
    "queryPlanning" : 4,
    "triggerExecution" : 3758,
    "walCommit" : 67
  },
  "stateOperators" : [ ],
  "sources" : [ {
    "description" : "KafkaV2[Subscribe[topic_name]]",
    "startOffset" : {
      "topic_name" : {
        "2" : 203220825774,
        "5" : 203220898873,
        "4" : 203221313129,
        "1" : 203220708969,
        "3" : 203220862337,
        "0" : 203220836346
      }
    },
    "endOffset" : {
      "topic_name" : {
        "2" : 203220873492,
        "5" : 203220946581,
        "4" : 203221360840,
        "1" : 203220756688,
        "3" : 203220910053,
        "0" : 203220884060
      }
    },
    "latestOffset" : {
      "topic_name" : {
        "2" : 203220873492,
        "5" : 203220946581,
        "4" : 203221360840,
        "1" : 203220756688,
        "3" : 203220910053,
        "0" : 203220884060
      }
    },
    "numInputRows" : 286286,
    "inputRowsPerSecond" : 57257.2,
    "processedRowsPerSecond" : 76180.41511442256,
    "metrics" : {
      "avgOffsetsBehindLatest" : "0.0",
      "estimatedTotalBytesBehindLatest" : "0.0",
      "maxOffsetsBehindLatest" : "0",
      "minOffsetsBehindLatest" : "0"
    }
  } ],
  "sink" : {
    "description" : "ForeachBatchSink",
    "numOutputRows" : -1
  }
```

I would grab and end offsets - start offsets, sum them, and get a small multiple of it. Then I'll try to reprocess it as much as possible.

There more resources about it, I specially suggest watching this adobe video from the last summit: https://www.youtube.com/watch?v=5RppAH780DM