+++
Description = ""
date = "2023-10-21T22:52:32Z"
title = "KSQL, a horror tale"
tags = ["Confluent", "Kafka",  "Ksql"]
+++

After spending several weeks working on a ksql solution to filter billions of events and determine their destination topic, I was disappointed to find that it did not live up to my expectations.

I had hoped for a more robust product that would align with our needs. Previously, we utilized a similar filter in Spark, incurring traffic costs for both Confluent and AWS. With kSQL, the advantage was that we could avoid paying for AWS traffic.

To summarize a tale of horror:
* The scalability of KSQL clusters proved to be a significant issue. Increasing CSUs required recreating the cluster, resulting in the loss of all created tables and streams.

* KSQL **always** needs written permission on the schema registry. All my queries used a predefined schema, so it didn't need it. Still, it's mandatory. If you fuck up the query it will overwrite the schema.

* You can't delete dependent streams in cascade. You must do this manually.

* All ksql queries/tables must be done by UI or API, I ended up with some scripts calling the API, and I don't like it.

* Debugging is hell.

It's well announced that now confluent is working in [flink](https://www.confluent.io/blog/introducing-flink-on-confluent-cloud/), so that may be a good go in the future. 
[Well, in fact, we can see that for the cloud it may make sense to move to Flink.](https://www.reddit.com/r/apachekafka/comments/16dgyrk/comment/jzvq2ld/?utm_source=share&utm_medium=web2x&context=3)


Overall, my preference still lies with Spark for this task, and my experience with ksql has been quite disappointing.

UPDATE Narch 2024: https://www.confluent.io/es-es/blog/serverless-flink-confluent-cloud-generally-available/