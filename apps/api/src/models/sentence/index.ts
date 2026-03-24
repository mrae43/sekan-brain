import { ThoughtNodeDocument } from './types';

/**
 * Handle the "Trigger Enrichment" stage
 */
export function enrich(
  this: ThoughtNodeDocument,
  nuance: string, 
  relationships: any[]
): ThoughtNodeDocument {
  this.context.userNuance = nuance;
  this.relationships.push(...relationships);
  this.stage = 'BRAIN';
  return this;
}
