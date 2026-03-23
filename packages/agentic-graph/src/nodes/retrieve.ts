import { RefineryStateType } from "../state";
import { SentenceService } from "@repo/api/src/services/sentences.service";

export const retrieveNode = async (state: RefineryStateType): Promise<Partial<RefineryStateType>> => {
  try {
    if (!state.contextId) {
      return {
        status: "ready_to_save",
        logs: ["Retrieve Node Failed: No contextId provided in the state"]
      }
    }

    const currentSubject = state.subject || "unknown";

    const resonanceResults = await SentenceService.findResonance(
      state.contextId,
      currentSubject
    );

    const candidateNodes = resonanceResults
      .filter((doc) => doc._id.toString() !== state.sentenceId)
      .map((doc) => ({
        _id: doc._id.toString(),
        content: doc.content,
        nuance: doc.enrichmentData.userNuance || "",
        metadata: doc.enrichmentData.metadata,
        relationships: doc.relationships,
      }));
    
    const nextStatus = candidateNodes.length > 0 ? "processing" : "ready_to_save";

    return {
      brainContext: candidateNodes,
      status: nextStatus,
      logs: [`Retrieved ${candidateNodes.length} candidate nodes using contextId: ${state.contextId}.`]
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Retrieval Error";
    return {
      status: "error",
      errorLog: `Retrieve Node Failed: ${errorMessage}`
    };
  }
}