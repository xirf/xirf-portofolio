import {
    defineConfig,
    presetIcons,
    presetTypography,
    presetUno,
    presetWebFonts,
    transformerCompileClass,
    transformerVariantGroup,
} from 'unocss'
import { colors } from 'unocss/preset-mini'

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
            },
            extraProperties: {
                'display': 'inline-block',
                'fill': 'currentColor',
            },
        }),
    ],
})