import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // Ignore patterns
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.{js,mjs,ts}",
      "public/**",
      "scripts/**",
      "sync-service/**",
      ".turbo/**",
      "playwright-report/**",
      "test-results/**",
      "playwright/.cache/**",
    ],
  },

  // TypeScript ESLint recommended configs
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // TypeScript-specific overrides
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Disable overly strict type-checking rules for better DX
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },

  // React rules (manually configured to avoid circular references)
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ JSX transform
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/jsx-key": ["warn", { checkFragmentShorthand: true }],
      "react/jsx-no-target-blank": "warn",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-unescaped-entities": "warn",
      "react/no-unknown-property": "error",
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Next.js rules (manually configured to avoid circular references)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-unwanted-polyfillio": "warn",
      "@next/next/no-page-custom-font": "warn",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-assign-module-variable": "error",
      "@next/next/no-before-interactive-script-outside-document": "error",
      "@next/next/no-css-tags": "error",
      "@next/next/no-head-element": "warn",
      "@next/next/no-head-import-in-document": "error",
    },
  },

  // General code quality rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-unused-vars": "off", // Use TypeScript version
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["warn", "always", { null: "ignore" }],
      "curly": ["warn", "all"],
    },
  },
];
