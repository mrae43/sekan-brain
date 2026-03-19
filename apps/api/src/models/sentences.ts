import { Schema, model, Types, InferSchemaType } from 'mongoose';

// Define the raw schema structure
const sentenceSchema = new Schema({
  content: { type: String, required: true },
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
  sequence: { type: Number, required: true },
  
  // Vector search capabilities
  embedding: { 
    type: Buffer, // Optimization: Store as float32 binary data
    required: false,
    select: false // Prevent accidental retrieval of large vectors
  },
  
  // GraphRAG metadata
  entities: [{ type: String, index: true }],
  
  // Knowledge Graph edges
  relationships: [{
    target: { type: Schema.Types.ObjectId, ref: 'Sentence' },
    type: { type: String },
    metadata: { type: Map, of: String }
  }]
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// Instance methods for semantic operations
sentenceSchema.methods.calculateWeight = function(queryEmbedding: number) {
  // Logic to calculate relevance weight based on vector distance
};

// Static methods for graph traversal
sentenceSchema.statics.findGroundedSubgraph = async function(sentenceIds: Types.ObjectId) {
  return this.aggregate();
};

// Index for graph traversal performance
sentenceSchema.index({ 'relationships.target': 1 });

// Exporting the derived type for use in services
export type SentenceDocument = InferSchemaType<typeof sentenceSchema> & {
  _id: Types.ObjectId;
};

export const Sentence = model('Sentence', sentenceSchema);