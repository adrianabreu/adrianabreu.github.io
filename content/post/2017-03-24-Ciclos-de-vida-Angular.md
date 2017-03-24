+++
Description = ""
date = "2017-03-24T23:11:22Z"
title = "Interacción a través de ViewChild en Angular"

+++

Hoy me he encontrado con una situación peculiar en un código. Aunque considero que quizás como está realizada la tarea no sea la mejor opción, creo que es un buen ejemplo para entender algunos conceptos de Angular.

Partiendo de una aplicaicón muy básica donde tenemos dos componentes: **AppComponent** y **ChildComponent**, vamos a renderizar dinámicamente el componente hijo desde el componente padre y ejecutar una serie de acciones.

Empecemos por el componente padre:

```
<h1>
  {{title}}
</h1>

<button type="button" (click)="renderChildAndDoChildStuff()">Render the child!</button>
<child *ngIf="timeToRenderChild"></child>
```
**app.component.ts**

```
import { Component, ViewChild } from '@angular/core';
import { ChildComponent } from './child/child.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  @ViewChild(ChildComponent)
  private childComponent: ChildComponent;

  private timeToRenderChild: boolean;

  constructor() {
    this.timeToRenderChild = false;
  }

  renderChildAndDoChildStuff() {
    this.timeToRenderChild = true;
    this.childComponent.doStuff();
  }
}

```
**app.component.html**

Varios detalles:

1. La directiva ngIf hace que hasta que no se cumpla la condición no empiece el renderizado del componente hijo.

2. El decorator @ViewChild permite que un componente padre acceda a las propiedades de un componente hijo.

La funcion doStuff no hace más que modificar un valor de texto en el componente hijo. ¿Que pasa cuando hacemos click en el botón?

Tenemos un error, que nos dice que nuestro componente aún está en estado undefined.
¿Como podemos saber que nuestro componente está listo?

Aquí entran en juego los [lifecycle hooks](https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html). Si utlizamos OnInit, ya estará nuestro componente resuelto. Pero, y aquí el quid del post, aún falta una cosa. Y es que el componente padre sepa que el hijo ha terminado de instanciarse. En un principio notificar una acción de un componente hijo a un componente padre es tan sencillo como usar un evento.

Pero esto no es suficiente: Cuando el componente hijo ya esté creado será demasiado tarde como para modificar el componente padre en el mismo ciclo (debido a la estructura en árbol del detector de cambios), por tanto, es necesario esperar un tiempo, y esto se consigue utilizando por ejemplo un setTimeOut. 

```
setTimeout(() => this.childComponent.doStuff(), 0);
```

Para ver el código del post:
https://github.com/adrianabreu/angular_viewchild_lifecycle

Para más información:
https://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html#smarter-change-detection