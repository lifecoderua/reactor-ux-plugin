// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactorUX',
      formats: ['es'],
      // the proper extensions will be added
      fileName: (format) => `reactor-ux.${format}.js`
    }
  },
})