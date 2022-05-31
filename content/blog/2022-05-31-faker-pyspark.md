+++
Description = ""
date = "2022-05-31T09:28:32Z"
title = "Faker with PySpark"
tags = ["PySpark"]
+++

I’m preparing a small blog post about some tweakings I’ve done for a delta table, but I want to dig into the Spark UI differences before this. As this was done as part of my work I’m reproducing the problem with some generated data. 

I didn’t know about [Faker](https://faker.readthedocs.io/en/master/) and _boy_ it is really simple and easy. 

In this case, I want to generate a small dataset for a dimension product table including its id, category and price.

So I installed the faker library in the Databricks community cluster and started to dig into it. The docs are quite straightforward. I’m starting with the instance and the basic fields like the id.

```python
from faker import Faker
fake = Faker()
Faker.seed(0)

fake.uuid4()
```

For the product categories I want to use a small set of categories so  I need a custom provider:

```python
from faker.providers import DynamicProvider

product_categories = DynamicProvider(
     provider_name="product_categories",
     elements=["Cleaning", "Food", "Misc", "Drink", "Alcoholic"],
)
fake.add_provider(product_categories)

fake.product_categories()
```

And for the price we can just use a pydecimal.

```python
fake.pydecimal(right_digits=2, positive=True, min_value=1, max_value=20)
```

So, we can now generate a small dataset:

```python
data = []
for i in range(100):
  data.append((fake.uuid4(), fake.product_categories(), fake.pydecimal(right_digits=2, positive=True, min_value=1, max_value=20)))

from pyspark.sql.types import StructType, StructField, StringType, DecimalType
schema = StructType([
  StructField("id", StringType()),
  StructField("category", StringType()),
  StructField("price", DecimalType(8,2))
])
```

```python
df = spark.createDataFrame(data, schema)
display(df)
```

Aaaand

```python
+--------------------+---------+-----+
|                  id| category|price|
+--------------------+---------+-----+
|a358cb1d-be3f-4af...|     Food| 8.94|
|de6c8762-b475-415...|Alcoholic|10.56|
|b261d0d2-a1c2-49b...|Alcoholic|18.69|
|b440ffe0-4137-40e...|    Drink| 7.54|
|29b10823-0d74-425...|     Misc| 1.40|
...
```

It's really easy to use and I hope to dig a bit more into it in the future.

If we wanted to add some column to an existing dataframe we could just use and **udf**.