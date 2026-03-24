import { Resolvers } from "../__generated__/types";
import GraphQLJSON from 'graphql-type-json';
import { ThoughtNodeService } from "../../services/thoughtNode.service"; 

export const resolvers: Resolvers = {
    // Custom scalar for JSON metadata
    JSON: GraphQLJSON,

    Query: {
        // Agentic RAG Trigger: Uses LLM to parse the prompt, runs vector/graph search, 
        // and returns a synthesized subgraph.
        querySecondBrain: async (_, { prompt }) => {
            return await ThoughtNodeService.querySecondBrain(prompt);
        },
        
        // Graph visualization entry point for a specific node
        expandThoughtGraph: async (_, { nodeId, depth }) => {
            // Provide a default depth of 1 if not specified
            return await ThoughtNodeService.expandGraph(nodeId, depth ?? 1);
        },

        // Human-in-the-loop Inbox
        getPendingValidations: async () => {
            return await ThoughtNodeService.getPendingValidations();
        }
    },

    Mutation: {
        // Stage 1: Frictionless capture (Defaults to GARBAGE stage internally)
        captureAhaMoment: async (_, { content, subject }) => {
            return await ThoughtNodeService.captureAhaMoment(content, subject);
        },
        
        // Stage 2: Human nuance + AI Context generation (Moves to RESONATING stage)
        enrichThought: async (_, { id, userNuance, semanticRole }) => {
            return await ThoughtNodeService.enrichThought(id, userNuance, semanticRole);
        },

        // Stage 3: Human validation and graph integration (Moves to BRAIN stage)
        promoteToBrain: async (_, { id, approvedRelationships }) => {
            return await ThoughtNodeService.promoteToBrain(id, approvedRelationships);
        }
    }
};