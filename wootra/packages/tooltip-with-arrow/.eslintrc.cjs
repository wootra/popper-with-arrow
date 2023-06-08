/* eslint-env node */
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  settings: {
    jest: {
      globalAliases: {
        describe: ["context"],
        fdescribe: ["fcontext"],
        xdescribe: ["xcontext"],
      },
    },
  },
  root: true,
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-restricted-globals": "off",
    "jest/prefer-expect-assertions": "off",
    indent: ["warn", 2],
  },
  ignorePatterns: [
    "**/*.config.{js|ts}",
    "**/*.css",
    "**/*.scss",
    "**/*.d.ts",
    "**/*.map",
    "dist",
  ],
  overrides: [
    {
      files: ["src/**/*.test.{js|ts|jsx|tsx}"],
      excludedFiles: ["**/*.config.{js|ts}"],
    },
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
  },
};
