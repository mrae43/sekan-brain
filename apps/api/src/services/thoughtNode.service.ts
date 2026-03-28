import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { RelationshipInput } from '../graphql/__generated__/types';
import { ThoughtNode } from '../models/thoughtNode/model';
import { EmbeddingService, LLMService } from './llm.service';
import { GraphNodeDocument, GraphEdgeDocument, GraphResponseDocument, IRelationship } from '../models/thoughtNode/types';
import { KnowledgeRefineryAgent } from '@repo/agentic-graph';

export class ThoughtNodeService {
    /**
     * Graph Search & Resonance Discovery
     * Performs a vector search to find initial seed nodes, expands the graph based on context and subjects, 
     * and generates an AI synthesis of the findings.
     * 
     * @param query - The natural language query to find resonance for.
     * @returns A GraphResponseDocument containing nodes, edges, and AI synthesis.
     */
    static async findResonatingThoughts(query: string): Promise<GraphResponseDocument> {
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);
      
      const seedNodes = await ThoughtNode.vectorSearch({
        queryVector: queryEmbedding,
        limit: 4,
        stage: 'BRAIN'
      });

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
      const edges: GraphEdgeDocument[] = [];
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

    /**
     * Graph Exploration
     * Traverses the graph from a specific node to a given depth, retrieving connected nodes 
     * and edges to visualize the local thought network.
     * 
     * @param nodeId - The ID of the starting node.
     * @param depth - The number of levels to traverse from the starting node.
     * @returns A GraphResponseDocument with the local subgraph.
     */
    static async expandGraph(nodeId: string, depth: number): Promise<GraphResponseDocument> {
      if (!Types.ObjectId.isValid(nodeId)) {
        throw new Error("Invalid node ID.");
      }
      const results = await ThoughtNode.expandThoughtGraph([nodeId], depth);

      if (!results || results.length === 0) {
         throw new Error("Aha moment not found in the Second Brain.");
      }

      const rootNode = results[0];
      const rawNodes = [
        rootNode,
        ...(rootNode.outgoingNodes || []),
        ...(rootNode.incomingNodes || [])
      ];

      const nodeMap = new Map<string, any>();
      for (const node of rawNodes) {
        const idStr = node._id.toString();
        if (!nodeMap.has(idStr)) {
          nodeMap.set(idStr, node);
        }
      }

      const uniqueNodes = Array.from(nodeMap.values());

      const edges: GraphEdgeDocument[] = [];
      
      for (const node of uniqueNodes) {
        if (node.relationships && Array.isArray(node.relationships)) {
          for (const rel of node.relationships) {
            const targetIdStr = rel.targetId.toString();
            if (nodeMap.has(targetIdStr)) {
              edges.push({
                sourceId: node._id.toString(),
                targetId: targetIdStr,
                type: rel.type,
                weight: rel.weight || 1.0
              })
            }
          }
        }
      }
      
      return {
        nodes: uniqueNodes,
        edges: edges,
      }
    }

    /**
     * Queue Management
     * Retrieves a list of thought nodes currently in the 'GARBAGE' or 'RESONATING' stages, 
     * sorted by potential priority for human validation.
     * 
     * @returns An array of GraphNodeDocuments awaiting human or agentic intervention.
     */
    static async getPendingValidations(): Promise<GraphNodeDocument[]> {
      try {
        const pendingNodes = await ThoughtNode.find({
          stage: { $in: ['GARBAGE', 'RESONATING'] }
        })
        .sort({ stage: -1, createdAt: 1 })
        .exec();

        return pendingNodes;
      } catch (error) {
        console.error("Error fetching pending validations:", error);
        throw new Error("Failed to retrieve the pending thought queue.");
      }
    }

    /**
     * Stage 1: Initial Capture
     * Records a raw thought into the system at the 'GARBAGE' stage, 
     * preserving the initial spark for later refinement.
     * 
     * @param content - The raw text of the thought.
     * @param subject - Optional category or subject for the thought.
     * @returns The newly created GraphNodeDocument.
     */
    static async captureAhaMoment(content: string, subject?: string | null): Promise<GraphNodeDocument> {
      if (!content || content.trim().length === 0) {
        throw new Error('Content cannot be empty. Even the most obscure resonance requires a trace.');
      }

      const rawThought = new ThoughtNode({
        content: content.trim(),
        ...(subject && { subject: subject.trim() }),
        stage: 'GARBAGE',
        context: {
          tags:[],
          metadata: new Map()
        },
        relationships:[]
      });

      const savedThought = await rawThought.save();
      return savedThought;
    }

    /**
     * Stage 2: Agentic Refinement & Resonance
     * Enhances a raw thought using AI to generate context, tags, and proposed 
     * relationships based on user nuance and semantic roles.
     * 
     * @param id - The ID of the node to enrich.
     * @param userNuance - Additional context or intent provided by the user.
     * @param semanticRole - Optional label describing the thought's role.
     * @returns The enriched GraphNodeDocument in the 'RESONATING' stage.
     */
    static async enrichThought(id: string, userNuance: string, semanticRole?: string | null): Promise<GraphNodeDocument> {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Node ID format.");
      }

      const node = await ThoughtNode.findById(id);
      if (!node) {
        throw new Error("Thought node not found.");
      }

      const aiResult = await KnowledgeRefineryAgent.processNode(
        node.content,
        userNuance,
        semanticRole || undefined
      );

      return node.enrich(userNuance, semanticRole, {
        llmGeneratedContext: aiResult.llmGeneratedContext,
        tags: aiResult.tags,
        metadata: aiResult.metadata,
        proposedRelationships: aiResult.proposedRelationships
      });
  }
  
    /**
     * Stage 3: Human Validation & Graph Integration
     * Promotes a thought node to the 'BRAIN' stage, cementing its relationships.
     * 
     * @param id - The ID of the GraphNode to promote.
     * @param approvedRelationships - The human-validated array of connections.
     * @returns The crystallized GraphNodeDocument.
     */

    static async promoteToBrain(id: string, approvedRelationships?: RelationshipInput[]): Promise<GraphNodeDocument> {
        try {
          if (!Types.ObjectId.isValid(id)) {
            throw new Error("Invalid Node ID format.");
          }

          const node = await ThoughtNode.findById(id);
          if (!node) {
            throw new Error("Thought node not found.");
          }

          if (node.stage !== 'RESONATING') {
            throw new GraphQLError(
              `[Sekan-Brain] Cannot promote node in ${node.stage} stage. Must be RESONATING first.`, 
              { extensions: { code: 'FAILED_PRECONDITION' } }
            );
          }

          // TRIGGER: Generate final high-quality resonance for the Brain stage
          console.log(`[Sekan-Brain] Generating final vector resonance for Node ID: ${id}`);
          const finalEmbedding = await EmbeddingService.generateEmbedding(node.content);
          
          // Map GraphQL input to IRelationship if necessary, or pass through if compatible
           const approved: IRelationship[] = (approvedRelationships ||[]).map(rel => {
            if (!Types.ObjectId.isValid(rel.targetId)) {
              throw new GraphQLError(`Invalid targetId format for relationship: ${rel.targetId}`, { extensions: { code: 'BAD_USER_INPUT' } });
            }
             
            return {
              targetId: new Types.ObjectId(rel.targetId),
              type: rel.type,
              weight: rel.weight ?? 1.0,
              isCrossSubject: rel.isCrossSubject ?? false,
              explanation: rel.explanation || undefined
            };
          });

          return node.promoteToBrain(approved, finalEmbedding);
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          // Wrap generic database/server errors
          throw new GraphQLError(`Failed to crystallize thought into BRAIN: ${(error as Error).message}`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
        }
    }
}