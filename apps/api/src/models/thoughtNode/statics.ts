import { Types } from 'mongoose';
import { IThoughtNodeModel, ThoughtNodeDocument } from './types';

/**
 * Horizontal Synthesis (Cross-subject discovery)
 * Find ThoughtNodes in OTHER subjects that share the same contextId
 */
export async function findCrossSubjectResonance(
  this: IThoughtNodeModel,
  contextId: Types.ObjectId | string, 
  currentSubject: string
): Promise<ThoughtNodeDocument[]> {
  return this.find({
    contextId,
    subject: { $ne: currentSubject },
    stage: 'BRAIN' 
  }).limit(10);
}

/**
 * Weighted Graph Traversal for RAG
 * Triggers a recursive $graphLookup to fetch interconnected thoughts
 */
export async function expandThoughtGraph(
  startIds: (Types.ObjectId | string)[],
  depth: number = 1 
): Promise<ThoughtNodeDocument[]> {
  const ids = startIds.map(id => new Types.ObjectId(id));
  
  // $graphLookup maxDepth: 0 means it only fetches direct neighbors (depth 1)
  const maxDepth = depth > 0 ? depth - 1 : 0;
}