import type { IconifyJSON } from '@iconify-json/mynaui/index.js'
import {
    defineConfig,
    presetIcons,
    presetTypography,
    presetUno,
    presetWebFonts,
    transformerCompileClass,
    transformerVariantGroup,
} from 'unocss'
export default defineConfig({
    rules: [
        [ "text-stroke", { 'text-shadow': "var(--xclr) 2px 0px 0px, var(--xclr) 1.75517px 0.958851px 0px, var(--xclr) 1.0806px 1.68294px 0px, var(--xclr) 0.141474px 1.99499px 0px, var(--xclr) -0.832294px 1.81859px 0px, var(--xclr) -1.60229px 1.19694px 0px, var(--xclr) -1.97999px 0.28224px 0px, var(--xclr) -1.87291px -0.701566px 0px, var(--xclr) -1.30729px -1.51361px 0px, var(--xclr) -0.421592px -1.95506px 0px, var(--xclr) 0.567324px -1.91785px 0px, var(--xclr) 1.41734px -1.41108px 0px, var(--xclr) 1.92034px -0.558831px 0px; --xclr: gray;" } ],
    ],
    shortcuts: {
        "y-animate": "animate-fade-in-up animate-count-1 animate-500ms",
    },
    content: {
        pipeline: {
            include: [
                /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html|json)($|\?)/,
            ]
        }
    },
    theme: {
        colors: {
            "d-base": "#111215",
            "d-on-base": "rgb(156 163 175)",
            "l-base": "#eff1f5",
            "l-on-base": "#4c4f69"
        }
    },
    transformers: [
        transformerVariantGroup(),
        transformerCompileClass({
            classPrefix: "x_"
        }),
    ],
    presets: [
        presetUno(),
        presetTypography(),
        presetWebFonts({
            provider: "google",
            fonts: {
                sans: "Lexend:300,400,500,700",
                mono: "JetBrains Mono"
            }
        }),
        presetIcons({
            collections: {
                myna: () => import("@iconify-json/mynaui/icons.json").then((i) => i.default),
                solar: () => import("@iconify-json/solar/icons.json").then((i) => i.default as IconifyJSON),
            },
            extraProperties: {
                'display': 'inline-block',
                'fill': 'currentColor',
            },
        }),
    ],
})