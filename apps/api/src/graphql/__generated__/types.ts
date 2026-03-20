import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { SentenceDocument } from '../../models/sentences';
import { MyContext } from '../../types/context';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
};

export type EnrichmentData = {
  __typename?: 'EnrichmentData';
  metadata?: Maybe<Scalars['JSON']['output']>;
  semanticRole?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  userNuance?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  enrichSentence: Sentence;
  ingestSentence: Sentence;
};


export type MutationEnrichSentenceArgs = {
  id: Scalars['ID']['input'];
  nuance: Scalars['String']['input'];
  relationships?: InputMaybe<Array<RelationshipInput>>;
};


export type MutationIngestSentenceArgs = {
  content: Scalars['String']['input'];
  contextId?: InputMaybe<Scalars['String']['input']>;
  noteId: Scalars['String']['input'];
  sequence: Scalars['Int']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  findCrossSubjectResonance?: Maybe<Array<Sentence>>;
  getBrainContext?: Maybe<Array<Sentence>>;
  getSentence?: Maybe<Sentence>;
};


export type QueryFindCrossSubjectResonanceArgs = {
  contextId: Scalars['ID']['input'];
  currentSubject: Scalars['String']['input'];
};


export type QueryGetBrainContextArgs = {
  startIds: Array<Scalars['ID']['input']>;
};


export type QueryGetSentenceArgs = {
  id: Scalars['ID']['input'];
};

export type Relationship = {
  __typename?: 'Relationship';
  isCrossSubject: Scalars['Boolean']['output'];
  target: Sentence;
  type: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type RelationshipInput = {
  isCrossSubject?: InputMaybe<Scalars['Boolean']['input']>;
  target: Scalars['ID']['input'];
  type: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type Sentence = {
  __typename?: 'Sentence';
  content: Scalars['String']['output'];
  contextId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['String']['output'];
  enrichmentData?: Maybe<EnrichmentData>;
  id: Scalars['ID']['output'];
  noteId: Scalars['ID']['output'];
  relationships?: Maybe<Array<Relationship>>;
  sequence: Scalars['Int']['output'];
  stage: SentenceStage;
  subject?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export enum SentenceStage {
  Brain = 'brain',
  Garbage = 'garbage',
  Resonance = 'resonance'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  EnrichmentData: ResolverTypeWrapper<EnrichmentData>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Relationship: ResolverTypeWrapper<Omit<Relationship, 'target'> & { target: ResolversTypes['Sentence'] }>;
  RelationshipInput: RelationshipInput;
  Sentence: ResolverTypeWrapper<SentenceDocument>;
  SentenceStage: SentenceStage;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  EnrichmentData: EnrichmentData;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  Relationship: Omit<Relationship, 'target'> & { target: ResolversParentTypes['Sentence'] };
  RelationshipInput: RelationshipInput;
  Sentence: SentenceDocument;
  String: Scalars['String']['output'];
}>;

export type EnrichmentDataResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['EnrichmentData'] = ResolversParentTypes['EnrichmentData']> = ResolversObject<{
  metadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  semanticRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  userNuance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  enrichSentence?: Resolver<ResolversTypes['Sentence'], ParentType, ContextType, RequireFields<MutationEnrichSentenceArgs, 'id' | 'nuance'>>;
  ingestSentence?: Resolver<ResolversTypes['Sentence'], ParentType, ContextType, RequireFields<MutationIngestSentenceArgs, 'content' | 'noteId' | 'sequence'>>;
}>;

export type QueryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  findCrossSubjectResonance?: Resolver<Maybe<Array<ResolversTypes['Sentence']>>, ParentType, ContextType, RequireFields<QueryFindCrossSubjectResonanceArgs, 'contextId' | 'currentSubject'>>;
  getBrainContext?: Resolver<Maybe<Array<ResolversTypes['Sentence']>>, ParentType, ContextType, RequireFields<QueryGetBrainContextArgs, 'startIds'>>;
  getSentence?: Resolver<Maybe<ResolversTypes['Sentence']>, ParentType, ContextType, RequireFields<QueryGetSentenceArgs, 'id'>>;
}>;

export type RelationshipResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Relationship'] = ResolversParentTypes['Relationship']> = ResolversObject<{
  isCrossSubject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['Sentence'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type SentenceResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Sentence'] = ResolversParentTypes['Sentence']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contextId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enrichmentData?: Resolver<Maybe<ResolversTypes['EnrichmentData']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  noteId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  relationships?: Resolver<Maybe<Array<ResolversTypes['Relationship']>>, ParentType, ContextType>;
  sequence?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['SentenceStage'], ParentType, ContextType>;
  subject?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MyContext> = ResolversObject<{
  EnrichmentData?: EnrichmentDataResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Relationship?: RelationshipResolvers<ContextType>;
  Sentence?: SentenceResolvers<ContextType>;
}>;

