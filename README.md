<h3 align="center">Microservices</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/denni-hill/microservices/issues.svg)](https://github.com/denni-hill/microservices/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/denni-hill/microservices.svg)](https://github.com/denni-hill/microservices/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center">
    Playground for my experience in microservices development
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Project parts](#project_parts)
- [Getting started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [TODO](#todo)
- [Author](#author)

## 🧐 About <a name = "about"></a>

My first idea was to develop open-source personal site for hosting my own cvs and blog on it, but as I want it to be progressive, it took some time to learn techs and architecture patterns. Today's result was rewritten many times and I'm still in search of fast and reliable approaches to develop APIs. Still want to acheive my first idea, but what's written is enought to become familiar with my REST API development skills.

## 📝 Prject parts <a name = "project_parts"></a>
- Authorization microservice
  - Written in simple javascript
  - express as web-server framework
  - three layer architecture (from top to bottom):
    - routing layer (access managment)
    - service layer (business logic)
    - data access layer (interractions with data)
  - pg as database client
  - knexjs as database query builder
  - winston as logger
  - chain-validator-js as data validator (my own library, written in typescript)
  - jwt for stateless cross-microservice authorization
  - redis as client for cache server (I use cache to blacklist access tokens and deleted users ids on logouts)
  - axios as http client
  - amqplib as client for RabbitMQ queues
  - jest as tests framework
  - dotenv to read configuration files
- Counter microservice (it's some some sort of game - users can create counters, invite other users, they can accept invites, participate in counters, creating scores for each other in. For example, you can use it as drinking game =). Score to Sam, as he drank 1 cocktail - that's the idea. Just for fun)
  - Written in typescript
  - express as web-server framework
  - three layer architecture (from top to bottom):
    - routing layer (access managment)
    - service layer (business logic)
    - data access layer (interractions with data)
  - pg as database client
  - typeorm as ORM
  - winston as logger
  - chain-validator-js as data validator
  - jwt for stateless cross-microservice authorization
  - redis as client for cache server (didn't use it here, but theoretically can be used to memorize something)
  - axios as http client
  - amqplib as client for RabbitMQ queues
  - jest as tests framework
  - dotenv to read configuration files
- PostgreSQL (database)
- RabbitMQ (queue service)
- nginx (api compositor and load balancer in theory)
- ELK Stack (Elasticsearch, LogStash and Kibana - used for centralized log processing of distributed microservices)
- Filebeat (daemon for whatching log files and sending new logs to ELK stack)
- Built with docker-compose for easy deployment


## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites

You will need docker-compose to be installed in your system to run project and, as long as there's no GUI, you will need something like Postman to make http requests to server

### Installing

Clone project

move to auth-service folder and install npm dependencies, using
```
npm install
```

then to run database migrations run
```
npm run migrate
```

move to counter-service folder and install npm dependencies, using
```
npm install
```

then to build counter-service run
```
npm run build
```

IMPORTANT! ELK stack requires more virtual memory than allowed by default. Fix for Windows users:
```
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
```

In project directory run:
```
docker-compose up -d
```

Now you can play with it using postman.<br>
Also Kibana for logs analysis is available on http://localhost:5601

## 🔧 Running the tests <a name = "tests"></a>

As microservices interracts with each-other (for exapmple, counter service makes request to auth service to validate access tokens) you can only run tests when docker-compose is running

move to auth-service folder and run
```
npm run test
```

move to counter-service folder and run
```
npm run test
```

## 🎈 Usage <a name="usage"></a>

There is no GUI here, but in todo list

## 🚀 Deployment <a name = "deployment"></a>

```
docker-compose up -d
```

## 📝 TODO <a name = "todo"></a>:

- Add frontend for authorization (thinking of micro-frontends approach)
- Add cv microservice
- Add frontend for cv
- Add blog microservice
- Add frontend for blog
- Add frontend for counters

## ✍️ Author <a name = "author"></a>[@denni_hill](https://github.com/denni_hill)
