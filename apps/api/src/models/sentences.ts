import { Schema, model, Types, Model, HydratedDocument, InferSchemaType } from 'mongoose';

export interface ISentence {
  content: string;
  noteId: Types.ObjectId;
  contextId?: Types.ObjectId;
  subject?: string;
  sequence: number;
  stage: 'garbage' | 'resonance' | 'brain';
  embedding?: Buffer;
  enrichmentData: {
    userNuance?: string;
    semanticRole?: string;
    tags: string[];
    metadata: Map<string, any>;
  };
  relationships: {
    target: Types.ObjectId;
    type: string;
    weight: number;
    isCrossSubject: boolean;
  }[];
}

interface ISentenceMethods {
  enrich(nuance: string, relationships: any[]): HydratedDocument<ISentence, ISentenceMethods>;
}

export type SentenceDocument = HydratedDocument<ISentence, ISentenceMethods>;

interface ISentenceModel extends Model<ISentence, {}, ISentenceMethods> {
  findCrossSubjectResonance(
    contextId: Types.ObjectId | string, 
    currentSubject: string
  ): Promise<SentenceDocument[]>;
  
  getBrainContext(
    startIds: (Types.ObjectId | string)[]
  ): Promise<SentenceDocument[]>;
}

const sentenceSchema = new Schema<ISentence, ISentenceModel, ISentenceMethods>({
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
  // Captures the "vibe" or "why" (e.g., Kizuna as a burden)
  enrichmentData: {
    userNuance: { type: String }, // Manual context provided by you
    semanticRole: { type: String }, // e.g., "Counter-argument", "Root Principle"
    tags: [{ type: String, index: true }],
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  
  // 5. Knowledge Graph Relationships (The Connective Tissue)
  relationships: [{
    target: { type: Schema.Types.ObjectId, ref: 'Sentence', index: true },
    type: { 
      type: String, 
      // Dynamic types: 'signaling-staking', 'mask-identity', 'shackle-burden'
      required: true 
    },
    // Weight can be negative (e.g., -1 for "Kizuna" as a burden/shackle)
    weight: { type: Number, default: 1 },
    isCrossSubject: { type: Boolean, default: false }, // Tracks "Horizontal Synthesis",
    description: { type: String }
  }]
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// --- Logic & Methods ---

// Instance Method: Handle the "Trigger Enrichment" stage
sentenceSchema.methods.enrich = function(nuance: string, relationships: any[]) {
  this.enrichmentData.userNuance = nuance;
  this.relationships.push(...relationships);
  this.stage = 'resonance'; // Move to intermediate stage
  return this;
};

// Static Method: Horizontal Synthesis (Cross-subject discovery)
// Find sentences in OTHER subjects that share the same contextId
sentenceSchema.statics.findCrossSubjectResonance = async function(contextId: Types.ObjectId | string, currentSubject: string) {
  return this.find({
    contextId,
    subject: { $ne: currentSubject },
    stage: 'brain'
  }).limit(10);
};

// Static Method: Weighted Graph Traversal for RAG
sentenceSchema.statics.getBrainContext = async function(startIds: Types.ObjectId[]) {
  return this.aggregate([
    { $match: { _id: { $in: startIds }, stage: 'brain' } },
    {
      $graphLookup: {
        from: 'sentences',
        startWith: '$relationships.target',
        connectFromField: 'relationships.target',
        connectToField: '_id',
        maxDepth: 3,
        as: 'network'
      }
    },
    // Filter out connections with negative weights if doing a "positive" search
    { $addFields: { 
        network: { $filter: { 
          input: "$network", 
          as: "item", 
          cond: { $gt: ["$$item.weight", -1] } 
        }}
    }}
  ]);
};

// --- Indexing for Performance ---
sentenceSchema.index({ contextId: 1, subject: 1 });
sentenceSchema.index({ 'relationships.type': 1 });

// --- TypeScript Exports ---

export const Sentence = model<ISentence, ISentenceModel>('Sentence', sentenceSchema);
