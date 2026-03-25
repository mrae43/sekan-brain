import { Types } from 'mongoose';
import { RelationshipInput } from '../graphql/__generated__/types';
import { ThoughtNode } from '../models/thoughtNode/model';
import { EmbeddingService, LLMService } from './llm.service';
import { GraphNodeDocument, GraphEdgeDocument, GraphResponseDocument } from '../models/thoughtNode/types';
import { KnowledgeRefineryAgent } from '@repo/agentic-graph';


export class ThoughtNodeService {
    // Queries
    static async findResonatingThoughts(query: string): Promise<GraphResponseDocument> {
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

    // Mutations
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

    static async enrichThought(id: string, userNuance: string, semanticRole?: string | null): Promise<GraphNodeDocument> {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Node ID format.");
      }

      const node = await ThoughtNode.findById(id);
      if (!node) {
        throw new Error("Thought node not found.");
      }

      node.context.userNuance = userNuance;
      if (semanticRole) {
        node.context.semanticRole = semanticRole;
      }

      const aiResult = await KnowledgeRefineryAgent.processNode(
        node.content,
        node.context.userNuance,
        node.context.semanticRole
      );

      node.context.llmGeneratedContext = aiResult.llmGeneratedContext;
      node.context.tags = aiResult.tags;

      if (aiResult.metadata) {
        node.context.metadata = new Map(Object.entries(aiResult.metadata));
      }

      node.relationships = aiResult.proposedRelationships;
      node.stage = 'RESONATING';

      const updatedNode = await node.save();
      return updatedNode;
    }

    static async promoteToBrain(id: string, approvedRelationships?: RelationshipInput): Promise<GraphNodeDocument> {
        
    }
}