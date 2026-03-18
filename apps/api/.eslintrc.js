export default {
  root: true,
  extends: ["@repo/eslint-config/node"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  ignorePatterns: ["dist", "node_modules"],
};