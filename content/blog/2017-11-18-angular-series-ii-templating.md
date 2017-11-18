+++
Description = ""
date = "2017-11-18T18:53:17Z"
title = "Angular Series II - Templating"
+++

Continuando con el [artículo del otro día sobre proyección de contenido](/blog/2017-08-14-angular-series-i-transclusion/) aquí pretendo mostrar otra forma de pasar contenido: las templates.
¿Qué es una template? Es un pedazo de html envuelto entre entre etiquetas ng-template tal que así:

{{< highlight html >}}
<ng-template>
<div class=”as-template”>
     I won’t be rendered
</div>
</ng-template>
{{< / highlight >}}

Si esto lo ponemos en un componente, tal como en el siguiente ejemplo en el navegador aparecerá: NADA. 

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-template-series?ctl=1&embed=1&file=app/parent/parent1.component.ts&view=preview"></iframe>


**¿Por qué?** Porque las plantillas de angular no se renderizan al ser evaluadas. Se renderizan donde una directiva les indique.  

Primero es importante aclarar que la mayoría de directivas estructurales que utilizamos: ***ngIf**, ***ngFor**, ***ngSwitch** ya usan las plantillas de angular "under the hood". 

¿Pero qué son? Los ng-template son elementos de angular inspirados en los template de los webcomponents. La idea es que el compilador no renderice esta plantilla cuando la analice sino que esta se renderice donde le indiquemos. De esta forma, tenemos una sección de html totalmente reusable y que podemos inyectar en cualqueir sitio.

## ¿Y como se renderiza una plantilla? 

El caso mas trivial es que lo haga un directiva ya existente por nosotros, por ejemplo, un ngIfElse. 

Obviamente, esto no es lo que queremos, lo que se busca es  poder renderizar plantillas dinámicamente, para eso tenemos la directiva **ngTemplateOutlet**.

Debemos añadirle un nombre a nuestra plantilla y luego colocar la directiva ngTemplateOutlet en algún elemento e indicarle que la plantilla a renderizar es la que hemos nombrado.

{{< highlight html >}}
<ng-template #wontberendered>
<div class=”as-template”>
     I won’t be rendered
</div>
</ng-template>
<ng-container *ngTemplateOutlet="wontberendered">
</ng-container>
{{< / highlight >}}

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-template-series-ii?&ctl=1embed=1&file=app/parent/parent1.component.ts&view=preview"></iframe>

Como vemos, ahora la plantilla sí que se renderiza. ¿Qué está haciendo la directiva estructural ***ngTemplateOutlet**? Está diciendole al componente que en ese lugar debe inyectar esa plantilla.

Ahora, ¿qué pasa si un componente padre nos pasara el contenido a mostrar por templating?

Pongamos que nuestro padre le pasa 

{{< highlight html >}}
    <child>
    <ng-template #wontberendered>
    <div class='as-template'>
        I won’t be rendered
    </div>
    </ng-template>
    </child>
{{< / highlight >}}

Y el hijo lo único que haría sería mostrar esta plantilla, tal como hacia el padre antes.

{{< highlight html >}}
  <ng-container *ngTemplateOutlet="wontberendered">
  </ng-container>
{{< / highlight >}}

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-template-series-iii?ctl=1&embed=1&file=app/child/child/child.component.ts&view=preview"></iframe>

Y ops... **NO FUNCIONA**. ¿Por qué? Por el contexto en el que se evalua la plantilla, al componente le hace falta tener constancia de está plantilla, para eso el componente tenemos que usar la anotación **@ContentChild**.

{{< highlight ts >}}
import { Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'child',
  template: `
  <ng-container *ngTemplateOutlet="wontberendered">
  </ng-container>
  `
})
export class ChildComponent {

  @ContentChild('wontberendered') wontberendered: TemplateRef<any>;
}
{{< / highlight >}}

*Nótese que la variable del componente tiene nombre wontberenredered*.

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-template-series-iv?ctl=1&embed=1&file=app/child/child/child.component.ts&view=preview"></iframe>

## ¿Y qué diferencia hay con la proyección de contenido?

Lo primero es entender quien tiene el control del contenido, vamos a hacer algo muy sencillo, vamos a pasar un componente a otro componente tanto por templating como por content projection y vamos a controlar cuando ocurre el ngOnInit de este componente.

Además, el contenido recibido lo envolveremos en un ngIf, porque no queremos que los componentes se construyan hasta que el hijo decida. 

**Child:**
{{< highlight html >}}
      <button (click)="showContent = !showContent">
        Toggle content
      </button>
      <hr />
      <ng-container *ngIf="showContent">
        <ng-container *ngTemplateOutlet="wontberendered">
        </ng-container>
        <ng-content></ng-content>
      </ng-container>
{{< / highlight >}}

**Parent:**
{{< highlight html >}}
      <ng-container *ngFor="let message of template">
          <span>{{message}}</span><br />
      </ng-container>

      <hr/>
      <child>
      <ng-template #wontberendered>
          <hello (created)="onTemplateCreated()"></hello>
      </ng-template>
      </child>
      
      <ng-container *ngFor="let message of projected">
      <span>{{message}}</span>
      </ng-container>
       <hr />
      <child>
        <hello (created)="onProjectedCreated()"></hello>
      </child>
{{< / highlight >}}

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-template-series-v?ctl=1&embed=1&file=app/parent/parent1.component.ts&view=preview"></iframe>

¡Sorpresa! ¿Como es que ya hay uno de los mensajes si ambos componentes están bajo un ngIf?

Concretamente se está creando el componente pasado por proyección de contenido, y es que el encargado de crear el componente y mandarlo hacia abajo, es el **ParentComponent**. Con lo cual el comportamiento que tenemos no es el esperado, es más, es bastante más serio, ya que el componente solo se ha instanciado una única vez, con lo cual da igual lo que haga el ngIf en el hijo, que no tiene control sobre el componente.

## ¿Eso es todo?

No, hay mucho más. ¿Cuál es el contexto de la plantilla? En principio, de la misma forma que en la proyección de contenido el contexto corresponde a donde se declara, con lo que sería para nuestro caso: **ParentComponent**.

Pero un template puede tener variables declarada por ella misma, y además, un contexto.

Un ejemplo muy sencillo es el siguiente, voy a interceptar los mensajes emitidos por **HelloComponent** en el ejemplo anterior y voy a hacer que se rendericen a nivel de hijo sin modificar las llamadas del padre, de tal forma que la proyección de contenido continue funcionando.

Para ello en la salida del hijo le proveo de un **ngOutLetContext** y le digo a que métodos quiero que llame. 

**Child:**
{{<  highlight ts >}}
@Component({
  selector: 'child',
  template: `
      <button (click)="showContent = !showContent">
        Toggle content
      </button>
      <hr />
      <ng-container *ngIf="showContent">
        <ng-container [ngTemplateOutlet]="wontberendered" [ngTemplateOutletContext]="{ onTemplateCreated: onTemplateCreated}">
        </ng-container>
        <ng-content></ng-content>
      </ng-container>
  `
})
export class ChildComponent {
  showContent = false;

  @ContentChild('wontberendered') wontberendered: TemplateRef<any>;

  onTemplateCreated = () => {
    console.log('Child');
  }
}
{{< / highlight >}}

**Parent**
{{< highlight html >}}
    <child>
    <ng-template #wontberendered let-onTemplateCreated="onTemplateCreated">
        <hello (created)="onTemplateCreated()"></hello>
    </ng-template>
    </child>
{{< / highlight >}}

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-template-series-vi?ctl=1&embed=1&file=app/child/child/child.component.ts&view=preview"></iframe>

Y voilá. Si podemos ver la consola, veremos que ahora nuestra plantilla ha "interceptado" este contexto y el método al que se está llamando corresponde al de nuestro componente hijo.

# Resumen

Las plantillas permiten pasar contenido a otros componentes tal y como permite la proyección de contenido. Sin embargo, el control sobre las plantillas recae en el hijo y no en el componente padre.

Las plantillas, además, tienen un contexto, que puede ser sobreescrito por componentes que las reciban otorgándoles aún más control sobre el contenido proyectado y permitiendo hacer componentes reusables cuyo contenido dinámico pueda aprovechar la funcionalidad ya existente.