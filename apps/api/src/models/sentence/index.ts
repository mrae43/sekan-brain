import { model } from 'mongoose';
import { ISentence, ISentenceModel } from './types';
import { sentenceSchema } from './schema';
import * as methods from './methods';
import * as statics from './statics';

// Attach logic
sentenceSchema.method(methods);
sentenceSchema.static(statics);

export const Sentence = model<ISentence, ISentenceModel>('Sentence', sentenceSchema);

export * from './types';
