import { Types } from 'mongoose';
import { Sentence, SentenceDocument } from '../models/sentence';
import { EnrichmentPayload } from '../graphql/__generated__/types';

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
  static async enrichSentence(
    id: string,
    payload: EnrichmentPayload
  ): Promise<SentenceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid Sentence ID format: ${id}`);
    }
  
    const doc = await Sentence.findById(id);
    if (!doc) throw new Error("Sentence node not found for enrichment");

    const metadataMap = new Map(Object.entries(payload.metadata || {}));

    // 1. Update the document's enrichment data directly
    doc.enrichmentData = {
      userNuance: payload.userNuance,
      semanticRole: payload.semanticRole || "Unassigned",
      tags: payload.tags || [],
      metadata: metadataMap
    };

    // 2. Handle Relationships 
    // (Assuming doc.enrich handles pushing relationships into the array)
    // If doc.enrich also sets the nuance, you might need to adjust it or just let it run.
    if (typeof doc.enrich === 'function') {
      doc.enrich(payload.userNuance, payload.relationships || []);
    }

    // 3. Explicitly promote to brain stage for RAG readiness
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