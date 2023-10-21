+++
Description = ""
date = "2023-10-21T22:52:32Z"
title = "KSQL, a horror tale"
tags = ["Confluent", "Kafka",  "Ksql"]
+++

I've been working in the past weeks on a ksql solution that would filter billions of events and decide where they should land in one topic or another.
Sadly, it didn't meet my expectations. I thought it was a much more robust product that would fit our scenario. We were doing a similar filter in Spark, where we were paying traffic costs for both Confluent and AWS. So with kSQL at least we wouldn't pay for our AWS traffic.
To summarize a tale of horror:
KSQL clusters can't scale. If you need more CSUs, you need to recreate the cluster, meaning that you will lose all the tables and streams created.
KSQL always needs written permission on the schema registry. All my queries used a predefined schema, so it didn't need it. Still, it's mandatory. If you fuck up the query it will overwrite the schema.
You can't delete dependent streams in cascade. You must do this manually.
All ksql queries/tables must be done by UI or API, I ended up with some scripts calling the API, and I don't like it.
Debugging is hell.
It's well announced that now confluent is working in [flink](https://www.confluent.io/blog/introducing-flink-on-confluent-cloud/), so that may be a good go in the future. 
[Well, in fact, we can see that for the cloud it may make sense to move to Flink.](https://www.reddit.com/r/apachekafka/comments/16dgyrk/comment/jzvq2ld/?utm_source=share&utm_medium=web2x&context=3)

Anyway, I just preferred Spark for this and I found the overall experience quite disappointing. 