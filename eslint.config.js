import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Include browser globals like `window` and `document`
        ...globals.node,    // Include Node.js globals like `process` and `__dirname`
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];