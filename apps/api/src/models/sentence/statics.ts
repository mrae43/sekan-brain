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
  this: IThoughtNodeModel,
  startIds: (Types.ObjectId | string)[],
  depth: number = 1 
): Promise<ThoughtNodeDocument[]> {
  
  // Mongoose aggregations do not auto-cast ObjectIds in $in arrays
  const objectIds = startIds.map(id => typeof id === 'string' ? new Types.ObjectId(id) : id);

  return this.aggregate([
    // 1. Find the starting nodes, ensuring they are validated thoughts
    { $match: { _id: { $in: objectIds }, stage: 'BRAIN' } },
    
    // 2. Traverse the knowledge graph
    {
      $graphLookup: {
        from: 'thoughtnodes', // Assumes Mongoose default pluralization of 'ThoughtNode'
        startWith: '$relationships.targetId', // Updated to targetId
        connectFromField: 'relationships.targetId', // Updated to targetId
        connectToField: '_id',
        maxDepth: depth, // Use dynamic depth passed from GraphQL
        as: 'network',
        restrictSearchWithMatch: { stage: 'BRAIN' } // Only pull in validated connections
      }
    }
    
    // Note: The previous logic filtering by `weight` inside the aggregation pipeline 
    // was removed. `$graphLookup` returns full documents, not edge definitions. 
    // You should filter low-weight/negative edges in the Service layer when 
    // constructing the `{ nodes, edges }` flat GraphResponse for the frontend.
  ]);
}