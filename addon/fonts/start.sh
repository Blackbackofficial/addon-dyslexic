#!/bin/bash
docker build -t fonts_static .
docker run --name fonts_static -p 8080:8080 -t fonts_static