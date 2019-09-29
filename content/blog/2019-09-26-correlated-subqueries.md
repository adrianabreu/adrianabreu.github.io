+++
Description = ""
date = "2019-09-26T20:43:32Z"
title = "Correlated subqueries"
+++

Llevo un par de meses viendo como la mayoría de esfuerzos en el proyecto en el que estoy se centran en evitar los joins en las distintas capas de análisis. Aprovechando las capacidades de spark se busca tener las estructuras muy desnormalizadas y se había "endemoniado" al join considerarlo perjudicial.

Tanto es así que llevo un par de días peleando con una pieza de código que me ha sorprendido. Partiendo de una tabla de hechos que agrupa datos para un periodo a hasta b, se quiere que se "colapsen" los datos de hace 14 días. Será mejor con un ejemplo:

Si para la tabla actual tenemos los siguientes datos

| datekey     | sales  | profit |
| ----------- | ------ | ------ |
| 2019-09-01  | 12     | 38.10  |
| 2019-09-15  | 10     | 27.05  |
| 2019-09-29  | 5      | 16     |

Y aplicamos el cálculo obtendríamos:

<div class="table-responsive">
<table>
    <th>datekey</th><th> sales</th><th> profit</th><th>datekey_14_ago</th><th>sales_14_days_ago</th><th>profit_14_days_ago</th>
    <tr><td>2019-09-01</td><td>12</td><td>38.10</td><td>2019-08-18</td><td>null</td><td> null  </td></tr>
    <tr><td>2019-09-15</td><td>10</td><td>27.05</td><td>2019-09-01</td><td>12  </td><td> 38.10 </td></tr>
    <tr><td>2019-09-29</td><td>5 </td><td>16   </td><td>2019-09-15</td><td>10  </td><td> 27.05 </td></tr>
</table>
</div>

En un primer momento, el código que se usó para resolver el problema fue tal que este:


{{< highlight sql >}}
select *,
(select max(sales) from fact_table f where f.datekey = historic.datekey_14_ago) as sales_14_days_ago,
(select max(profit) from fact_table f where f.datekey = historic.datekey_14_ago) as profit_14_days_ago
from (
    select *,
    date_sub(cast(datekey  as date), 14) as datekey_14_ago
    from fact_table
) historic
{{< / highlight >}}

Esto me rompió absolutamente todos los esquemas. Algunos compañeros lo veían absolutamente normal y otros estaban igual que yo.
Investigando esta tarde encontré el nombre de este tipo de operación: [correlated subqueries](https://en.wikipedia.org/wiki/Correlated_subquery). 
Y aquí se explica muy bien, la consulta se evalua **para cada fila** del conjunto resultando y ya se apunta 
a que es una método que puede ser lento aunque yo estaba interesado en como Spark realizaba este cálculo.

Y me encontré con este pequeño plan de ejecución:
```
== Optimized Logical Plan ==
Project [datekey#1509, sales#1510L, profit#1511, datekey_14_ago#1572, max(sales)#1580L AS sales_14_days_ago#1574L, max(profit)#1582 AS profit_14_days_ago#1576]
+- Join LeftOuter, (cast(datekey#1509#1584 as date) = datekey_14_ago#1572)
   :- Project [datekey#1509, sales#1510L, profit#1511, datekey_14_ago#1572, max(sales)#1580L]
   :  +- Join LeftOuter, (cast(datekey#1509#1583 as date) = datekey_14_ago#1572)
   :     :- Project [datekey#1509, sales#1510L, profit#1511, date_sub(cast(datekey#1509 as date), 14) AS datekey_14_ago#1572]
   :     :  +- Relation[datekey#1509,sales#1510L,profit#1511] orc
   :     +- Aggregate [datekey#1509], [max(sales#1510L) AS max(sales)#1580L, datekey#1509 AS datekey#1509#1583]
   :        +- Project [datekey#1509, sales#1510L]
   :           +- Filter isnotnull(datekey#1509)
   :              +- Relation[datekey#1509,sales#1510L,profit#1511] orc
   +- Aggregate [datekey#1509], [max(profit#1511) AS max(profit)#1582, datekey#1509 AS datekey#1509#1584]
      +- Project [datekey#1509, profit#1511]
         +- Filter isnotnull(datekey#1509)
            +- Relation[datekey#1509,sales#1510L,profit#1511] orc
```

Y en el optimized logical plan al final lo que tenemos un **join por columna** y una **función de agrupacion por columna**. Como vemos que se usa la misma condición para unir vamos a reescribir la query con un join:

{{< highlight sql >}}
select historic.*,
f.sales as sales_14_days_ago,
f.profit as profit_14_days_ago
from (
    select *,
    date_sub(cast(datekey  as date), 14) as datekey_14_ago
    from fact_table
) historic
left join fact_table f
on historic.datekey_14_ago = f.datekey_14_ago
{{< / highlight >}}

Y esto nos devuelve el siguiente plan de ejecución:

```
== Optimized Logical Plan ==
Project [datekey#1509, sales#1510L, profit#1511, datekey_14_ago#1872, sales#1878L AS sales_14_days_ago#1873L, profit#1879 AS profit_14_days_ago#1874]
+- Join LeftOuter, (cast(datekey_14_ago#1872 as string) = datekey#1877)
   :- Project [datekey#1509, sales#1510L, profit#1511, date_sub(cast(datekey#1509 as date), 14) AS datekey_14_ago#1872]
   :  +- Relation[datekey#1509,sales#1510L,profit#1511] orc
   +- Filter isnotnull(datekey#1877)
      +- Relation[datekey#1877,sales#1878L,profit#1879] orc
```

Como vemos aquí solo se produce un único join y se evita todo tipo de funciones de agrupación que son realmente costosas obteniendo el mismo resultado.

En definitiva, las correlated subqueries acaban transformandose en joins y su rendimiento puede ser bastante inferior al de realizar la operación de join directamente.