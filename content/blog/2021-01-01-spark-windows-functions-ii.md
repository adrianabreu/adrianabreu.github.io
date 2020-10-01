+++
Description = ""
date = "2020-08-11T18:52:32Z"
title = "Spark windows functions (II)"
tags = ["Spark", "Analytics", "SQL"]
+++

En el post anterior pudimos utilizar las funciones de ventanas para realizar agregados de sumas sobre ventanas temporales. Ahora, me gustaría utilizar otro ejemplo de analítica: Comparar con datos previos.

Pongamos que queremos analizar las ventas de un producto en diversos periodos de tiempo. Es decir, nos interesa saber si ahora vende más o menos que antes. 

Para ello partiremos de una tabla de ventas:

| DateKey | ProductId | Sales |
| ------- | --------- | ----- |
| | | |

Ahora que tenemos esto nos interesaría agrupar para cada producto sus ventas 