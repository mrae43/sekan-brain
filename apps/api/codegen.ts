import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:3000/graphql", 
  generates: {
    "src/graphql/__generated__/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "../../types/context#MyContext",
        useIndexSignature: true,
        maybeValue: 'T | null | undefined',
        mappers: {
          Sentence: '../../models/sentence#SentenceDocument',
        },
      },
    },
  },
};

export default config;