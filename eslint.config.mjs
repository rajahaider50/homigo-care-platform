import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/build/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["apps/*/src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
