+++
Description = ""
date = "2024-01-26T09:06:32Z"
title = "Querying the databricks api"
tags = ["Spark", "Databricks", "Python"]
+++

Exploring databricks SQL usage

At my company, we adopted databricks SQL for most of our users. Some users have developed applications that use the JDBC connector, some users have built their dashboards, and some users write plain ad-hoc queries.

We wanted to know what they queried, so we tried to use Unity Catalog's insights, but it wasn't enough for our case. We work with IOT and we are interested in what filters they apply within our tables.

So we decided to build a table in our system that used the [query history API](https://docs.databricks.com/api/workspace/queryhistory/list)

With the following Python script, you can write your query results to a table and then analyze the content of your queries. For example, I'm using regex to get the filters related to a specific column:

```python
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
import json
import requests
from pyspark.sql.functions import from_unixtime, col, date_format

start_date = dbutils.widgets.get("start")
end_date = dbutils.widgets.get("end") 

if (start_date == None or start_date == ''):
    start_date = (datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=-1)).strftime('%Y-%m-%d')

HOST = 
TOKEN = dbutils.secrets.get('data_engineer', 'adrian_token')
warehouse = ["XXXX"] # warehouses to include

def list_queries(sess, params):
    queries = []
    has_next_page = True
    while has_next_page:
        resp = sess.get(HOST + "/api/2.0/sql/history/queries", json=params).json()
        queries = queries + resp["res"]
        has_next_page = resp.get("has_next_page", False)
        params["page_token"] = resp.get("next_page_token")
    return queries


def main():
    sess = requests.Session()
    headers = {
    "Authorization": "Bearer {}".format(TOKEN)
    }
    sess.headers.update(headers)
    params = {
        "filter_by": {
            "query_start_time_range": {
                "start_time_ms": int(datetime.strptime(start_date, '%Y-%m-%d').timestamp() * 1000),
                "end_time_ms": int(datetime.strptime(end_date, '%Y-%m-%d').timestamp() * 1000)
            },
            "warehouse_ids": warehouse,
            "statuses": ["FINISHED"]
        },
        "max_results": "1000"
    }
    queries = list_queries(sess, params)
    return queries

queries = main()

df = spark.createDataFrame(queries).withColumn("query_date", date_format(from_unixtime(col('query_start_time_ms')/1000.0), 'yyyy-MM-dd'))

df.write\
.mode("overwrite")\
.option("replaceWhere", f"query_date >= '{start_date}' AND query_date < '{end_date}'")\
.save("path/query_history")
```

Then we can query stuff like and get insights!

```sql
select user_name, rows_produced, array_distinct(regexp_extract_all(query_text, "\'(\\w+(?:_\\w+\%*){1,2}+)\'+", 1)) as devices_names, query_text
 from query_history
where statement_type = 'SELECT' and query_text like '%device%' and query_text like '%from gold.devices_v1%'
```