# BPI-Clone

## Before running the project

- Please do ```npm install``` in the root directory to install all the dependencies.
- Before we start, please make sure you have the following installed:
  - Node.js
  - Docker
  - Google Cloud SDK (For application-level logging)
- Setup **GCP** (For application-level logging)
  - Create a project in GCP
  - Take note of the project ID
  - If your using mac:
    - brew --cask install google-cloud-sdk
    - gcloud init
    - gcloud auth application-default login
  - Under IAM & Admin, create a service account
  - Download the key and save it in the root directory as key.json
  - Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the key.json file (export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json") <- Put this into your .zshrc or .bashrc (or whatever shell you are using)
- Setup **Dockerfile**
  - In your terminal, run ```docker build -t postgres_server .``` to build the docker image
  - Run ```docker run -d -p 5432:5432 postgres_server``` to run the docker container
  - The ```init.sql``` will be run automatically to create the database and table for the project
- Setup **.env**
  - Create a ```.env``` file in the **root directory**
    - DB_HOST=localhost
    - DB_USER=app_user
    - DB_NAME=app_db
    - DB_PASSWORD=password
    - DB_PORT=5432
    - ENV= debug // Optional

- Setup ```https credentials```
  - In the root directory, run ```openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt```
  - It will ask for some information, just fill it up

## Running the project

- Run ```npm run build``` to build the project
- Run ```npm run dev``` to start the project
