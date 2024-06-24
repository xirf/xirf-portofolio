import pluginJs from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro"
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  pluginJs.configs.recommended,
  ...eslintPluginAstro.configs.all,
  ...tseslint.configs.recommended,
  {
    files : [ "**/*.{js,mjs,cjs,ts,astro}" ],
    rules : {
      languageOptions : {
        parserOptions : {
          project : true,
          extraFileExtension : [ ".astro" ],
          tsConfigRootDir : import.meta.dirname
        }
      }
    }
  },
  {
    languageOptions : {
      globals : globals.browser,
    },
  },
];