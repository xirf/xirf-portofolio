// uno.config.ts
import {
    defineConfig,
    presetAttributify,
    presetTypography,
    presetUno,
    presetIcons
} from 'unocss'

import transformerCompileClass from '@unocss/transformer-compile-class'
import transformerVariantGroup from "@unocss/transformer-variant-group"

export default defineConfig({
    rules: [
        [ 'shadow-d', { 'box-shadow': '0px 0px 20px 0px var(--un-shadow-color)' } ],
        [ 'bg-dotted', { 'background-image': 'radial-gradient(var(--un-gradient-from, white) 2px, transparent 1px)', 'background-size': '40px 40px' } ],
        [ 'font-dm', { 'font-family': 'DM Sans, sans-serif' } ],
        [ 'font-lexend', { 'font-family': 'Lexend, sans-serif' } ],
        [ 'font-mono', { 'font-family': 'JetBrains Mono, monospace' } ],
    ],
    transformers: [
        transformerVariantGroup(),
        transformerCompileClass({
            classPrefix: 'a-',
        }),
    ],
    presets: [
        presetAttributify(),
        presetUno(),
        presetTypography(),
        presetIcons({
            collections: {
                charm: () => import("@iconify-json/charm/icons.json").then((i) => i.default),
                clarity: () => import("@iconify-json/clarity/icons.json").then((i) => i.default),
            },
            extraProperties: {
                'display': 'inline-block',
                'fill': 'currentColor',
            },
        }),
    ],
})
