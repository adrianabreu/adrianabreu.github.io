+++
Description = "Aprender de nuevo"
date = "2026-01-06T20:14:10"
title = "Aprender de nuevo"
tags = ["data engineering","job"]
+++

2025 ha sido un año bastante loco.

Pasé la mayor parte del año sentando las bases de una startup en el mundo de la seguridad, haciendo frontend, backend, mucho devops y... poco data.

Me pilló de lleno la era de la AI y como siempre, el campo ajeno es más verde. Viví la burbuja de v0 y mi trabajo respecto a este, fue bastante miserable. El proyecto a medida que crecía dejaba de ser funcional. Un cambio manual que arreglase el mismo era incompatible. 

Las pequeñas funcionalidades que iban saliendo para permitir el 2-way (to git and from git) simplemente no me llegaron a funcionar.

Mientras en twitter la gente construía prototipos con supabase en un fin de semana y sacaban pecho, mi trabajo era a grosso modo, "achicar" agua del barco.

Pasé semanas luchando para estandarizar el proyecto, encontrando errores criticos como filtrar las credenciales de supabase al navegador o renderizar 300k filas en cliente y causar un out of memory. 

No es que me molesten estos errores, me molesta la capacidad de generarlos recurremente y la falta del bucle: ha pasado esto, aprendemos, seguimos.

Con cursor la cosa mejoró bastante, primero simplemente añadiendo el contexto de los fichero de referencia acabé con un flujo bastante sólido. Mis chats eran de una longitud pequeña y la velocidad de crucero se alcanzó rápido. El único drawback era que:
A) Las cosas no se hacian siempre igual 
B) A veces hacía algo mal y no había forma de evitarlo

Refinando rules se acabó ese problema. No estuvo nada mal.

NextJS no me acaba de encajar, especialmente para una aplicación intensiva en formularios. En el código generado por v0 el 90% era "use client" y poca estandarización.

Por otro lado better-auth y drizzle fueron una absoluta pasada. No puedo dejar de recomendarlas y pensar que era el batteries powered que necesitaba.

Pero en definitiva, mi cruce con el AI generated code fue una cruzada intensiva y frustante que me ha hecho muy escéptico de todo. 

Pero un vídeo hace poco hablaba de usar un LLM para revisar el aprendizaje de un lenguaje y la verdad es que me gustaría incluir Rust en mi toolkit de 2026. Primero porque creo que en un futuro mediano será relevante, segundo porque en la apuesta de duckdb vs rust, me interesa más la aproximación estilo lenguaje como datafusion que la aproximación de puro SQL. (Y ojo, que este año tengo planes de probarlo bien).

Feliz 2026 :) 