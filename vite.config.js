import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    port: 3000,
    host: true,  // Allow external connections
    https: true,  // Enable HTTPS
    open: true
  }
});
