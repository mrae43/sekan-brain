import { buildRefineryGraph } from "../graphs/refineryGraphs";
import { IRelationship } from "@repo/api/src/models/thoughtNode/types";

/**
 * KnowledgeRefineryAgent
 * 
 * This agent orchestrates the refinement process of raw thought nodes.
 * It invokes the LangGraph-based refinery flow to generate structured context,
 * analyze relationships, and identify semantic resonance.
 */
export class KnowledgeRefineryAgent {
  /**
   * Processes a thought node to generate enriched context and proposed relationships.
   * 
   * @param content - The raw content of the thought.
   * @param userNuance - Additional context provided by the user.
   * @param semanticRole - (Optional) The identified role of the thought.
   * @returns An object containing the generated context and relationships.
   */
  static async processNode(
    content: string, 
    userNuance: string, 
    semanticRole?: string
  ) {
    const graph = buildRefineryGraph();

    // The refinery graph state expects content, userNuance, and optionally nodeId.
    // Since we are enriching an existing node, passing the content is the primary driver.
    const finalState = await graph.invoke({
      content,
      userNuance,
      // We map semanticRole to userNuance or keep it for future nodes if needed
    });

    // Structure the response to match the service's expectations
    return {
      llmGeneratedContext: finalState.generatedContext?.llmGeneratedContext ?? null,
      tags: finalState.generatedContext?.tags ?? [],
      metadata: finalState.generatedContext?.metadata ?? {},
      proposedRelationships: (finalState.proposedRelationships as IRelationship[]) ?? []
    };
  }
}
