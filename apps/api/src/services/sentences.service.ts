import { Types } from 'mongoose';
import { Sentence, SentenceDocument } from '../models/sentence';
import { RelationshipInput } from '../graphql/__generated__/types';

export class SentenceService {
  /**
   * Raw Ingestion: Creates a 'garbage' node from raw source text.
   */
  static async ingest(data: {
    content: string;
    noteId: string;
    sequence: number;
    contextId?: string | null;
    subject?: string | null;
  }): Promise<SentenceDocument> {
    return await Sentence.create({
      ...data,
      contextId: data.contextId || undefined,
      subject: data.subject || undefined,
      stage: 'garbage'
    });
  }

  /**
   * Refinement: Adds user nuance, links relationships, and promotes to 'brain'.
   */
  static async enrich(
    id: string, 
    nuance: string, 
    relationships: RelationshipInput[] = []
  ): Promise<SentenceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid Sentence ID format: ${id}`);
    }
    const doc = await Sentence.findById(id);
    if (!doc) throw new Error("Sentence node not found for enrichment");

    // Use your instance method
    doc.enrich(nuance, relationships);
    
    // Explicitly promote to brain stage for RAG readiness
    doc.stage = 'brain';
    
    return await doc.save();
  }

  /**
   * Retrieval: Get the expanded graph network for a specific node.
   */
  static async getBrainContext(startIds: string[]): Promise<SentenceDocument[]> {
    if (!startIds.every(Types.ObjectId.isValid)) {
      throw new Error(`Invalid Sentence ID format: ${startIds}`);
    }
    const ids = startIds.map(id => new Types.ObjectId(id));
    return await Sentence.getBrainContext(ids);
  }

  /**
   * Discovery: Find cross-subject resonance for horizontal synthesis.
   */
  static async findResonance(contextId: string, currentSubject: string) {
    if (!Types.ObjectId.isValid(contextId)) {
      throw new Error(`Invalid Context ID format: ${contextId}`);
    }
    return await Sentence.findCrossSubjectResonance(contextId, currentSubject);
  }

  static async getById(id: string): Promise<SentenceDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid Sentence ID format: ${id}`);
    }
    return await Sentence.findById(id);
  }
}