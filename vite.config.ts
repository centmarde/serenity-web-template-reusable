import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { inspectorServer } from '@react-dev-inspector/vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    plugins: [
      react({
        // Add babel plugin for react-dev-inspector in development
        babel: isDev ? {
          plugins: [['@react-dev-inspector/babel-plugin']]
        } : undefined
      }),
      tailwindcss(),
      // Add React Dev Inspector server plugin only in development
      ...(isDev ? [inspectorServer()] : [])
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
