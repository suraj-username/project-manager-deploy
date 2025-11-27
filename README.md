# Project Manager (project-manager-deploy)

![status](https://img.shields.io/badge/status-WIP-yellow)

Lightweight project management app with a React + Vite client and an Express/MongoDB server. It provides projects, tasks, and basic team membership features for small teams and demos.

## Table of Contents

- [What the project does](#what-the-project-does)
- [Why this is useful](#why-this-is-useful)
- [Quickstart — Get up and running](#quickstart--get-up-and-running)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Run the app (development)](#run-the-app-development)
- [API & usage examples](#api--usage-examples)
- [Where to get help](#where-to-get-help)
- [Who maintains and contributes](#who-maintains-and-contributes)

## What the project does

Project Manager is a full-stack sample application for creating and managing projects and tasks. It includes:

- A Vite + React frontend in `client/` with pages for login, dashboard, project details, and task management.
- An Express REST API in `server/` with authentication, project and task controllers, and role-based access (admin/user), backed by MongoDB.
- Task state management implemented with state objects in `server/services/taskState/`.

## Why this is useful

- Fast example boilerplate to learn or demonstrate team-oriented features (projects, team members, task lifecycle).
- Clear separation of frontend and backend for easier development and deployment.
- Small, practical codebase that can be adapted for demos, tutorials, or bootstrapping new projects.

## Quickstart — Get up and running

Follow these steps to run the project locally. Commands assume a PowerShell (`pwsh.exe`) environment on Windows, but shell commands are equivalent for macOS/Linux.

### Prerequisites

- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB instance (local or cloud — e.g., MongoDB Atlas)

### Install

Open two terminals (one for server, one for client) and run:

```powershell
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### Environment variables

Create a `.env` file inside `server/` (copy `.env.example` if present). At minimum set:

```
MONGO_URI=mongodb://localhost:27017/project-manager
JWT_SECRET=replace-with-a-strong-secret
PORT=5000
```

Adjust values to point to your MongoDB and a secure JWT secret.

### Run the app (development)

Run server and client in separate terminals:

```powershell
# Terminal 1 — server
cd server
npm run dev     # or `npm start` depending on scripts

# Terminal 2 — client
cd client
npm run dev
```

The client typically runs on `http://localhost:5173` (Vite default) and the server on `http://localhost:5000` (or the `PORT` you set).

If you prefer a single command to run both, consider adding a root-level `package.json` script using `concurrently` or `npm-run-all`.

## API & usage examples

The server exposes REST endpoints under `/api/` — examples include:

- `POST /api/auth/login` — login and receive a JWT
- `GET /api/projects` — list projects (admin sees all, users see assigned projects)
- `POST /api/projects` — create a project (authenticated)
- `POST /api/projects/:projectId/members` — add a member to a project
- `DELETE /api/projects/:projectId/members/:userId` — remove a member
- `GET /api/projects/:projectId/tasks` — list tasks for a project
- `POST /api/tasks` — create a task

Example: create a project with curl (replace `$TOKEN` and endpoint as needed):

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","description":"Example"}'
```

Example: get projects (authenticated):

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/projects
```

For a complete list of endpoints, see the `server/routes/` directory:

- `server/routes/auth.routes.js`
- `server/routes/projectRoutes.js`
- `server/routes/task.routes.js`
- `server/routes/user.routes.js`

The server controllers and middleware (e.g., `server/controllers/projectController.js`, `server/middleware/auth.middleware.js`) show required request shapes and permission checks.
