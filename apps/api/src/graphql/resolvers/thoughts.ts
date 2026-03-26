import { Resolvers } from "../__generated__/types";
import GraphQLJSON from 'graphql-type-json';
import { ThoughtNodeService } from "../../services/thoughtNode.service"; 
import { GraphNodeDocument, IContextData, IRelationship } from "../../models/thoughtNode/types";

export const resolvers: Resolvers = {
    // Custom scalar for JSON metadata
    JSON: GraphQLJSON,

    Query: {
        // Agentic RAG Trigger: runs vector/graph search, returns a synthesized subgraph.
        findResonatingThoughts: async (_, { query }: { query: string }) => {
            return await ThoughtNodeService.findResonatingThoughts(query);
        },
        
        // Graph visualization entry point for a specific node
        expandThoughtGraph: async (_, { nodeId, depth }: { nodeId: string, depth: number }) => {
            // Provide a default depth of 1 if not specified
            return await ThoughtNodeService.expandGraph(nodeId, depth ?? 1);
        },

        // Human-in-the-loop Inbox
        getPendingValidations: async () => {
            return await ThoughtNodeService.getPendingValidations();
        }
    },

    GraphNode: {
        id: (parent: GraphNodeDocument): string => {
            return parent._id.toString();
        },
        createdAt: (parent: GraphNodeDocument) => {
            const date = parent.createdAt || new Date();
            return date.toISOString();
        },
        updatedAt: (parent: GraphNodeDocument) => {
            const date = parent.updatedAt || new Date();
            return date.toISOString();
        },
    },

    ContextData: {
        metadata: (parent: IContextData): Record<string, any> => {
            if (parent.metadata instanceof Map) {
                return Object.fromEntries(parent.metadata)
            }

            return parent.metadata || {};
        },

        tags: (parent: IContextData): string[] => {
            return parent.tags ||[];
        }
    },

    Relationship: {
        targetId: (parent: IRelationship): string => {
            return parent.targetId.toString();
        }
    },

    Mutation: {
        // Stage 1: Frictionless capture (Defaults to GARBAGE stage internally)
        captureAhaMoment: async (_, { content, subject }) => {
            return await ThoughtNodeService.captureAhaMoment(content, subject);
        },
        
        // Stage 2: Human nuance + AI Context generation (Moves to RESONATING stage)
        enrichThought: async (_, { id, userNuance, semanticRole }) => {
            return await ThoughtNodeService.enrichThought(
                id, 
                userNuance, 
                semanticRole
            );
        },

        // Stage 3: Human validation and graph integration (Moves to BRAIN stage)
        promoteToBrain: async (_, { id, approvedRelationships }) => {
            return await ThoughtNodeService.promoteToBrain(id, approvedRelationships ?? undefined);
        }
    }
};