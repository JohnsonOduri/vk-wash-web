import { defineConfig } from 'vite';
import { componentTagger } from "lovable-tagger";
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add any React plugin options here
    }),
    componentTagger(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    // Add any other server options here
  },
  build: {
    // Customize the build options if needed
  },
});