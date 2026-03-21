import { Types, Model, HydratedDocument } from 'mongoose';

export interface ISentence {
  content: string;
  noteId: Types.ObjectId;
  contextId?: Types.ObjectId;
  subject?: string;
  sequence: number;
  stage: 'garbage' | 'resonance' | 'brain';
  embedding?: Buffer;
  enrichmentData: {
    userNuance?: string;
    semanticRole?: string;
    tags: string[];
    metadata: Map<string, any>;
  };
  relationships: {
    target: Types.ObjectId;
    type: string;
    weight: number;
    isCrossSubject: boolean;
  }[];
}

export interface ISentenceMethods {
  enrich(nuance: string, relationships: any[]): HydratedDocument<ISentence, ISentenceMethods>;
}

export type SentenceDocument = HydratedDocument<ISentence, ISentenceMethods>;

export interface ISentenceModel extends Model<ISentence, {}, ISentenceMethods> {
  findCrossSubjectResonance(
    contextId: Types.ObjectId | string, 
    currentSubject: string
  ): Promise<SentenceDocument[]>;
  
  getBrainContext(
    startIds: (Types.ObjectId | string)[]
  ): Promise<SentenceDocument[]>;
}
