import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cookies do not distinguish localhost ports. Give each independent portal its own
// browser cookie and translate it to the single backend's session cookie in the proxy.
const sessionCookie = 'FOODIE_CUSTOMER_SESSION'
function backendProxy() {
  return {
    target: process.env.FOODIE_BACKEND_URL || 'http://localhost:8081',
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (request, incoming) => {
        const cookie = (incoming.headers.cookie || '').split(';').map(value=>value.trim()).find(value=>value.startsWith(sessionCookie+'='))
        request.removeHeader('cookie')
        if(cookie) request.setHeader('cookie', cookie.replace(sessionCookie+'=', 'JSESSIONID='))
      })
      proxy.on('proxyRes', response => {
        if(response.headers['set-cookie']) response.headers['set-cookie']=response.headers['set-cookie'].map(cookie=>cookie.replace(/^JSESSIONID=/,sessionCookie+'='))
      })
    },
  }
}
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'build' },
  server: {
    port: 5174, strictPort: true,
    proxy: { '/api': backendProxy() },
  },
})
