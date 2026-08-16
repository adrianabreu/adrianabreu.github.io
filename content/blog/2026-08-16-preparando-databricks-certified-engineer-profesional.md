+++
Description = "Preparando databricks certified engineer professional (I)"
date = "2026-08-16T15:13:00Z"
title = "Preparando databricks certified engineer professional (I)"
tags = ["data engineering", "databricks"]
+++

Continuando en mi cambio de trabajo por año. Intento volver a databricks. Es la tecnología que mejor se adapta a mí y que me permite mantener casi sin esfuerzo esa mentalidad constante de kaizen. 

Hace unos meses fue el [Databricks Learning Festival]() donde por completar unos cursos, obtuve un 50% de descuento en certificaciones. Ahora tengo el examen en aproximadamente 11 días y el problema, es que hace dos años que no toco databricks. Hace dos años mi stack se basaba en:

1) Crear jobs con scala y subir jars usando el databricks cli como ci/cd. 
2) Automatizar infraestructura de databricks usando terraform. 
3) Gestionar pequeños dashboards en databricks sql.

Por supuesto me dejo la parte divertida: mantener miles de millones de eventos diarios en kafka, hacer frameworks que imitaban a las delta live tables a menor coste y tunear hasta el mínimo detalle mientras se hacían miles de reportes sobre las tabals de billing.

Ahora me encuentro con una docena de tecnologías nuevas que simplifican el trabajo, y con la necesidad de hacer muchas notas. El examen está actualizado en julio de 2026. Voy a usar databricks free en la medida de lo posible para intentar valida casi todos los conceptos. E intentaré publicar el repo con los ejercicios de ejemplo acompañando esto. 

Para estudiar simplemente se coge la guia de referencia:
Developing Code for Data Processing using Python and SQL – 22%
Data Ingestion & Acquisition – 7%
Data Transformation, Cleansing, and Quality – 10%
Data Sharing and Federation – 5%
Monitoring and Alerting – 10%
Cost & Performance Optimisation – 13%
Ensuring Data Security and Compliance – 10%
Data Governance – 7%
Debugging and Deploying – 10%
Data Modelling – 6%

Voy a ir añadiendo contenidos en base al tamaño del módulo. El último, evidentemente, será el primero. Por ser el más grande y el que más ejemplos necesita.

Hoy me centraré en Ensuring Data Security and Compliance. Si abrimos la guía del PDF, estos son los contenidos detallados:

● Applying Data Security mechanisms.
  ○ Use ACLs to secure Workspace Objects, enforcing the principle of least privilege including enforcing principles like least privilege, policy enforcement.
  ○ Use row filters and column masks to filter and mask sensitive table data.
  ○ Apply anonymization and pseudonymization methods, such as Hashing, Tokenization, Suppression, and generalization, to confidential data.
● Ensuring Compliance
  ○ Implement a compliant batch & streaming pipeline that detects and applies masking of PII to ensure data privacy.
  ○ Develop a data purging solution ensuring compliance with data retention policies.


De todo he incluido un pequeño ejemplo en este repositorio git:  https://github.com/adrianabreu/de-professional-training/tree/main/07.Ensuring%20Data%20Security