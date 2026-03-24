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
      },
    },
  },
};

export default config;