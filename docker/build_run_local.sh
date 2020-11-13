#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
IMAGENAME=TEMPLATE
PORT=TEMP_PORT

# Stop container if it is already running
docker stop ${IMAGENAME}

# Navigating to root directory
cd ${SCRIPT_DIR}
cd ..

# Building the image
docker build . -f Dockerfile -t ${IMAGENAME}

# Running the image
docker run -d --rm --env-file ${SCRIPT_DIR}/dockerenv.vars --name ${IMAGENAME} -p ${PORT}:3000 ${IMAGENAME}
sleep 1
docker ps