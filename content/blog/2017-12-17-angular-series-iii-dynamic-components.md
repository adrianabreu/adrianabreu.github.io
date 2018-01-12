+++
Description = ""
date = "2017-12-17T14:43:32Z"
title = "Angular Series III - Dynamic components"
+++

Antes de terminar repasando el tema de *templating*, quiero hacer un inciso. Existen ciertos casos donde el templating es insuficiente y lo que necesitamos es simplemente escoger dinámicamente que componente vamos a renderizar. 
 
Esto está documentado en la documentación de angular bajo el nombre de [Dynamic Components](https://angular.io/guide/dynamic-component-loader). 
 
### ¿Cómo funcionan estos dynamics components?  
 
Explicado mal y pronto, la idea es: Escoger un elemento de la vista que actue de contenedor e inyectar el componente debe ir ahí.  
 
**¿Cómo se puede hacer esto?**

Antes de empezar he de aclarar que los componentes dinámicos que queramos crear deben ser declarados como [Entry Components](https://angular.io/guide/ngmodule-faq#what-is-an-entry-component). 

Un entry component es un un componente que no se usa de forma directa en ninguna plantilla. Por ejemplo un componente dinámico como este será eliminado por el compilador. Al declararlo como entry components el compilador no lo eliminará y podremos utilizarlo.


Ahora que ya tenemos esto claro, veamos lo que necesitamos: El [compontentFactoryResolver](https://angular.io/api/core/ComponentFactoryResolver) y el [ViewContainerRef](https://angular.io/api/core/ViewContainerRef). 
 
### Component Factory

Normalmente en nuestra aplicación instanciamos múltiples veces cada componente, por tanto existe una factoría responsable de su creación. 

Esta factoría se puede crear a través de un servicio llamado [Component Factory Resolver](https://angular.io/api/core/ComponentFactoryResolver).

Un ejemplo muy sencillo donde inyectamos conseguimos la factoría necesaria para un determinado componente.

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-dynamic-components-i?ctl=1&embed=1&file=app/app.component.html&view=preview"></iframe>

Hemos:

* Creado un componente dinámico de tipo "entry component".
* Cargado la factoría del componente a través de su tipo.

### ViewContainerRef

Una vez que tenemos la factoría del componente necesitamos inyectarlo en algún sitio. 

Aquí entra en juego el ViewContainerRef. 

Primero hemos de declarar un elemento con un nombre, por ejemplo:

{{< highlight html >}}
<ng-template #dynamiccomponent>
</ng-template>
{{< / highlight >}}

Ahora hemos de hacer una query a este elemento de la plantilla en el ts e inyectar el ViewContainerRef, ambos están en el paquete **@angular/core**.

{{< highlight ts >}}
  @ViewChild('dynamiccomponent')
  viewRef: any;

  constructor(private _cfr: ComponentFactoryResolver,
   private _vcr: ViewContainerRef) {
  }
{{< / highlight >}}

Y lo que haremos será inyectar nuestro componente a través del método **createComponent**.

{{< highlight ts >}}
  onClick() {
    this.componentFactory = this._cfr.resolveComponentFactory(DynamicComponent);
    this._vcr.clear();
    this.viewRef = this._vcr.createComponent(this.componentFactory);
  }

{{< / highlight >}}

Aquí un pequeño ejemplo funcional.

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-dynamic-components-ii?ctl=1&embed=1&file=app/app.component.ts&view=preview"></iframe>

Et voilá! Ya tenemos un componente que podemos generar dinámicamente cada vez que pulsamos un botón.


### Actualizar los inputs del componente

Ahora que ya hemos renderizado el componente nos quedaría gestionar la interacción con el componente. Empecemos por los inputs. Obviamente necesitariamos mostrar algo más que una plantilla aquí, pero es un problema con fácil solucion.

Una vez que hemos creado el componente, tenemos una referencia a su instancia. Hagamos que nuestro dynamic component acepte un input llamado "test" que contiene una string a mostrar en la vista.

Si cogemos el compRef que hemos creado previamente podemos acceder a su instancia y modificar las propiedades directamente:

`(<any>compRef.instance).greeting = 'Salutations!'`

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-dynamic-components-iii?ctl=1&embed=1&file=app/app.component.ts&view=preview"></iframe>

Como vemos, setear el input de nuestro componente ha sido increíblemente sencillo. :)

### Actualizar los outputs del componente

De la misma forma que podemos acceder a los inputs también podemos suscribirnos a los outputs. (Sí, a fin de cuentas, los event emitters no son más que observables).

Vamos a emitir un pequeño evento con un mensaje desde el hijo al pulsar un botón y a renderizar este mensaje en la plantilla del componente padre.

Para ello, añadimos un evento en el hijo:

{{< highlight ts >}}
  @Output()
  farewell = new EventEmitter<string>();

  sayGoodBye() {
    this.farewell.emit('Bye bye Alabama...');
  }
{{< / highlight >}}

Y lo que tenemos que hacer es suscribirnos en el padre, para mostrar el mensaje:

{{< highlight ts >}}
    (<any>compRef.instance).farewell.subscribe(x => this.farewellMessage = x);
{{< / highlight >}}

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-dynamic-components-iv?ctl=1&embed=1&file=app/app.component.ts&view=preview"></iframe>

### Un componente versátil

Ahora que hemos ido punto por punto revisando los pasos necesarios para gestionar un componente dinámic, hagamos un pequeño sumario:

* Necesitamos un lugar donde inyectar el componente.
* Necesitamos que el servicio nos provea de una factoría responsable de crear el componente.
* Tenemos que crear una instancia del componente en la vista. 
* Tenemos que colocar los inputs del componente.
* Tenemos que subscribirnos a los outputs del componente.

¿Por qué no encapsulamos todo este comportamiento en un componente?

Vamos a darle más sentido a nuestro **Dynamic Component** y vamos a hacerle responsable de manejar estas tareas.

Lo primero será encargarnos de recibir el tipo de componente por input y de crearlo en la vista correspondiente.

{{< highlight ts >}}
import { Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'dynamic-component',
  template: `
   <ng-template #dynamiccomponent></ng-template>
  `
})
export class DynamicComponent  {

  @Input()
  compType: any;

  @ViewChild('dynamiccomponent', {read: ViewContainerRef })
  compRef: any;

  constructor(private _cfr: ComponentFactoryResolver) {

  }

  ngOnChanges() {
    this.compRef.clear();
    let compFactory = this._cfr.resolveComponentFactory(this.compType); 
    this.compRef.createComponent(compFactory);   
  }
}
{{< / highlight >}}

Como vemos, han habido unos pequeños cambios. Por ejemplo la sección de **ViewChild** se ha simplificado utilizando la propiedad read.

Ahora tenemos que gestionar los inputs y outputs. ¿Como podemos hacerlo?

Para ambos casos lo mejor seria pasar un objeto que represente el nombre del input / output y el valor (o método) correspondiente.

Empecemos por los inputs, que son el caso más sencillo. La idea es muy simple, iterar el objeto nombre / valor y setearlo en la instancia, quedaría un código tal que:

{{< highlight ts >}}
import { Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'dynamic-component',
  template: `
   <ng-template #dynamiccomponent></ng-template>
  `
})
export class DynamicComponent  {

  @Input()
  compType: any;

  @Input()
  params: Param[];

  @ViewChild('dynamiccomponent', {read: ViewContainerRef })
  compRef: any;

  constructor(private _cfr: ComponentFactoryResolver) {

  }

  ngOnChanges() {
    this.compRef.clear();
    let compFactory = this._cfr.resolveComponentFactory(this.compType); 
    let component = this.compRef.createComponent(compFactory);
    if (this.params) {
      this.params.map(param => {
        component.instance[param.name] = param.value;
      });
    } 
  }
  
}
{{< / highlight >}}


El tipo param solo indica la clave nombre / valor que hemos indicado antes.

{{< highlight ts >}}
  export interface Param {
    name: string;
    value: any;
  }
{{< / highlight >}}

Ahora que ya tenemos los inputs, pasaremos al tema de los outputs. Como necesitamos emitir un valor hacia el padre me he inspirado en el "eventBus" para solucionar la problemática. Condensaremos n outputs en un único output con un objeto nombre / valor.

Al componente le pasaremos un array de nombres de eventos como estos:

{{< highlight ts >}}

  outputs = ['sayHi'];

{{< / highlight >}}

Y además nos hará falta una función en el padre que gestione este evento.

{{< highlight ts >}}

  (outputBus)="onEventEmitted($event)"

  onEventEmitted(event) {
    console.log('Gotcha!, I received', event);
  }

{{< / highlight >}}

Y ahora nos suscribiriemos y relazanremos a través del *eventBus* que hemos creado:

{{< highlight ts >}}
import { Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'dynamic-component',
  template: `
   <ng-template #dynamiccomponent></ng-template>
  `
})
export class DynamicComponent  {

  @Input()
  compType: any;

  @Input()
  params: Param[];

  @Input()
  outputs: any[];

  @Output()
  outputBus = new EventEmitter<any>();

  @ViewChild('dynamiccomponent', { read: ViewContainerRef })
  compRef: any;

  constructor(private _cfr: ComponentFactoryResolver) {

  }

  ngOnChanges() {
    this.compRef.clear();
    let compFactory = this._cfr.resolveComponentFactory(this.compType);
    let component = this.compRef.createComponent(compFactory);
    if (this.params) {
      this.params.map(param => {
        component.instance[param.name] = param.value;
      });
    }

    if (this.outputs) {
      this.outputs.map( output => 
      component.instance[output].subscribe(v => this.outputBus.emit({ name: output, value: v})));
    }
  }
}

{{< / highlight >}}

Y como vemos, ¡ahora podemos ver en la consola ambos eventos lanzados por los distintos componentes!

<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-dynamic-components-v?ctl=1&embed=1&file=app/app.component.ts&view=preview"></iframe>

Aunque en principio quería parar el artículo aquí, aún queda algo muy importante: Gestionar los cambios. Hemos de actualizar los inputs cuando corresponda y hemos de gestionar todas estas suscripciones que estamos creando.

Distinguimos tres pasos: 

1. Conseguir la instancia del componente.
2. Setear los inputs.
3. Suscribir / desuscribir los outputs. 

Como son pasos muy simples y quiero que queden claros, he pasado directamente a poner el código como si fueran un conjunto de pasos que se repiten. 

{{< highlight ts >}}

export class DynamicComponent {

  @Input()
  compType: any;

  @Input()
  params: Param[];

  @Input()
  outputs: any[];

  @Output()
  outputBus = new EventEmitter<any>();

  @ViewChild('dynamiccomponent', { read: ViewContainerRef })
  compRef: any;

  component: any;

  subscriptions: Subscription[] = [];

  constructor(private _cfr: ComponentFactoryResolver) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['compType']) {
      this.clearSubscriptions();
      this.createComponent();
      this.updateInputs(this.component, this.params);
      this.updateOutputs(this.component);
    }

    if (changes['params']) {
      this.updateInputs(this.component, this.params);
    }

    if (changes['outputs']) {
      this.updateOutputs(this.component);
    }
  }

  private createComponent() {
    this.compRef.clear();
    let compFactory = this._cfr.resolveComponentFactory(this.compType);
    this.component = this.compRef.createComponent(compFactory);
  }

  private updateInputs(component, params) {
    this.params.map(param => {
      component.instance[param.name] = param.value;
    });
  }

  private clearSubscriptions() {
    if (this.subscriptions) {
      this.subscriptions.map(subscription => subscription.unsubscribe());
    }
  }

  private updateOutputs(component) {
    this.clearSubscriptions();
    this.outputs.map( output => {
      let subscription = component.instance[output].subscribe(v => this.outputBus.emit({ name: output, value: v}));
      this.subscriptions.push(subscription)
    });
  }
}

{{< / highlight >}}


<iframe class="aa_iframes" src="https://stackblitz.com/edit/angular-dynamic-components-vi?ctl=1&embed=1&file=app/app.component.ts&view=preview"></iframe>

¡Con esto ya estamos listos para crear componentes dinámicos! 