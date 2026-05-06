# GhostNet-Honeypot - Simple Project Doc

## What it is

GhostNet-Honeypot is a lightweight honeypot platform for monitoring attack activity and logging suspicious behavior. It combines a Python-based backend, a React frontend, and a small honeypot engine to capture SSH-related intrusion attempts.

## Main components

- `backend/`: API server and web UI backend services
- `frontend/`: React dashboard and web interface
- `ghostnet/`: honeypot engine, CLI commands, SSH handling, and logging
- `docker/`: Docker Compose configuration for MongoDB

## Key features

- real-time attack logging
- web dashboard for viewing sessions and logs
- MongoDB-backed storage
- CLI-driven honeypot process

## Quick start

1. Clone the repository

   ```bash
   git clone https://github.com/cgdhanush/GhostNet-Honeypot.git
   cd GhostNet-Honeypot
   ```

2. Install Python dependencies

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Start MongoDB

   ```bash
   docker compose -f docker/mongo-docker-compose.yaml up -d
   ```

4. Run the backend

   ```bash
   python -m ghostnet webserver
   ```

5. Start the frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Project layout

- `backend/app/`: Flask or FastAPI application modules and services
- `frontend/src/`: React app components, pages, and services
- `ghostnet/commands/`: CLI options and command implementation
- `ghostnet/ssh/`: SSH honeypot server and key files
- `ghostnet/data/`: log handling and storage manager

## Notes

- This project is intended for research and controlled lab environments only.
- Do not deploy it on unauthorized or production systems.
- Ensure MongoDB is running before launching the backend.

## Useful commands

- `python -m ghostnet --help`
- `docker compose -f docker/mongo-docker-compose.yaml up -d`
- `npm run dev` (from `frontend/`)
