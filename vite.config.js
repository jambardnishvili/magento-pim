import {defineConfig} from "vite";

export default defineConfig({
    root: '.',
    base: process.env.NODE_ENV === 'production' ? '/magento-pim/' : '/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html'
            }
        },
        sourcemap: true
    },
    server: {
        open: true
    }
})