# 🚀 API Service (Backend)

The core GraphQL engine for the project, built with **Express** and **Apollo Server**.

## 🛠️ Tech Stack
- **Framework:** Express.js
- **GraphQL Server:** Apollo Server
- **Language:** TypeScript
- **Runtime:** Node.js
- **Development Tool:** `ts-node-dev` (for hot-reloading)

## 📁 Directory Structure
- `src/schema/`: GraphQL type definitions (SDL).
- `src/resolvers/`: Logic for handling GraphQL queries and mutations.
- `src/models/`: Database schemas/interfaces.
- `src/utils/`: Helper functions and middleware (CORS, Auth).

## 🚦 Local Development

### 1. Installation
If you haven't installed dependencies from the root:
```bash
pnpm install
```

### 2. Running the Server
To start the API with hot-reloading:
```bash
pnpm dev
```
The server will be available at: `http://localhost:4000/graphql`

### 3. Testing Queries
Open `http://localhost:4000/graphql` in your browser to access the **Apollo Sandbox**. You can explore the schema and run test queries there.

## 🔌 API Endpoints
- `GET /health`: Check if the server is alive.
- `POST /graphql`: The main entry point for all data requests.

## 🏗️ Build & Deployment
To compile the TypeScript code to JavaScript:
```bash
pnpm build
```
The output will be generated in the `dist/` folder.
