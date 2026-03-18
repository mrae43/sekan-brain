/** @type {import("eslint").Linter.Config} */
export default {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  plugins: ["react-refresh"],
  env: {
    browser: true,
    es2020: true,
  },
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-unused-vars": ["warn"],
  },
  ignorePatterns: ["dist"],
};