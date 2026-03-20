import { ApolloServer } from '@apollo/server';
import { Sentence } from '../models/sentences';
import { Resolvers } from './__generated__/types';
import GraphQLJSON from 'graphql-type-json';

// 1. Type Definitions
export const typeDefs = `#graphql
  scalar JSON

  enum SentenceStage {
    garbage
    resonance
    brain
  }

  type EnrichmentData {
    userNuance: String
    semanticRole: String
    tags: [String!]
    metadata: JSON
  }

  type Relationship {
    target: Sentence!
    type: String!
    weight: Float!
    isCrossSubject: Boolean!
  }

  type Sentence {
    id: ID!
    content: String!
    noteId: ID!
    contextId: ID
    subject: String
    sequence: Int!
    stage: SentenceStage!
    enrichmentData: EnrichmentData
    relationships: [Relationship!]
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getSentence(id: ID!): Sentence
    findCrossSubjectResonance(contextId: ID!, currentSubject: String!): [Sentence!]
    getBrainContext(startIds: [ID!]!): [Sentence!]
  }

  type Mutation {
    ingestSentence(
      content: String!, 
      noteId: String!, 
      sequence: Int!, 
      contextId: String, 
      subject: String
    ): Sentence!

    enrichSentence(
      id: ID!, 
      nuance: String!, 
      relationships: [RelationshipInput!]
    ): Sentence!
  }

  input RelationshipInput {
    target: ID!
    type: String!
    weight: Float
    isCrossSubject: Boolean
  }
`;

// 2. Resolvers (Mapping GQL to Mongoose)
export const resolvers: Resolvers = {
  JSON: GraphQLJSON,
  
  Query: {
    getSentence: async (_ , { id }: { id: string }) => {
      return await Sentence.findById(id);
    },
    findCrossSubjectResonance: async (_ , { contextId, currentSubject }: any) => {
      // Calling your schema's static method
      return await Sentence.findCrossSubjectResonance(contextId, currentSubject);
    },
    getBrainContext: async (_ , { startIds }: { startIds: string[] }) => {
      // Calling your schema's static method for GraphRAG
      return await Sentence.getBrainContext(startIds);
    }
  },

  Mutation: {
    ingestSentence: async (_ , args: any) => {
      return await Sentence.create({ ...args, stage: 'garbage' });
    },
    enrichSentence: async (_ , { id, nuance, relationships }: any) => {
      const doc = await Sentence.findById(id);
      if (!doc) throw new Error("Sentence node not found");
      
      // Using your schema's .enrich() instance method
      doc.enrich(nuance, relationships || []);
      
      // Logic: Move to brain once it has enough nuance
      doc.stage = 'brain'; 
      
      return await doc.save();
    }
  }
};