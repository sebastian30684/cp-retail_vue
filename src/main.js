// src/main.js - Industrial Machines Platform Entry Point
import { createApp } from 'vue'
import App from './components/App.vue'

// CSS Import - Konsolidierte Styles
import './styles/main.css'

console.log('🚀 Starting Industrial Machines Platform...')

const app = createApp(App)

// Mount the app
app.mount('#app')

console.log('✅ Industrial Machines Platform loaded successfully!')