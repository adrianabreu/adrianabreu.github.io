+++
Description = ""
date = "2023-10-04T17:49:32Z"
title = "Implementing Confluent Wire Format In Scala"
tags = ["Confluent", "Avro", "Scala"]
+++

I've been working with Confluent for the last few months. I've been mainly configuring the Terraform project and querying the API for some kSQL setup and tuning. When we had ready our sandbox environment, I wanted to test the throughput. 

If you follow the [docs](https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/serdes-avro.html) is  straightforward, you need to use the serializer from the Confluent library. In fact if you use Spark you can use some nice wrapper as [ABRiS](https://github.com/AbsaOSS/ABRiS).

But I wanted to understand why I can't use the plain avro format and do no add like 60MB in dependencies from the confluent package. That leaded me to the [wire format](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/bindings/kafka-protocol-binding.md)

That implementation is quite straightforward, and here is the associate ScalaCLI code I've been using:

```
```