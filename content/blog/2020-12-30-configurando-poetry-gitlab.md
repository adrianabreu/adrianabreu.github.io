+++
Description = ""
date = "2020-12-30T15:42:32Z"
title = "Configurando poetry y gitlab"
tags = ["Python", "Poetry"]
+++

Hace poco más de un mes cambié de trabajo y me encontré además con un cambio de stack considerable. Ahora estoy trabajando con aws + github + python. Y bueno, al margen de los cambios de conceptos y demás, me ha llevado bastante encontrar un flujo de trabajo que no me pareciera "frágil".

Lo primero y que me ha decepcionado bastante es que github no incluye soporte para hostear paquetes de python. Lo tendrá sí, pero sin fecha clara y [por lo pronto parece que será despues de Junio de 2021](https://github.com/github/roadmap/projects/1?card_filter_query=label%3Apackages).

Tras investigar varias opciones, donde incluso barajé el apuntar a repositorios de git con tags, acabé optando por usar gitlab que en Agosto de este año [puso en su versión gratuita el soporte de paquetes](https://gitlab.com/gitlab-org/gitlab/-/issues/221259).

Ahora tocaba hacer lo básico, crear un paquete con poetry, publicarlo y resolverlo como dependencia en otro proyecto. ¿Por qué poetry y no cualquier otro? Pues porque me cayó en gracia en [este post](https://mungingdata.com/pyspark/poetry-dependency-management-wheel/) de Matthew Powers.

Me gustaba tener una versión "opinionated" que no se sintiera tan manual como el estándar de pip + setup.py. En todo caso, tras instalar poetry siguiendo la [documentación](https://python-poetry.org/docs/), cree un pequeño proyecto con `poetry new package-demo`. 

El setup que hace es bastante básico. Ahora pongamos que este proyecto ya nos vale y lo queremos publicar. En nuestra cuenta de gitlab nos crearemos un nuevo proyecto (ojo, proyecto, no grupo) y vamos a apuntar hacia el con poetry.

La documentación ya trae un descriptivo de como hacerlo con pip: https://docs.gitlab.com/ee/user/packages/pypi_repository/index.html#authenticate-with-a-personal-access-token

Lo primero es crearnos un Personal Access Token desde gitlab. Lamentablemente hay alguna confusión en la documentación y con los permisos de read and write de registry solamente no vale (estos son para las imagenes de docker), así que hay que darle permisos de api.

Ahora configuraremos nuestro repositorio de paquetes con el siguiente comando:

```
poetry config repositories.my-awesome-registry https://gitlab.example.com/api/v4/projects/<project_id>/packages/pypi
```

(El project id está en la vista general del proyecto de gitlab)

`poetry config http-basic.my-awesome-registry username password`

Y ahora podremos publicar el paquete con:

`poetry build`

`poetry publish --repository my-awesome-registry` 

En gitlab podremos ver nuestro paquete publicado en el registry.

Ahora para instalarlo, creamos otro proyecto como `poetry new package-demo-install`.

Para indicarle a que repositorio tiene que ir a buscarlo tenemos que modificar el `.toml`.

Simplemente añadimos estas líneas:

```
[[tool.poetry.source]]
name = "my-awesome-registry"
url = "https://gitlab.example.com/api/v4/projects/<project_id>/packages/pypi/simple/"
```

**¡OJO** El /simple/ del final es muy importante, ya que si no, poetry no buscará paquetes en ese repositorio.

 y hacemos un `poetry add package-demo` nos encontraremos con el proyecto funcionado :).

 Si por un casual fallara podemos aumentar la "verbosity" usando -vvv que es modo debug. (Gracias a este modo descubrí que el /simple/ era imprescindible).