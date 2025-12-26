import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

// Try to load Next.js configs, but if FlatCompat fails due to circular references,
// use a proper TypeScript/React config as fallback
let nextConfigs = [];
try {
  const configs = compat.extends("next/core-web-vitals", "next/typescript");
  nextConfigs = Array.isArray(configs) ? configs : [configs];
} catch (error) {
  // FlatCompat failed - use proper TypeScript ESLint config directly
  console.warn("Using fallback ESLint config due to FlatCompat issues");
  
  // Import plugins using dynamic imports (synchronously loaded at config time)
  const tsParser = (await import("@typescript-eslint/parser")).default;
  const tsPlugin = (await import("@typescript-eslint/eslint-plugin")).default;
  const reactPlugin = (await import("eslint-plugin-react")).default;
  const reactHooksPlugin = (await import("eslint-plugin-react-hooks")).default;
  
  nextConfigs = [
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tsParser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          project: "./tsconfig.json",
        },
      },
      plugins: {
        "@typescript-eslint": tsPlugin,
        react: reactPlugin,
        "react-hooks": reactHooksPlugin,
      },
      settings: {
        react: {
          version: "detect", // Automatically detect React version
        },
      },
      rules: {
        // TypeScript rules
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
          },
        ],
        // React rules
        "react/react-in-jsx-scope": "off", // Not needed in Next.js
        "react/prop-types": "off", // Using TypeScript for prop validation
        "react/jsx-no-comment-textnodes": "warn", // Warn instead of error
        // React Hooks rules
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        // Disable Next.js specific rules that aren't available in fallback
        "@next/next/no-img-element": "off",
        "jsx-a11y/alt-text": "off",
      },
    },
  ];
}

const eslintConfig = [
  ...nextConfigs,
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "*.config.{js,mjs,ts}",
      "public/**",
      "dist/**",
      "build/**",
      "coverage/**",
    ],
  },
];

export default eslintConfig;
