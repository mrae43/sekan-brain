import { GraphNodeDocument, IRelationship } from './types';

/**
 * Stage 2: Human Nuance + AI Context Generation
 * Transitions the node from GARBAGE to RESONATING.
 * This prepares the thought for human validation without polluting the Brain graph.
 */
export async function enrich(
  this: GraphNodeDocument,
  userNuance: string, 
  semanticRole?: string,
  llmGeneratedContext?: string
): Promise<GraphNodeDocument> {
  
  // 1. Assign Human Nuance
  this.context.userNuance = userNuance;
  
  // 2. Assign optional AI/Semantic data
  if (semanticRole) {
    this.context.semanticRole = semanticRole;
  }
  
  if (llmGeneratedContext) {
    this.context.llmGeneratedContext = llmGeneratedContext;
  }
  
  // 3. Move to transitionary stage
  this.stage = 'BRAIN';
  
  // 4. Save and return the Hydrated Document
  return this.save();
}

/**
 * Stage 3: Human Validation & Graph Integration
 * Transitions the node from RESONATING to BRAIN.
 * Crystallizes the thought into the permanent Knowledge Graph.
 */
export async function promoteToBrain(
  this: GraphNodeDocument,
  approvedRelationships: IRelationship[]
): Promise<GraphNodeDocument> {
  
  // 1. Validate and assign relationships
  // We filter out any invalid/missing relationships before assignment
  const validRelationships = approvedRelationships.filter(r => 
    r.targetId && r.type && r.explanation
  );
  
  this.relationships = validRelationships;
  
  // 2. Move to permanent storage
  this.stage = 'BRAIN';
  
  // 3. Save and return
  return this.save();
}
