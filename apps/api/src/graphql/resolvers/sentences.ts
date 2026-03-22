import { SentenceService } from "../../services/sentences.service";
import { Resolvers } from "../__generated__/types";
import GraphQLJSON from 'graphql-type-json';
import { SentenceDocument } from "../../models/sentence";

export const resolvers: Resolvers = {
    JSON: GraphQLJSON,
    Sentence: {
        network: async (parent: SentenceDocument) => {
            return await SentenceService.getBrainContext([parent._id.toString()]);
        }
    },
    Relationship: {
        target: async (parent) => {
            const doc = await SentenceService.getById(parent.target.toString());
            if (!doc) throw new Error(`Target sentence ${parent.target} not found`);
            return doc;
        }
    },
    Query: {
        getSentence: async (_, { id }) => await SentenceService.getById(id),
        
        findCrossSubjectResonance: async (_, { contextId, currentSubject }) => 
            await SentenceService.findResonance(contextId, currentSubject),
            
        getBrainContext: async (_, { startIds }) => 
            await SentenceService.getBrainContext(startIds)
    },
    Mutation: {
        ingestSentence: async (_, args) => await SentenceService.ingest(args),
        
        enrichSentence: async (_, { id, nuance, relationships }) => 
            await SentenceService.enrich(id, nuance, relationships || [])
    }
};