+++
Description = ""
date = "2017-11-06T23:18:17Z"
title = "Experimentando con Redux"
+++

Con el objetivo de mejorar el [simulador SIMDE](https://github.com/adrianabreu/SIMDE-Simulator) me decidí a probar un sistema de gestión de estados y concentrar el funcionamiento de la aplicación. ¿El motivo? Era la única forma sensata que tenía de poder gestionar la UI cuando entrara la máquina VLIW sin que todo fuera un caos.

Para ello he recurrido a mi aplicación favorita: Chuck Norris client app. (Ya la he hecho en AngularJS y Angular previamente). Como boilerplate he utilizado el template de visual studio, ya que quería tener compatibilidad con typescript. 

En resumen, la aplicación tiene: *React*, *Redux* (*React-Redux* para conectar el estado a los componentes, *Redux thunk* para las acciones asíncronas), *Typescript*, *Jest* (para testing) y *SASS*. 

Mi experiencia ha sido MUY positiva, aunque en más de una ocasión he tenido algún que otro problema con el tipado de las props, en general he podido extraer algunas conclusiones:

1. Un componente que se conecta a la store se denomina container, y su única responsabilidad es pasar los datos necesarios a un componente homónimo que no sea de tipo container.
2. Los componentes pueden ser functions o clases, dependiendo de las necesidades de cada uno, la regla es que si tiene estado, normalmente será una clase.

## ¿Cómo trabajar con React y Redux? 

Lo primero es entender el concepto de componente, es el mismo concepto que viene de otros frameworks modernos: 

### Un componente es una pieza de tu aplicación una sección de código con una vista asociada.  

Los componentes reciben props y tienen un estado. El problema es, ¿cómo comunicamos muchos componentes para que compartan ese estado?

Ahí es donde entra Redux. El objetivo de Redux no es más que dar una forma segura de modificar un estado global de la aplicación, se basa en tres elementos: **Dispatchers**, **Actions** y **Reducers**.

Un dispatcher se encarga de lanzar una acción. **Una acción es un POJO (plain old javascript object) que tiene un tipo y un payload.** Esta acción tiene como consecuencia que se activen 1 o varios reducers. 

**Los reducers deberían ser funciones puras (aquellas que no generan efectos laterales) que se encargaran de transformar el estado global.**

¿Merece la pena todo esto?
Rotundamente sí. Redux da una aproximación funcional que  Es recomendable leer la sección de performance de la documentación [https://github.com/reactjs/redux/blob/master/docs/faq/Performance.md]( https://github.com/reactjs/redux/blob/master/docs/faq/Performance.md)  

Además, las herramientas de depuración (Redux Dev Tools) son impresionantes, y te ayudan a hacer “time-travelling” sin mayor problema.

Por último, quiero añadir que además la build de la aplicación está hecha con Circleci, que recientemente ha sacado la versión 2.0 y es una herramienta fantástica. Ahora mismo estoy ejecutando los tests con Jest que me aseguran que no rompo mi funcionalidad mientras refactorizo y es una delicia.

Por desgracia, me he encontrado con un problema terrible: Crear los tipos para los componentes.

Es decir, por suerte en este proyecto la funcionalidad es bastante reducida y el estado no necesita ser dividido en varios componentes, pero crear los types que cada componente debe recibir resulta muy complicado.

Ante esto, solo puedo decir: Es el momento de usar any. Sí, parece que estoy predicando algo terrorífico, pero es que es el momento apropiado. La cantidad de esfuerzo necesaria para evitar usarlo no compensa el usarlo.

Quizás y solo quizás: React y Typescript no sean la mejor combinación. 

Por mi parte, voy a seguir practicando con React y Redux en el proyecto de SIMDE y espero compartir buenas experiencias con el. 