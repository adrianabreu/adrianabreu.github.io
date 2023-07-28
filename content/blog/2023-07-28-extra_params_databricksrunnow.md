+++
Description = ""
date = "2023-07-28T16:00:32Z"
title = "Adding extra params on DatabricksRunNowOperator"
tags = ["Databricks", "Workflows", "Airflow"]
+++

With the [new Databricks jobs API 2.1](https://docs.databricks.com/api/workspace/jobs/runnow) you have different params depending on the kind of tasks you have in your workflow. Like: jar_params, sql_params, python_params, notebook_params... 

And not always the airflow operator is ready for handle all of the. If we check the [current release of the DatabricksRunNowOperator](https://airflow.apache.org/docs/apache-airflow-providers-databricks/stable/operators/run_now.html), we can see that there is only support for:
notebook_params
python_params
python_named_parameters
jar_params
spark_submit_params
And not the query_params mentioned earlier. But there is a way of comibing both, there is a param called _json_ that allows you to write the payload of a databricksrunnow and it will also merge the content of the json with your named_params!

So if we have a job_runthat has both a query and a jar, we can:
```
    json = {
        "sql_params": {
            "date": "2023-07-28",
            "days_back": "30"
        }
    }

    notebook_run = DatabricksRunNowOperator(
        job_id = 42,
		task_id='notebook_run',
 		json=json,
        jar_params = ["douglas adams", "42"]
	)

```

This [was well documented on the source code of the operator](https://github.com/apache/airflow/blob/main/airflow/providers/databricks/operators/databricks.py#L437). Still, I think that this post can help people find it faster :) 