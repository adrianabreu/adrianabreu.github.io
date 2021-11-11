+++
Description = ""
date = "2021-11-11T18:32:32Z"
title = "Multiplying rows in Spark"
tags = ["Analytics", "Spark"]
+++

Earlier this week I checked on a Pull Request that bothered me since I saw it from the first time. Let's say we work for a bank and we are going to give cash to our clients if they get some people to join our bank.

And we have an advertising campaign definition like this:

| campaign_id | inviter_cash | receiver_cash |
| ------------- | ------------ | -------------- |
| FakeBank001 | 50 | 30 |
| FakeBank002 | 40 | 20 |
| FakeBank003 | 30 | 20 | 

And then our BI teams defines the schema they want for their dashboards.

| campaign_id | type | cash |
| ----------- | ---- | ---- |
| FakeBank001 | inviter | 50 |
| FakeBank001 | receiver | 30 |
| FakeBank002 | inviter | 40 |
| FakeBank002 | receiver | 20 |
| FakeBank003 | inviter | 30 |
| FakeBank003 | receiver | 20 |

And well I saw a code that solved the problem.

```
campaignDf
.drop("receiver_cash")
.withColumn("type", lit("inviter"))
.withColumn("cash", col("inviter_cash"))
.drop("inviter_cash")
.union(
campaignDf
.drop("inviter_cash")
.withColumn("type", lit("receiver"))
.withColumn("cash", col("receiver_cash"))
.drop("receiver_cash")
)
```

Well it does what we want but if we don't cache this, Spark will compute the same dataframe twice and it will dupllicate efforts and perform poorly. And well, we're not doing anything quite special with any of them, so... Let's rewrite it.

We want to multiply our current rows, there is an operation that does it and that's the `explode`. 
So what we need is to add a column with and array thas has both values and explode it.

```campaignDf.withColumn("type", explode(array(lit("inviter"), lit("receiver"))))
```

So now we have duplicated our rows and have something like this:

| campaign_id | type | inviter_cash | receiver_cash |
| ----------- | ---- | ---- | --- |
| FakeBank001 | inviter | 50 | 30 |
| FakeBank001 | receiver | 40 | 30 |
| FakeBank002 | inviter | 40 | 20 |
| FakeBank002 | receiver | 40 | 20 |
| FakeBank003 | inviter | 30 | 20 |
| FakeBank003 | receiver | 30 | 20 |

Now what remains is quite straight forward, we just need to pick one column or another based on the the type we have and we will get with the desired result. 

```
campaignDf
.withColumn("cash", 
    when( col("type") === "Inviter", col("inviter_cash"))
	.when( col("type") === "Receiver", col("receiver_cash") )
).drop("inviter_cash", "receiver_cash")
```

And we end with the desired result, computed in one single operation without need for caching or anything like that.