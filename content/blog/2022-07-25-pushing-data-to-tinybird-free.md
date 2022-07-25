+++
Description = ""
date = "2022-07-25T07:28:32Z"
title = "Pusing data to tinybird for free"
tags = ["Github","Streaming","Tinybird"]
+++

So my azure subscription expired and I ended up losing the function I was using to feed my real-time data on analytics (part of the [Transportes Insulares de Tenerife SA](https://github.com/adrianabreu/titsa-gtfs-api) analysis I was making). 

And after some struggle, I decided to move it to a GitHub action. Why? Because the free mins per month were more than enough and because I just needed some script to run on a cron and that script just makes a quest and a post. So, it was quite straightforward.

**Note: I tried to make this using a shell script and I even parse part of the XML answer but boy, I needed to add minutes to a timestamp and that was screaming how a bad idea this was**.

So I make this simple python script for reading data from titsa, parsing the XML, and posting a ndjson to my tinybird source:
```
import requests
import json
import xmltodict
from datetime import datetime, timedelta
import os

if __name__ == '__main__':
    titsa_token = os.getenv('TITSA_TOKEN')
    stop_id = 1918
    titsa_url = f"http://apps.titsa.com/apps/apps_sae_llegadas_parada.asp?idApp={titsa_token}&idParada={stop_id}"
    tinybird_url = "https://api.tinybird.co/v0/datasources?format=ndjson&name=realtime&mode=append"
    tinybird_token = os.getenv('TINYBIRD_TOKEN')

    response = requests.get(titsa_url)

    if response.status_code == 200:
        response = xmltodict.parse(response.content)
        for arrival in response["llegadas"]:
            body = response["llegadas"][arrival]
            mins_next_arrival = response["llegadas"][arrival]["minutosParaLlegar"]
            arrival_time = datetime.strptime(body["hora"], '%d/%m/%Y %H:%M:%S') + timedelta(minutes=int(mins_next_arrival))
            requests.post(url=tinybird_url, data={
                "line": body["linea"],
                "stop_id": body["codigoParada"],
                "calendar_date": arrival_time.strftime("%Y%m%d"),
                "arrival_time": arrival_time.strftime("%H:%M:%S")
            },headers= {"Authorization": f"Bearer {tinybird_token}"})
            print("Data appended")
    else:
        sys.exit(f"Titsa API unavailable {response.status_code}")
```

Now that it was complete I needed to run this command about every 20 mins from 5 am until 11 pm every day. And you can schedule GitHub workflows: 

```
name: Push Data To TinyBird
on:
  push:
  schedule:
    - cron: "*/20 5-23 * * *"
jobs:
  run-bash:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: setup python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9 #install the python needed
      - name: execute py script # run the run.py to get the latest data
        run: |
          python load_realtime.pyz
        env:
          TITSA_TOKEN: ${{ secrets.TITSA_TOKEN }}
          TINYBIRD_TOKEN: ${{ secrets.TINYBIRD_TOKEN }}
```

Why the .pyz? Well, I didn't want to lose time installing all the dependencies every time I needed to run, in the end, if I can save 20 seconds each run I end up saving more than 500 mins per month. It is quite simple to build your dependencies with python 3, first you need to install your dependencies in the project folder:

```
poetry export -f requirements.txt --output requirements.txt
pip3 install -r requirements.txt --target load_realtime
```

Then we can use the inbuilt zipapp for generating that .py

`python3 -m zipapp load_realtime`

With this, we have provided all the dependencies so we won't lose any time installing them.

{{< resp-image "/images/workflows-script.png" >}}