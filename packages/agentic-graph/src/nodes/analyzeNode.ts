import { z } from "zod";
import { Types } from "mongoose";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RefineryState } from "../state/graphState";
import { AIProvider } from "../orchestration/aiProvider";

const AnalysisOutputSchema = z.object({
  generatedContext: z.object({
    llmGeneratedContext: z.string().describe("A synthesized paragraph explaining how the new thought connects to the retrieved context."),
    semanticRole: z.string().describe("The functional role of this thought (e.g., 'Observation', 'Solution', 'Lore Connection', 'Problem')."),
    tags: z.array(z.string()).describe("3-5 highly relevant tags for vector metadata."),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).describe("Extract 2-5 dynamic key-value pairs representing specific attributes, entities, or dimensions found in the thought (e.g., { 'domain': 'React', 'complexity': 8, 'is_distorted': true }).")
  }),
  proposedRelationships: z.array(
    z.object({
      targetId: z.string().describe("The ID of the retrieved node this thought connects to."),
      type: z.enum(["SUPPORTS", "CONTRADICTS", "RELATES_TO", "EVOLVES", "DEVIATES_FROM"]).describe("The specific nature of the edge."),
      weight: z.number().min(0.1).max(1.0).describe("Strength of the resonance. 1.0 is direct equivalence, 0.5 is tangential."),
      isCrossSubject: z.boolean().describe("True if connecting entirely different subjects or domains."),
      explanation: z.string().describe("Agentic insight: Why did you connect these? Be concise but analytical.")
    })
  ).describe("An array of graph edges connecting the new thought to the retrieved context.")
})

/**
 * ANALYZE NODE
 * The "Brain" of the Resonance phase. Evaluates new nuance against historical leylines.
 */
export const analyzeNode = async (state: RefineryState): Promise<Partial<RefineryState>> => {
  const llm = AIProvider.getLLM().withStructuredOutput(AnalysisOutputSchema, { name: "extract_cognitive_resonance" });
  
  console.log(`[Analyze Node] Analyzing resonance for Node ID: ${state.nodeId}`);
  try {
    const historicalContext = state.retrievedContext?.length
      ? state.retrievedContext.map((node) => ({
        id: node._id.toString(),
        content: node.content,
        stage: node.stage,
        subject: node.subject || "unknown",
        metadata: node.context?.metadata instanceof Map 
          ? Object.fromEntries(node.context.metadata) 
          : (node.context?.metadata || {})
      }))
      : [];
    
    if (historicalContext.length === 0) {
      console.log(`[Analyze Node] No historical context found. Generating isolated semantic context.`);
    }

    const prompt = ChatPromptTemplate.fromMessages([[
        "system",
        `You are the core logic engine of 'Sekan-Brain', an advanced Knowledge Refinery. 
        Your task is to transition a raw thought from the 'GARBAGE' stage into the 'RESONATING' stage.
        
        INSTRUCTIONS:
        1. Analyze the user's raw 'Thought Content' and their clarifying 'User Nuance'.
        2. Compare this against the provided 'Historical Context' (existing nodes in the brain).
        3. Identify deep resonances. If the thought describes a copied/distorted system (like the False Grail War in Snowfield), and a historical node describes the original system (like the Fuyuki Grail), connect them with 'DEVIATES_FROM' or 'RELATES_TO'.
        4. Synthesize a new overarching context and generate precise, weighted graph relationships.
        5. DO NOT hallucinate IDs. Only use the IDs provided in the 'Historical Context'.`
      ],[
        "user",
        `THOUGHT CONTENT: {content}
         USER NUANCE: {nuance}
         
         HISTORICAL CONTEXT (Available Nodes to connect to): 
         {historicalContext}`
      ]
    ]);

    const formattedPrompt = await prompt.formatMessages({
      content: state.content,
      nuance: state.userNuance || "No nuance provided",
      historicalContext: JSON.stringify(historicalContext, null, 2)
    });

    console.log(`[Analyze Node] Invoking LLM for structured extraction...`);
    const analysis = await llm.invoke(formattedPrompt);

    console.log(`[Analyze Node] Successfully extracted ${analysis.proposedRelationships.length} relationships.`);

    const processedRelationships = analysis.proposedRelationships.
      filter(rel => Types.ObjectId.isValid(rel.targetId))
      .map(rel => ({
        ...rel,
        targetId: new Types.ObjectId(rel.targetId)
      }));
    
    if (processedRelationships.length < analysis.proposedRelationships.length) {
      console.warn(`[Analyze Node] Warning: Filtered out invalid hallucinated ObjectIds from LLM response.`);
    }

    return {
      generatedContext: {
        ...analysis.generatedContext,
        userNuance: state.userNuance
      },
      proposedRelationships: processedRelationships
    }
    
  } catch (error) {
    console.error(`[Analyze Node] Critical Analysis Failure:`, error);
    return {
      generatedContext: {
        llmGeneratedContext: "Analysis failed due to system anomaly. Manual intervention required.",
        semanticRole: "Unclassified",
        tags: ["error", "Requires-Manual-Review"],
        metadata: {},
        userNuance: state.userNuance
      },
      proposedRelationships: []
    }
  }
};