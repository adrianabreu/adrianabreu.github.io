+++
Description = ""
date = "2017-03-12T10:39:22Z"
title = "Como construir un portfolio"

+++

Desde hace un tiempo en los países anglosajones los desarrolladores tienen una herramienta más importante que su CV, el portfolio.

Un portfolio no es más que una muestra de tus trabajos y una justificación de las habilidades escritas en tu CV. A día de hoy, es increíblemente fácil tener un portfolio. Pero ya que voy a hablar de eso, aprovecharé para hablar también de qué debería contener un portfolio, y como enfocar el portfolio de un desarrollador junior proporcionando algunas ideas básicas.

## 1. Donde alojar el portfolio

Aunque puede que tengas tu propio host o vps, creo que lo más sensato es utilizar github. [En la propia página de github](https://pages.github.com/) explican como tener tu web: "username.github.io". De hecho, es donde ahora mismo está alojado este blog.

## 2. Contenidos de un portfolio

Aquí empieza a abrirse el abanico de opciones. En general, la creatividad se premia, pero vamos a centrarnos en algunos conceptos clave:

1. Tus datos de contacto deben ser visibles. Un gran error de un portfolio es no dar visibilidad a la sección de contacto o carecer de los famosos iconos de redes sociales.

2. Debe ser una muestra de tu trabajo, no tiene por qué ser muy extenso. Lo más sensato es que tengas alguna pequeña imagen, una breve descripción y un enlace para probar el proyecto.

3. Muestra a qué puesto te gustaría aspirar, que rama te interesa más, si te interesa entrar en algún sector en concreto, etcétera. 

4. **NO PONGAS UNA LISTA DE LENGUAJES / HABILIDADES Y LE DES UNA PUNTUACIÓN A CADA UNO DE ELLOS**. Aunque no quería ponerlo, creo que es importante resaltarlo. Valorarse a uno mismo es un error **casi tan grande como poner todos los lenguajes que has tocado para intentar parecer que tienes un gran dominio**. En la carrera trabajé con C++ un par de cursos. ¿Me pongo ya un 5 sobre 5 en C++? [El creador del lenguaje se pone a sí mismo un 7 sobre 10](https://www.slideshare.net/olvemaudal/deep-c/255).

5. También debe hablar algo de ti, tus aficiones. Seguimos siendo personas, y no un conjunto de datos.

Con esto ya tenemos lo básico para un portfolio.

Pero claro, se plantea una duda. Una persona que se dedique altamente al front-end, va a tener muy fácil el destacar. Ya que sus proyectos son usables y visibles. Por otro lado, alguien que quiera enfocarse más al backend no lo va a tener tan sencillo. Para estos últimos recomiendo que describan su proyecto. Que planteen el problema y que estructura se siguió para resolverlo. 

Por ejemplo:

> WordreferenceBot es un bot para telegram que permite traducir palabras del inglés al español y viceversa. Utiliza NodeJS para hacer webscraping de la página de wordreference y luego genera un mensaje en formato markdown para telegram.
Para mejorar los tiempos de respuesta las traducciones se almacenan en una base de datos (MongoDB) de tal forma que queden cacheadas, así, cuánto más se use, más rápido responderá.

> Además se ha añadido un endpoint web utilizando ejs donde se puede ver en tiempo real la cantidad de palabras almacenada en la base de datos gracias al uso de websockets.

Con esto queda más o menos claro las herramientas que hemos utilizado en el proyecto y como lo hemos enfocado.

## 3. ¿Qué utilizo para portfolio?

Este tema lo he estado reflexionado bastante y creo, tras leer múltiples opiniones, que lo mejor es utilizar un html estático.

Aplica tu creatividad y si eres bueno en tema de diseño quizás quieras demostrar más habilidades aún evitando utilizar bootstrap y jQuery.

También, al igual que yo puedes hacer utilizar algún generador estático, como por ejemplo: [Jekyll](https://jekyllrb.com/) (Ruby), [Hexo](https://hexo.io/) (Node) o [Hugo](https://gohugo.io/) (Go).

[Hace unas entradas](https://adrianabreu.com/post/2017-03-04-Why-you-should-start-a-blog/) argumenté las ventajas de tener un blog y de escribir las cosas que se van aprendiendo.


## 4. ¿Qué podría usar para rellenar el portfolio? 

La creatividad manda, no hace falta elaborar proyectos complicados, pero creo que existen una serie de puntos que deberían estar en tu portfolio.

1. Demostrar tu dominio del DOM: Hacer algún proyecto sencillo que interactúe con el DOM. Algo tan simple como una lista de la compra que vaya creando y borrando elementos y cantidad puede ser un buen ejemplo.

2. Demostrar que sabes AJAX: Hacer un cliente para alguna api abierta. Por ejemplo yo hice un cliente en angular para una API que daba frases de Chuck Norris. Existen muchas apis abiertas, [aquí tienes una lista](https://github.com/toddmotto/public-apis).

3. Demostrar que conoces "la parte de atrás": Montar un CRUD en backend, ofreciendo y diseñando tu mismo la API y realizando persistencia en base de datos.

## 5. ¿Y que hago con todos estos proyectos? 

Lo primero sería publicarlos en github, eso como base. Así se puede ver como trabajas a través de tu historial de commits. 

Ahora, para los proyectos de front (html, css y js), si creas una rama "gh-pages" en el repositorio, puedes acceder "in vivo" al proyecto a traves de la dirección **username.github.io/nombredelrepositorio**.

Ahora, para el tema del backend, existen unas cuantas soluciones gratuitas. Por enumerar los que he probado: [Heroku](https://dashboard.heroku.com/login), [Microsoft Azure (plan de estudiantes)](https://imagine.microsoft.com/en-us/Catalog/Product/99), [Openshift](https://www.openshift.com/).

Así que no necesitas invertir en host ni en vps para poder alojar tus aplicaciones.

## 6. ¿Ejemplos?

Ya que ahora mismo mi blog no es un gran ejemplo. (**Excusa**: No he parado de irme de un sitio a otro para decidir que iba a utilizar como generador hasta decidirme por hugo). Voy a aprovechar para dejar algunos buenos ejemplos de portfolio:

* https://zertukis.com/
* https://jordancarney.com/
* https://chrisgreg.github.io/Portfolio/index.html
* https://jamesiv.es/

## 7. Conclusiones:

Espero que estos pasos sirvan de guía para alguien y tenga las cosas más claras a la hora de crear su propio portfolio.

Ante cualquier duda o sugerencia, podéis contactar conmigo a través de [twitter](https://twitter.com/aabreuglez) o [email](mailto:me@adrianabreu.com)