import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro"
import unocssConfig from "unocss";

export default [
  pluginJs.configs.recommended,
  ...eslintPluginAstro.configs.all,
  ...tseslint.configs.recommended,
  {
    files: [ "**/*.{js,mjs,cjs,ts,astro}" ],
    rules: {
      languageOptions: {
        parserOptions: {
          project: true,
          extraFileExtension: [".astro"],
          tsConfigRootDir: import.meta.dirname
        }
      }
    }
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
];