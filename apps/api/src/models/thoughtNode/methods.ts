import { GraphNodeDocument, IRelationship } from './types';

/**
 * Stage 2: Human Nuance + AI Context Generation
 * Transitions the node from GARBAGE to RESONATING.
 * This prepares the thought for human validation without polluting the Brain graph.
 */
export async function enrich(
  this: GraphNodeDocument,
  userNuance: string, 
  semanticRole?: string | null,
  aiResults?: {
    llmGeneratedContext?: string | null;
    tags?: string[] | null;
    metadata?: Record<string, any> | null;
    proposedRelationships?: IRelationship[] | null;
  }
): Promise<GraphNodeDocument> {

  if (!this.context) {
    this.context = {};
  }
  
  // 1. Assign Human Nuance
  this.context.userNuance = userNuance;
  
  // 2. Assign optional AI/Semantic data
  if (semanticRole) {
    this.context.semanticRole = semanticRole;
  }
  
  if (aiResults) {
    if (aiResults.llmGeneratedContext) {
      this.context.llmGeneratedContext = aiResults.llmGeneratedContext;
    }
    if (aiResults.tags) {
      this.context.tags = aiResults.tags;
    }
    if (aiResults.metadata) {
      this.context.metadata = aiResults.metadata;
    }
    if (aiResults.proposedRelationships) {
      this.relationships = aiResults.proposedRelationships;
    }
  }
  
  // 3. Move to transitionary stage
  this.stage = 'RESONATING';
  
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
  approvedRelationships: IRelationship[],
  embedding?: number[]
): Promise<GraphNodeDocument> {
  
  // 1. Validate and assign relationships
  // We filter out any invalid/missing relationships before assignment
  const validRelationships = approvedRelationships.filter(r => 
    r.targetId &&
    r.type &&
    r.explanation && r.explanation.trim() !== ""
  );
  
  this.relationships = validRelationships;

  // 2. Assign embedding if provided
  if (embedding) {
    this.embedding = embedding;
  }
  
  // 3. Move to permanent storage
  this.stage = 'BRAIN';
  
  // 4. Save and return
  return this.save();
}
