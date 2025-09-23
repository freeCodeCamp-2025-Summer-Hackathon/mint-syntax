<p align="center">
  <img src="https://i.ibb.co/Cs11WQFJ/mint-syntax-baner-transparent-1.png" alt="Mint-Syntax Logo" />
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22.x-green" alt="Node.js v22" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-4.0+-brightgreen" alt="MongoDB 4.0+" /></a>
  <a href="https://docs.astral.sh/uv/"><img src="https://img.shields.io/badge/uv-enabled-purple" alt="uv enabled" /></a>
  <a href="https://github.com/freeCodeCamp-2025-Summer-Hackathon/mint-syntax/pulls">
    <img src="https://img.shields.io/github/issues-pr/freeCodeCamp-2025-Summer-Hackathon/mint-syntax" alt="Pull Requests" />
  </a>
  <a href="https://github.com/freeCodeCamp-2025-Summer-Hackathon/mint-syntax/issues">
    <img src="https://img.shields.io/github/issues/freeCodeCamp-2025-Summer-Hackathon/mint-syntax" alt="Open Issues" />
  </a>
</p>

# Mint-Syntax: 2025 Summer Hackathon

## 📍 Table of Contents
- [Project](#-project)
- [Team](#-team)
- [Development](#️-development)
  - [Prerequisites](#prerequisites)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Setup](#setup)
    - [Copy .env file](#copy-env-file)
    - [Frontend](#frontend-1)
    - [Backend](#backend-1)
    - [Enabling pre-commit checks for frontend and backend](#enabling-pre-commit-checks-for-frontend-and-backend)
    - [Database](#database)
      - [Local Database Deployment (MongoDB Community)](#local-database-deployment-mongodb-community)
      - [Cloud Database Deployment (MongoDB Atlas)](#cloud-database-deployment-mongodb-atlas)
  - [Development](#development)
    - [Frontend Client](#frontend-client)
    - [Backend Server](#backend-server)
    - [Running commands from the root folder](#running-commands-from-the-root-folder)
    - [Running Seed Script](#running-seed-script)
  - [Running Tests](#running-tests)
    - [Frontend](#frontend-2)
    - [Backend](#backend-2)
      - [Unit tests](#unit-tests)
      - [Integration tests](#integration-tests)
      - [Running all (unit and integration) backend tests](#running-all-unit-and-integration-backend-tests)
      - [Running individual tests](#running-individual-tests)

---

## 📌 Project
> **IdeaForge** — A collaborative brainstorming board where users can submit, vote, and iterate on ideas together.

---

## 👥 Team

<ul>
 <!--<li>Apofus</li>-->
  <li><a href="https://github.com/bstojkovic">Božo (Coding Puppy)</a></li>
  <li><a href="https://github.com/connororeil">Connor</a></li>
  <li><a href="https://github.com/willhitman">Gift Ruwende | Zimbabwe</a></li>
  <li><a href="https://github.com/gikf">Krzysztof</a></li>
   <!--<li><a href="https://github.com/MarkoCuk54">longlive247</a></li>-->
  <li><a href="https://github.com/Lorevdh">Lore</a></li>
  <!--<li>Millicent</li>-->
  <li><a href="https://github.com/Vallayah">Ola</a></li>
  <li><a href="https://github.com/Sebastian-Wlo">Sebastian_W</a></li>
  <li><a href="https://github.com/cosmonewt">Theo</a></li>
 <!--<li><a href="https://github.com/tetrisy">Tetris</li>-->
 <!--<li><a href="https://github.com/nurmukhammad03">VooDooRe</a></li>-->
</ul>

---
## ⚙️ Development

### Prerequisites

#### Frontend
- Node 22, recommended installation via [nvm](https://github.com/nvm-sh/nvm/)

#### Backend

- MongoDB 4.0+ - running locally (ie. with docker), or hosted with MongoDB Atlas
- uv - https://docs.astral.sh/uv/getting-started/installation/

### Setup

#### Copy `.env` file

```bash
/$ cp sample.env .env
```

If needed, update `MONGODB_URI` in `.env` file.

#### Frontend

```bash
/$ cd frontend
/frontend$ npm install
```

**Note:** The dependency on the helmet-async has been removed recently - if you're getting errors, or the page doesn't load after pulling the latest version of the repository, you need to run `npm install` again. If the problem persists, try rebuilding the dependency list using the following commands:

```bash
/frontend$ rm -rf node_modules
/frontend$ rm package-lock.json
/frontend$ npm install
```
#### Backend

```bash
/$ cd backend
/backend$ uv sync
```

#### Enabling pre-commit checks for frontend and backend

```bash
/$ cd backend
/backend$ uv run pre-commit install
```
First commit after this can take a bit longer

#### Database

##### Local Database Deployment (MongoDB Community)

This section references the official [Install MongoDB Community with Docker Tutorial](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-community-with-docker/). Visit the link for more details.

- Before you begin, install and start [Docker](https://docs.docker.com/get-started/get-docker/)
- No need to make changes to the .env file, as it is already setup to connect to the local database deployment

```bash
/$ docker pull mongodb/mongodb-community-server:latest
```

```bash
/$ docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
```
Check, if the docker container is running:
```bash
/$ docker container ls
```
The above command should output something similar to below:
```
CONTAINER ID   IMAGE                                       COMMAND                  CREATED         STATUS         PORTS       NAMES
c29db5687290   mongodb/mongodb-community-server:5.0-ubi8   "docker-entrypoint.s…"   4 seconds ago   Up 3 seconds   27017/tcp   mongo
```

##### Cloud Database Deployment (MongoDB Atlas)

1. Follow the offical [MongoDB Atlas Tutorial](https://www.mongodb.com/resources/products/platform/mongodb-atlas-tutorial) to create an account, setup a cluster, and access the connection string.
2. In the .env file, replace the string after "MONGODB_URI=" with the MongoDB Atlas connection string. Don't forget to replace the password placeholder with the password.

### Development

#### Frontend Client

```bash
/frontend$ npm run develop
```

#### Backend Server

```bash
/backend$ uv run fastapi dev src/main.py
```

#### Running commands from the root folder

It's possible to run commands without actually navigating to the folder, by running commands in the _subshell_

```bash
/$ (cd frontend && npm run develop)
```

```bash
/$ (cd backend && uv run fastapi dev src/main.py)
```
#### Running Seed Script
To seed the database with initial data, run the following command from the `/backend` directory
```bash
/backend$ uv run -m src.scripts.seed_data
```

### Running Tests

#### Frontend

```bash
/frontend$ npm run test:browser
```

#### Backend

pytest gives multiple options for running all or part of the tests. [How to invoke pytest](https://docs.pytest.org/en/stable/how-to/usage.html#specifying-which-tests-to-run).

##### Unit tests
Unit tests are using mocked db with very limited capabilities.

```bash
/backend$ uv run pytest -m "not integration"
```

##### Integration tests
To run integration tests, real MongoDB instance is required, with `MONGODB_TEST_URI` set in the `.env` file. Using the same db as for the development should be okay. While tests are expected to setup required data and clean-up afterwards, there's always possiblity of things not going right.

```bash
/backend$ uv run pytest -m integration
```

##### Running all (unit and integration) backend tests
Requires the same setup as integration tests.

```bash
/backend$ uv run pytest
```

##### Running individual tests

1. Mark test(s) to run with additional marker, ie. `@pytest.mark.only`.
2. Run only tests with the marker.

```bash
/backend$ uv run pytest -m only
```
