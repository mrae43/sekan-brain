import { model } from 'mongoose';
import { IThoughtNode, IThoughtNodeModel } from './types';
import { thoughtNodeSchema } from './schema';
import * as methods from './methods';
import * as statics from './statics';

// Attach logic
thoughtNodeSchema.method(methods);
thoughtNodeSchema.static(statics);

export const ThoughtNode = model<IThoughtNode, IThoughtNodeModel>('ThoughtNode', thoughtNodeSchema);
