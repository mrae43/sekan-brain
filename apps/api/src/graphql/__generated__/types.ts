import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ThoughtNodeDocument, GraphEdgeDocument, GraphResponseDocument } from '../../models/thoughtNode/types';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export enum CognitiveStage {
  Brain = 'BRAIN',
  Garbage = 'GARBAGE',
  Resonating = 'RESONATING'
}

export type ContextData = {
  __typename?: 'ContextData';
  llmGeneratedContext?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  semanticRole?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  userNuance?: Maybe<Scalars['String']['output']>;
};

export type GraphEdge = {
  __typename?: 'GraphEdge';
  sourceId: Scalars['ID']['output'];
  targetId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type GraphNode = {
  __typename?: 'GraphNode';
  content: Scalars['String']['output'];
  context?: Maybe<ContextData>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  relationships?: Maybe<Array<Relationship>>;
  stage: CognitiveStage;
  subject?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type GraphResponse = {
  __typename?: 'GraphResponse';
  aiSynthesis?: Maybe<Scalars['String']['output']>;
  edges: Array<GraphEdge>;
  nodes: Array<GraphNode>;
};

export type Mutation = {
  __typename?: 'Mutation';
  captureAhaMoment: GraphNode;
  enrichThought: GraphNode;
  promoteToBrain: GraphNode;
};


export type MutationCaptureAhaMomentArgs = {
  content: Scalars['String']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEnrichThoughtArgs = {
  id: Scalars['ID']['input'];
  semanticRole?: InputMaybe<Scalars['String']['input']>;
  userNuance: Scalars['String']['input'];
};


export type MutationPromoteToBrainArgs = {
  approvedRelationships?: InputMaybe<Array<RelationshipInput>>;
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  expandThoughtGraph: GraphResponse;
  findResonatingThoughts: GraphResponse;
  getPendingValidations: Array<GraphNode>;
};


export type QueryExpandThoughtGraphArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
  nodeId: Scalars['ID']['input'];
};


export type QueryFindResonatingThoughtsArgs = {
  query: Scalars['String']['input'];
};

export type Relationship = {
  __typename?: 'Relationship';
  explanation?: Maybe<Scalars['String']['output']>;
  isCrossSubject: Scalars['Boolean']['output'];
  targetId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type RelationshipInput = {
  explanation?: InputMaybe<Scalars['String']['input']>;
  isCrossSubject?: InputMaybe<Scalars['Boolean']['input']>;
  targetId: Scalars['ID']['input'];
  type: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

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
  CognitiveStage: CognitiveStage;
  ContextData: ResolverTypeWrapper<ContextData>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GraphEdge: ResolverTypeWrapper<GraphEdgeDocument>;
  GraphNode: ResolverTypeWrapper<ThoughtNodeDocument>;
  GraphResponse: ResolverTypeWrapper<GraphResponseDocument>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Relationship: ResolverTypeWrapper<Relationship>;
  RelationshipInput: RelationshipInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  ContextData: ContextData;
  Float: Scalars['Float']['output'];
  GraphEdge: GraphEdgeDocument;
  GraphNode: ThoughtNodeDocument;
  GraphResponse: GraphResponseDocument;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  Relationship: Relationship;
  RelationshipInput: RelationshipInput;
  String: Scalars['String']['output'];
}>;

export type ContextDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContextData'] = ResolversParentTypes['ContextData']> = ResolversObject<{
  llmGeneratedContext?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  semanticRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  userNuance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type GraphEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['GraphEdge'] = ResolversParentTypes['GraphEdge']> = ResolversObject<{
  sourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type GraphNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['GraphNode'] = ResolversParentTypes['GraphNode']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  context?: Resolver<Maybe<ResolversTypes['ContextData']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  relationships?: Resolver<Maybe<Array<ResolversTypes['Relationship']>>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['CognitiveStage'], ParentType, ContextType>;
  subject?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type GraphResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GraphResponse'] = ResolversParentTypes['GraphResponse']> = ResolversObject<{
  aiSynthesis?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['GraphEdge']>, ParentType, ContextType>;
  nodes?: Resolver<Array<ResolversTypes['GraphNode']>, ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  captureAhaMoment?: Resolver<ResolversTypes['GraphNode'], ParentType, ContextType, RequireFields<MutationCaptureAhaMomentArgs, 'content'>>;
  enrichThought?: Resolver<ResolversTypes['GraphNode'], ParentType, ContextType, RequireFields<MutationEnrichThoughtArgs, 'id' | 'userNuance'>>;
  promoteToBrain?: Resolver<ResolversTypes['GraphNode'], ParentType, ContextType, RequireFields<MutationPromoteToBrainArgs, 'id'>>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  expandThoughtGraph?: Resolver<ResolversTypes['GraphResponse'], ParentType, ContextType, RequireFields<QueryExpandThoughtGraphArgs, 'depth' | 'nodeId'>>;
  findResonatingThoughts?: Resolver<ResolversTypes['GraphResponse'], ParentType, ContextType, RequireFields<QueryFindResonatingThoughtsArgs, 'query'>>;
  getPendingValidations?: Resolver<Array<ResolversTypes['GraphNode']>, ParentType, ContextType>;
}>;

export type RelationshipResolvers<ContextType = any, ParentType extends ResolversParentTypes['Relationship'] = ResolversParentTypes['Relationship']> = ResolversObject<{
  explanation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isCrossSubject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  ContextData?: ContextDataResolvers<ContextType>;
  GraphEdge?: GraphEdgeResolvers<ContextType>;
  GraphNode?: GraphNodeResolvers<ContextType>;
  GraphResponse?: GraphResponseResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Relationship?: RelationshipResolvers<ContextType>;
}>;

