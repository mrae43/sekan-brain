import { EmbeddingService as AgenticEmbeddingService, AIProvider } from "@repo/agentic-graph";
import { GraphEdge } from "../graphql/__generated__/types";

/**
 * EmbeddingService (API Wrapper)
 * Consumes the centralized embedding logic from the agentic-graph package.
 */
export class EmbeddingService {
    static async generateEmbedding(text: string): Promise<number[]> {
        return AgenticEmbeddingService.generateEmbedding(text);
    }
}

/**
 * LLMService (API Wrapper)
 * Consumes centralized LLM capabilities for general text generation and synthesis.
 */
export class LLMService {
    static async generateText(prompt: string): Promise<string> {
        const llm = AIProvider.getLLM();
        const response = await llm.invoke(prompt);
        return response.content.toString();
    }
  
    static async extractSearchIntent(prompt: string): Promise<string> {
        // This can be expanded into a specific agentic call if higher precision is needed
        return prompt; 
    }
    
    static async generateSynthesis(query: string, nodes: any[], edges: GraphEdge[]): Promise<string> {
       const llm = AIProvider.getLLM();
       
       const context = nodes.map(n => `- [${n.subject || 'Thought'}]: ${n.content}`).join('\n');
       const prompt = `
        You are the Sekan-Brain Synthesis Engine. 
        Given the user query and the following retrieved thoughts, provide a concise synthesis 
        of how these thoughts relate to each other and what "Aha!" moment they might suggest.

        Query: "${query}"

        Retrieved Context:
        ${context}

        Synthesis:
       `;

       const response = await llm.invoke(prompt);
       return response.content.toString();
    }
}
