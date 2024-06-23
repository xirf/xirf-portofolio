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
    theme: {
        colors: {
            "d-base": "#111215",
            "d-on-base": "rgb(156 163 175)",
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