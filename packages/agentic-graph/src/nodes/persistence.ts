import { RefineryStateType } from "../state";
import { SentenceService } from "@repo/api/src/services/sentences.service"; // Connecting to your backend services
import { EnrichmentPayload } from "@repo/types";

export const persistenceNode = async (state: RefineryStateType): Promise<Partial<RefineryStateType>> => {
  try {
    // 1. Pre-Flight Validation
    // We must have a sentenceId to perform an update.
    if (!state.sentenceId) {
      throw new Error("Cannot persist: No sentenceId provided in the graph state.");
    }

    // 2. Data Transformation
    // Package the graph state into the exact payload expected by your backend's enrich mutation.
    const enrichmentPayload: EnrichmentPayload = {
      // The structured data (combining your input with the Architect's output)
      userNuance: state.userNuance,
      semanticRole: state.semanticRole || "Unassigned",
      tags: state.tags || [],
      metadata: state.metadata || {},
      
      // The relationship edges validated by the AI
      // Fallback to an empty array if potentialLinks is undefined
      relationships: state.potentialLinks?.map(link => ({
        target: link.target,
        type: link.type,
        weight: link.weight || 1.0, 
        isCrossSubject: link.isCrossSubject || false,
        description: link.description || ""
      })) || []
    };

    // 3. Database Mutation (The Notary)
    // Execute the backend service method. Adjust this method name to match 
    // whatever logic powers your GraphQL `enrich` mutation.
    await SentenceService.enrichSentence(state.sentenceId, enrichmentPayload);

    // 4. Successful Completion
    return {
      status: "completed",
      logs: [`Successfully persisted sentence ${state.sentenceId} to the 'brain' stage with ${enrichmentPayload.relationships?.length} links.`]
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Database Error";
    
    // 5. Graceful Failure
    // If the database transaction fails (e.g., a connection timeout or a schema validation error),
    // we catch it here. The graph state updates to "error" so the calling function knows it failed.
    return {
      status: "error",
      errorLog: `Persist Node Failed: ${errorMessage}`
    };
  }
};