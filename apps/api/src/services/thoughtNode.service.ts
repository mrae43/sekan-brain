import { Types } from 'mongoose';
import { GraphEdge, GraphResponse, RelationshipInput } from '../graphql/__generated__/types';
import { ThoughtNode } from '../models/sentence';
import { EmbeddingService, LLMService } from './llm.service';

export class ThoughtNodeService {
    // Queries
    static async findResonatingThoughts(query: string): Promise<GraphResponse> {
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);
      
      const seedNodes = await ThoughtNode.aggregate([
        {
          $vectorSearch: {
            index: 'thought_node_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 4,
            filter: { stage: 'BRAIN' }
          }
        },
      ])

      if (!seedNodes || seedNodes.length === 0) {
        return { nodes: [], edges:[], aiSynthesis: "No resonating thoughts found." };
      }

      const seedIds = seedNodes.map(node => node._id);
      const contextIds = seedNodes.map(node => node.contextId).filter(Boolean);
      const subjects = seedNodes.map(node => node.subject).filter(Boolean);

      // STEP 2: Graph Expansion - Trigger Structured & Unstructured relations

      const expandedNodes = await ThoughtNode.aggregate([
        {
          $match: {
            $or: [
              { _id: { $in: seedIds } },
              {'relationships.targetId': { $in: seedIds } },
              { contextId: { $in: contextIds } },
              { subject: { $in: subjects } }
            ]
          }
        },
        {
          $graphLookup: {
            from: 'thoughtnodes',
            startWith: '$relationships.targetId',
            connectFromField: 'relationships.targetId',
            connectToField: '_id',
            maxDepth: 1,
            as: 'connectedGraphNodes',
            restrictSearchWithMatch: { stage: 'BRAIN' },
          }
        }
      ]);

      const uniqueNodesMap = new Map<string, any>();

      expandedNodes.forEach(node => {
        uniqueNodesMap.set(node._id.toString(), node);

        if (node.connectedGraphNodes) {
          node.connectedGraphNodes.forEach((connectedNode: any) => {
            uniqueNodesMap.set(connectedNode._id.toString(), connectedNode);
          });
        }
      });

      const finalNodes = Array.from(uniqueNodesMap.values());

      // STEP 3: Graph Construction (Mapping Nodes & Edges)
      const edges: GraphEdge[] = [];
      const edgeDuplicationSet = new Set<string>();

      finalNodes.forEach(sourceNode => {
        const sourceIdStr = sourceNode._id.toString();
      // 3a. Map Structured Relationships (Explicit)
      if (sourceNode.relationships && sourceNode.relationships.length > 0) {
        sourceNode.relationships.forEach((rel: any) => {
          // Only create an edge if the target node was retrieved
          const targetIdStr = rel.targetId.toString();
          if (uniqueNodesMap.has(targetIdStr)) {
            const edgeHash = `${sourceIdStr}-${targetIdStr}`;
            if (!edgeDuplicationSet.has(edgeHash)) {
              edges.push({
                sourceId: sourceIdStr,
                targetId: targetIdStr,
                type: rel.type,
                weight: rel.weight || 1.0
              });
            }
          }
        });
      }
      
      finalNodes.forEach(targetNode => {
        const targetIdStr = targetNode._id.toString();
        if (sourceIdStr !== targetIdStr) {
          const hasSharedContext = sourceNode.contextId && targetNode.contextId && sourceNode.contextId.equals(targetNode.contextId?.toString());
          if (hasSharedContext) {
            edges.push({
              sourceId: sourceIdStr,
              targetId: targetIdStr,
              type: 'RELATED_TO',
              weight: 0.5
            });
          }
        }
      });
    });
      
      const aiSynthesis = await LLMService.generateSynthesis(query, finalNodes, edges);

      return {
        nodes: finalNodes,
        edges: edges,
        aiSynthesis: aiSynthesis
      }
        
    }

    static async expandGraph(nodeId: string, depth: number): Promise<GraphResponse> {
        // Run a graph query (e.g., Neo4j/MongoDB $graphLookup) starting from nodeId
        // Return flattened { nodes, edges } for the UI
    }

    static async getPendingValidations(): Promise<ThoughtNodeDocument[]> {
        // Retrieve nodes where stage === 'RESONATING' or 'GARBAGE'
    }

    // Mutations
    static async captureAhaMoment(content: string, subject?: string | null): Promise<ThoughtNodeDocument> {
        // Insert DB record with stage: 'GARBAGE'
    }

    static async enrichThought(id: string, userNuance: string, semanticRole?: string | null): Promise<ThoughtNodeDocument> {
        // 1. Save userNuance
        // 2. Trigger LLM to generate llmGeneratedContext and proposed relationships
        // 3. Update stage to 'RESONATING'
    }

    static async promoteToBrain(id: string, approvedRelationships?: RelationshipInput): Promise<ThoughtNodeDocument> {
        
    }
}