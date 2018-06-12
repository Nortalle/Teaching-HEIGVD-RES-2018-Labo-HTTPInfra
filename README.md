# Teaching-HEIGVD-RES-2018-Labo-HTTPInfra

## Objectives

The first objective of this lab is to get familiar with software tools that will allow us to build a **complete web infrastructure**. By that, we mean that we will build an environment that will allow us to serve **static and dynamic content** to web browsers. To do that, we will see that the **apache httpd server** can act both as a **HTTP server** and as a **reverse proxy**. We will also see that **express.js** is a JavaScript framework that makes it very easy to write dynamic web apps.

The second objective is to implement a simple, yet complete, **dynamic web application**. We will create **HTML**, **CSS** and **JavaScript**  assets that will be served to the browsers and presented to the users.  The JavaScript code executed in the browser will issue asynchronous HTTP  requests to our web infrastructure (**AJAX requests**) and fetch content generated dynamically.

The third objective is to practice our usage of **Docker**.  All the components of the web infrastructure will be packaged in custom  Docker images (we will create at least 3 different images).

## Step 1: Static HTTP server with apache httpd

### You have a GitHub repo with everything needed to build the Docker image. 

[Repo]: https://github.com/Nortalle/Teaching-HEIGVD-RES-2018-Labo-HTTPInfra

### You do a demo, where you build the image, run a container and access content from a browser. 

```bash
$ docker build -t res/apache_php .

$ docker run -d -p 9090:80 res/apache_php
```

The content we'll be visible on http://localhost:9090/

### You have used a nice looking web template, different from the one shown in the webcast. 

[One Page Wonder]: https://startbootstrap.com/template-overviews/one-page-wonder/

### You are able to explain what you do in the Dockerfile. 

Voici le contenu du dockerfile

```dockerfile
FROM php:7.0-apache
COPY content/ /var/www/html/
```

### You are able to show where the apache config files are located (in a running container). 

Nous exécutons :

```bash
$ docker exec -it <dockerfile_name> /bin/bash
```

ensuite nous allons jusqu'au dossier `etc`

## Step 2: Dynamic HTTP server with express.js

###You do a demo, where you build the image, run a container and access content from a browser.

```dockerfile
FROM node:8.11

COPY src /opt/app

CMD ["node", "/opt/app/index.js"]
```



```bash
$ docker build -t res/express_students .
$ docker run -d -p 3000:3000 res/express_students
```

###You generate dynamic, random content and return a JSON payload to the client.

```json
[ { address: '899 Renka Ridge',
    areacode: '(360)',
    city: 'Lijheka' },
  { address: '1702 Uhsun Path', areacode: '(269)', city: 'Ogrima' },
  { address: '1316 Ekkek Center',
    areacode: '(382)',
    city: 'Lakjole' },
  { address: '1751 Bied Point',
    areacode: '(278)',
    city: 'Hazonmab' },
  { address: '425 Culoz Key', areacode: '(467)', city: 'Gujege' },
  { address: '1564 Nacal Highway',
    areacode: '(752)',
    city: 'Betpukhi' },
  { address: '1254 Muvdew Trail',
    areacode: '(278)',
    city: 'Rabtuvzo' },
  { address: '1821 Edolo Ridge',
    areacode: '(873)',
    city: 'Palulnud' } ]

```

 ## Step 3: Reverse proxy with apache (static configuration)

###You do a demo, where you start from an "empty" Docker environment  (no container running) and where you start 3 containers: static server,  dynamic server and reverse proxy; in the demo, you prove that the  routing is done correctly by the reverse proxy.

```bash
$ docker build -t res/express_students . 
$ docker build -t res/apache_php .
$ docker build -t res/apache_rp .

$ docker run -d --name apache_static res/apache_php
$ docker run -d --name express_dynamic res/express_students
$ docker run -d res/apache_rp

$ docker inspect apache_static | grep -i ipaddress
$ docker inspect express_dynamic | grep -i ipaddress
```

###You are able to explain why the static configuration is fragile and needs to be improved

This static configuration is fragile because we need the docker to be build in a certain order so they have the right ip addresses.

## Step 4: AJAX requests with JQuery

```javascript
$(function () {
    console.log("loading addresses");

    function loadAddresses() {
        $.getJSON("/api/students/", function (addresses) {
            console.log(addresses);
            var message = "No Addresses is here";
            if (addresses.length > 0) {
                message = addresses[0].address + " " + addresses[0].areacode + " " + addresses[0].city;
            }
            $(".display-4").text(message);
        });
    };

    loadAddresses();
    setInterval(loadAddresses, 2000);
});
```

## Step 5: Dynamic reverse proxy configuration

- You have found a way to replace the static configuration of the  reverse proxy (hard-coded IP adresses) with a dynamic configuration.

  ```bash
  $ docker run -d -e STATIC_APP=172.17.0.5:80 -e DYNAMIC_APP=172.17.0.8:3000 --name apache_rp -p 8080:80 res/apache_rp
  ```

- You may use the approach presented in the webcast (environment  variables and PHP script executed when the reverse proxy container is  started), or you may use another approach. The requirement is that you  should not have to rebuild the reverse proxy Docker image when the IP  addresses of the servers change.

  **Dockerfile**

  ```dockerfile
  FROM php:7.0-apache
  
  RUN apt-get update && \ 
  	apt-get install -y vim
  
  COPY apache2-foreground /usr/local/bin
  COPY templates /var/apache2/templates
  COPY conf/ /etc/apache2/
  
  RUN a2enmod proxy proxy_http
  RUN a2ensite 000-* 001-* 
  ```

  **apache2-foreground**

  ```bash
  # Add Setup for RES lab
  echo "Setup for the RES lab.."
  echo "Static app URL: $STATIC_APP"
  echo "Dynamic app URL: $DYNAMIC_APP"
  
  $ php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf 
  ```

  **config-template.php**

  ```php
  <?php
  
  $static_app = getenv('STATIC_APP');
  $dynamic_app = getenv('DYNAMIC_APP');
  
  ?>
  <VirtualHost *:80>
  
  	ServerName demo.res.ch
  
          ProxyPass '/api/students/' 'http://<?php print "$dynamic_app"?>/'
          ProxyPassReverse '/api/students/' 'http://<?php print "$dynamic_app"?>/'
  
          ProxyPass '/' 'http://<?php print "$static_app"?>/'
          ProxyPassReverse '/' 'http://<?php print "$static_app"?>/'
  </VirtualHost>
  ```

## Management UI 

we run : 

```bash
#docker volume create portainer_data
$ docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer

```

