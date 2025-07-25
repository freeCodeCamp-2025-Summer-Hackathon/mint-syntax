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

## 📌 Project
> **IdeaForge** — A collaborative brainstorming board where users can submit, vote, and iterate on ideas together.

---

## 👥 Team

<ul>
  <li>Apofus</li>
  <li><a href="https://github.com/bstojkovic">Božo (Coding Puppy)</a></li>
  <li><a href="https://github.com/connororeil">Connor</a></li>
  <li><a href="https://github.com/willhitman">Gift Ruwende | Zimbabwe</a></li>
  <li><a href="https://github.com/gikf">Krzysztof</a></li>
  <li><a href="https://github.com/MarkoCuk54">longlive247</a></li>
  <li><a href="https://github.com/Lorevdh">Lore</a></li>
  <li>Millicent</li>
  <li><a href="https://github.com/Vallayah">Ola</a></li>
  <li><a href="https://github.com/Sebastian-Wlo">Sebastian_W</a></li>
  <li><a href="https://github.com/tetrisy">Tetris</li>
  <li><a href="https://github.com/nurmukhammad03">VooDooRe</a></li>
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
