+++
Description = ""
date = "2019-05-17T22:43:32Z"
title = "Depurando queries en hive"
+++

En la última he podido ver qué pasa cuando el volumen de datos aumenta de forma exponencial, una query que funcionaba en un tiempo razonable para un volumen considerable ha empezado a fallar a pesar de los reintentos. 

¿El origen? 

```
Status: Failed 19/05/21 01:05:30 [main]: ERROR SessionState: Status: Failed Vertex failed, vertexName=Map 10, vertexId=vertex_1558386441915_0035_1_01, diagnostics=[Task failed, taskId=task_1558386441915_0035_1_01_000002, diagnostics=[TaskAttempt 0 failed, info=[Error: Failure while running task:java.lang.RuntimeException: java.lang.OutOfMemoryError: Java heap space 
```

Esto se traduce en que uno de los vértices, ha tenido que mover demasiados datos y hemos acabado sin memoria. 

Tras hacer muchas pruebas, revisar el plan de ejecución (a través del Dag View, usando el `EXPLAIN EXTENDED`), etcétera. 
He acabado delante de una frase muy genérica: “Tienes que comprender tus datos”. 

Aunque en un principio parece la portada de un folleto barato de autoestima, es realmente acertado. ¿Por qué? Tenemos que revisar dos partes: El data skew, y como hace hive los joins. 

## Data skewness: 

Cuando trabajamos con datos, lo que esperamos es que se distribuyan siguiendo la forma de una función normal, una campana de Gauss.  

{{< resp-image "/images/gaussbell.png" >}}

Sin embargo, el término de data skewness hace referencia a cuando los datos tienen “una cola”. En vez de estar en una media normal hay un cúmulo de datos a la izquierda o a la derecha. 

{{< resp-image "/images/skew.png" >}}

Este concepto se puede encontrar formalmente en la estadística, para más información podéis revisar [https://www.investopedia.com/terms/s/skewness.asp](aquí). 

## Como hive hace los joins 

Es importante tener claro como hive hace las joins al trabajar con datos.

Pongamos que queremos unir dos tablas A y B.

`SELECT a.ID FROM A INNER JOIN B ON A.ID = B.ID`

Lo que va psará es que las filas se distribuirán a lo largo de los reducers. Todas las id1 irán a un reducer, las id2 a otro, las id3  a otro etcétera.


## Uniendo conceptos 

Pongamos que tenemos un sistema de datawarehouse para el sector del retail. Donde un usuario registrado puede identificarse en caja para conseguir descuentos.  

Si intentamos unir el volumen de tickets con los usuarios, ¿qué pasará? 

``` 
SELECT * 
FROM dbo.tickets t 
LEFT JOIN usuarios u
ON t.userid = u.id 
``` 

Si la tabla de usuarios es lo suficientemente grande, hive no hará un map join sino un join normal, que distribuirá a lo largo de n tareas. 

¿Qué pasaría según lo que hemos dicho antes? 

A la hora de ordenar, estamos ante un caso de data skew. 

Un usuario medio tendrá n compras, y con excepciones estará a una distancia relativamente cercana de la media. 

Sin embargo, a menos de que el sistema sea un éxito, lo más probable es que el número de tickets con userid a nulo sea enorme y estos acaben todos en la misma tarea, desembocando en un outofmemory. 

## Solución 

¿Ahora que tenemos el problema, como solucionamos esto? 

La solución es realmente sencilla si conocemos nuestros datos, basta con unir solo la parte que nos interesa. 

``` 
SELECT *  

FROM ( 

    SELECT * 
    FROM dbo.tickets t 
    LEFT JOIN usuarios u 
    ON t.userid is not null AND t.userid = u.id 

UNION ALL 

    SELECT * 
    FROM dbo.tickets t 
    WHERE t.userid IS NULL 
) p
``` 
Con este simple union forzamos  que los tickets con id a nulo se distribuyan a lo largo de otro reducer (puesto que tiene que crear uno para aplicar el filtro) y el join con usuario quede normalizado a lo largo del volumen. 