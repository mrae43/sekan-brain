import { RefineryState } from "../state/graphState";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Types } from "mongoose";
import { ThoughtNode } from "@repo/api/src/models/thoughtNode/model"; 
import { GraphExpandedThoughtNode } from "@repo/api/src/models/thoughtNode/types";

/**
 * RETRIEVE NODE
 * Strategy: Sequential (1. Vector Search for Semantic Resonance -> 2. Graph Lookup for Deep Context)
 */
export const retrieveNode = async (state: RefineryState): Promise<Partial<RefineryState>> => {
  console.log(`[Retrieve Node] Initiating sensory sweep for Node ID: ${state.nodeId}`);

  // 1. Construct the query payload
  const searchQuery = `${state.content} ${state.userNuance}`;

  // 2. Generate Embeddings
  const embeddings = new OpenAIEmbeddings({ 
    modelName: "text-embedding-3-small", 
    dimensions: 1536 
  });
  
  const queryVector = await embeddings.embedQuery(searchQuery);

  // 3. Vector Search Pipeline (Finding resonant "BRAIN" nodes across the database)
  const vectorPipeline =[
    {
      $vectorSearch: {
        index: "vector_index", // The name of your Atlas Vector Search Index
        path: "embedding",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 3,
        filter: { 
          stage: "BRAIN" 
        }
      }
    },
    {
      // Project away the heavy embedding buffer for performance
      $project: { embedding: 0, score: { $meta: "vectorSearchScore" } }
    }
  ];

  const resonantNodes = await ThoughtNode.aggregate(vectorPipeline);

  // If no resonance is found, return early
  if (!resonantNodes || resonantNodes.length === 0) {
    console.log(`[Retrieve Node] No existing resonance found.`);
    return { retrievedContext:[] };
  }

  // 4. Graph Traversal Pipeline
  // Extract the IDs of the resonant nodes to find their established neighborhoods
  const resonantIds = resonantNodes.map(node => node._id);

  const graphPipeline =[
    { 
      $match: { _id: { $in: resonantIds } } 
    },
    {
      $graphLookup: {
        from: "thoughtnodes",
        startWith: "$relationships.targetId",
        connectFromField: "relationships.targetId",
        connectToField: "_id",
        as: "outgoingNodes",
        maxDepth: 1,
        restrictSearchWithMatch: { stage: "BRAIN" }
      }
    },
    {
      $project: { embedding: 0 }
    }
  ];

  const expandedContext: GraphExpandedThoughtNode[] = await ThoughtNode.aggregate(graphPipeline);

  console.log(`[Retrieve Node] Successfully retrieved ${expandedContext.length} resonant clusters.`);

  // 5. Update the LangGraph State
  return {
    retrievedContext: expandedContext
  };
};