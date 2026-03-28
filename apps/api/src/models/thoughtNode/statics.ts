import { Types } from 'mongoose';
import { GraphExpandedThoughtNode, IThoughtNodeModel, GraphNodeDocument, CognitiveStage } from './types';

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

/**
 * ATLAS VECTOR SEARCH (Centralized)
 */
export async function vectorSearch(
  this: IThoughtNodeModel,
  { 
    queryVector, 
    limit = 10, 
    numCandidates = 100, 
    stage = 'BRAIN' 
  }: { 
    queryVector: number[], 
    limit?: number, 
    numCandidates?: number, 
    stage?: CognitiveStage 
  }
): Promise<(GraphNodeDocument & { score: number })[]> {
  const VECTOR_INDEX_NAME = process.env.VECTOR_INDEX_NAME || "vectorSearchIndex";
  
  const searchPayload: any = {
    index: VECTOR_INDEX_NAME,
    path: "embedding",
    queryVector: queryVector,
    numCandidates,
    limit,
    similarity: "cosine", 
  };

  if (stage) {
    searchPayload.filter = { stage };
  }

  return this.aggregate([
    { $vectorSearch: searchPayload },
    {
      $project: {
        embedding: 0, 
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]) as any;
}