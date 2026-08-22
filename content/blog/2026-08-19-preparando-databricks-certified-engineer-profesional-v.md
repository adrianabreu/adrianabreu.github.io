+++
Description = "Preparando databricks certified engineer professional (IV)"
date = "2026-08-18T15:13:00Z"
title = "Preparando databricks certified engineer professional (IV)"
tags = ["data engineering", "databricks"]
+++

Seguimos repasando y estudiando, ha habido drama con Snowflake, asi que tengo más motivación. 


## Section 3: Data Transformation, Cleansing, and Quality
# Write efficient Spark SQL and PySpark code to apply advanced data transformations, including window functions, joins, and aggregations, to manipulate and analyze large Datasets.

Aquí voy a hablar de las reglas de oro:
a) Lee lo mínimo indispensable. Si hay particiones, úsalas, si no necesitas una columna, no la leas.
b) Rompe el plan una vez. Hubo un tiempo que vi abusacar del `.cache()`. La realidad es que partir las ejecuciones rara vez era mejor. Mucho más fiable confiar en el disk caché. 
c) Esto es programación funcional, componer es ganar. 
d) Ordena solo si lo necesitas, que no es gratis, leñe, que tiras un shuffle. 

Aprovecho para hablar de un código manual algo curioso que es cuando tenemos que unir unos datos que están muy desbalanceados (skewed). Hay una técnica llamada salting que lo que hace es "encajar" en n buckets conocidos los datos para que esten  uniformemente distribuidos.
```python
events = spark.createDataFrame([
    (1, "bot_user_123", "click", "2024-01-01"),
    (1000001, "regular_user_2", "view", "2024-01-01"),
], ["event_id", "user_id", "event_type", "event_date"])

users = spark.createDataFrame([
    ("bot_user_123", "Bot Account", "bot@example.com"),
    ("regular_user_1", "Alice", "alice@example.com"),
    ("regular_user_2", "Bob", "bob@example.com"),
], ["user_id", "user_name", "email"])

SALT_RANGE = 10 
events_salted = events.withColumn(
    "salt",
    floor(rand() * SALT_RANGE).cast("int")
)
salt_values = array([lit(i) for i in range(SALT_RANGE)])
users_exploded = users.withColumn("salt", explode(salt_values))

result = events_salted.join(
    users_exploded,
    on=["user_id", "salt"],  
    how="inner"
)
```

Con esto nos aseguramos que los datos se distribuyen uniformemente. 


# Develop a quarantining process for bad data with Lakeflow Spark Declarative Pipelines, or autoloader in classic jobs.

Esto ya databricks da todo el material, somos meros hijos de tu trabajo. Aunque yo lo hacía mano con tablas `_failed`. 

![](https://docs.databricks.com/aws/en/assets/images/quarantine-flow-graph-76ab9bb57b6c26c3c5334b4193051d0f.png)

Me he copiado el ejemplo, es chulísimo. 

```python
from pyspark import pipelines as dp
from pyspark.sql.functions import expr

rules = {
  "valid_pickup_zip": "(pickup_zip IS NOT NULL)",
  "valid_dropoff_zip": "(dropoff_zip IS NOT NULL)",
}
quarantine_rules = "NOT({0})".format(" AND ".join(rules.values()))

@dp.view
def raw_trips_data():
  return spark.readStream.table("samples.nyctaxi.trips")

@dp.table(
  temporary=True,
  partition_cols=["is_quarantined"],
)
@dp.expect_all(rules)
def trips_data_quarantine():
  return (
    spark.readStream.table("raw_trips_data").withColumn("is_quarantined", expr(quarantine_rules))
  )

@dp.view
def valid_trips_data():
  return spark.read.table("trips_data_quarantine").filter("is_quarantined=false")

@dp.view
def invalid_trips_data():
  return spark.read.table("trips_data_quarantine").filter("is_quarantined=true")
```

Aquí vemos que hay unas "expectations" que son reglas de calidad que se validan sobre los datos. 

![](https://docs.databricks.com/aws/en/assets/images/expectations-flow-graph-02ab5dd2011b18ad791c67c0e8449af6.png)

A cada expectation le tenemos que dar un nombre y tiene que ser un codigo sql

```sql
CREATE OR REFRESH STREAMING TABLE customers(
  CONSTRAINT valid_customer_age EXPECT (age BETWEEN 0 AND 120)
) AS SELECT * FROM STREAM(datasets.samples.raw_customers);
```

Sobre un registor que no satisfaga la condición podemos hacer varias cosas dependiendo del método que elijamos:
* warn (expect): se escribe en el target y se avisa en métrica. 
* drop (expect_or_drop): no se escribe el registro pero se cuenta cuantos registros se dropean.
* fail (expect_or_fail): falla el pipeline. 


Los registros dropeados o con warning se pueden ver a través de la event_log table function, pero hablaremos de eso en el siguiente post. Los objetos a revisar son: `details:flow_progress.data_quality.expectations` y `details:flow_progress.data_quality`.


Se pueden agrupar varias reglas en python con las funciones `expect_all, expect_all_or_drop, and expect_all_or_fail`:

```python
valid_pages = {"valid_count": "count > 0", "valid_current_page": "current_page_id IS NOT NULL AND current_page_title IS NOT NULL"}

@dp.table
@dp.expect_all(valid_pages)
def raw_data():
  # Create a raw dataset

@dp.table
@dp.expect_all_or_drop(valid_pages)
def prepared_data():
  # Create a cleaned and prepared dataset

@dp.table
@dp.expect_all_or_fail(valid_pages)
def customer_facing_data():
  # Create cleaned and prepared to share the dataset
```