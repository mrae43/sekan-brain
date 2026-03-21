import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { connectDB } from './lib/db';  
import { ENV } from './config/env';
import { resolvers } from './graphql/resolvers/sentences';
import { errorHandler } from './middleware/error.handler';

const typeDefs = readFileSync(path.join(__dirname, 'schema.gql'), 'utf-8');
const app = express();

// 1. Core Middleware
app.use(cors());
app.use(express.json());

// 2. Apollo Server Setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const start = async () => {
  try {
    // Ensure DB is ready first
    await connectDB();

    // Start Apollo
    await server.start();

    // 3. Mount GraphQL at /graphql
    app.use('/graphql', expressMiddleware(server));

    // Health Check
    app.get('/health', (req, res) => res.sendStatus(200));

    // Error Handling
    app.use(errorHandler);

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${ENV.PORT}`);
      console.log(`📊 GraphQL Playground at http://localhost:${ENV.PORT}/graphql`);
    });
  } catch (err) {
    console.error('Failed to ignite Refinery:', err);
    process.exit(1);
  }
};

start();