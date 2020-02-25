+++
Description = ""
date = "2020-02-24T19:22:32Z"
title = "Límites en azure functions para procesos de larga duración"
+++

Estas últimas semanas he tenido que implementar ciertas mejoras en un proyecto. El objetivo era muy simple, conectar el proyecto a una aplicación de datawarehousing existente, y de forma externa, realizar agregados y luego aplicar cierto procesamiento para un servicio en particular.

Además había una serie de requisitos extras:

1. El procesamiento iba a ser reutilizado por otro proyecto. Y requería comprimir y cifrar archivos grandes.
2. La primera parte tenía que simplemente, 
3. Había una deadline muy cercana para este proyecto.


Con todas estas limitaciones, la solución propuesta fue esta:

{{< resp-image "/images/function-bus.png" >}}

Una azure function cuyo trigger sería un service bus que viene desde el datawarehouse. Esta function sería la responsable de consumir el mensaje y mandar la query. 
Después, llamaría a otra function que continuaría con el resto de proceso compartido, pero que queda fuera de scope en este artículo.

Tras hacer una serie de pruebas me encontré con que algunas queries de agregados eran realmente lentas. En principio no debería haber ningún problema, ya que la function era de tipo service plan y el host.json tenía la propiedad de functionTimeout a -1.

```
{
    "version": "2.0",
    "functionTimeout": -1
}
```

Sin embargo, me encontré con otra sorpresa. El peek del mensaje del service bus. Tal como dice la documentación, [el tiempo máximo que podemos tener un mensaje de service bus marcado como invisible es de 10 minutos](https://docs.microsoft.com/th-th/azure/azure-functions/functions-bindings-service-bus-trigger?tabs=csharp#peeklock-behavior). Y esto no es una limitación de la function, sino del service bus en sí. Además, la mayoría de soluciones ya no eran compatibles con functions v2 porque se había cambiado el modelo que exponía el sdk.

Después de darle vueltas, estuve revisando que pasaba con el caso de los mensajes de un storage. Y aquí fue donde encontre la luz. Aunque la documentación era claramente confusa porque, ojo, el [parámetro de visibilityTimeout del host.json representa que el tiempo que el mensaje permanece invisible tras FALLAR una de las ejecuciones](https://docs.microsoft.com/es-es/azure/azure-functions/functions-bindings-storage-queue?tabs=csharp#host-json). 

Existe dentro del código un visibilityTimeout que realmente representa lo que queremos: El tiempo en el cual el mensaje esta marcado como invisible. Ese código es [este](https://github.com/Azure/azure-webjobs-sdk/blob/4130350327c6d637d48456222de7e658c6cf729a/src/Microsoft.Azure.WebJobs.Extensions.Storage/Queues/Listeners/QueueListener.cs#L104).

Ahora, la nueva implementación ha pasado a ser esta:

{{< resp-image "/images/function-bus-queue.png" >}}

Y por ahora, tras las pruebas realizadas. Ha funcionado como se esperaba y ha resuelto la casuística.