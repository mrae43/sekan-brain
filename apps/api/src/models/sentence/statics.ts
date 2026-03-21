import { Types } from 'mongoose';
import { ISentenceModel, SentenceDocument } from './types';

/**
 * Horizontal Synthesis (Cross-subject discovery)
 * Find sentences in OTHER subjects that share the same contextId
 */
export async function findCrossSubjectResonance(
  this: ISentenceModel,
  contextId: Types.ObjectId | string, 
  currentSubject: string
): Promise<SentenceDocument[]> {
  return this.find({
    contextId,
    subject: { $ne: currentSubject },
    stage: 'brain'
  }).limit(10);
}

/**
 * Weighted Graph Traversal for RAG
 */
export async function getBrainContext(
  this: ISentenceModel,
  startIds: (Types.ObjectId | string)[]
): Promise<SentenceDocument[]> {
  return this.aggregate([
    { $match: { _id: { $in: startIds }, stage: 'brain' } },
    {
      $graphLookup: {
        from: 'sentences',
        startWith: '$relationships.target',
        connectFromField: 'relationships.target',
        connectToField: '_id',
        maxDepth: 3,
        as: 'network',
        restrictSearchWithMatch: { stage: 'brain' }
      }
    },
    // Filter out connections with negative weights if doing a "positive" search
    { $addFields: { 
        network: { $filter: { 
          input: "$network", 
          as: "item", 
          cond: { $gt: ["$$item.weight", -1] } 
        }}
    }}
  ]);
}
