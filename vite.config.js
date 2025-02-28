import {defineConfig} from "vite";

export default defineConfig({
    root: '.',
    base: process.env.NODE_ENV === 'production' ? '/magento-pim/' : '/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html'
            },
            output: {
                manualChunks: {
                    vendor: ['@supabase/supabase-js', 'papaparse', 'tabulator-tables']
                }
            }
        },
        sourcemap: true,
        commonjsOptions: {
            include: [/node_modules/]
        }
    },
    server: {
        open: true
    },
    resolve: {
        dedupe: ['tabulator-tables', '@supabase/supabase-js', 'papaparse']
    }
})