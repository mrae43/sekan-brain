import { model } from 'mongoose';
import { GraphNodeDocument, IThoughtNodeModel } from './types';
import { thoughtNodeSchema } from './schema';
import * as methods from './methods';
import * as statics from './statics';

// Attach logic
thoughtNodeSchema.method(methods);
thoughtNodeSchema.static(statics);

export const ThoughtNode = model<GraphNodeDocument, IThoughtNodeModel>('ThoughtNode', thoughtNodeSchema);
