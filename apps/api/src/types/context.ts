import { Sentence } from '../models/sentences';

export interface MyContext {
    models: {
        Sentence: typeof Sentence;
    };
}