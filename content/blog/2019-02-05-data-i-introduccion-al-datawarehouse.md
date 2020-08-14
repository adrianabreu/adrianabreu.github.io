+++
Description = ""
date = "2019-02-05T14:43:32Z"
title = "Datos I - Introducción al Datawarehousing"
tags = ["Analytics", "SQL"]
+++

En los últimos meses mi trabajo ha pivotado del mundo de la web al mundo de los datos. He entrado a participar en un proyecto de Data Warehouse y he acabado muy contento en él. Hace unos días mi cambio se oficializó completamente y ahora me he dado cuenta de que no solo tengo un mundo técnico ante mí, sino que además necesito consolidar algunas bases teóricas.

Investigando la bibliografía, me han recomendado en Reddit: *The Data Warehouse Toolkit, The Complete Guide to Dimensional Modeling 2nd Edition.*
Y el libro parece encajar perfectamente en el conocimiento que busco. Aun así, como todo, por necesidad, intentaré resumir en unas cuantas entradas el conocimiento que se puede obtener de este libro. El cual recomiendo encarecidamente.

## Representación de la información

Existen varias formas de visualizar la información. Pero nos vamos a centrar en dos partes relacionadas con el negocio:

1. Desde un punto de vista **operacional** nos encontramos con una información disgregada, preparada normalmente en un modelo relacional que elimina redundancias y que se centra en gestionar una o pocas filas de tablas. 
2. Otra perspectiva sería desde un punto de vista **analítico**, donde nos interesa trabajar con agrupaciones y grandes volúmenes de datos.

Para traducir este primer mundo al segundo, podemos hacer uso de un Data Warehouse. El objetivo del Data Warehouse es hacer que la información de la empresa sea fácilmente accesible, consistente y permitir que esta información aporte el valor al negocio, haciéndola versátil y adaptada a las decisiones.

## Componentes del Data Warehouse:

### Operational Source Systems:
Estos son los sistemas que capturan las transacciones del negocio. Están fuera de los límites de gestión del Data Warehouse porque es posible que tengamos escaso o ningún control sobre estos sistemas. Estos sistemas están preparados para tener alto rendimiento y disponibilidad, suelen almacenar poco histórico y un buen *Data Warehouse* no dependería de ellos para representar el pasado.

### Data Staging Area:
Esta zona sirve tanto de almacenamiento como de *host* para un conjunto de procesos denominados comúnmente **ETL (extract-transformation-load).**

Un buen símil que hace aquí es que debería ser como la cocina de un restaurante, transforma el producto crudo en comida preparada para el usuario y además no se debe dejar al usuario final entrar aquí por la cantidad de peligros (fuegos, cuchillos) que podrían hacerle daño.

En los procesos de etl la parte de extracción consiste en __leer los datos del origen, comprenderlos, y traer la información necesaria al área de staging de datawarehouse__ para manipularlas.

Estos datos deben ser limpiados (quizás haya que corregir fallos de nombres, arreglar datos, rellenar datos perdidos). En un conjunto de procesos que se denominan transformación.

El resultado de esta transformación puede estar en tablas, pero no tiene por qué. No hace falta que haya una tecnología relacional, pueden ser simplemente conjuntos de archivos. De hecho, es un error intentar normalizar los datos si no lo están porque requieren una gran inversión de esfuerzo que debería usarse en el área de presentación.

Por último, hay que cargar estos datos en las tablas dimensionales de cada data mart (en el siguiente apartado se explica lo que es un data mart).

### Data Presentation:
En esta zona los datos se organizan, se almacenan y se hacen accesibles los usuarios para que los consulten, escriban informes o accedan aplicaciones de análisis.

Normalmente nos referimos a la zona de presentación como una serie de data marts. Un data mart representa los datos de un proceso del negocio.

Los datos en esta zona deben estar en esquemas dimensionales. Ahora explicaremos en que consiste esto.

## Conceptos adicionales:

### Metadata:
Los metadatos son toda la información del entorno de *Data Warehouse* que no son los datos en sí mismos. Aparecen en diversas formas y tienen que encajar en la estructura del *Data Warehouse*. El objetivo no es más que integrar y catalogar todas estas variedades de metadatos como si se tratase de una librería.

### Operational Data Store:

Este concepto hace referencia a un proceso especializado en hacer reportes relacionados campo operacional. Suelen ser un conjunto de consultas predefinidas en aplicaciones de reporte y se suelen utilizar en decisiones tácticas.

A veces este sistema se alimenta de la información del *Data Warehouse* para hacer algún tipo de consulta. En cualquier caso, se puede considerar a este sistema como un tercer sistema físico entre los sistemas operacionales y el *Data Warehouse*.

## Vocabulario del modelado dimensional:

Se trata de una técnica utilizada en los 70 para representar la información. La idea no está tanto en eliminar la redundancia de información como simplificar la representación de la información para el entendimiento humano. La idea es empaquetar los datos de tal forma que sean fáciles de consultar en grandes volúmenes.

Si este modelado dimensional se hace en una base de datos, entonces las tablas modeladas con esto se refieren como esquemas en estrella. Si se utiliza una base de datos multidimensional u **OLAP** *(online analytic processing)*, entonces los datos se almacenan en cubos.

### Fact Table (Tabla de hechos):
Esta es la tabla primaria de un modelo dimensional. Aquí se almacenan las medidas del negocio. Si ponemos un ejemplo como el del libro, en el sector de ventas, podríamos definir la tabla de hecho de ventas como:

| Daily Sales Fact Table |
| ---------------------- |
| Date Key FK |
| Product Key FK |
| Store Key FK |
| Quantity Sold |
| Dollar Sales Amount |

Y lo que vemos en cada fila es una medida de un producto vendiéndose en una tienda. Cada una de las medidas que componen la tabla es una **dimensión**.

Como nota, los **hechos** más útiles son numéricos y sumables, como la cantidad de dólares de una venta. Los que no son sumables tienen que ser convertidos en conteos o medias y los semiaditivos no encajaran en algunas dimensiones.

Todas las tablas de hechos tienen dos o más claves foráneas (Foreign Key), actuando como relaciones muchos a muchos. La tabla en sí misma normalmente tiene una clave primaria formada por un subconjunto de sus claves foráneas, que se suele denominar clave compuesta.

*"Toda tabla de hechos en un modelo dimensional tiene una clave compuesta, y toda tabla con una clave compuesta es una tabla de hechos en un modelo dimensional"*.
Para las claves primarias no debería hacer falta añadir un ROWID, aunque es posible, que por el tipo de negocio si que puedan entrar dos filas idénticas en la tabla de hecho y por tanto ahí tiene sentido añadirlo.

### Dimension Table (Tabla de dimensiones):

Las tablas de dimensiones contienen los descriptores del negocio. Una buena tabla de dimensiones tiene varias columnas que actúan como atributos y que son descripciones textuales. Por ejemplo, en el caso anterior, para un producto, podemos tener:

| Product Dimension Table |
| ----------------------- |
| Product Key |
| Product Description |
| Brand Description |
| Category Description |
| Weight |
| Storage |
| .... |

Los mejores atributos son textutales y discretos. Deberían ser palabras reales y no criptogramas, o códigos. La idea es facilitar de cara al usuario del negocio el entendimiento del modelo.

Las tablas de dimensiones, además, están altamente desnormalizadas y a veces representan información de forma redundante. Por ejemplo en la tabla anterior para cada producto almacenamos su categoría y marca, pero lo hacemos en pos de mejorar la facilidad de uso y el rendimiento.

### Star Schema (Modelo en estrella)
Cuando unimos las tablas de hechos con las tablas de dimensiones, formamos una estructura característica denominada *star join schema*. Entre sus mejoras encontramos su simplicidad de cara al usuario donde pueden reconocer su negocio y además donde la escasa cantidad de joins hace que sean altamente escalables.

### Snowflake Model (Modelo de copo de nieve)
Si en vez de mantener las tablas de dimensiones denormalizadas nos encargamos de crear una pequeña jerarquía normalizada donde eliminados redudancia acabamos disgregando el modelo en estrella en un modelo en snowflake que, ya que las tablas de dimensiones son mucho más pequeñas que las de hechos, no representan un gran beneficio en el tamaño total de la base de datos.