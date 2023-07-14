// uno.config.ts
import {
    defineConfig,
    presetAttributify, presetTypography, presetUno, presetWebFonts
} from 'unocss'
import transformerCompileClass from '@unocss/transformer-compile-class'

export default defineConfig({
    theme: {
        colors: {
            primary: {
                DEFAULT: '#1b1e23',
                50: '#14171c',
            },
        },
    },
    transformers: [
        transformerCompileClass({
            classPrefix: 'a-',
            
        }),
    ],
    presets: [
        presetAttributify(), // required when using attributify mode
        presetUno(), // required
        presetTypography(),
        presetWebFonts({
            provider: 'google',
            fonts: {
                "sans": 'Work Sans',
                "serif": 'Merriweather',
                "mono": 'JetBrains Mono',
            },
        })
    ],
})