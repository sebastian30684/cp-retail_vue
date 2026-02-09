import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  plugins: [
    vue(),
    netlify(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // GTM Head Script
        const gtmHead = `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KLF9JSGG');</script>
    <!-- End Google Tag Manager -->`
        
        // GTM Body Script (noscript fallback)
        const gtmBody = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KLF9JSGG"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`
        
        // Insert GTM in head (before closing </head> tag)
        html = html.replace('</head>', `${gtmHead}\n</head>`)
        
        // Insert GTM noscript in body (right after opening <body> tag)
        html = html.replace('<body>', `<body>\n${gtmBody}`)
        
        return html
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: 'localhost',
    port: 8500,
    strictPort: false,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem'))
    },
    open: true,
    proxy: {}
  }
})