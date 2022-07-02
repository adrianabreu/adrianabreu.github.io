+++
Description = ""
date = "2022-07-01T07:28:32Z"
title = "Reading firebase data"
tags = ["Spark","DataBricks","Firebase","BigQuery"]
+++

Firebase is a common component nowadays for most mobile apps. And it can provide some useful insights, for example in my previous company we use it to detect where the people left at the initial app wizard. (We could measure it).

It is quite simple to export your data to BigQuery: https://firebase.google.com/docs/projects/bigquery-export

But maybe your lake is in AWS or Azure. In the next lines, I will try to explain how to load the data in your lake and some improvements we have applied.

# Spark - Big Query Connector

We are loading the data using Spark on Databricks. There is a library for reading the data directly from BigQuery: https://cloud.google.com/dataproc/docs/tutorials/bigquery-connector-spark-example

But we do not need to install anything! Since runtime 7.1 the connector is already included for us (with some tweaks): https://databricks.com/blog/2020/07/31/announcing-support-for-google-bigquery-in-databricks-runtime-7-1.html

In the library docs, the parameters are well documented, the project, the table, etc. 

# Intraday vs Consolidated Tables 

Our initial exported data will go to a big query table, those tables are prefixed with **events_** but, for the initial data that table won't be available and we should go against **events_intraday_**. 

I prefer to extract the metadata from both tables and ensure that the events tables have the proper information (remember that firebase has a 72h period where the table can be modified). And reflect the source table in a table field like *is_intraday*, so the users know where the data came from.

# Shifted hours 

If you parse the timestamp of the rows you will find that for a given day there are two shifter hours from the day before, like:

| hours | day |
| ----- | --- |
| 0 - 22 |  n |
| 23 - 0 | n - 1 |

So when we load data from one day we should modify at least two partitions, the one for the given day and the one from the previous one. 

# Delta comes to the rescue!

Usually, our mobile events tend to be the biggest entity. For example in the project I'm working on now I'm on the magnitude of billions of events per day and we're talking about 3 hours every day to load the data and publish it. 

To improve the load we revamp the process to load the data into delta directly. We generated a table modeling the big query schema, and added the following fields:

| field_name | type |
| ---------- | ---- |
| is_intraday | boolean |
| p_date_key | string | 
| p_shifted | integer |
| p_event_name | string |

So, now let's write a simple process. Today is the 1st of July and we want to load the data from yesterday.
We should query both tables:

```scala
import com.google.cloud.spark.bigquery.repackaged.com.google.cloud.bigquery.{BigQuery, Table}

  def chooseTable(events: Try[Table], intraday: Try[Table]): Option[Table] = {
    (events, intraday) match {
      case (Failure(_), Success(intraday))  => Some(intraday))
      case (Success(daily), Failure(_))     => Some(daily))
      case (Success(daily), Success(intraday)) if intraday.getNumRows.longValue() > daily.getNumRows.longValue()  => Some(intraday))
      case (Success(daily), Success(intraday)) if intraday.getNumRows.longValue() <= daily.getNumRows.longValue()  => Some(daily))
      case _       => Option.empty[Table]
    }
  }
```

And probably we will extract the data from the intraday, so we will end with (event_names are omitted since they would be a lot).

| is_intraday | p_date_key | p_shifted | p_event_name |
| ----------- | ---------- | --------- | ------------ |
| true        | 2022-06-30 | 0 | ... |
| true        | 2022-06-29 | 1 | ... |

On day 3rd of July, we should have the events table ready, so we will load:

| is_intraday | p_date_key | p_shifted | p_event_name |
| ----------- | ---------- | --------- | ------------ |
| false        | 2022-06-30 | 0 | ... |
| false        | 2022-06-29 | 1 | ... |

Since we want to overwrite that specific part of p_date_key and p_shifted, ignoring the event_names underneath (as there may be events that were already in the intraday table but not in the consolidated one), we can use the [`replaceWhere` statement](https://docs.databricks.com/delta/delta-batch.html#overwrite), with this we can merge the delete and write operation in one.
