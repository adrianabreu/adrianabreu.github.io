+++
Description = ""
date = "2023-10-02T13:25:32Z"
title = "Repairing metadata unity catalog"
tags = ["Databricks", "Delta", "Unity Catalog"]
+++

I've been subscribed to https://www.dataengineeringweekly.com/p/data-engineering-weekly-148 for years. This last number included several on-call posts on Medium.  I found these quite useful. 

Today, I got an alert from Metaplane that a cost monitor dashboard was out of date. I checked the processes, and everything was fine. I ran a query to check the freshness of the data and it was ok too.

Metaplane checks our delta table freshness by querying the table information available in the Unity Catalog. For some unknown reason that metadata didn't receive any update. I ran an optimization operation (the table tiny) and the metadata didn't update either.

I was looking for some "refresh metadata" alike and found this command: 
```MSCK REPAIR TABLE MY_TABLE SYNC METADATA```.

As stated in the [docs](https://docs.databricks.com/en/sql/language-manual/sql-ref-syntax-ddl-repair-table.html#example-unity-catalog-table) that table did update the metadata and the alert went away. I couldn't identify the root cause of the metadata not being updated, but at least the on call got solved :) 
