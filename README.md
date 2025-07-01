### Backend

#### Prerequisites
- MongoDB 4.0+ - running locally (ie. with docker), or hosted with MongoDB Atlas
- uv - https://docs.astral.sh/uv/getting-started/installation/

#### Setup
```bash
cp sample.env .env
```
If needed, update `MONGODB_URI` in `.env` file.

```bash
cd backend
uv sync
```

#### Running development server
```bash
uv run fastapi dev src/main.py
```
