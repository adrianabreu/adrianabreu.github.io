+++
Description = ""
date = "2020-04-06T18:22:32Z"
title = "Notas sobre programación funcional en Scala I"
+++

Hace unos días pude comprarme el [libro de Paul Chiusano y Rúnar Bjarnason: Functional Programming in scala](https://www.amazon.es/Functional-Programming-Scala-Paul-Chiusano/dp/1617290653) y no puedo estar más contento con él.

Como ya es costumbre, aprovecho para dejar mis notas sobre el libro en el blog. No se trata de un resumen del mismo sino curiosidades que sé que volveré a consultar en un futuro. Intentaré que no queden post excesivamente largos haciendo un por capítulo. Igualmente, recomiendo a todo el mundo adquirir "el libro rojo de Scala" y echarle un vistazo.

## Getting started with functional programming

### Loops as functions

La idea de mantener todo como una función es permitir hacer las composiciones y la testabilidad a lo largo del código, para ello se suele crear un función interna llamada *loop* o *go* por convenio que se encargará de hacer el bucle. 

Aprovecho para dejar el ejemplo más común de recursividad y así vemos la diferencia de hacerlo como un bucle interno, el factorial.

{{< highlight scala >}}
def factorial(n: Int): Int = {
    if (n <= 0) 1
    else n * factorial(n-1)
}
{{</ highlight >}}

En cambio, con un bucle interno

{{< highlight scala >}}
def factorial(n: Int): Int = {
    def loop(n: Int, acc: Int): Int = {
        if (n <= 0) acc
        else loop(n-1,n*acc)
    }
    loop(n,1)
}

{{</ highlight >}}

Como vemos, la función de loop interna se asemeja mucho a un bucle normal. Y la diferencia
con el factorial normal es, que el factorial normal necesita llegar hasta final para resolver la cascada de llamadas mientras que loop se resuelve sus parámetros en cada iteración.

**Tail call optimisation**: Uno de los mayores problemas de la recursividad es que al ser necesario mantener el stack de llamadas de la función para valores muy grandes podemos acabar en un stackoverflow error.
Cuando el compilador detecta que las llamadas recursivas se hacen al final, es capaz de convertirlo en bucles iterativos que no requieren mantener el stack. Si queremos forzar una función como recursiva y que el compilador falle si no lo es podemos usar la anotación *tailrec*. La verdad es que detectar esto en casos complejos, es realmente dificil y un post muy interesante sobre eso es [este](http://blog.richdougherty.com/2009/04/tail-calls-tailrec-and-trampolines.html).

### Higher-order Functions

Este concepto siempre me había resultado difícil de entender en el mundo de Redux, pero la verdad es que en Scala es muy intuitivo. Las HoF son functiones que aceptan funciones como parámetros. En Scala es muy intuitivo declarar una función como párametro. Por ejemplo pongamos que queremos validar un "predicado" para numeros enteros, el tipo del predicado sería Int => Boolean. Y una función de comprobación podría ser:

{{< highlight scala >}}

def check(n: Int, p: Int => Boolean): Boolean = p(n)

{{</ highlight >}}

**Nota**: Es común encontrarse con nombres de una sola letra como f,g o h para los parámetros de las HoF, esto es porque se supone que la función no sabe nada de lo que hace el parámetros, solo de su tipo.

### Anonymous functions or literal functions

El uso de las HoF se vería bastante limitado si tuviesemos que pasar funciones funciones ya existentes. En base al ejemplo anterior:

{{< highlight scala >}}

def isPositive(n: Int): Boolean = n >= 0

def check(n: Int, p: Int => Boolean): Boolean = p(n)

check(3, isPositive)

{{</ highlight >}}

En Scala podemos definir funciones inline como ahora vamos a ver:

{{< highlight scala >}}

def check(n: Int, p: Int => Boolean): Boolean = p(n)

check(3, (x: Int) => x >= 0)

{{</ highlight >}}

Este tipo de funciones ya existen en muchos lenguajes, lo curioso es que en Scala lo que se está definiendo por debajo es un object con un método apply. En Scala estos objects con apply se pueden llamar directamente como si fueran métodos. Se [explica muy bien en este post](https://www.scala-lang.org/old/node/133.html). 

Lo he probado en mi máquina, y el resultado no ha sido el esperado. Ha aparecido un tipo nuevo: Lambda. He estado investigando y [desde Scala 2.12 se hace uso de los lambdas de Java](https://www.scala-lang.org/news/2.12.0/#lambda-syntax-for-sam-types)

Por ahora, [el límite está en 22 parámetros](https://github.com/scala/scala/blob/2.13.x/src/library/scala/Function22.scala), lo cual debería ser más que suficiente para una función anónima. (Por si acaso, lo he probado y este es el mensaje de error: "functions may not have more than 22 parameters, but 25 given")

### Partial application

Este concepto me resultó bastante difícil de entender, porque se confunde fácilmente con el término currying. Como es más claro, empecemos por el currying consiste en "romper" las funciones en funciones de un parámetro, por ejemplo, volviendo al método check de antes.

{{< highlight scala >}}

def check(n: Int)(p: Int => Boolean): Boolean = p(n)

check(3)((x: Int) => x >= 0)

{{</ highlight >}}

Con esto podríamos definir el número en un punto del programa y el predicado en otro. Sin embargo, lo que hace el partial application, es darnos la posibilidad de no usar todos los argumentos a la hora de llamar a la función.

{{< highlight scala >}}

def check(n: Int,p: Int => Boolean): Boolean = p(n)

val f = check(3, _: Int => Boolean)
f((x: Int) => x >= 0)

{{</ highlight >}}


Con esto estaría cubierto todo lo relacionado con este capítulo para más información sobre este último punto recomiendo [esta página](https://www.geeksforgeeks.org/scala-partially-applied-functions/)