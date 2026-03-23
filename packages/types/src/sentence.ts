export interface RelationshipInput {
  target: string;
  type: string;
  weight?: number;
  isCrossSubject?: boolean;
  description?: string;
}

export interface EnrichmentPayload {
  userNuance: string;
  semanticRole?: string;
  tags?: string[];
  metadata?: Record<string, any>; // For flexible AI-generated stats
  relationships?: RelationshipInput[];
}