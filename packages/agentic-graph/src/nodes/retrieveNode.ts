import { RefineryState } from "../state/graphState";
import { AIProvider } from "../orchestration/aiProvider";
import { ThoughtNode } from "@repo/api/src/models/thoughtNode/model"; 
import { GraphExpandedThoughtNode } from "@repo/api/src/models/thoughtNode/types";


/**
 * RETRIEVE NODE
 * Strategy: Sequential (1. Vector Search for Semantic Resonance -> 2. Graph Lookup for Deep Context)
 */
export const retrieveNode = async (state: RefineryState): Promise<Partial<RefineryState>> => {
  console.log(`[Retrieve Node] Initiating sensory sweep for Node ID: ${state.nodeId}`);

  try {
    const searchQuery = `${state.content} ${state.userNuance}`;
    const queryVector = await AIProvider.getEmbeddings().embedQuery(searchQuery);

    const resonantNodes = await ThoughtNode.vectorSearch({
      queryVector,
      limit: 10,
      stage: "BRAIN"
    });

    if (!resonantNodes || resonantNodes.length === 0) {
      console.log(`[Retrieve Node] No existing resonance found.`);
      return { retrievedContext:[] };
    }

    const resonantIds = resonantNodes.map(node => node._id);
    const expandedTree = await ThoughtNode.expandThoughtGraph(resonantIds, 1);

    const flatContextMap = new Map<string, GraphExpandedThoughtNode>();
    
    expandedTree.forEach(node => {
      // Add the root resonant node
      flatContextMap.set(node._id.toString(), node);
      
      // Flatten both outgoing and incoming neighbors into the same Map to ensure uniqueness
      const neighbors = [...(node.outgoingNodes || []), ...(node.incomingNodes || [])];
      neighbors.forEach(neighbor => {
        flatContextMap.set(neighbor._id.toString(), neighbor);
      });
    });

    const flatContext = Array.from(flatContextMap.values());

    console.log(`[Retrieve Node] Successfully retrieved and flattened ${flatContext.length} contextual nodes.`);

    return {
      retrievedContext: flatContext
    };

  } catch (error) {
    console.error(`[Retrieve Node] Fatal failure during sensory sweep:`, error);
    return { retrievedContext: [] };
  }
};