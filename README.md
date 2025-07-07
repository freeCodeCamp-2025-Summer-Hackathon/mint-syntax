## Development

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

#### Running commands from root folder

It's possible to run commands without actual navigating to the folder, by running commands in the _subshell_

```bash
/$ (cd frontend && npm run develop)
```

```bash
/$ (cd backend && uv run fastapi dev src/main.py)
```
