import { Schema } from 'mongoose';
import { ISentence, ISentenceModel, ISentenceMethods } from './types';

export const sentenceSchema = new Schema<ISentence, ISentenceModel, ISentenceMethods>({
  content: { type: String, required: true },
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
  
  // 1. Context Rooting & Subject Grouping
  contextId: { type: Schema.Types.ObjectId, ref: 'Context', index: true }, 
  subject: { type: String, index: true }, // e.g., "Dating Game" or "Blockchain"
  sequence: { type: Number, required: true },
  
  // 2. Lifecycle Management (The Refinery Pipeline)
  stage: { 
    type: String, 
    enum: ['garbage', 'resonance', 'brain'], 
    default: 'garbage', 
    index: true 
  },

  // 3. Vector Optimization
  embedding: { 
    type: Buffer, 
    required: false,
    select: false 
  },
  
  // 4. Enrichment & Semantic Nuance
  enrichmentData: {
    userNuance: { type: String },
    semanticRole: { type: String },
    tags: [{ type: String, index: true }],
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  
  // 5. Knowledge Graph Relationships (The Connective Tissue)
  relationships: [{
    target: { type: Schema.Types.ObjectId, ref: 'Sentence', index: true },
    type: { 
      type: String, 
      required: true 
    },
    weight: { type: Number, default: 1 },
    isCrossSubject: { type: Boolean, default: false },
    description: { type: String }
  }]
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// --- Indexing for Performance ---
sentenceSchema.index({ contextId: 1, subject: 1 });
sentenceSchema.index({ 'relationships.type': 1 });
