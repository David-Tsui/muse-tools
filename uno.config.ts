import transformerVariantGroup from '@unocss/transformer-variant-group'
import { defineConfig, presetAttributify, presetWind3, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  shortcuts: [
    [
      'btn',
      'bg-white/20 border border-white/30 backdrop-blur text-white text-sm font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 ease-in-out hover:(bg-white/30 -translate-y-0.5)'
    ],
    [
      'btn--small',
      'px-3.5 py-1.5 text-xs'
    ],
    [
      'flex-center',
      'flex items-center justify-center'
    ]
  ],
})
