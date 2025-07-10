import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import VueRouter from 'unplugin-vue-router/vite';
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    VueRouter(),
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      dts: 'src/components.d.ts'
    }),
    UnoCSS()
  ],
  resolve: {
    alias: {
      '~/': `${__dirname}/`,
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      './tests/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      './src/**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
    // coverage: {
    //   enabled: true,
    //   provider: 'v8',
    //   reportsDirectory: './tests/unit/coverage',
    //   include: [
    //     'lib/**/*.?(c|m)[jt]s?(x)',
    //     'web/utils/**/*.?(c|m)[jt]s?(x)',
    //   ],
    // },
  }
});
