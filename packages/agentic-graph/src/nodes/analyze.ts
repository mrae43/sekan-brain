import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RefineryStateType } from "../state";

// Structured Output (The AI's "Filing" Format)
const EnrichmentSchema = z.object({
  semanticRole: z.string().describe(
    "The function of this sentence in the lore (e.g., 'Protagonist Motivation', 'World Building - Magic System', 'Plot Hook')."
  ),
  tags: z.array(z.string()).describe(
    "3-5 highly specific tags for GraphRAG indexing."
  ),
  metadata: z.record(z.string(), z.any()).describe(
    "Additional extracted JSON data like locations, dates, or power levels mentioned. Empty object if none."
  ),
  suggestedRelationships: z.array(z.object({
    targetId: z.string().describe("The exact ID of the related 'brain' node from the provided context."),
    type: z.string().describe("Type of link: 'contradicts', 'elaborates', 'foreshadows', or 'character_parallel'."),
    description: z.string().describe("Why is this link important based on the user's nuance?")
  })).describe("Links to other sentences provided in the context. Only link if a genuine connection exists.")
});


const llm = new ChatOpenAI({
  model: "gpt-4o", 
  temperature: 0.1,
}).withStructuredOutput(EnrichmentSchema, { name: "refine_sentence" });

// Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert Graph Architect managing a Knowledge Graph for a complex light novel.
The user has provided a raw sentence and their own contextual meaning ("User Nuance").

Your Task:
1. Read the user's nuance—this is the absolute truth.
2. Generate technical metadata (semanticRole, tags, metadata) based on their nuance.
3. Review the provided "Candidate Brain Nodes" (if any). Identify if the current sentence forms a logical relationship with any of them.
4. Review "User Relationship Hints". These are links the user specifically wants. Your job is to formalize these links and verify them against the "Candidate Brain Nodes".
5. If the user provided a hint, ensure it is included in your output with a refined description.
6. Output strict JSON. Do NOT hallucinate target IDs; only use the IDs provided in the candidate list.`
  ],
  [
    "user", 
    `Subject: {subject}
    Raw Text: {rawContent}

    User Nuance (The Core Meaning):
    {userNuance}

    User Relationship Hints (Human Input):
    {userHints}

    Candidate Brain Nodes for Linking:
    {brainContext}`
  ]
]);

// The Node Function
export const analyzeNode = async (state: RefineryStateType): Promise<Partial<RefineryStateType>> => {
  try {
    const chain = prompt.pipe(llm);

    // Format the retrieved brain nodes into a readable string for the LLM
    // (Assumes state.brainContext is an array of SentenceDocuments or similar objects)
    const formattedCandidates = state.brainContext && state.brainContext.length > 0
      ? state.brainContext.map(node => `ID: ${node._id} | Text: ${node.content} | Nuance: ${node.userNuance || 'None'}`).join("\n---\n")
      : "No candidate nodes available for linking.";

    // Invoke the LLM
    const response = await chain.invoke({
      subject: state.subject || "Unknown Subject",
      rawContent: state.rawContent,
      userNuance: state.userNuance || "No human nuance provided.",
      userHints: state.userRelationships && state.userRelationships.length > 0
        ? state.userRelationships.map(r => `- Link to ${r.target}: ${r.description}`).join("\n")
        : "No manual hints provided.",
      brainContext: formattedCandidates
    });

    // Map the structured output to the Graph State
    return {
      semanticRole: response.semanticRole,
      tags: response.tags,
      metadata: response.metadata,
      
      // Map 'suggestedRelationships' into the state's 'potentialLinks' array
      potentialLinks: response.suggestedRelationships.map(rel => ({
        target: rel.targetId,
        type: rel.type,
        description: rel.description,
        weight: 0.8, // Default weight, or you could have the LLM generate this too
        isCrossSubject: false // Default, you can calculate this in the persist node if subjects differ
      })),
      
      status: "ready_to_save",
      
      logs: [
        `Refinement complete. Generated ${response.tags.length} tags and found ${response.suggestedRelationships.length} relationships.`
      ]
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown LLM Error";
    return {
      status: "error",
      errorLog: `Analyze Node (Refiner) Failed: ${errorMessage}`
    };
  }
};