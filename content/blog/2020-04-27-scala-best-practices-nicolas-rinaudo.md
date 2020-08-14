+++
Description = ""
date = "2020-04-27T20:55:32Z"
title = "Scala best practices notes"
tags = ["Scala", "FP"]
+++

He aprovechado estos días de cuarentena para revisar algunos de los "huecos" de conocimiento que tenía en Scala. Una de las charlas que he podido ver es esta: [Scala best practices I wish someone'd told me about - Nicolas Rinaudo](https://www.youtube.com/watch?v=DGa58FfiMqc)

Por supuesto siempre recomiendo ver la charla, pero he querido condensar (aún más) ese conocimiento en este post, insisto, es amena y muy interesante, muchos de los puntos que se definen en la charla no se han explicado porque la mayoría se resuelven en dotty y aunque 


## Type annotation

{{< highlight scala >}}
def asOption[A](a: A) = Some(a)
{{</ highlight >}}

Un método como este, si va a ser público, debería tener especificado el tipo que devuelve, porque el compilador, en vez de inferir que es un Option[A] va a inferior que su tipo es Some[A] y aunque no es gran cosa esto (Some es un subtype de Option) un cambio menor puede romper el contrato de una librería.

## Sealed traits

{{< highlight scala >}}
sealed trait Foo

class Bar extends Foo
{{</ highlight >}}

Cuando definimos un sealed trait específicamos que todo subtipo directo estará especificado en el mismo fichero. El problema es que Bar es una class, y se puede heredar desde cualquier otro lugar, lo cual puede dar un comportamiento inesperado. La solución a esto es hacer que Bar sea final o sealed.


{{< highlight scala >}}
sealed trait Foo

final class Bar extends Foo
{{</ highlight >}}

Lo mejor es hacer esto por defecto, y si hay algún motivo cambiarlo.

## Algebraic Data Types

{{< highlight scala >}}
sealed trait Status 

object Status {
    case object Ok extends Status
    case object Nok extends Status
}
{{</ highlight >}}

Este código parecer perfectamente razonable, el problema es que si creamos una lista

{{< highlight scala >}}
List(Status.Ok, Status.Nok)
{{</ highlight >}}

En vez de obtener el tipo List[Status] obtenemos un tipo mucho más complejo, y este tipo ocurre porque ambos miembros son case object, asi que cuando el compilador busca los tipos más comunes, encuentra todos esos tipos. La solución sería hacer que el trait herede de ambos, para ser el tipo más cercano en la jerarquía. Así evitamos que detalles de implementación lleguen al usuario.

{{< highlight scala >}}
sealed trait Status extends Product with Serializable

object Status {
    case object Ok extends Status
    case object Nok extends Status
}
{{</ highlight >}}

## Case classes

{{< highlight scala >}}

case class Foo(i: Int)

class Bar(i: Int, s: String) extends Foo(i)

new Bar(1, "foo") == new Bar(1, "bar") // true
{{</ highlight >}}

Este ejemplo describe un comportamiento muy muy interesante y que está relacionado con que las case classes deben ser final. Al crear una case class se sobreescribe el método equals y esto hace que la clase Bar que exiente de Foo, tenga el método equals de la case class Foo, haciendo que cuando comparemos Bar realmente estemos comaprando Foo.

## Exceptions

{{< highlight scala >}}

def parseInt(str: String): Int = str.toInt

{{</ highlight >}}

Las excepciones no son referential transparent, con lo cual no debemos lanzarlas. Si es posible se recomienda utilizar las clases Either (para computaciones que pueden fallar) Option (para tratar valores que pueden no existir) y si hay que utilizar excepciones, utilizar Try.

## Errors


{{< highlight scala >}}

sealed trait DbError extends Exceptions with Product with Serializable

object DbError {
    case object InvalidSql extends DbError
    case object ConnectionLost extends DbError
}

{{</ highlight >}}

Aunque se desrecomienda lanzar excepciones, no se desrecomienda usarlas. Si queremos tipar un error, lo mejor que podemos hacer es extender la clase Exception. De esta manera podremos utilizar el tipo en Try y en Future.

## Return

{{< highlight scala >}}

def foo(is: List[Int]): List[Int] =
is.map(n => return n + 1)

{{</ highlight >}}

Este ejemplo es realmente complicado de enseñar, se desrecomienda usar return proqeu genera error a la hora de inferir los tipos en el compilador, el codigo de arriba genera un extraño bucle de List[Int] -> Int -> List[Nothing] -> Int -> List[Nothing] -> Int... 

Estos han sido los detalles que más me han gustado y parecido relevantes de la charla, espero que alguien lo encuentro tan útil como yo :)