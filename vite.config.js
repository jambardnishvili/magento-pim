import {defineConfig} from "vite";

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html'
            }
        }
    },
    server: {
        open: true
    },
    base: './',
    resolve: {
        alias: {
            'tabulator-tables': 'tabulator-tables/dist/js/tabulator.min.js',
        },
    }
})