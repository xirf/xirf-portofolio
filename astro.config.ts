import { defineConfig } from 'astro/config';

import svelte from "@astrojs/svelte";
import partytown from "@astrojs/partytown";
import unocss from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [ svelte(), partytown(), unocss({
    theme: "dark",
    injectReset: true,
  })]
});