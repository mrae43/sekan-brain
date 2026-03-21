import { Sentence, SentenceDocument } from "../../models/sentences";
import { Resolvers } from "../__generated__/types";
import GraphQLJSON from 'graphql-type-json';

export const resolvers: Resolvers = {
    JSON: GraphQLJSON,
    Sentence: {
        network: async (parent: SentenceDocument) => {
            return await Sentence.getBrainContext([parent._id.toString()]);
        }
    },
    Relationship: {
        target: async (parent) => {
            const doc = await Sentence.findById(parent.target);
            if (!doc) throw new Error(`Target sentence ${parent.target} not found`);
            return doc;
        }
    },
    Query: {
        getSentence: async (_, { id }: { id: string }) => {
            return await Sentence.findById(id);
        },
        findCrossSubjectResonance: async (_, { contextId, currentSubject }) => {
            return await Sentence.findCrossSubjectResonance(contextId, currentSubject);
        },
        getBrainContext: async (_, { startIds }: { startIds: string[] }) => {
            return await Sentence.getBrainContext(startIds);
        }
    },
    Mutation: {
        ingestSentence: async (_, { contextId, subject, ...rest }) => {
            return await Sentence.create({ 
                ...rest, 
                contextId: contextId || undefined, 
                subject: subject || undefined,
                stage: 'garbage' 
            });
        },
        enrichSentence: async (_, { id, nuance, relationships }) => {
            const doc = await Sentence.findById(id);
            if (!doc) throw new Error("Sentence node not found");
            doc.enrich(nuance, relationships || []);
            doc.stage = 'brain';
            return await doc.save();
        }
    }
}