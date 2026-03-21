import { Sentence } from "../../models/sentences";
import { Resolvers } from "../__generated__/types";
import GraphQLJSON from 'graphql-type-json';

export const resolvers: Resolvers = {
    JSON: GraphQLJSON,
    Query: {
        getSentence: async (_, { id }: { id: string }) => {
            return await Sentence.findById(id);
        },
        findCrossSubjectResonance: async (_, { contextId, currentSubject }: any) => {
            return await Sentence.findCrossSubjectResonance(contextId, currentSubject);
        },
        getBrainContext: async (_, { startIds }: { startIds: string[] }) => {
            return await Sentence.getBrainContext(startIds);
        }
    },
    Mutation: {
        ingestSentence: async (_, args: any) => {
            return await Sentence.create({ ...args, stage: 'garbage' });
        },
        enrichSentence: async (_, { id, nuance, relationships }: any) => {
            const doc = await Sentence.findById(id);
            if (!doc) throw new Error("Sentence node not found");
            doc.enrich(nuance, relationships || []);
            doc.stage = 'brain';
            return await doc.save();
        }
    }
}