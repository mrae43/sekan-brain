import { Schema, model, Types, Model, HydratedDocument, InferSchemaType } from 'mongoose';

// 1. Define the Schema Structure
const sentenceSchema = new Schema({
  content: { type: String, required: true },
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
  sequence: { type: Number, required: true },
  
  // Lifecycle Management 
  stage: { 
    type: String, 
    enum: ['garbage', 'brain'], 
    default: 'garbage', 
    index: true 
  },

  // Vector Search Optimization [cite: 42, 70]
  embedding: { 
    type: Buffer, // Stored as float32 binary for RAM efficiency [cite: 42]
    required: false,
    select: false // Prevent accidental retrieval of large vectors [cite: 71]
  },
  
  // Context Enrichment & Nuance
  // Used to store user-provided tags or "nuance" before promotion to "brain"
  enrichmentData: {
    userNuance: { type: String },
    tags: [{ type: String, index: true }],
    metadata: { type: Map, of: String }
  },
  
  // Knowledge Graph Relationships
  relationships: [{
    target: { type: Schema.Types.ObjectId, ref: 'Sentence', index: true },
    type: { 
      type: String, 
      enum: ['sequential', 'semantic', 'context_enrichment', 'contradicts'],
      default: 'semantic' 
    },
    weight: { type: Number, default: 1 }
  }]
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// 2. Define Instance Methods (Traditional functions only) 
sentenceSchema.methods.promoteToBrain = function() {
  this.stage = 'brain';
  return this.save();
};

// 3. Define Static Methods for GraphRAG
sentenceSchema.statics.findGroundedSubgraph = async function(startIds: Types.ObjectId[], depth: number = 2) {
  return this.aggregate([
    { $match: { _id: { $in: startIds }, stage: 'brain' } },
    {
      $graphLookup: {
        from: 'sentences',
        startWith: '$relationships.target',
        connectFromField: 'relationships.target',
        connectToField: '_id',
        maxDepth: depth,
        as: 'connectedContext',
        depthField: 'distance'
      }
    }
  ]);
};

// 4. Performance Indexing
sentenceSchema.index({ stage: 1, noteId: 1 });
sentenceSchema.index({ 'relationships.target': 1, 'relationships.type': 1 });

// 5. TypeScript Interface Export
export type ISentence = InferSchemaType<typeof sentenceSchema>;

// Correctly typing the Hydrated Document to include methods
export type SentenceDocument = HydratedDocument<ISentence, {
  promoteToBrain(): Promise<SentenceDocument>;
}>;

// Export the Model
export const Sentence = model<ISentence, Model<ISentence>>('Sentence', sentenceSchema);