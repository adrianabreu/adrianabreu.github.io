+++
Description = ""
date = "2021-10-10T14:47:32Z"
title = "Sbt Intro I"
tags = ["Scala"]
+++

El mes pasado cambié a otro trabajo :) y por casualidades he vuelto a acabar con proyectos de scala. Este proyecto está bastante avanzado y hace un uso intensivo de los plugins de sbt. De hecho, una tarea que tengo próximamente es hacer una plantilla para proyectos. Así que quería repasar los conceptos básicos de sbt en una serie de posts.


¿Qué es sbt **scala build tool**? Es una herramienta para gestionar proyectos en scala. Es la más utilizada (casi el 95% de los proyectos se hacen en sbt) y uno de sus puntos fuertes es que permite trabajar con múltiples versiones de scala haciendo cross-compilation.

¿Qué es un proyecto en sbt? Es un directorio que contiene ficheros **.sbt** (el fichero por defecto es el _build.sbt_) y una estructura de carpetas al estilo de maven.

```
src/
  main/
    resources/
       <files to include in main jar here>
    scala/
       <main Scala sources>
    scala-2.12/
       <main Scala 2.12 specific sources>
    java/
       <main Java sources>
  test/
    resources
       <files to include in test jar here>
    scala/
       <test Scala sources>
    scala-2.12/
       <test Scala 2.12 specific sources>
    java/
       <test Java sources>
```
(Sacado de https://www.scala-sbt.org/1.x/docs/Directories.html)


Además de src tenemos la carpeta **project** esta carpeta contendrá información sobre la build. 

Veamos un pequeño ejemplo de los ficheros que afectan al proyecto antes de entrar en detalle:

```
src/
project/
    build.properties -> sbt.version = "1.5.5"
    Dependencies.scala
    ...
build.sbt
```

En el fichero **build.properties** podemos definir a nivel de proyecto que versión de sbt usar.

El fichero **build.sbt** contiene definiciones de proyectos. Los proyectos están definidos por el tipo [Project](https://github.com/sbt/sbt/blob/develop/main/src/main/scala/sbt/Project.scala) y se configura mediante un dsl de sbt para las settings del estilo clave-valor.

```
lazy val root = (project in file("."))
  .settings(
    name := "Hello",
    scalaVersion := "2.12.7"
  )
```

Y en el fichero **Dependencies.scala** podemos definir todas las dependencias. Este fichero a veces se omite y se pone todo en el build.sbt, pero se recomienda tener un fichero dedicado exclusivamente a esto y así gestionar todas las dependencias en un único sitio. (https://www.scala-sbt.org/1.x/docs/Organizing-Build.html#Tracking+dependencies+in+one+place)

Las dependencias se definen así:

**groupID % artifactID % revision**

En este caso el artifact id debe especificar la versión de scala.

Por ejemplo:
"org.scalatest" % "scalatest_2.11" % "3.2.4"

Si nuestro proyecto está en scala 2.11 es equivalente a:
"org.scalatest" %% "scalatest" % "3.2.4"

(Nótese que hay un % extra antes del artifactID)

Lo que hacen estos porcentajes es construir objetos del tipo ModuleId para especificar las dependencias.

Y para poder importarlas tenemos una key específica en el proyecto de settings, **libraryDependencies**.

{{< highlight scala >}}

object Dependencies {
    
  object scalatest {
    def scalatest(version: String) = "org.scalatest" %% "scalatest" % version
  }
}

import Dependencies._

lazy val root = (project in file("."))
  .settings(
    name := "Hello",
    scalaVersion := "2.12.7"
    libraryDependencies += Seq(
        scalatest.scalatest(scalaTest32Version) % Test
    )
  )
{{</ highlight >}}

Las dependencias pueden tener varios modos: "Compile", "Provided", "Test". Esta parte de la documentación refleja las implicaciones que tiene. Las dependencias compile se incoporarán a la build del proyecto, las provided se asumen que están en el entorno, etcétera. Recomiendo [esta parte de la documentación]( https://www.scala-sbt.org/1.x/docs/Scopes.html#Scoping+by+the+configuration+axis) sobre ello.

A la hora de descargar las librerías es probable que querramos utilizar algún repositorio privado (gitlab por ejemplo). En este caso para añadir un repositorio de tipo maven, basta con añadir un elemento a la key resolvers.

```
lazy val root = (project in file("."))
  .settings(
    name := "Hello",
    scalaVersion := "2.12.7"
    libraryDependencies += Seq(
        scalatest.scalatest(scalaTest32Version) % Test
    )
    resolvers += "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots"
  )
```

Al igual que con las dependencias, el operador at es el encargado de traducir las strings al tipo Resolver.

Y por último y para terminar este bombardeo inicial, se pueden definir varios proyectos en un repositorio.
Para ello solo tenemos que definir varios proyectos en el fichero .sbt

```
val version = "2.12.7"
lazy val schema = (project in file(schema))
  .settings(
    name := "schema",
    scalaVersion := version
    libraryDependencies += Seq(
        , Dependencies.schema:_*
    )
    resolvers += "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots"
  )

lazy val etl = (project in file("etl"))
  .settings(
    name := "etl",
    scalaVersion := version
    libraryDependencies += Seq(
        Dependencies.common:_*, Dependencies.etl:_*
    )
  )
  .dependsOn(schema)
```

Un proyecto puede depender de otro, por ejemplo, la etl depende del schema, simplemente añadiendo el dependsOn ya tenemos los proyectos vinculados entre sí.

Los proyectos se vinculan automáticamente, ya que el sbt al no detectar ningún proyecto en el directorio raiz ("."), lo que hace es generar un proyecto root que se encarga de agregar los subproyectos entre sí.