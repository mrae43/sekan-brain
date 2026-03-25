import { Types } from 'mongoose';
import { GraphExpandedThoughtNode, IThoughtNodeModel, GraphNodeDocument } from './types';

/**
 * Horizontal Synthesis (Cross-subject discovery)
 * Find ThoughtNodes in OTHER subjects that share the same contextId
 */
export async function findCrossSubjectResonance(
  this: IThoughtNodeModel,
  contextId: Types.ObjectId | string, 
  currentSubject: string
): Promise<GraphNodeDocument[]> {
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
  this: IThoughtNodeModel,
  startIds: (Types.ObjectId | string)[],
  depth: number = 1 
): Promise<GraphExpandedThoughtNode[]> {
  const ids = startIds.map(id => new Types.ObjectId(id));
  
  // $graphLookup maxDepth: 0 means it only fetches direct neighbors (depth 1)
  const maxDepth = depth > 0 ? depth - 1 : 0;

  return this.aggregate([
    { $match: { _id: { $in: ids } } },
    // 1. Traverse OUTGOING relationships (Thoughts this node links to)
    {
      $graphLookup: {
        from: this.collection.name,
        startWith: '$relationships.targetId',
        connectFromField: 'relationships.targetId',
        connectToField: '_id',
        maxDepth: maxDepth,
        as: 'outgoingNodes',
        depthField: 'graphDepth',
        restrictSearchWithMatch: { stage: 'BRAIN' }
      }
    },

    // 2. Traverse INCOMING relationships (Thoughts that link back to this node)
    {
      $graphLookup: {
        from: this.collection.name,
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'relationships.targetId',
        maxDepth: maxDepth,
        as: 'incomingNodes',
        depthField: 'graphDepth',
        restrictSearchWithMatch: { stage: 'BRAIN' }
      }
    }
  ])
};