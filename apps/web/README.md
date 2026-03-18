# 🎨 Web Frontend

The user interface for the project, built with **React**, **TypeScript**, and **Tailwind CSS**.

## 🛠️ Tech Stack
- **Framework:** [React](https://react.dev/) (Vite)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** (e.g., React Context or Apollo Client)
- **Data Fetching:** GraphQL (via Apollo Client or Urql)
- **Testing:** Vitest & Playwright

## 📁 Directory Structure
- `src/components/`: Reusable UI components (Buttons, Modals, etc.).
- `src/hooks/`: Custom React hooks for logic and data fetching.
- `src/pages/`: Main application views/routes.
- `src/styles/`: Global CSS and Tailwind directives.
- `src/graphql/`: Queries and Mutations (.graphql files or gql strings).

## 🚦 Local Development

### 1. Installation
If you haven't installed dependencies from the root:
```bash
pnpm install
```

### 2. Running the Development Server
To start the Vite dev server:
```bash
pnpm dev
```
The app will be available at: `http://localhost:5173`

### 3. Tailwind CSS
This project uses a shared Tailwind configuration. Custom theme changes should be made in `packages/tailwind-config` if they affect the whole monorepo.

## 🔗 Connecting to the API
The frontend expects the GraphQL API to be running at:
`http://localhost:4000/graphql`

Make sure to set your `VITE_API_URL` in a `.env` file if you are using environment variables.

## 🏗️ Build & Deployment
To create a production-ready build:
```bash
pnpm build
```
The optimized files will be generated in the `dist/` folder.
```

---
