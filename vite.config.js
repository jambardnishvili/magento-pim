import {defineConfig} from "vite";
import {resolve} from "path";

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1000,
        minify: 'esbuild',
        esbuildOptions: {
            target: ['es2020'],
            legalComments: 'none',
            drop: ['console.debug']
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-supabase': ['@supabase/supabase-js'],
                    'vendor-papaparse': ['papaparse'],
                    'vendor-tabulator': [
                        'tabulator-tables', 
                        'tabulator-tables/dist/css/tabulator.min.css'
                    ],
                    'app-core': [
                        './src/core/App.js',
                        './src/core/BaseModule.js',
                        './src/core/ProductTable.js'
                    ],
                    'app-utils': [
                        './src/utils/DataTransformer.js'
                    ]
                },
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        cors: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    optimizeDeps: {
        include: ['@supabase/supabase-js', 'papaparse']
    },
    envPrefix: 'VITE_'
})