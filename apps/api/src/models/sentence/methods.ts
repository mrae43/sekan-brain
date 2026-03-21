import { SentenceDocument } from './types';

/**
 * Handle the "Trigger Enrichment" stage
 */
export function enrich(
  this: SentenceDocument,
  nuance: string, 
  relationships: any[]
): SentenceDocument {
  this.enrichmentData.userNuance = nuance;
  this.relationships.push(...relationships);
  this.stage = 'brain';
  return this;
}
