+++
date = "2020-08-10T18:04:42Z"
title = "Sql Windows Functions"
+++

En análitica, es muy común hacer uso de las funciones de ventana para distintos cálculos. Hace poco me encontré con un pequeño problema cuya solución mejoró muchísimo al usar las funciones de ventana, demos un poco de contexto.

Tenemos una dimensión de usuarios donde los usuarios se van registrando con una fecha.
Tenemos una tabla de ventas donde tenemos las ventas globales para cada día.

Ilustro:

| Día | Ventas |
| --- | ------ |
| 1 | 2 |
| 2 | 3 | 
| 3 | 5 |

| Usuario | Día Registro |
| ------- | ------------ |
| Customer1 | 1 |
| Customer2 | 1 |
| Customer3 | 3 |

La idea final que queremos representar sería:

| Día | Ventas | RegistrosAcumulados |
| --- | ------ | ------------------- |
| 1 | 2 | 2 |
| 2 | 3 | 2 |
| 3 | 5 | 3 |

Para el problema intenté seguir una aproximación sencilla. Sin preocuparme del rendimiento, lo primero era conseguir que cada día de ventas contuviera sus períodos anteriores de tal forma que asi podria simplemente  agrupar por dia y sumar esos registros.

Seria tan facil como hacer un ventas inner join registros on dia >= dia registro.

De esta forma las filas se multiplicarían y tendriamos todos los registros. Mejor verlo, creo.

| Día | Ventas | Usuario | Día Registro |
| --- | ------ | ------- | ------------ |
| 1   |   2    | Customer1 | 1 |
| 1   |   2    | Customer2 | 1 |
| 2   |   3    | Customer1 | 1 |
| 2   |   3    | Customer2 | 1 |
| 3   |   5    | Customer1 | 1 |
| 3   |   5    | Customer2 | 1 |
| 3   |   5    | Customer3 | 3 |

Luego simplemente agrupando por dia y ventas y contando los usuarios, tendríamos el acumulado.

Pero esta solución, en este ejemplo ya pasariamos de dos tablas de 3 filas a una tabla intermedia de 7 filas con muchisima información duplicada. 

Para un día 4 de ventas ya serían 10 y sería creciendo de manera no lineal. 

Por eso, queríamos darle la vuelta y aplicar una solución mucho más elegante usando esta vez, funciones de ventana.

Volvamos a unir las dos tablas, pero estaba vez cada una con su dia correspondiente y permitiendo que hayan nulos, es decir: ventas left join registros on dia = dia registro.

Nos quedaría algo así:

| Día | Ventas | Usuario | Día Registro |
| --- | ------ | ------- | ------------ |
| 1   |   2    | Customer1 | 1 |
| 1   |   2    | Customer2 | 1 |
| 2   |   3    | null | null |
| 3   |   5    | Customer3 | 3 |

Ahora vamos a agrupar los datos por dias y vamos a sumar los registros especificando  una window function. ¿Qué nos interesa? Nos interesa el mismo efecto de antes, que para cada una de las filas nos devuelva la suma de las filas anteriores.

La sintaxis es muy simple: 

```
sum over()


