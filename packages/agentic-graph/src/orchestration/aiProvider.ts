import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

/**
 * AI Provider
 * Centralizes the instantiation of AI models and providers to ensure consistency
 * across the agentic graph and the API.
 */
export class AIProvider {
  private static _embeddings: OpenAIEmbeddings;
  private static _llm: ChatOpenAI;

  static getEmbeddings(): OpenAIEmbeddings {
    if (!this._embeddings) {
      this._embeddings = new OpenAIEmbeddings({
        modelName: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      });
    }
    return this._embeddings;
  }

  static getLLM(): ChatOpenAI {
    if (!this._llm) {
      this._llm = new ChatOpenAI({
        modelName: LLM_MODEL,
        temperature: 0,
      });
    }
    return this._llm;
  }
}

/**
 * Shared Embedding Service logic for common operations
 */
export class EmbeddingService {
  static async generateEmbedding(text: string): Promise<number[]> {
    const provider = AIProvider.getEmbeddings();
    return provider.embedQuery(text);
  }
}
