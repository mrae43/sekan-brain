import { StateGraph } from "@langchain/langgraph";
import { RefineryStateAnnotation } from "../state/graphState";
import { retrieveNode } from "../nodes/retrieveNode";
import { analyzeNode } from "../nodes/analyzeNode";

export const buildRefineryGraph = () => {
  const workflow = new StateGraph(RefineryStateAnnotation)
    .addNode("retrieve", retrieveNode)
    .addNode("analyze", analyzeNode)
    
    // Define the Leylines (Execution Flow)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "analyze")
    .addEdge("analyze", "__end__"); 
    // In the future, we can add conditional edges here to check if data needs Human Validation

  return workflow.compile();
};