import { Annotation } from "@langchain/langgraph";

// ==========================================
// INTERFACES
// ==========================================

export interface ScrapedRelationship {
  target: string;         // The ID of the target sentence
  type: string;           // e.g., "supports", "contrasts", "translates_to"
  weight: number;         // 0.0 to 1.0
  isCrossSubject: boolean;
  description: string;    // The 'why' behind the link
}

/**
 * Represents the retrieved 'brain' nodes passed to the AI for relationship linking.
 */
export interface CandidateNode {
  _id: string;
  content: string;
  userNuance?: string;
  subject?: string;
}

// ==========================================
// GRAPH STATE
// ==========================================

export const RefineryState = Annotation.Root({
  // ==========================================
  // 1. INPUTS (Provided by the User/API when the graph starts)
  // ==========================================
  sentenceId: Annotation<string>,
  rawContent: Annotation<string>,
  contextId: Annotation<string | undefined>,
  subject: Annotation<string | undefined>,
  
  // The core meaning provided manually by you (The anchor for the AI)
  userNuance: Annotation<string>, 

  // ==========================================
  // 2. RETRIEVAL STATE (Populated by retrieve.ts)
  // ==========================================
  // The 'menu' of existing brain nodes the AI is allowed to link to
  brainContext: Annotation<CandidateNode[]>({
    reducer: (currentState, updateValue) => updateValue,
    default: () => [],
  }),

  // ==========================================
  // 3. ENRICHMENT STATE (Populated by analyze.ts)
  // ==========================================
  semanticRole: Annotation<string>({
    reducer: (currentState, updateValue) => updateValue,
    default: () => "",
  }),
  
  tags: Annotation<string[]>({
    // We overwrite (rather than concat) so that if the node retries, it doesn't duplicate tags
    reducer: (currentState, updateValue) => updateValue, 
    default: () => [],
  }),
  
  metadata: Annotation<Record<string, any>>({
    reducer: (currentState, updateValue) => updateValue,
    default: () => ({}),
  }),
  
  potentialLinks: Annotation<ScrapedRelationship[]>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => [],
  }),

  // ==========================================
  // 4. METADATA & CONTROL FLOW
  // ==========================================
  status: Annotation<"processing" | "needs_review" | "ready_to_save" | "completed" | "error">({
    reducer: (currentState, updateValue) => updateValue,
    default: () => "processing",
  }),
  
  logs: Annotation<string[]>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => [],
  }),
  
  errorLog: Annotation<string | undefined>({
    reducer: (currentState, updateValue) => updateValue,
    default: () => undefined,
  }),
});

export type RefineryStateType = typeof RefineryState.State;