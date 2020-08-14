+++
Description = ""
date = "2020-05-30T19:52:32Z"
title = "Acceso al keyvault mediante certificados"
tags = ["Azure", "KeyVault"]
+++

En el proceso de migración de una aplicación de webjob a azure batch, nos encontramos con la problemática de gestionar los secretos. El servicio de batch se encarga de recoger una aplicación de un storage y hacer ejecuciones de ellas (tasks) en unas máquinas concretas (pool).

Para poder gestionar los secretos de la aplicación, estos estaban guardados en keyvault. Y teníamos que acceder de forma segura a ello. Por eso optamos por utilizar la autenticación via certificado. La idea de este tutorial es reproducir los mismos pasos que he usado yo para poder usar este certificado.

El objetivo es conseguir recuperar este secreto desde keyvault:

{{< resp-image "/images/acceso-keyvault/1.png" >}}

Lo primero es generar un certificado en la sección de **Certificados** de keyvault.

Lo generaremos de tipo **pfx**.

Y lo habilitaremos (simplemente hacer click en el certificado y marcarlo como habilitado).

{{< resp-image "/images/acceso-keyvault/2.png" >}}

Exportamos el certificado en formato .cer.

Ahora registraremos una aplicación en el directorio activo y le asociaremos este certificado:

{{< resp-image "/images/acceso-keyvault/3.png" >}}

Por último, le daremos permisos a esta aplicación para gestionar los secretos en la sección de **Access Policies** del keyvault.

{{< resp-image "/images/acceso-keyvault/4.png" >}}

Llega el momento de probar todo lo que hemos configurado. Exportamos el certificado en formato pfx y lo instalamos en nuestra máquina.
Ahora nos falta el código para acceder:

{{< highlight csharp >}}
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;

namespace testkeyvaultsecret
{
    class Program
    {
        static void Main(string[] args)
        {
            var configurationBuilder = new ConfigurationBuilder();

            var store = new X509Store(StoreLocation.CurrentUser);
            store.Open(OpenFlags.ReadOnly);

            var thumbprint = "CERTIFICATE_THUMBPRINT";

            var cert = store.Certificates.Find(X509FindType.FindByThumbprint, thumbprint, false)
                                         .OfType<X509Certificate2>().SingleOrDefault();

            if (cert == null) throw new Exception("No Certificate found");

            configurationBuilder.AddAzureKeyVault
                                ("KEY_VAULT_URL",
                                "AAD_CLIENT_IDS",
                                cert);

            var config = configurationBuilder.Build();

            Console.WriteLine(config["mysecret"]);
            Console.ReadKey();
        }
    }
}
{{</ highlight >}}

Y este es el resultado:

{{< resp-image "/images/acceso-keyvault/5.png" >}}

Voilá.

Espero que esto os haya servido :) Para cualquier duda o sugerencia podeis contactarme por twitter o email.
