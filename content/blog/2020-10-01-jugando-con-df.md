+++
Description = ""
date = "2020-10-01T10:12:32Z"
title = "Jugando con Data Factory"
tags = ["Data Factory"]
+++

Sorprendentemente, hasta ahora, no había tenido la posibilidad de trabajar con data factory, tan solo lo habia usado para algunas migraciones de datos.

Sin embargo, tras estabilizar un proyecto y consolidar la nueva etapa, necesitabamos mejorar la solución implementada para migrar datos.

Una representación simple de la arquitectura actual sería:

En un flujo muy sencillo sería esto:
1. La etl escribe un fichero csv con spark en un directorio de un blob storage.
2. La primera function filtra los ficheros de spark que no son part- y se encarga de notificar a una function que actua de gateway para el batch con que fichero queremos enviar, el nombre original, el path y el nombre que queremos darle.
3. Esta function de gateway se encarga de realizar las llamadas necesarias a la api de Azure para generar una tarea en el batch.
4. El batch se encarga de comprimir el fichero y enviarlo al sftp del cliente, recuperando las credenciales según el tipo de fichero que se trate. 

Este proceso nos permitía trabajar con dos versiones del proyecto en lo que hacíamos la migranción a la nueva versión. Ahora que esta ya está consolidada y hemos conseguido además que el cliente use la compresión de gzip que podemos escribir directamente desde spark.

Pues todas esta arquitectura se ha simplificado en: Data Factory.

Lo primero que teníamos que resolver era el renombrado del fichero. Al final desde la propia API de hadoop se puede realizar este renombrado sin atacar directamente a la implementación por debajo.

Ahora, tenemos que construir nuestra pipeline de data factory. 

Lo primero que haremos será configurar los linked services, en nuestro caso son tres:

1. El storage del que vamos a extraer los ficheros.
2. El sftp al que queremos atacar.
3. El key vault del que queremos recuperar la contraseña. (¡No nos olvidemos de vincular la contraseña!)

Configuramos dos datasets, uno de origen asociado al storage que reciba dos parametros.

-- IMAGEN DATASET--

Y otro de sink. Que por ahora no tendrá parámetros.

Configuramos la acitvity de copy data con ambos y estaría casi todo, nos falta saber que fichero queremos leer. Marcamos la opción en el source de ' ' y nos dedicamos a configurar dos parámetros para la pipeline.

La idea es que esta pipeline la dispare un blob trigger asociado al storage. Este blob trigger presenta dos parametros de folderPath y fileName. 

Los asociamos  y ahora se los pasamos al dataset así.

```
```

Ahora configuraremos el blob trigger. Añadimos un sufijo para que no nos molesten los otros ficheros, solo los nuestros:

-- IMAGEN TRIGGER --.

Y además configuramos los dos parametros, que en este caso serían así:
```
```

Ya tenemos nuestra pipeline en marcha, si subimos un fichero podremos monitorizar como este se envia al ftp.

Sin embargo, antes comenté que dependiendo del fichero tenía que usar unas credenciales u otras. Y aquí es donde se complica un poco la cosa.

Para que entendamos el problema, quiero que el fichero que acabe en PL_DATAMART.csv.gz coja las credenciales asociadas a "PL". De tal manera que haya un usuario por país en un modelo internacional.

Para esto, necesitamos aprovechar una de las mejoras que han puesto hace relativamente en Data Factory, los parameters para los linked services. El problema de estos parámetros es que solo pueden hacerse desde el json, así que dejo aquí un json de ejemplo:

```json
```

Ahora viene el momento de extraer la información del nombre del fichero, en este caso tenemos que jugar con las funciones disponibles: length, sub, y substring. 

```
EXTRAER PAIS
```

Ahora tenemos en una cadena el país correspondiente. En mi caso he recurrido a un fichero de configuración y he hecho un lookup sobre el mismo. He utilizado una tarea de filter para discriminar las entradas que no me interesaban, simplemente con un:

```
FILTRO
```

Y esto se ha convertido en el parámetro asociado.

Además, dado que el output del filter incluye la cantidad de elementos que han pasado el filtro:

```

```

Me puedo permitir añadir un if que hará que las cosas no fallen si en el storage aparece algún país nuevo para el cual no tengo usuario.

Además de poder hacer este spike me he permitido el lujo de mandar un fichero de 10 GB y los tiempos han resultado brutales.
