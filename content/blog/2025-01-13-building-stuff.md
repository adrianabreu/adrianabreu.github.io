+++
Description = "A guide on setting up a vps with docker for a golang webapp"
date = "2025-01-13T20:07:32Z"
title = "I’m Building Stuff – My New Motto"
tags = ["Go", "VPS"]
+++

For the past seven years, I worked in data, and I have mixed feelings about it. I still believe data is the most important part of any app, but it’s meaningless without the app itself.

Now that I’m working at a startup, I’ve decided to focus on building things. To start, I revisited one of my older projects: a PDF parser about professor designations in the Canary Islands, where one of my best friends works as a teacher.

Using gomponents, SQLite, and Echo, I built a simple web app around this parser. And I wanted my friend to use it. So I had a good new challenge: deploying it.

I took advantage of a great Black Friday deal from [OVH](https://www.ovh.com/) to get a VPS. I also had a [Namecheap](https://www.namecheap.com/) domain ready to go.

For guidance, I followed this excellent video tutorial by Dreams of Code: [Setting up a production ready VPS is a lot easier than I thought](https://www.youtube.com/watch?v=F-9KWQByeU0).

**Disclaimer**: For a more accesible guide, check his source code on GitHub: [dreamsofcode-io/guestbook](https://github.com/dreamsofcode-io/guestbook)

Let's dive in.


## SSH Hardening  

I followed OVH's suggestions from their [documentation](https://help.ovhcloud.com/csm/en-gb-dedicated-servers-securing-server?id=kb_article_view&sysparm_article=KB0043969).  

First, I changed the default SSH port to a random one, like 49882. Since the documentation’s solution didn’t work for Ubuntu 24.04, I had to search for an updated approach.  

Let’s edit `/etc/ssh/sshd_config`:  

Uncomment the port line and set it to the new number:  

```
...
Include /etc/ssh/sshd_config.d/*.conf

Port 49882
#AddressFamily any
#ListenAddress 0.0.0.0
#ListenAddress ::
...
```  

Restart the SSH service:  

```bash
sudo systemctl restart ssh.service
```  

Now, log in again using:  

```bash
ssh user@ip -p 49882
```  

To further secure the server, I configured SSH to use a key-based login and disabled password authentication. This part was a bit tricky. While it seems like you can modify the same `/etc/ssh/sshd_config` file, the configuration also includes other files with the line:  

```
Include /etc/ssh/sshd_config.d/*.conf
```  

One of these files, `/etc/ssh/sshd_config.d/50-cloud-init.conf`, contains `PasswordAuthentication yes`. To disable password authentication, you’ll need to either edit this file or remove it altogether.  

Make sure you’re using the root user (`sudo su`) to access and modify these files.  

After making these changes, if you try to access the server without an SSH key, you’ll see:  

```  
Permission denied (publickey).  
```  


## Enabling a Firewall  

As suggested in the video, we’ll use UFW to limit traffic. To do this, enable the following rules:  

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 49882  # SSH port
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
```  

Then, enable the firewall with:  

```bash
sudo ufw enable
```  

For more detailed documentation, refer to: [How to Set Up a Firewall with UFW on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu).  

---

## Dockerization  

To streamline deployments, we’ll publish two Docker images to our GitHub registry.  

Using a matrix build (as suggested in [this GitHub issue](https://github.com/docker/build-push-action/issues/561)), we can create a workflow that builds and pushes both the API and the ingestor.  

Here’s an example workflow file:  

```
name: Build & publish professors-designations images
on:
    push:
        branches:
          - main
    
permissions:
    packages: write
    

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push-image:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - dockerfile: ./cmd/api/Dockerfile
            image: ghcr.io/adrianabreu/professors-designations-web
          - dockerfile: ./cmd/ingest/Dockerfile
            image: ghcr.io/adrianabreu/professors-designations-ingest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Log in to the Container registry
        uses: docker/login-action@f054a8b539a109f9f41c372932f1ae047eff08c9
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@98669ae865ea3cffbcbaa878cf57c20bbf1c6c38
        with:
          images: ${{ matrix.image }}

      - name: Build and push Docker image Professor Designation
        uses: docker/build-push-action@ad44023a93711e3deb337508980b4b5e9bcdc5dc
        with:
          context: .
          file: ${{ matrix.dockerfile }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```  

Next, we update the images remotely by logging into our GitHub namespace from the VPS. Due to a GitHub registry limitation, you’ll need to configure a personal access token. Export it as an environment variable (`CR_PAT`) and log in with:  

```bash
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```  

To enable automatic updates for Docker images, add Watchtower. Assign the following label to your services:  

```yaml
labels:
  - "com.centurylinklab.watchtower.enable=true"
```  

Then add the Watchtower service:  

```yaml
watchtower:
  image: containrrr/watchtower
  command:
    - "--interval"
    - "180"
    - "--label-enable"
  volumes:
    - "/var/run/docker.sock:/var/run/docker.sock"
```  

---

## Adding Traefik  

Traefik acts as a reverse proxy, allowing multiple subdomains to point to different services. It also automates Let’s Encrypt certificate generation for HTTPS.  

Traefik’s documentation is excellent and covers these configurations in detail:  
1. [Routing Configuration with Labels](https://doc.traefik.io/traefik/providers/docker/#routing-configuration-with-labels)  
2. [ACME Configuration Examples](https://doc.traefik.io/traefik/https/acme/#configuration-examples)  

### Challenges with Cloudflare  
1. I encountered a loop when enabling Let’s Encrypt. To fix this, I changed the SSL setting in Cloudflare from *Flexible* to *Full*.  
2. TLS challenge didn’t work, so I switched to the HTTP challenge.  



Now my service is fully deployed at: [https://profesores.adrianabreu.com](https://profesores.adrianabreu.com)  
