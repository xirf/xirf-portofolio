import type { IconifyJSON } from '@iconify-json/mynaui/index.js'
import {
    defineConfig,
    presetIcons,
    presetTypography,
    presetWind3,
    presetWebFonts,
    transformerVariantGroup,
} from 'unocss'
export default defineConfig({
    rules: [
        ["text-stroke", { 'text-shadow': "var(--xclr) 2px 0px 0px, var(--xclr) 1.75517px 0.958851px 0px, var(--xclr) 1.0806px 1.68294px 0px, var(--xclr) 0.141474px 1.99499px 0px, var(--xclr) -0.832294px 1.81859px 0px, var(--xclr) -1.60229px 1.19694px 0px, var(--xclr) -1.97999px 0.28224px 0px, var(--xclr) -1.87291px -0.701566px 0px, var(--xclr) -1.30729px -1.51361px 0px, var(--xclr) -0.421592px -1.95506px 0px, var(--xclr) 0.567324px -1.91785px 0px, var(--xclr) 1.41734px -1.41108px 0px, var(--xclr) 1.92034px -0.558831px 0px; --xclr: gray;" }],
    ],
    shortcuts: {
        "y-animate": "animate-fade-in-up animate-count-1 animate-500ms",
        "btn-normal": "bg-#8881 rounded-md py-2 px-4",
        // Shared building blocks for /tools/*
        "tool-field": "w-full rounded-md bg-#8881 border border-#8882 px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-#8888 placeholder:opacity-50",
        "tool-area": "tool-field min-h-40 resize-y leading-relaxed",
        "tool-btn": "inline-flex items-center justify-center gap-1.5 rounded-md bg-#8881 px-3 py-1.5 text-sm transition-colors cursor-pointer select-none hover:bg-#8882 disabled:(opacity-40 cursor-not-allowed)",
        "tool-btn-active": "bg-#8883 dark:text-#e5e7eb text-#1e1e2e",
        "tool-label": "block text-xs uppercase tracking-wider opacity-60 mb-1.5",
        "tool-panel": "rounded-lg border border-#8882 p-4",
        "tool-chip": "inline-flex items-center gap-1 rounded-full border border-#8882 px-2.5 py-0.5 text-xs",
        "tool-heading": "dark:text-#e5e7eb text-#1e1e2e font-bold",
        "tool-error": "text-sm text-red-600 dark:text-red-400",
        "tool-ok": "text-sm text-green-700 dark:text-green-400",
    },
    content: {
        pipeline: {
            include: [
                /\.(mdx|md|astro|html|json|ts)($|\?)/,
                "src/content/**/*.{md.mdx}",
                "src/**/*.{yml,yaml}",
                "src/**/*.json",
            ]
        },
        filesystem: [
            "src/**/*.yaml",
            "src/data/**/*.ts",
            "src/lib/**/*.ts",
        ]
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
    ],
    presets: [
        presetWind3({
            dark: "class",
        }),
        presetTypography(),
        presetWebFonts({
            provider: "google",
            fonts: {
                sans: "Lexend:300,400,500,700",
                mono: "JetBrains Mono:400",
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
