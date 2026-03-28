import { Types, Model, HydratedDocument } from 'mongoose';

// 1. Aligning the stage with the GraphQL CognitiveStage enum
export type CognitiveStage = 'GARBAGE' | 'RESONATING' | 'BRAIN';

// 2. Extracted sub-documents for cleaner typing and reusability
export interface IContextData {
  userNuance?: string | null;
  llmGeneratedContext?: string | null; 
  semanticRole?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;   
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
  
  // Used for Vector Search / RAG via MongoDB Atlas
  embedding?: number[];           
  
  context: IContextData;        
  relationships: IRelationship[];

  createdAt: Date;
  updatedAt: Date;
}

// 4. Instance Methods (Mapped to your Mutation lifecycle)
export interface IThoughtNodeMethods {
  enrich(
    userNuance: string, 
    semanticRole?: string | null, 
    aiResults?: {
      llmGeneratedContext?: string | null;
      tags?: string[] | null;
      metadata?: Record<string, any> | null;
      proposedRelationships?: IRelationship[] | null;
    }
  ): Promise<HydratedDocument<IThoughtNode, IThoughtNodeMethods>>;

  promoteToBrain(
    approvedRelationships: IRelationship[],
    embedding?: number[]
  ): Promise<HydratedDocument<IThoughtNode, IThoughtNodeMethods>>;
}

export type GraphNodeDocument = HydratedDocument<IThoughtNode, IThoughtNodeMethods>;

export type GraphExpandedThoughtNode = GraphNodeDocument & {
  outgoingNodes?: GraphExpandedThoughtNode[];
  incomingNodes?: GraphExpandedThoughtNode[];
};

// 5. Static Model Methods (Graph RAG Entry Points)
export interface IThoughtNodeModel extends Model<IThoughtNode, {}, IThoughtNodeMethods> {

  // This will handle the $graphLookup aggregation in Mongoose
  expandThoughtGraph(
    startIds: (Types.ObjectId | string)[],
    depth: number
  ): Promise<GraphExpandedThoughtNode[]>;

  vectorSearch(params: {
    queryVector: number[];
    limit?: number;
    numCandidates?: number;
    stage?: CognitiveStage; 
  }): Promise<(GraphNodeDocument & { score: number })[]>;
}

export type GraphEdgeDocument = {
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
};

export type GraphResponseDocument = {
  nodes: GraphNodeDocument[];
  edges: GraphEdgeDocument[];
  aiSynthesis?: string;
};