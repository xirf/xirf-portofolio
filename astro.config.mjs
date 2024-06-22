import presetUno from '@unocss/preset-uno';
import { defineConfig } from 'astro/config';
import { presetIcons, presetWebFonts } from 'unocss'
import UnoCss from "unocss/astro"

// https://astro.build/config
export default defineConfig({
    site: "https://andka.my.id",
    integrations: [
        UnoCss({
            injectReset: true,
            presets: [
                presetUno(),
                presetWebFonts({
                    provider: "fontshare",
                    fonts: {
                        base: 'Outfit',
                        mono: 'JetBrains Mono'
                    }
                }),
                presetIcons({
                    collections: {
                        mynaui: () => import("@iconify-json/mynaui/icons.json").then((i) => i.default),
                    },
                    extraProperties: {
                        'display': 'inline-block',
                        'fill': 'currentColor',
                    },
                }),
            ]
        })
    ]
});
