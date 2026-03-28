import { buildRefineryGraph } from "./graphs/refineryGraphs";
import { KnowledgeRefineryAgent } from "./orchestration/KnowledgeRefineryAgent";
import { AIProvider, EmbeddingService } from "./orchestration/aiProvider";

export { KnowledgeRefineryAgent, AIProvider, EmbeddingService };

export const runRefineryPipeline = async (nodeId: string, content: string, userNuance: string) => {
  const graph = buildRefineryGraph();
  
  const finalState = await graph.invoke({
    nodeId,
    content,
    userNuance
  });

  return {
    proposedRelationships: finalState.proposedRelationships,
    generatedContext: finalState.generatedContext
  };
};