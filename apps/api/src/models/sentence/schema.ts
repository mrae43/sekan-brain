import { Schema } from 'mongoose';
import { IThoughtNode, IThoughtNodeModel, IThoughtNodeMethods } from './types';

export const thoughtNodeSchema = new Schema<IThoughtNode, IThoughtNodeModel, IThoughtNodeMethods>({
  content: { type: String, required: true },
  
  // 1. Frictionless Capture Setup
  // noteId and sequence are now OPTIONAL. A raw "aha" moment 
  // might not belong to a specific note or sequence initially.
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: false, index: true },
  sequence: { type: Number, required: false },
  
  // 2. Context Rooting & Subject Grouping
  contextId: { type: Schema.Types.ObjectId, ref: 'Context', index: true }, 
  subject: { type: String, index: true }, // e.g., "Dating Game" or "Blockchain"
  
  // 3. Lifecycle Management (The Cognitive Pipeline)
  stage: { 
    type: String, 
    enum:['GARBAGE', 'RESONATING', 'BRAIN'], 
    default: 'GARBAGE', 
    index: true 
  },

  // 4. Vector Optimization (For Vector Search / RAG)
  embedding: { 
    type: Buffer, 
    required: false,
    select: false 
  },
  
  // 5. Enrichment & Semantic Nuance (Formerly enrichmentData)
  context: {
    userNuance: { type: String },
    llmGeneratedContext: { type: String }, 
    semanticRole: { type: String },
    tags: [{ type: String, index: true }],
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} } 
  },
  
  // 6. Knowledge Graph Relationships (The Connective Tissue)
  relationships:[{
    targetId: { type: Schema.Types.ObjectId, ref: 'ThoughtNode', index: true, required: true },
    type: { 
      type: String, 
      required: true 
    },
    weight: { type: Number, default: 1 },
    isCrossSubject: { type: Boolean, default: false },
    explanation: { type: String } 
  }]
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// --- Indexing for Performance ---
// Standard compound index for scoping down queries
thoughtNodeSchema.index({ contextId: 1, subject: 1 });

// Optimize relationship queries (crucial for Graph RAG traversals in MongoDB)
thoughtNodeSchema.index({ 'relationships.type': 1 });
thoughtNodeSchema.index({ 'relationships.targetId': 1 }); 

// Consider adding a text index on content if you want hybrid search (Vector + Keyword)
// thoughtNodeSchema.index({ content: 'text', subject: 'text' });