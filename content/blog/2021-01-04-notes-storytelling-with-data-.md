+++
Description = ""
date = "2021-01-04T19:00:32Z"
title = "Notas sobre storytelling with data"
tags = ["Data Visualization"]
+++

Como uno de los objetivos antes de cambiar de año quería empezar a dar visibilidad sobre el producto en el que estoy trabajando con un dashboard. Tras probar varias opciones, hemos optado por utilizar [Quicksight](https://aws.amazon.com/es/quicksight/) para simplificar los procesos en aws y reducir nuestra infraestructura.

Aún así, empezando un dashboard de cero, es muy difícil transmitir la información de forma clara. Es importante evitar que los usuarios vengan simplemente a expotar sus datos a csv para luego cargarlos en excel.

Antes de empezar con las notas, el libro debería leérselo todo el mundo, el currículum del autor es impresionante y da una buena introducción sobre la comunicación efectiva.

Sobre el aspecto de: "Escogiendo una visualización efectiva"

* Números simples: Si tenemos un par de números que comunicar, podemos usar los propios números en si (acompañados de algunas palabras para darles contexto) para transmitir lo que queremos decir. Que haya números no implica que se necesiten gráficos.

* Tablas: Las tablas no suelen ayudar demasiado y una buena idea sería ponerlas en los apéndices de los datos que generamos (por ejemplo, otra página del reporte). También es importante que en las tablas destaquen los datos y no nos distraigan cosas como los borders (ya sea poniendoles un color muy claro o eliminandolos).

* Mapas de calor: Los mapas de calor son un tipo de tabla concreta donde además damos pistas visuales para buscar valores altos utilizando la asaturación del color. Estos gráficos siempre deben ir acompañados de una leyenda low-high que permitan la interpretación de los datos.

* Puntos: Los gráficos de puntos nos permiten encontrar relaciones entre dos tipos de datos sobre un eje.

* Lineas: Este tipo de gráficos permite representar muy bien aquellos gráficos que evolucionan a lo largo del tiempo, ya que existe una relación implícita entre los datos.

* Barras: Las barras nos resultan extremadamente sencillas de leer y deberían ser utilizadas a menudo porque son además, muy comunes. El autor recomienda el uso además de las barras horizontales sobre todo, porque son increíblemente fáciles de leer. Además, desaconseja el uso de los gráficos stackeados porque solo la primera categoría es fácil de comparar (el resto, a menos de que incluya el número dentro, no es visualizable al no compartir base).

Y me centraré en esta frase "pie chart are evil". Los gráficos de tarta no permiten diferenciar bien porcentajes similares. Lo mismo pasa con los gráficos de donuts, intentamos que la gente mida con el ojo distinta longitudes de arco, y eso, no es nada intuitivo para el ser humano. En vez de eso es mucho mejor utilizar gráficas de barras. 

## Evitando el "cluttering"

Cuando tenemos muchísimos elementos delante de nosotros nuestra carga cognitiva aumenta. El clutter, son todos aquellos elementos que añaden carga visual pero no ayudan a comprender mejor los datos. Una forma de reducir la carga visual es convertir los gráficos en diseños simples. Por ejemplo: eliminando bordes, quitando 0 extras en los tickets, quitando los puntos de las lineas, las "grid" lines, etiquetando los datos directamente y unificando su color.

Los ejemplos del libro son tan buenos que lo único que podría hacer es plagiarlo, y para eso, os leéis el libro.

**Extra**: No quería seguir contando partes del libro porque más que notas sería un resumen del rincón del valgo, pero hay ciertas puntualizaciones en la zona del color que me resultan increíblemente interesantes: utiliza como color base sombras de gris en vez de negro porque esto permite un mejor contraste y normalmente utiliza el azul como color principal porque es bastante amigable con los daltónicos.