+++
Description = ""
date = "2017-08-04T16:37:11Z"
title = "Auto deployment en gh-pages con Travis"
+++

Una de las mejores características de github sin duda alguna, son las [gh-pages](https://pages.github.com/). 
 
Las gh-pages nos permiten desplegar el código de nuestra aplicación frontend a través de esta rama, de tal forma que muchos de nuestros proyectos (por ejemplo este blog) estén disponibles sin tener limitaciones de hosting. 
 
Pero sin duda una desventaja es el hecho de tener que mantener el deploy de nuestras revisiones: cambiar de rama, eliminar el contenido, hacer una build y desplegar.  
 
¡Pero todo esto puede automatizarse mediante el uso de travis! [Travis](https://travis-ci.org/) es una herramienta gratuita* que permite hacer integración continua (es la responsable de las famosas notas de la build). 
 
Como el procedimiento de activación de la cuenta es muy sencillo y hay decenas de tutoriales, voy a centrarme en el aspecto del deploy, que es lo realmente importante. Para ello usaré un script de gist y lo explicaré detalladamente: 
 
[Fuente](https://gist.github.com/domenic/ec8b0fc8ab45f39403dd) 

``` 
#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

function doCompile {
  ./compile.sh
}

# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy; just doing a build."
    doCompile
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deply)
git clone $REPO out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..

# Clean out existing contents
rm -rf out/**/* || exit 0

# Run our compile script
doCompile

# Now let's go have some fun with the cloned repo
cd out
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# If there are no changes to the compiled out (e.g. this is a README update) then just bail.
if git diff --quiet; then
    echo "No changes to the output on this push; exiting."
    exit 0
fi

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A .
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ../deploy_key.enc -out ../deploy_key -d
chmod 600 ../deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH
``` 

Revisemos poco a poco que hace este script:

```
function doCompile {
  ./compile.sh
}
```

Esta función se encargará de compilar nuestro código, para un proyecto tipico quedaría

```
function doCompile {
  npm run build
}
```

Saltaré las siguientes comprobaciones por son lo propio que explica el comentario, me centraré en este bloque:

```
git clone $REPO out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..
```

**out** representa el directorio de salida de la compilación, en mi caso es dist, asi que lo modifico.

```
git clone $REPO dist
cd dist
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..
```

¿Qué es lo que hace? Clona nuestro repositorio de nuevo en la carpeta de salida de nuestra build, se mete en ella y cambia de rama, de esta forma nuestra carpeta de salida estará vinculada a nuestra rama de gh-pages. En caso de que la rama no exista utiliza el parámetro `--orphan`. 

Este parámetro es realmente interesante. Cuando creamos una rama en git normalmente partimos de un commit inicial. Por ejemplo.

```
master: A ----- B ----- C
                 \
gh-pages:         \----- D 
```

Sin embargo, cuando le decimos que es de tipo `orphan` lo que hace es crear una rama totalmente desvinculada que tiene su propio initial commit y sus ficheros no están relacionados.

```
master:   A ----- B ----- C

gh-pages: D ----- E ----- F 
```

Esto es precisamente lo que necesitamos para la rama de gh-pages, ya que solo va a incluir los ficheros de la carpeta de salida. 

Bien, el resto en general parece bastante claro, asi que pasemos a la parte final: 

```
# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ../deploy_key.enc -out ../deploy_key -d
chmod 600 ../deploy_key
eval `ssh-agent -s`
ssh-add deploy_key
```

Con el objetivo de mejorar la seguridad utilizaremos un deploy_key. Lo que vamos a hacer es lo siguiente:

1. Generar una nueva clave de ssh `ssh-keygen -t rsa -b 4096 -C "tu@email.com"`

2. Añadir la clave pública al repositorio en cuestión en la sección de **"Deploy keys"**.

3. Ahora es necesario que publiquemos nuestra clave privada en el repositorio, cosa que no es muy segura, asi que vamos a utilizar el [cliente de travis](https://github.com/travis-ci/travis.rb). Nos logueamos utilizando `travis login` y utilizamos la utilidad `travis encrypt-file`.

4. La idea es generar el fichero `deploy_key.enc` que utilizaremos en el script. A la salida nos saldrá un comando ssl que deberemos añadir, pero el script se preocupa de ello por nosotros, asi que solo necesitamos la cadena que sale entre _. Por ejemplo de `$encrypted_0a6446eb3ae3_key ` necesitamos `0a6446eb3ae3`. Esta variable se irá al fichero .travis.yml.

5. Añadimos un fichero .travis.yml 
```
language: generic # don't install any environment

script: bash ./deploy.sh
env:
  global:
  - ENCRYPTION_LABEL: "<.... encryption label from previous step ....>"
  - COMMIT_AUTHOR_EMAIL: "you@example.com"
  ```

Donde el encription label es la clave que hemos sacado del pasado anterior y el author email nuestro email.

Con todo esto listo, cuando hagamos el próximo push a master, nuestro proyecto se compilará automáticamente y subirá el resultado a gh-pages.

Si queréis ver algún ejemplo ahora mismo tengo dos proyectos utilizando esta configuración: 
[Simde Simulator](https://github.com/adrianabreu/SIMDE-Simulator) y [Chuck Norris Angular Client](https://github.com/adrianabreu/chuck-norris-angular-client)

Espero que esto fomente la creación de muchísimos proyectos nuevos y que os animéis.


\* Gratuita con limitaciones, ya que no permite hacer la gestión de los repositorios privados si no "aflojas pasta". 