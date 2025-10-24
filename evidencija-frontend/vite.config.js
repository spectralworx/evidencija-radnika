import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.app'], // ✅ dozvoljava sve ngrok linkove
    host: true, // omogućava pristup sa vanjske mreže
  },
})
