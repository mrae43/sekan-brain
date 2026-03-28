import { buildRefineryGraph } from "./graphs/refineryGraphs";
import { KnowledgeRefineryAgent } from "./orchestration/KnowledgeRefineryAgent";

export { KnowledgeRefineryAgent };

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