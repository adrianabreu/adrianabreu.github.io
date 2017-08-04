+++
Description = ""
date = "2017-07-28T17:11:10Z"
title = "Mi experiencia con React"
+++

Hoy se cumple un mes desde que entregué mi trabajo de fin de grado. *(Modestia aparte, conseguí un 10)*. Han pasado muchas cosas desde entonces, como que por ejemplo ahora mismo estoy viviendo en Barcelona y que trabajo para nada más y nada menos que **Plain Concepts**. Pero al margen de eso, vamos a centrarnos en mi trabajo de fin de grado.

En tercero de grado de ingeniería informática es posible escoger una especialidad. Yo descontento con la mayoría me decidí por Ingeniería de Computadores *a.k.a.* Hardware. Y a lo largo de estos dos cursos me encontré con dos asignaturas de **Arquitectura de Computadores**. 

En la primera de ellas se explicaba el funcionamiento del paralelismo a nivel de instrucción (una conjunto de técnicas que permiten mejorar el rendimiento de los ordenadores y que es un concepto fundamental a día de hoy) mediante el uso de un simulador desarrollado en 2004: **SIMDE**.

{{< figure class="responsive-img" src="/images/experiencia-react/simde-original.png" >}}


El uso de este simulador era bastante importante ya que hablamos de comprender en papel algoritmos de hace 40 años. Como por ejemplo el algoritmo de Tomasulo.

{{< figure class="responsive-img" src="/images/experiencia-react/tomasulo.png" >}}

Como os imaginareis es un suplicio usar este simulador. Aunque hace su cometido casi perfectamente se trata de una aplicación hecha en C++ 98 cuya documentación no es accesible y con un aspecto tosco y viejo. 

Una de las propuestas de este año fue: Convertirlo a web. 

Cuando salió esta propuesta me reuní con el profesor (¡el mismo que lo había desarrollado hace 13 años!) y jugué mi baza más importante: **Aceptaría el tfg si se me daba libertad de usar lo que quisiera**.

Y así fue. Dediqué las navidades a investigar sobre como podría hacer las cosas y que podría utilizar. En aquel momento ya estaba trabajando con Angular asi que al menos sabía que quería *Typescript*. 

No tenía muy claro la parte web, pero la verdad es que ya iba apuntando maneras. Sabía que iba a utilizar alguna librería para gestionar la aplicación porque:

1. No quería perder el tiempo haciendo bindings.
2. Los componentes saltaban a la vista.

Tras todo esto, me puse manos a la obra. Primero tuve que migrar muchísimo código C++ antiguo a Typescript y comprender el funcionamiento. Para ello utilicé de base un proyecto que había salido por enero que usaba Ava para ejecutar test. 

Al inicio del proyecto me encontré con tareas tan divertidas como reescribir el compilador del código ensamblador en Lex. Por suerte con una librería publicada en npm y escribiendo un wrapper para typescript, no fue nada difícil.

Luego me tocó marearme mirando código y comprendiendo el modelo de la aplicación. Al tratarse un dominio tan específico era bastante difícil tener una visión clara de lo que se esperaba de la máquina.

Una vez migradas las estructuras necesarias, me puse manos a la obra con React. [Con el tutorial oficial se puede llegar a comprender su funcionamiento de forma clara.](https://facebook.github.io/react/)

Y luego llegó el momento clave:
¿Como conecto los objetos creados a React? Para solucionar esto fue tan sencillo como usar callbacks que se registraban en un objeto común que colgaba de windows. Con esto, cada iteración de la máquina llamaba a esos callbacks y refrescaba la vista. 

Aquí ya tuve un primer contacto maravilloso con React, y es que su flexibilidad me permitía seguir jugando con Javascript para solucionar mis problemas.

El proyecto lo integré con Webpack y también utilicé Typescript con React. En general la experiencia fue positiva y me lo pasé muy bien, aunque me tuve que romper la cabeza algunas veces para comprender los errores.

También me costó bastante conseguir empaquetar la app en modo producción, no recuerdo exactamente por qué, pero al final tenía el iconito verde maravilloso en la extensión de react-developer-tools. *[(Sí, hay una extensión de react para desarrollo y deberías utilizarla.)](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)*

Por falta de tiempo no integré ningún sistema de gestión de estados como **Redux** o **Mobx**, si no que me hice un time travelling casero. Funciona perfectamente y me hizo ganar muchos puntos antes el profesor y el tribunal.

La idea es que para que un componente muestre su contenido debe transformar lo que le pasa el simulador. Así que tras realizar esta transformación este objeto se almacena en un array. Y si el usuario decide implementar time travelling no hace más que moverse en la interfaz a lo largo de este array, sin alterar la ejecución.

Coincidiendo con mi incorporaicón a la empresa he aprovechado para añadirle un par de cosas al proyecto, que quizás puedan ser interesantes:

* La aplicación tiene CD/CI con Travis. Ahora tras ejecutar los test (¡que tiene bastantes para la lógica!), la aplicación se despliega automáticamente en github-pages.

* Coveralls se encarga de mostrar el porcentaje de código cubierto. Otra característica muy agradable de ver.

* He añadido polyfills para aumentar la compatibilidad cross browser, ¡incluso funciona en Internet Explorer!

Y ya que estoy, aprovecho para dejar un pequeño roadmap. De cara a un futuro cercano: 

* Implementar algunas características de la versión antigua que se han quedado en el aire.

* Actualizar a React fiber, la nueva versión de React mucho más rápida.

Y bueno, ya con esto se cubren muchos casos. La verdad es que desarrollar una aplicación tan particular con React ha sido una maravilla. Si te has quedado con ganas de verla: [aquí tienes su código fuente, que por cierto está bajo licencia GPLv3](https://github.com/adrianabreu/SIMDE-Simulator).


