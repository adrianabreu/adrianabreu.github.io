+++
Description = "Preparando databricks certified engineer professional (II)"
date = "2026-08-17T15:13:00Z"
title = "Preparando databricks certified engineer professional (II)"
tags = ["data engineering", "databricks"]
+++

Continuamos aprendiendo, hoy con github caído :) 

Hoy me toca centrarme en Data Sharing and Federation y Data Governance.


De nuevo vamos a la guía del PDF: 

### Section 4: Data Sharing and Federation
* Demonstrate delta sharing securely between Databricks deployments using Databricks
to Databricks Sharing (D2D) or to external platforms using the open sharing protocol
(D2O).
* Configure Lakehouse Federation with proper governance across the supported source
Systems.
*  Use Delta Share to share live data from Lakehouse to any computing platform.



### Section 8: Data Governance
* Create and add descriptions/metadata about enterprise data to make it more
discoverable.
* Demonstrate understanding of Unity Catalog permission inheritance model.

En el caso de la gestión de los datos corporativos, tenemos que tener en cuenta que siempre pasa lo mismo, se recopilan miles de millones de datos y luego se cae en el descontrol. Descontrol por dos partes, nadie a sabe a donde pertenece un dato y peor, nadie sabe qué significa un dato. Aparece en todas las reuniones esa misma pregunta: "este usuario es activo por que..." y esa persona de BI entra en trance y repite esa definición que vive en el comentario del sql y en una página de confluence cuyo último visitante dejó la empresa hace tres años.

Para resolver a donde pertenece, para agrupar, para poder monitorizar costes, responsaibiliades, productos, podemos usar tags. Lo cual es realmente útil en productos que son transversales. ¿La tabla de usuarios a quien pertenece? ¿A ventas? ¿A marketing? ¿A soporte? Quizás pertenezca a todos, y por eso podemos taggear recursos.

Los tags son parejas clave valor que se pueden poner en catalogs, schemas, tablas, y por defecto se heredan. Cuidado, porque he dicho clave valor pero realmente el valor es opcional, podemos tener un tag `team=BI` que es igual de valido que `PII`.

Para consultar los tags tenemos el information schema (schema_tags, table_tags) y la ui.

¿Pero como evitar que esto acabe en un descontrol? Usando los governed tags. En el ejemplo enseño como añadir un governed tag a una tabla. Los governed tags nos permiten también hacer algo muy chulo que introdujimos ayer, hacer [column masking y row filter automaticamente cuando tageamos recursos](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/core-concepts).



2. Añadir comentarios y descripciones 

Estos son facilmente añadibles con el comando `COMMENT ON <object> is` 

Pero también podemos aprovechar la IA, porque sinceramente que escribe el código de la pipeline no me ayuda, pero que me escriba los comentarios de las 500 columnas que pidió el de marketing... 

![](https://docs.databricks.com/aws/en/assets/images/ai-generate-button-49bc13979d2e474ab6847c6085735e4d.png)


Aquí no hay mucho que añadir, pasemos a lo otro :) 


En cuanto al sistema de permisos para mí solo se puede explicar con una imagen:

![](https://docs.databricks.com/aws/en/assets/images/object-hierarchy-data-objects-f3cc8c2008f012e7deb38e87387dfa64.png)

Existen muchísimos tipos de objetos cada uno con su permiso particular, pero lo que más nos interesa es la jerarquía que tenemos al medio:

Catalog > Schema > Table / View / Secret / Function...

Para saber que permisos pdemos dar a cada objeto: https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/privileges-reference

¿Qué quiere decir esto? 
Primero para acceder a la tabla `my_catalog.my_schema.my_table`. Necesito varios permisos.
Primero, permiso de `USE CATALOG` sobre `my_catalog`.
Luego permiso de `USE SCHEMA` sobre `my_schema`.
Y por último permiso de `SELECT` sobre `my_table`.

¿Como funciona el sistema de herencia? Muy sencillo. 
Si doy select sobre `my_table` solo puedo seleccionar esa tabla dentro de `my_schema`. 
Si doy select sobre `my_schema`, puedo seleccionar `my_table` y cualquier tabla que exista o se cree en `my_schema`. 
Si doy select sobre `my_catalog` puedo seleccionar cualquier tabla de cualquier schema que pueda usar.

Lo único curioso del select es que si lo das a un contenedor permites select de tablas, vistas y funciones.  No se puede separar por tipo de objeto.

Tambien puedo dar `use_schema` sobre `my_schema` o sobre `my_catalog`, haciendo lo mismo con todos los schemas.

Break: gracias a dios snowflake ha copiado a databricks en esto y ha publicado los [inherited grants](https://docs.snowflake.com/en/user-guide/inherited-grants-intro), de verdad como odio los malditos futures, que sin sentido de decisión tecnologica. Perdón, es que ha sido un año duro. 

Como recomendación esto permite hacer un sistema de permisos bsados en roles muy chulos:

AR_CATALOG_READ -> SELECT EN CATALOG
AR_CATALOG_WRITE -> MODIFY EN CATALOG
AR_CATALOG_SCHEMA_READ -> SELECT EN SCHEMA 

Y luego definimos los roles de los equipos y encajamos


De nuevo, ejemplos disponibles en: 