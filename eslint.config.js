import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "plugins/**",
      "data/**",
      "tests/__fixtures__/**",
    ],
  },
  ...tseslint.configs.recommendedTypeChecked,
  jsdoc.configs["flat/recommended-typescript"],
  {
    files: ["scripts/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false,
            ClassDeclaration: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-name": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/check-param-names": "error",
      "jsdoc/no-undefined-types": "off",
    },
  },
];
