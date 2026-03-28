import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ThoughtNode } from "@repo/api/src/models/thoughtNode/model";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);

const embeddings = new OpenAIEmbeddings({
    modelName: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
});

/**
 * ATLAS VECTOR SEARCH TOOL
 * A dynamic LangChain tool that allows an agent to explicitly query the Sekan-Brain
 * via Mongoose Atlas Vector Search. It retrieves semantically resonant thoughts.
 */
export const atlasVectorTool = tool(
  async ({ query, limit, stageFilter }) => {
    console.log(`[Tool: atlasVectorTool] Agent invoked search for: "${query}"`);

    try {
      const queryVector = await embeddings.embedQuery(query);

      const results = await ThoughtNode.vectorSearch({
        queryVector,
        limit: limit || 10,
        stage: stageFilter as any || 'BRAIN'
      });

      if (!results || results.length === 0) {
        return "No resonant thoughts found for the given query.";
      }

      return JSON.stringify(results.map(node => ({
        id: node._id,
        content: node.content,
        subject: node.subject,
        stage: node.stage,
        score: node.score
      })), null, 2);

    } catch (error) {
      console.error(`[Tool: atlasVectorTool] Execution failed:`, error);
      return `Error executing vector search: ${(error as Error).message}`;
    }
  },
  {
    name: "atlas_vector_search",
    description: "Search the Sekan-Brain for semantically resonant thoughts using Atlas Vector Search.",
    schema: z.object({
      query: z.string().describe("The search query string."),
      limit: z.number().optional().describe("Maximum number of results to return (default: 10)."),
      stageFilter: z.enum(["GARBAGE", "RESONATING", "BRAIN"]).optional().describe("Filter by cognitive stage (default: BRAIN).")
    })
  }
)