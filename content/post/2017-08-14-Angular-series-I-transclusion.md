+++
Description = ""
date = "2017-08-14T17:32:37Z"
title = "Angular series I - Proyección de contenido (Content projection)"
+++

Cuaqndo creé este blog tenía bastante claro que uno de los objetivos principales era que me sirviera de utilidad para interiorizar lo que voy aprendiendo.
Y aunque he escrito ciertas cosas útiles para mi día a día no estoy registrando ni una centésima parte de la información que mi mente ha ido procesando estos
meses.

Así que voy a dedicarme a escribir un artículo semanal sobre un tema con el que llevo ya casi un año: **Angular**.

No tengo un roadmap definido. Sé que no quiero detenerme en los conceptos más básicos de Angular porque de eso existen miles de tutoriales. Por ejemplo
hoy quiero hablar de un concepto importantísimo pero que pasa desapercibido: La proyección de contenido (o transclusión para los viejos amigos de AngularJs).

**¿Qué es la proyección de contenido?** Es la capacidad de pasar código html de un componente a otro. Siempre se habla de que los componentes deben ser 
reusables al cien por cien, pero mucha gente acaba haciendo lo mismo. 

La proyección de contenido es muy sencilla, partiendo de un componente *A* que tiene dos hijos *B* y *C* haremos que sea A quien pase el contenido a mostrar
en estos dos hijos. De hecho, para darle más "gracia", el objetivo es que para una misma cadena el componente B muestre esta cadena en mayúsculas y el C en minúsculas.

Asumiendo que ya están los componentes definidos en sus respectivos módulos y demás, vamos a poner una estructura muy simple. La clave de esto es la
etiqueta `ng-content`que será reemplazada por el contenido que proyectemos. 

```
@Component({
  selector: 'app-b',
  template: `<h2><ng-content></ng-content><h2>`
})
export class BComponent {
}

@Component({
  selector: 'app-c',
  template: `<div style="color: red"><ng-content></ng-content></div>`
})
export class CComponent {

}

```

Como vemos los componentes no hacen nada más que proyectar el contenido de su padre y decorar el mismo. 

Ahora el componente A se encargará de mandar la información necesaria.

```
@Component({
  selector: 'app-a',
  template: `<app-c>{{title | uppercase }}</app-c>
  <app-b>{{title | lowercase}} </app-b>
  `
})
export class AComponent {

  title = 'Content projection';

}
```

Y esto nos genera como resultado...

{{< figure src="/images/angular1-cp/result1.png" >}}


¿Sencillo, verdad? Ahora solo queda un problema. ¿Que pasaría si quisieramos pasar diversas parte de un contenido? Pensemos en esta plantilla para un componente **Artículo**.

```
<article>
  <header><ng-content></ng-content></header>
  <section><ng-content></ng-content></section>
  <footer><ng-content></ng-content></footer>
</article>
```

Como vemos este "artículo", soporta no uno, sino **tres** ng-content. ¿Como identificamos donde va lo que corresponde? Simplemente: nombrándolos.  

```
<article>
  <header>
    <ng-content select=".header"></ng-content>
  </header>
  <section>
    <ng-content select=".section"></ng-content>
  </section>
  <footer>
    <ng-content select=".footer"></ng-content>
  </footer>
</article>
```

En este caso le decimos al ng-content, que nos reemplace el contenido por el de aquellos elementos que tengan la clase del tipo correspondiente.

Se pueden usar etiquetas o directivas, [como explica el fabuloso libro de Rangle.io](https://angular-2-training-book.rangle.io/handout/components/projection.html)

Y si ahora nuestro componente padre nos indica el contenido de esas secciones...

```
<ng-container *ngFor="let datum of data">
  <article>
    <div class="header">{{datum.header}}</div>
    <div class="section">{{datum.body}}</div>
    <div class="footer">{{datum.footer}}</div>
  </article>
</ng-container>
```

Obtendremos esto: voilá.

{{< figure src="/images/angular1-cp/result2.png" >}}


Como siempre, [tenéis el código fuente disponible en github](https://github.com/adrianabreu/angular-samples/tree/master/transclusion), espero que haya servido de ayuda, al menos a mí si que me ha servido.