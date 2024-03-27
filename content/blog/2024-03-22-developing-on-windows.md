+++
Description = ""
date = "2024-03-22T18:06:32Z"
title = "Developing on windows"
tags = ["Spark", "Scala", "WSL"]
+++

Over the years, I've been using MacOS at work and Ubuntu at home for my development tasks. However, my Lenovo P1 Gen 3 laptop didn't work well with Linux, leading to frequent issues with the camera and graphics (screen flickering, I'm looking at you, and it hurts).

I've triend  Windows Subsystem for Linux (WSL) but it was quite bad to be honest. But as I've heard of WSL2 and WSLg, I decided to give it another shot.


Here is my experience preparing my just formatted windows pc to work with sala and spark.

Installing WSL2: Enable WSL2 Feature: Open PowerShell in administrator mode and run the command `wsl --install`.

Testing WSLg: Install gedit `sudo apt install gedit` to test WSLg functionality.

Let's prepare our environment using sdkman.

```
    sudo apt-get install unzip zip
    curl -s "https://get.sdkman.io" | bash
    source "/home/abreu/.sdkman/bin/sdkman-init.sh"
``` 

And let's set  java, scala and spark:

```
    sdk install java 11.0.22-zulu
    sdk install scala 2.12.19
    sdk install spark 3.3.4
```
    
Cool, time for Intellij!: Use the IntelliJ Toolbox and install dependencies with this super nice script:

`sudo curl -fsSL https://raw.githubusercontent.com/nagygergo/jetbrains-toolbox-install/master/jetbrains-toolbox.sh | bash`

It also required an extra dependency fuse. But I just needed to type: `sudo apt install libfuse2`.

{{< resp-image "/images/wsl-toolbox.png" >}}


Extra: You can skip docker-desktop and just run dockerd inside WSL.

I can't literally believe this. In less than 1 hour I had my windows setup working smoothly and with my screen working properly as well as my camera!

Totally recommended.