+++
date = "2017-10-08T18:04:42Z"
title = "SOLID Principles"
+++

## SRP: Single Responsability Principle

**Una pieza de software debería tener una única razón para cambiar.**

Si una clase tiene más de una "responsabilidad" (razón de cambio), un cambio en algún requisito podría ser muy difícil de modelar. Ya que al cumplir con esta responsabilidad podríamos estar incumpliendo otras. 

Esto hace que el diseño sea realmente frágil y esté acoplado: es decir, se va a romper de formas inesperadas. 

Es importante ver que esta regla aunque es general no implica que tengamos que desgranar siempre todas las clases. Por ejemplo si una de mis clases se gestiona en base a una lógica establecida en la constitución española, no creo que esa lógica vaya a cambiar, con lo cual no es una razón de cambio y no pasa nada porque esté ahí.

## OCP: Open Closed Principle

**Una pieza de software debe ser abierta para extensión pero cerrada a modificación.**

Este principio hace referencia a dos partes y puede resultar muy abstracto. La primera parte dice que una pieza de software debe ser abierta para extensión. 

Esto significa que podemos agregarle funcionalidad. 

La segun parte nos dice que el código debe ser cerrado a modificaciones, es decir no debe ser modificado.

¿Cómo podemos cumplir dos cosas al mismo tiempo? La clave está en las **abstracciones**.

Si nuestra pieza de software en vez de aceptar una clase o un tipo concreto acepta una abstracción podemos incrementar nuestra funcionalidad (permitir que trabaje con más tipos de clases que implementen esa interfaz) sin modificar el código ya existente. 

## LSP: Liskov Substitution Principle

**Una pieza de software que hace referencia a clases base (o interfaces) debe ser capaz de usar objetos de clases derivadas sin saberlo".**

Si hemos cumplido con el principio OCP ahora estaremos dependiendo de una interfaz, sin embargo, si esta regla no se comprende bien puede que violemos otro principio si intentamos averiguar que tipo derivado estamos usando.


```
void DrawShape(const Shape& s)
{
    if (typeid(s) == typeid(Square))
        DrawSquare(static_cast<Square&>(s)); 
    else if (typeid(s) == typeid(Circle))
        DrawCircle(static_cast<Circle&>(s));
}
```

En este ejemplo de Rob C. Martin, se usa la información en tiempo de ejecución para actuar segun la clase derivada, y esto es una viola el principio de sustitución de Liskov. 

Si hemos de gestionar que tipo hace cada cosa, entonces está claro que no es nuestra responsabilidad dibujar la figura, sino que la figura debería dibujarse a sí misma.

```
void DrawShape(const Shape& s)
{
    s.Draw();
}
```

También se puede violar el principio de substitución de Liskov por crear comportamientos que en un principio parecen razonables pero que desde el punto de vista de los clientes no cumplen con todas las condiciones.

Para esto es necesario dejar claro un ejemplo, digamos que tengo un método que recibe un pato y hace que el pato parpee.
```
public interface IDuck {
    String Quack();
}

function MakeDuckQuack(IDuck duck) {
    duck.Quack();
}
```

Sin embargo, a la hora de diseñar, decido que mi patito de goma es también un pato, pero obviamente un patito de goma no puede hacer quack,
asi que como es un pato pero no hace quack, lo más sensato es no dar

```
public class RubberDuck implements IDuck {
    String Quack() {
        throw  new NotImplementedException();
    }
}
```

Si ahora nuestro método quisiera hacer uso se encontraría con una desagradable sorpresa de una excepción no esperada, con lo cual no estamos cumpliendo el principio de sustitución de Liskov.


## ISP: Interface Segregation Principle

**Los clientes no dbeerían ser forzados a depender en interfaces que no usan.**

Este principio hace referencia a las desventajas de las interfaces "gordas". Si dependemos de una interfaz que agrupa mucha funcionalidad en ese caso estamos creando acomplamiento en todos los clientes de esta interfaz, aunque usen subpartes diferentes de la misma.

Para evitar esto, lo mejor que podemos hacer es desgranar nuestra interface en pequeñas interfaces que se hangan cargo de una ressponsabilidad concreta. 

## DIP: Dependency Inversion Principle

**Los módulos de alto no nivel no deben depender en módulos de bajo nivel. Ambos depender en abstracciones. Y estas abstracciones no deben depender en detalles, son los detalles los que deberían depender en las abstracciones.**

Los módulos de alto nivel serían aquellos que contienen la lógica de negocio y el modelo, en definitiva *"nuestra"* aplicación. Y nuestro objetivo es, por supuesto, reutilizarlos. 

Si dependemos directamente de módulos de bajo nivel estamos limitando seriamente esta reutilización, por lo que debemos depender siempre de abstracciones, en vez de los propios módulos.

Un buen ejemplo es el patrón DAO. Donde el acceso a la capa de persistencia queda oculta, ya no nos importa donde lo vamos a persistir. ¿Es un fichero? ¿Una base de datos? Da igual, mientras cumpla con la abstracción, funcionará. 


He preparado un conjunto de diapositivas para explicar estos principios que acompañarían a esta charla. [Se pueden ver estas diapositivas aquí.](https://1drv.ms/p/s!AoC6q0w0j0MZg0CTWhdpW_TL2EWR)