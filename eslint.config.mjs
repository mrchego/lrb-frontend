
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Enforce theme-based chart colors.
  {
    files: [
      "**/*chart*.{ts,tsx}",
      "**/charts/**/*.{ts,tsx}",
      "app/**/dashboard/**/*.{ts,tsx}",
    ],

    ignores: [
      "lib/theme-engine.ts",
      "lib/chart-theme.ts",
      "lib/use-chart-palette.ts",
      "lib/brand-color.ts",
    ],

    rules: {
      "no-restricted-syntax": [
        "error",

        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "Use chartColor(i) or var(--chart-N), not a literal color.",
        },

        {
          selector: "Literal[value=/^(rgb|rgba|hsl|hsla|oklch|oklab)\\(/]",
          message:
            "Use chartColor(i) or var(--chart-N), not a literal color.",
        },

        {
          selector: "Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "Use chartColor(i) or var(--chart-N), not a literal color.",
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
