

import { defineConfig } from 'vitest/config'

export default defineConfig({
    define: {
        'import.meta.vitest': 'undefined',
    },
    test: {
        name: 'jsdom',
        root: '.',
        environment: 'jsdom',
        setupFiles: ['./setup.happy-dom.ts'],
        includeSource: ['src/**/*.test.{tsx,ts,jsx,js}']
      },
})