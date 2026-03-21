import { Sentence } from '../models/sentence';

export interface MyContext {
    models: {
        Sentence: typeof Sentence;
    };
}