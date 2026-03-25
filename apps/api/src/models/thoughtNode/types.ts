import { Types, Model, HydratedDocument } from 'mongoose';

// 1. Aligning the stage with the GraphQL CognitiveStage enum
export type CognitiveStage = 'GARBAGE' | 'RESONATING' | 'BRAIN';

// 2. Extracted sub-documents for cleaner typing and reusability
export interface IContextData {
  userNuance?: string;
  llmGeneratedContext?: string; 
  semanticRole?: string;
  tags: string[];
  metadata: Map<string, any>;   
}

export interface IRelationship {
  targetId: Types.ObjectId;     
  type: string;
  weight: number;
  isCrossSubject: boolean;
  explanation?: string;         
}

// 3. The Core Entity (formerly ISentence)
export interface IThoughtNode {
  content: string;
  
  // These are optional now to support "frictionless capture"
  // A raw "aha" moment might not belong to a specific note or sequence yet.
  noteId?: Types.ObjectId;      
  contextId?: Types.ObjectId;
  sequence?: number;            
  
  subject?: string;
  stage: CognitiveStage;
  
  // Used for Vector Search / RAG (Note: If using MongoDB Atlas Vector Search, 
  // you might eventually change this to `number[]`, but Buffer is fine if using pgvector/others)
  embedding?: Buffer;           
  
  context: IContextData;        
  relationships: IRelationship[];

  createdAt: Date;
  updatedAt: Date;
}

// 4. Instance Methods (Mapped to your Mutation lifecycle)
export interface IThoughtNodeMethods {
  enrich(
    userNuance: string, 
    semanticRole?: string, 
    llmGeneratedContext?: string
  ): Promise<HydratedDocument<IThoughtNode, IThoughtNodeMethods>>;

  promoteToBrain(
    approvedRelationships: IRelationship[]
  ): Promise<HydratedDocument<IThoughtNode, IThoughtNodeMethods>>;
}

export type ThoughtNodeDocument = HydratedDocument<IThoughtNode, IThoughtNodeMethods>;

export type GraphExpandedThoughtNode = ThoughtNodeDocument & {
  outgoingNodes?: GraphExpandedThoughtNode[];
  incomingNodes?: GraphExpandedThoughtNode[];
};

// 5. Static Model Methods (Graph RAG Entry Points)
export interface IThoughtNodeModel extends Model<IThoughtNode, {}, IThoughtNodeMethods> {
  // Still highly relevant: Used when LLM identifies a resonance opportunity
  findCrossSubjectResonance(
    contextId: Types.ObjectId | string, 
    currentSubject: string
  ): Promise<ThoughtNodeDocument[]>;
  
  // Renamed from getBrainContext to reflect Graph traversal
  // This will handle the $graphLookup aggregation in Mongoose
  expandThoughtGraph(
    startIds: (Types.ObjectId | string)[],
    depth: number
  ): Promise<GraphExpandedThoughtNode[]>;
}

export type GraphEdgeDocument = {
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
};

export type GraphResponseDocument = {
  nodes: ThoughtNodeDocument[];
  edges: GraphEdgeDocument[];
  aiSynthesis?: string;
};