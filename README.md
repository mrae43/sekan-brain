# Sekan Brain Monorepo

A full-stack monorepo managed with **Turborepo** and **pnpm**.

## 🏗️ Project Structure
- `apps/web`: Frontend built with **React**, **TypeScript**, and **Tailwind CSS** (Vite).
- `apps/api`: Backend built with **Node.js**, **Express**, and **GraphQL** (Apollo Server).
- `packages/tsconfig`: Shared TypeScript configurations.
- `packages/tailwind-config`: Shared Tailwind CSS configurations.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v22+)
- [pnpm](https://pnpm.io/) (v8+)

### Installation
From the root directory, run:
```bash
pnpm install
```

### Development
To run both the frontend and backend in parallel:
```bash
pnpm turbo dev
```

To focus strictly on the **API development**:
```bash
pnpm turbo dev --filter api
```

## 🛠️ Tech Stack
- **Monorepo Management:** Turborepo
- **Package Manager:** pnpm
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + GraphQL (Apollo)
- **Language:** TypeScript
```