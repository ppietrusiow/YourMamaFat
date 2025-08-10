import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = 'YourMamaFat' 

export default defineConfig({
  plugins: [react()],
  base: `/${repo}/`,
})