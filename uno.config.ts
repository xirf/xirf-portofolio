import { defineConfig,  transformerCompileClass, transformerVariantGroup } from 'unocss'

export default defineConfig({
    transformers: [
        transformerCompileClass({
            alwaysHash: true,
        }),
        transformerVariantGroup()
    ],
})