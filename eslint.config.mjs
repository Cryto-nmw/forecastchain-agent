import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend recommended Next.js and TypeScript configurations
  ...compat.extends(
    "next/core-web-vitals", // Next.js recommended rules
    "plugin:@typescript-eslint/recommended" // TypeScript recommended rules
  ),
  {
    // Specify files to lint
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser, // TypeScript parser
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin, // TypeScript ESLint plugin
    },
    rules: {
      // Modify the no-explicit-any rule to warn instead of error
      "@typescript-eslint/no-explicit-any": "warn", // Allows `any` with a warning
      // Optional: Add other custom rules
      "no-unused-vars": "off", // Disable base rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ], // TypeScript-specific unused vars
      "react/prop-types": "off", // Not needed with TypeScript
    },
  },
];

export default eslintConfig;
