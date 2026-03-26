import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:3000/graphql", 
  generates: {
    "src/graphql/__generated__/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        maybeValue: 'T | null | undefined',
        mappers: {
          GraphNode: '../../models/thoughtNode/types#GraphNodeDocument',
          GraphEdge: '../../models/thoughtNode/types#GraphEdgeDocument',
          GraphResponse: '../../models/thoughtNode/types#GraphResponseDocument',
          ContextData: '../../models/thoughtNode/types#IContextData',
          Relationship: '../../models/thoughtNode/types#IRelationship',
        }
      },
    },
  },
};

export default config;